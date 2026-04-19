"use client";

import { useState } from "react";
import { updateWorker } from "@/actions/workers";
import { Modal, useModal } from "@/components/ui/Modal";

interface WorkerEditFormProps {
  worker: {
    id: string;
    name: string;
    telegram: string | null;
    ratePerSubscriber: any; // Decimal
    status: string;
  };
}

export function WorkerEditForm({ worker }: WorkerEditFormProps) {
  const modal = useModal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      telegram: formData.get("telegram") as string,
      ratePerSubscriber: parseFloat(formData.get("ratePerSubscriber") as string),
      status: formData.get("status") as any,
    };

    const result = await updateWorker(worker.id, data);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      modal.close();
    }
  }

  return (
    <>
      <button onClick={modal.open} className="btn btn-secondary btn-sm">
        ⚙️ Редактировать профиль
      </button>

      <Modal isOpen={modal.isOpen} onClose={modal.close} title="Редактирование воркера">
        <form onSubmit={handleSubmit} className="form-group">
          <div>
            <label className="label">Имя</label>
            <input
              name="name"
              type="text"
              className="input"
              defaultValue={worker.name}
              required
            />
          </div>

          <div>
            <label className="label">Telegram (Username)</label>
            <input
              name="telegram"
              type="text"
              className="input"
              defaultValue={worker.telegram || ""}
              placeholder="@username"
            />
          </div>

          <div>
            <label className="label">Ставка за подписчика ($)</label>
            <input
              name="ratePerSubscriber"
              type="number"
              step="0.01"
              className="input"
              defaultValue={Number(worker.ratePerSubscriber)}
              required
            />
          </div>

          <div>
            <label className="label">Статус</label>
            <select name="status" className="input" defaultValue={worker.status}>
              <option value="ACTIVE">Активен</option>
              <option value="INACTIVE">Неактивен</option>
              <option value="SUSPENDED">Приостановлен</option>
            </select>
          </div>

          {error && <p style={{ color: "var(--color-danger)", fontSize: "0.875rem" }}>{error}</p>}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button
              type="submit"
              className="btn btn-accent"
              style={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? "Сохранение..." : "Сохранить изменения"}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={modal.close}
              disabled={loading}
            >
              Отмена
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
