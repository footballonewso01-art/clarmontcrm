import { getAgencyById } from "@/lib/dal";
import { getAgencyStats } from "@/lib/services/payout-service";
import { notFound } from "next/navigation";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AgencyPayoutButton } from "@/components/agencies/AgencyPayoutButton";
import { DeleteAgencyButton } from "@/components/agencies/DeleteAgencyButton";
import Link from "next/link";

export default async function AgencyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agency = await getAgencyById(id);
  if (!agency) notFound();

  const stats = await getAgencyStats(id);

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/dashboard/agencies" style={{ color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.875rem" }}>
            ← Агентства
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.25rem" }}>
            <h1 style={{ margin: 0 }}>{agency.name}</h1>
            <span style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
              Ставка: <strong style={{ color: "var(--color-text)" }}>{formatCurrency(agency.ratePerSubscriber)}/sub</strong>
            </span>
            <div style={{ marginLeft: "auto" }}>
              <DeleteAgencyButton agencyId={agency.id} agencyName={agency.name} />
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem",
      }}>
        <StatsCard title="Общий доход" value={formatCurrency(stats.totalRevenue)} icon="💵" variant="purple" />
        <StatsCard title="Получено" value={formatCurrency(stats.totalPaid)} icon="✅" variant="success" />
        <StatsCard title="Задолженность" value={formatCurrency(stats.remainingBalance)} icon="💰" variant={stats.remainingBalance > 0 ? "warning" : "default"} />
        <StatsCard title="Модели" value={stats.modelCount} icon="⭐" />
      </div>

      {/* Agency Payout */}
      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>Добавить поступление</h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
              Невыплаченный остаток: <strong style={{ color: "var(--color-warning)" }}>{formatCurrency(stats.remainingBalance)}</strong>
            </p>
          </div>
          <AgencyPayoutButton agencyId={agency.id} maxAmount={stats.remainingBalance} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Models */}
        <div className="glass-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--color-border)" }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 600 }}>⭐ Модели</h3>
          </div>
          {agency.models.length === 0 ? (
            <div className="empty-state"><p>Нет моделей</p></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Links</th>
                  <th>Доход</th>
                </tr>
              </thead>
              <tbody>
                {agency.models.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 500 }}>{m.name}</td>
                    <td>{m._count.trackingLinks}</td>
                    <td style={{ color: "var(--color-success)" }}>
                      {m.conversions[0] ? formatCurrency(m.conversions[0].revenueTotal) : "$0.00"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Payouts */}
        <div className="glass-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--color-border)" }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 600 }}>💰 История поступлений</h3>
          </div>
          {agency.payouts.length === 0 ? (
            <div className="empty-state"><p>Нет выплат</p></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                {agency.payouts.map((p) => (
                  <tr key={p.id}>
                    <td>{formatDate(p.date)}</td>
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
