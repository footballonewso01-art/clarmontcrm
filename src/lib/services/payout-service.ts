import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface PayoutCalculation {
  workerId: string;
  modelId: string;
  modelName: string;
  linkName: string | null;
  totalSubscribers: number;
  lastPaidSubscribers: number;
  payableSubscribers: number;
  ratePerSubscriber: number;
  payoutAmount: number;
  canPayout: boolean;
}

export async function calculateWorkerPayout(workerId: string): Promise<PayoutCalculation[]> {
  const worker = await db.worker.findUniqueOrThrow({
    where: { id: workerId },
    include: {
      trackingLinks: {
        include: { model: true },
      },
      conversions: {
        orderBy: { date: "desc" },
      },
      payouts: {
        orderBy: { date: "desc" },
      },
    },
  });

  const rate = Number(worker.ratePerSubscriber);
  const calculations: PayoutCalculation[] = [];

  for (const link of worker.trackingLinks) {
    const modelId = link.modelId;
    const latestConversion = worker.conversions.find(c => c.modelId === modelId);
    const latestPayout = worker.payouts.find(p => p.modelId === modelId);

    const totalSubscribers = latestConversion?.subscribersTotal ?? 0;
    const lastPaidSubscribers = latestPayout?.subscribersTo ?? 0;
    const payableSubscribers = totalSubscribers - lastPaidSubscribers;
    const payoutAmount = Math.max(0, payableSubscribers * rate);

    calculations.push({
      workerId: worker.id,
      modelId: link.modelId,
      modelName: link.model.name,
      linkName: link.name || null,
      totalSubscribers,
      lastPaidSubscribers,
      payableSubscribers,
      ratePerSubscriber: rate,
      payoutAmount: Math.round(payoutAmount * 100) / 100,
      canPayout: payableSubscribers > 0,
    });
  }

  return calculations;
}

export async function executeWorkerPayout(workerId: string, modelId: string): Promise<{ success: boolean; error?: string; payoutId?: string }> {
  return await db.$transaction(async (tx) => {
    const worker = await tx.worker.findUnique({
      where: { id: workerId },
      select: { id: true, ratePerSubscriber: true },
    });
    
    if (!worker) {
      return { success: false, error: "Воркер не найден" };
    }
    const rate = Number(worker.ratePerSubscriber);

    // Get latest conversion for THIS MODEL
    const latestConversion = await tx.conversion.findFirst({
      where: { workerId, modelId },
      orderBy: { date: "desc" },
    });

    if (!latestConversion) {
      return { success: false, error: "Нет конверсий для выплаты по этой модели" };
    }

    // Get latest payout for THIS MODEL
    const latestPayout = await tx.payoutWorker.findFirst({
      where: { workerId, modelId },
      orderBy: { date: "desc" },
    });

    const totalSubscribers = latestConversion.subscribersTotal;
    const lastPaidSubscribers = latestPayout?.subscribersTo ?? 0;
    const payableSubscribers = totalSubscribers - lastPaidSubscribers;

    if (payableSubscribers <= 0) {
      return { success: false, error: "Нет подписчиков для выплаты. Все подписчики уже оплачены." };
    }

    const amount = Math.round(payableSubscribers * rate * 100) / 100;

    const payout = await tx.payoutWorker.create({
      data: {
        workerId,
        modelId,
        amount: new Prisma.Decimal(amount),
        subscribersFrom: lastPaidSubscribers,
        subscribersTo: totalSubscribers,
        date: new Date(),
      },
    });

    return { success: true, payoutId: payout.id };
  });
}

export interface AgencyStats {
  agencyId: string;
  agencyName: string;
  totalRevenue: number;
  totalPaid: number;
  remainingBalance: number;
  modelCount: number;
}

export async function getAgencyStats(agencyId: string): Promise<AgencyStats> {
  const agency = await db.agency.findUniqueOrThrow({
    where: { id: agencyId },
    include: {
      models: {
        include: {
          conversions: {
            orderBy: { date: "desc" },
          },
        },
      },
      payouts: true,
    },
  });

  // Sum latest revenue for each model per worker
  const latestConversions = new Map<string, number>();
  for (const model of agency.models) {
    for (const c of model.conversions) {
      const key = `${c.workerId}_${model.id}`;
      // Since conversions are ordered date: "desc", the first one is the latest
      if (!latestConversions.has(key)) {
        latestConversions.set(key, c.revenueTotal.toNumber());
      }
    }
  }
  const totalRevenue = Array.from(latestConversions.values()).reduce((sum, r) => sum + r, 0);

  const totalPaid = agency.payouts.reduce(
    (sum, p) => sum + p.amount.toNumber(),
    0
  );

  return {
    agencyId: agency.id,
    agencyName: agency.name,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    remainingBalance: Math.round((totalRevenue - totalPaid) * 100) / 100,
    modelCount: agency.models.length,
  };
}
