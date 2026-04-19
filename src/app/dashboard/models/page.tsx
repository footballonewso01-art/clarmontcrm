import { getModels, getAgencies } from "@/lib/dal";
import { ModelActions } from "@/components/models/ModelActions";
import { DeleteModelButton } from "@/components/models/DeleteModelButton";

export default async function ModelsPage() {
  const models = await getModels();
  const agencies = await getAgencies();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Модели</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            OnlyFans модели и их привязка к агентствам
          </p>
        </div>
        <ModelActions agencies={agencies.map(a => ({ id: a.id, name: a.name }))} />
      </div>

      <div className="glass-card" style={{ overflow: "hidden" }}>
        {models.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Нет моделей</p>
            <p>Добавьте первую модель</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Агентство</th>
                <th>Tracking Links</th>
                <th>Конверсии</th>
                <th style={{ width: "80px", textAlign: "right" }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model) => (
                <tr key={model.id}>
                  <td style={{ fontWeight: 500 }}>{model.name}</td>
                  <td>
                    <span className="badge badge-purple">{model.agency.name}</span>
                  </td>
                  <td>{model._count.trackingLinks}</td>
                  <td>{model._count.conversions}</td>
                  <td style={{ textAlign: "right" }}>
                    <DeleteModelButton modelId={model.id} modelName={model.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
