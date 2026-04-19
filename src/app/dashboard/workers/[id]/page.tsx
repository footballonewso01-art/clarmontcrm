import { getWorkerById, getWorkerStats } from "@/lib/dal";
import { calculateWorkerPayout } from "@/lib/services/payout-service";
import { notFound } from "next/navigation";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { PayoutButton } from "@/components/workers/PayoutButton";
import { WorkerEditForm } from "@/components/workers/WorkerEditForm";
import { WorkerStatsEditor } from "@/components/workers/WorkerStatsEditor";
import { DeleteWorkerButton } from "@/components/workers/DeleteWorkerButton";
import Link from "next/link";

export default async function WorkerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const worker = await getWorkerById(id);
  if (!worker) notFound();

  const stats = await getWorkerStats(id);
  const payoutCalc = await calculateWorkerPayout(id);

  // Подготавливаем данные для быстрого редактирования
  const initialStats = worker.trackingLinks.map((tl) => {
    const latestConversion = worker.conversions.find(c => c.modelId === tl.modelId);
    return {
      modelId: tl.modelId,
      modelName: tl.model.name,
      linkName: tl.name,
      currentSubscribers: latestConversion?.subscribersTotal ?? 0,
      currentRevenue: latestConversion?.revenueTotal?.toNumber() ?? 0,
    };
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
            <Link href="/dashboard/workers" style={{ color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.875rem" }}>
              ← Воркеры
            </Link>
          </div>
          <h1>{worker.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
            <span className={`badge ${worker.status === "ACTIVE" ? "badge-success" : worker.status === "SUSPENDED" ? "badge-warning" : "badge-danger"}`}>
              {worker.status === "ACTIVE" ? "Активен" : worker.status === "SUSPENDED" ? "Приостановлен" : "Неактивен"}
            </span>
            <span style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
              Ставка: <strong style={{ color: "var(--color-text)" }}>{formatCurrency(worker.ratePerSubscriber)}/sub</strong>
            </span>
            {worker.telegram && (
              <span style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                Telegram: <strong style={{ color: "var(--color-text)" }}>{worker.telegram}</strong>
              </span>
            )}
          </div>
        </div>
        
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <WorkerEditForm 
            worker={{
              id: worker.id,
              name: worker.name,
              telegram: worker.telegram,
              status: worker.status,
              ratePerSubscriber: Number(worker.ratePerSubscriber),
            }} 
          />
          <DeleteWorkerButton workerId={worker.id} workerName={worker.name} />
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem",
      }}>
        <StatsCard title="Всего подписчиков" value={formatNumber(stats.totalSubscribers)} icon="📈" variant="accent" />
        <StatsCard title="Общий доход" value={formatCurrency(stats.totalRevenue)} icon="💵" variant="purple" />
        <StatsCard title="Выплачено (Воркеру)" value={formatCurrency(stats.totalPaidAmount)} icon="✅" variant="success" />
        <StatsCard
          title="Доступно к выплате"
          value={formatCurrency(payoutCalc.reduce((sum, p) => sum + p.payoutAmount, 0))}
          subtitle={`${payoutCalc.reduce((sum, p) => sum + p.payableSubscribers, 0)} подписчиков (всего)`}
          icon="💰"
          variant={payoutCalc.some(p => p.canPayout) ? "warning" : "default"}
        />
      </div>

      {/* Tracking Links */}
      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>🔗 Трекинг-ссылки</h2>
        {worker.trackingLinks.length === 0 ? (
          <div className="empty-state">Нет привязанных ссылок</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {worker.trackingLinks.map((link) => (
              <div key={link.id} style={{
                display: "flex", alignItems: "center", gap: "1rem", justifyContent: "space-between",
                padding: "0.75rem 1rem", background: "var(--color-bg-tertiary)", borderRadius: "var(--radius-sm)"
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <span className="badge badge-purple">{link.model.name}</span>
                  </div>
                  {link.name && <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{link.name}</div>}
                </div>
                <div style={{ flex: 1, overflow: "hidden", marginLeft: "1rem", textAlign: "right" }}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" style={{
                    color: "var(--color-accent)", fontSize: "0.875rem", textDecoration: "none",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "inline-block", maxWidth: "100%"
                  }}>
                    {link.url}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <WorkerStatsEditor workerId={worker.id} initialStats={initialStats} />

      {/* Payout Section */}
      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>Выплаты (по моделям)</h2>
        
        {payoutCalc.length === 0 ? (
          <div className="empty-state">У воркера нет активных моделей для выплаты.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {payoutCalc.map((calc) => (
              <div key={calc.modelId} style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                padding: "0.75rem 1rem",
                background: "var(--color-bg-tertiary)",
                borderRadius: "var(--radius-sm)"
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <span style={{ fontWeight: 600 }}>{calc.modelName}</span>
                    {calc.linkName && (
                      <span className="badge" style={{ fontSize: "0.6875rem", background: "var(--color-bg-primary)" }}>
                        {calc.linkName}
                      </span>
                    )}
                  </div>
                  <div style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    {calc.canPayout ? (
                      <>
                        Подписчики: {calc.lastPaidSubscribers} → {calc.totalSubscribers} ({calc.payableSubscribers} шт.)
                      </>
                    ) : (
                      "Нет новых подписчиков для выплаты"
                    )}
                  </div>
                </div>
                {calc.canPayout && (
                  <PayoutButton
                    workerId={worker.id}
                    modelId={calc.modelId}
                    modelName={calc.modelName}
                    canPayout={calc.canPayout}
                    amount={calc.payoutAmount}
                    subscribers={calc.payableSubscribers}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two columns: Conversions + Payouts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Conversions */}
        <div className="glass-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--color-border)" }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 600 }}>📈 Конверсии</h3>
          </div>
          {worker.conversions.length === 0 ? (
            <div className="empty-state"><p>Нет данных</p></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Подписчики</th>
                  <th>Доход</th>
                </tr>
              </thead>
              <tbody>
                {worker.conversions.map((c) => (
                  <tr key={c.id}>
                    <td>{formatDate(c.date)}</td>
                    <td>{formatNumber(c.subscribersTotal)}</td>
                    <td style={{ color: "var(--color-success)" }}>{formatCurrency(c.revenueTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Payouts */}
        <div className="glass-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--color-border)" }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 600 }}>💰 История выплат</h3>
          </div>
          {worker.payouts.length === 0 ? (
            <div className="empty-state"><p>Нет выплат</p></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Модель</th>
                  <th>Подписчики</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                {worker.payouts.map((p) => (
                  <tr key={p.id}>
                    <td>{formatDate(p.date)}</td>
                    <td>{p.model?.name || "Неизвестно"}</td>
                    <td>{p.subscribersFrom} → {p.subscribersTo}</td>
                    <td style={{ color: "var(--color-success)", fontWeight: 600 }}>{formatCurrency(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
