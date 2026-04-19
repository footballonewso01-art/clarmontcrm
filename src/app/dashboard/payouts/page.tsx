import { getWorkerPayouts, getAgencyPayouts } from "@/lib/dal";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function PayoutsPage() {
  const [workerPayouts, agencyPayouts] = await Promise.all([
    getWorkerPayouts(100),
    getAgencyPayouts(100),
  ]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Выплаты</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            История выплат воркерам и поступлений от агентств
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Worker Payouts */}
        <div className="glass-card" style={{ overflow: "hidden" }}>
          <div style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>💰 Выплаты воркерам</h2>
            <span className="badge badge-info">{workerPayouts.length}</span>
          </div>
          {workerPayouts.length === 0 ? (
            <div className="empty-state"><p>Нет выплат</p></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Воркер</th>
                  <th>Подписчики</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                {workerPayouts.map((p) => (
                  <tr key={p.id}>
                    <td style={{ color: "var(--color-text-secondary)", fontSize: "0.8125rem" }}>{formatDate(p.date)}</td>
                    <td style={{ fontWeight: 500 }}>{p.worker.name}</td>
                    <td>
                      <span style={{ fontSize: "0.8125rem" }}>{p.subscribersFrom} → {p.subscribersTo}</span>
                    </td>
                    <td style={{ color: "var(--color-success)", fontWeight: 600 }}>{formatCurrency(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Agency Payouts */}
        <div className="glass-card" style={{ overflow: "hidden" }}>
          <div style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>🏦 Поступления от агентств</h2>
            <span className="badge badge-success">{agencyPayouts.length}</span>
          </div>
          {agencyPayouts.length === 0 ? (
            <div className="empty-state"><p>Нет выплат</p></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Агентство</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                {agencyPayouts.map((p) => (
                  <tr key={p.id}>
                    <td style={{ color: "var(--color-text-secondary)", fontSize: "0.8125rem" }}>{formatDate(p.date)}</td>
                    <td style={{ fontWeight: 500 }}>{p.agency.name}</td>
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
