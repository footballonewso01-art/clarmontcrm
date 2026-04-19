import { getWorkers, getModels } from "@/lib/dal";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { WorkerActions } from "@/components/workers/WorkerActions";
import { SearchInput } from "@/components/ui/SearchInput";

export default async function WorkersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = (await searchParams).q?.toLowerCase() || "";
  let workers = await getWorkers();
  
  if (q) {
    workers = workers.filter(w => 
      w.name.toLowerCase().includes(q) || 
      (w.telegram && w.telegram.toLowerCase().includes(q))
    );
  }
  const models = await getModels();

  const statusBadge: Record<string, { class: string; label: string }> = {
    ACTIVE: { class: "badge-success", label: "Активен" },
    INACTIVE: { class: "badge-danger", label: "Неактивен" },
    SUSPENDED: { class: "badge-warning", label: "Приостановлен" },
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Воркеры</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Управление трафик-арбитражниками
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <SearchInput placeholder="Поиск по @username или имени..." />
          <WorkerActions models={models.map(m => ({ id: m.id, name: m.name }))} />
        </div>
      </div>

      <div className="glass-card" style={{ overflow: "hidden" }}>
        {workers.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Нет воркеров</p>
            <p>Добавьте первого воркера для начала работы</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Username (TG)</th>
                <th>Трекинг ссылки</th>
                <th>Конверсии (всего)</th>
                <th>Ставка</th>
                <th>Активность</th>
                <th style={{ width: "80px" }}></th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker) => {
                const badge = statusBadge[worker.status];
                const lastActiveText = worker.lastActive ? formatDate(worker.lastActive) : "—";
                
                return (
                  <tr key={worker.id}>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <Link
                          href={`/dashboard/workers/${worker.id}`}
                          style={{
                            color: "var(--color-accent)",
                            textDecoration: "none",
                            fontWeight: 500,
                          }}
                        >
                          {worker.name}
                        </Link>
                        <span className={`badge ${badge.class}`} style={{ fontSize: "0.625rem", width: "fit-content", marginTop: "4px" }}>
                          {badge.label}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: "var(--color-text-secondary)", fontFamily: "monospace" }}>
                      {worker.telegram || "—"}
                    </td>
                    <td>
                      {worker.trackingLinks.length > 0 ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {worker.trackingLinks.slice(0, 3).map((tl) => (
                            <div key={tl.id} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <span className="badge badge-purple" style={{ fontSize: "0.6875rem" }}>
                                {tl.model.name}
                              </span>
                              {tl.name && <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{tl.name}</span>}
                            </div>
                          ))}
                          {worker.trackingLinks.length > 3 && (
                            <span className="badge" style={{ fontSize: "0.6875rem" }}>+{worker.trackingLinks.length - 3}</span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem" }}>—</span>
                      )}
                    </td>
                    <td style={{ fontWeight: 500 }}>{worker.totalSubscribers}</td>
                    <td>{formatCurrency(worker.ratePerSubscriber)}/sub</td>
                    <td style={{ color: "var(--color-text-secondary)", fontSize: "0.8125rem" }}>
                      {lastActiveText}
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/workers/${worker.id}`}
                        className="btn btn-ghost btn-sm"
                      >
                        →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
