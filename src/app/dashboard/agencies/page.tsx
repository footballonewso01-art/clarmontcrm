import { getAgencies } from "@/lib/dal";
import Link from "next/link";
import { AgencyActions } from "@/components/agencies/AgencyActions";

export default async function AgenciesPage() {
  const agencies = await getAgencies();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Агентства</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Агентства моделей и учёт расчётов
          </p>
        </div>
        <AgencyActions />
      </div>

      <div className="glass-card" style={{ overflow: "hidden" }}>
        {agencies.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Нет агентств</p>
            <p>Добавьте первое агентство</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Модели</th>
                <th>Выплаты</th>
                <th style={{ width: "80px" }}></th>
              </tr>
            </thead>
            <tbody>
              {agencies.map((agency) => (
                <tr key={agency.id}>
                  <td>
                    <Link
                      href={`/dashboard/agencies/${agency.id}`}
                      style={{ color: "var(--color-accent)", textDecoration: "none", fontWeight: 500 }}
                    >
                      {agency.name}
                    </Link>
                  </td>
                  <td>{agency._count.models}</td>
                  <td>{agency._count.payouts}</td>
                  <td>
                    <Link href={`/dashboard/agencies/${agency.id}`} className="btn btn-ghost btn-sm">→</Link>
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
