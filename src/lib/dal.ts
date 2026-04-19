import { db } from "@/lib/db";

// ── Workers ──────────────────────────────────────────

export async function getWorkers() {
  const workers = await db.worker.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
    include: {
      trackingLinks: { 
        where: { model: { isDeleted: false } },
        include: { model: true } 
      },
      conversions: {
        orderBy: { date: "desc" },
        take: 1,
      },
      _count: { select: { conversions: true, payouts: true } },
    },
  });

  // Calculate aggregate metrics
  return Promise.all(workers.map(async (w) => {
    const allWorkerConversions = await db.conversion.findMany({
      where: { workerId: w.id },
      orderBy: { date: "desc" },
    });
    const latestPerModel = new Map<string, number>();
    for (const c of allWorkerConversions) {
      if (!latestPerModel.has(c.modelId)) {
        latestPerModel.set(c.modelId, c.subscribersTotal);
      }
    }
    const totalSubscribers = Array.from(latestPerModel.values()).reduce((a, b) => a + b, 0);
    
    return {
      ...w,
      totalSubscribers,
      lastActive: w.conversions[0]?.date ?? null,
    };
  }));
}

export async function getWorkerById(id: string) {
  return db.worker.findUnique({
    where: { id },
    include: {
      trackingLinks: { include: { model: { include: { agency: true } } } },
      conversions: { orderBy: { date: "desc" }, take: 20 },
      payouts: { orderBy: { date: "desc" }, take: 20, include: { model: true } },
    },
  });
}

export async function getWorkerStats(workerId: string) {
  const allConversions = await db.conversion.findMany({
    where: { workerId },
    orderBy: { date: "desc" },
  });
  
  const latestConversions = new Map<string, typeof allConversions[0]>();
  for (const c of allConversions) {
    if (!latestConversions.has(c.modelId)) {
      latestConversions.set(c.modelId, c);
    }
  }

  let totalSubscribers = 0;
  let totalRevenue = 0;
  for (const c of latestConversions.values()) {
    totalSubscribers += c.subscribersTotal;
    totalRevenue += c.revenueTotal.toNumber();
  }

  const latestPayout = await db.payoutWorker.findFirst({
    where: { workerId },
    orderBy: { date: "desc" },
  });
  
  const totalPaid = await db.payoutWorker.aggregate({
    where: { workerId },
    _sum: { amount: true },
  });

  return {
    totalSubscribers,
    totalRevenue,
    lastPaidSubscribers: latestPayout?.subscribersTo ?? 0,
    totalPaidAmount: totalPaid._sum.amount?.toNumber() ?? 0,
    lastPayoutDate: latestPayout?.date ?? null,
  };
}

// ── Models ──────────────────────────────────────────

export async function getModels() {
  return db.model.findMany({
    where: { isDeleted: false, agency: { isDeleted: false } },
    orderBy: { name: "asc" },
    include: {
      agency: true,
      _count: { select: { trackingLinks: true, conversions: true } },
    },
  });
}

// ── Agencies ──────────────────────────────────────────

export async function getAgencies() {
  return db.agency.findMany({
    where: { isDeleted: false },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { models: true, payouts: true } },
    },
  });
}

export async function getAgencyById(id: string) {
  return db.agency.findUnique({
    where: { id },
    include: {
      models: {
        include: {
          conversions: { orderBy: { date: "desc" }, take: 1 },
          _count: { select: { trackingLinks: true } },
        },
      },
      payouts: { orderBy: { date: "desc" }, take: 20 },
    },
  });
}

// ── Tracking Links ──────────────────────────────────────────

export async function getTrackingLinks() {
  return db.trackingLink.findMany({
    where: { 
      worker: { isDeleted: false },
      model: { isDeleted: false }
    },
    orderBy: { createdAt: "desc" },
    include: {
      worker: true,
      model: { include: { agency: true } },
    },
  });
}

// ── Conversions ──────────────────────────────────────────

export async function getConversions(limit = 50) {
  return db.conversion.findMany({
    where: { worker: { isDeleted: false } },
    orderBy: { date: "desc" },
    take: limit,
    include: {
      worker: true,
      model: { include: { agency: true } },
    },
  });
}

// ── Payouts ──────────────────────────────────────────

export async function getWorkerPayouts(limit = 50) {
  return db.payoutWorker.findMany({
    where: { worker: { isDeleted: false } },
    orderBy: { date: "desc" },
    take: limit,
    include: { worker: true },
  });
}

export async function getAgencyPayouts(limit = 50) {
  return db.payoutAgency.findMany({
    orderBy: { date: "desc" },
    take: limit,
    include: { agency: true },
  });
}

// ── Dashboard Stats ──────────────────────────────────────────

export async function getDashboardStats() {
  const [
    workersCount,
    modelsCount,
    agenciesCount,
    workerPayoutsTotal,
    agencyPayoutsTotal,
  ] = await Promise.all([
    db.worker.count({ where: { status: "ACTIVE", isDeleted: false } }),
    db.model.count({ where: { isDeleted: false, agency: { isDeleted: false } } }),
    db.agency.count({ where: { isDeleted: false } }),
    db.payoutWorker.aggregate({ _sum: { amount: true } }),
    db.payoutAgency.aggregate({ _sum: { amount: true } }),
  ]);

  // Calculate globally via all conversions 
  const allConversions = await db.conversion.findMany({
    orderBy: { date: "desc" },
    include: { model: { include: { agency: true } } },
  });
  
  const latestPerPair = new Map<string, typeof allConversions[0]>();
  for (const c of allConversions) {
    const key = `${c.workerId}_${c.modelId}`;
    if (!latestPerPair.has(key)) {
      latestPerPair.set(key, c);
    }
  }

  let totalRevenue = 0;
  let totalSubscribers = 0;
  const agencyRevenueMap = new Map<string, number>();

  for (const c of latestPerPair.values()) {
    totalRevenue += c.revenueTotal.toNumber();
    totalSubscribers += c.subscribersTotal;
    
    const agencyName = c.model.agency.name;
    const current = agencyRevenueMap.get(agencyName) || 0;
    agencyRevenueMap.set(agencyName, current + c.revenueTotal.toNumber());
  }

  // Formatting for chart
  const agencyRevenue = Array.from(agencyRevenueMap.entries()).map(([name, revenue]) => ({
    name,
    revenue,
  }));

  const totalWorkerPayouts = workerPayoutsTotal._sum.amount?.toNumber() ?? 0;
  const totalAgencyPayouts = agencyPayoutsTotal._sum.amount?.toNumber() ?? 0;

  return {
    activeWorkers: workersCount,
    totalModels: modelsCount,
    totalAgencies: agenciesCount,
    totalRevenue,
    totalSubscribers,
    totalWorkerPayouts,
    totalAgencyPayouts,
    outstandingLiabilities: totalRevenue - totalAgencyPayouts,
    agencyRevenue,
  };
}
