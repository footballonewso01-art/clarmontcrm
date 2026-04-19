import { getDashboardStats, getWorkerPayouts, getAgencyPayouts } from "@/lib/dal";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import { RevenueChart } from "@/components/dashboard/RevenueChart";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const recentWorkerPayouts = await getWorkerPayouts(5);
  const recentAgencyPayouts = await getAgencyPayouts(5);

  const projectProfit = stats.totalAgencyPayouts - stats.totalWorkerPayouts;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Обзор</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Общая статистика системы
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem",
      }}>
        <StatsCard
          title="Активные воркеры"
          value={stats.activeWorkers}
          icon="👤"
          variant="accent"
        />
        <StatsCard
          title="Всего подписчиков"
          value={formatNumber(stats.totalSubscribers)}
          icon="📈"
          variant="success"
        />
        <StatsCard
          title="Общий доход"
          value={formatCurrency(stats.totalRevenue)}
          icon="💵"
          variant="purple"
        />
        <StatsCard
          title="Выплачено воркерам"
          value={formatCurrency(stats.totalWorkerPayouts)}
          icon="💸"
          variant="warning"
        />
        <StatsCard
          title="Прибыль проекта"
          value={formatCurrency(projectProfit)}
          subtitle="Реальные деньги на руках"
          icon="💎"
          variant="success"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <StatsCard
            title="Задолженность"
            value={formatCurrency(stats.outstandingLiabilities)}
            subtitle="Невыплаченный баланс агентств"
            icon="⚠️"
            variant="danger"
          />
          <StatsCard
            title="Получено от агентств"
            value={formatCurrency(stats.totalAgencyPayouts)}
            icon="🏦"
            variant="success"
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <StatsCard title="Модели" value={stats.totalModels} icon="⭐" />
            <StatsCard title="Агентства" value={stats.totalAgencies} icon="🏢" />
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            📈 Доход по агентствам
          </h2>
          <RevenueChart data={stats.agencyRevenue} />
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Recent Worker Payouts */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
            💰 Последние выплаты воркерам
          </h2>
          {recentWorkerPayouts.length === 0 ? (
            <div className="empty-state">
              <p>Пока нет выплат</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {recentWorkerPayouts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem",
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-bg-primary)",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>{p.worker.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      Подписчики: {p.subscribersFrom} → {p.subscribersTo} · {formatDate(p.date)}
                    </div>
                  </div>
                  <div style={{
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    color: "var(--color-success)",
                  }}>
                    {formatCurrency(p.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Agency Receipts */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
            🏦 Последние поступления от агентств
          </h2>
          {recentAgencyPayouts.length === 0 ? (
            <div className="empty-state">
              <p>Пока нет выплат</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {recentAgencyPayouts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem",
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-bg-primary)",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>{p.agency.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      {formatDate(p.date)}
                    </div>
                  </div>
                  <div style={{
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    color: "var(--color-success)",
                  }}>
                    {formatCurrency(p.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
