import { getTrackingLinks, getWorkers, getModels } from "@/lib/dal";
import { formatDate } from "@/lib/utils";
import { TrackingLinkActions } from "@/components/tracking/TrackingLinkActions";
import { SearchInput } from "@/components/ui/SearchInput";

export default async function TrackingPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = (await searchParams).q?.toLowerCase() || "";
  let links = await getTrackingLinks();
  
  if (q) {
    links = links.filter(l => 
      l.worker.name.toLowerCase().includes(q) || 
      (l.worker.telegram && l.worker.telegram.toLowerCase().includes(q)) ||
      (l.name && l.name.toLowerCase().includes(q))
    );
  }
  const workers = await getWorkers();
  const models = await getModels();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Tracking Links</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Уникальные ссылки для отслеживания трафика
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <SearchInput placeholder="Поиск по @username или имени..." />
          <TrackingLinkActions
            workers={workers.map((w) => ({ id: w.id, name: w.name }))}
            models={models.map((m) => ({ id: m.id, name: m.name }))}
          />
        </div>
      </div>

      <div className="glass-card" style={{ overflow: "hidden" }}>
        {links.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Нет tracking links</p>
            <p>Создайте первую ссылку</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Воркер</th>
                <th>Название ссылки</th>
                <th>Модель</th>
                <th>Агентство</th>
                <th>URL</th>
                <th>Создан</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id}>
                  <td style={{ fontWeight: 500 }}>
                    <div>{link.worker.name}</div>
                    {link.worker.telegram && (
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", fontFamily: "monospace" }}>
                        {link.worker.telegram}
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{link.name || "—"}</span>
                  </td>
                  <td>
                    <span className="badge badge-purple" style={{ width: "fit-content" }}>{link.model.name}</span>
                  </td>
                  <td style={{ color: "var(--color-text-secondary)" }}>{link.model.agency.name}</td>
                  <td>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "var(--color-accent)",
                        textDecoration: "none",
                        fontSize: "0.8125rem",
                        maxWidth: "300px",
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {link.url}
                    </a>
                  </td>
                  <td style={{ color: "var(--color-text-secondary)" }}>{formatDate(link.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
