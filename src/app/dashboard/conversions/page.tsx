import { getConversions, getWorkers, getModels } from "@/lib/dal";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { ConversionActions } from "@/components/conversions/ConversionActions";

export default async function ConversionsPage() {
  const conversions = await getConversions();
  const workers = await getWorkers();
  const models = await getModels();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Конверсии</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Данные о подписчиках и доходах
          </p>
        </div>
        <ConversionActions
          workers={workers.map((w) => ({ id: w.id, name: w.name }))}
          models={models.map((m) => ({ id: m.id, name: m.name }))}
        />
      </div>

      <div className="glass-card" style={{ overflow: "hidden" }}>
        {conversions.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Нет конверсий</p>
            <p>Добавьте данные о конверсиях</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Воркер</th>
                <th>Модель</th>
                <th>Агентство</th>
                <th>Подписчики</th>
                <th>Доход</th>
              </tr>
            </thead>
            <tbody>
              {conversions.map((c) => (
                <tr key={c.id}>
                  <td style={{ color: "var(--color-text-secondary)" }}>{formatDate(c.date)}</td>
                  <td style={{ fontWeight: 500 }}>{c.worker.name}</td>
                  <td><span className="badge badge-purple">{c.model.name}</span></td>
                  <td style={{ color: "var(--color-text-secondary)" }}>{c.model.agency.name}</td>
                  <td>{formatNumber(c.subscribersTotal)}</td>
                  <td style={{ color: "var(--color-success)", fontWeight: 600 }}>{formatCurrency(c.revenueTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
