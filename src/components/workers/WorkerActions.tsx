"use client";

import { useState } from "react";
import { createWorker } from "@/actions/workers";
import { Modal, useModal } from "@/components/ui/Modal";

interface WorkerActionsProps {
  models: Array<{ id: string; name: string }>;
}

export function WorkerActions({ models }: WorkerActionsProps) {
  const modal = useModal();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError("");
    const result = await createWorker(formData);
    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    } else {
      modal.close();
      setIsPending(false);
    }
  }

  return (
    <>
      <button onClick={modal.open} className="btn btn-primary">
        + Добавить воркера
      </button>

      <Modal isOpen={modal.isOpen} onClose={modal.close} title="Новый воркер">
        <form action={handleSubmit}>
          <div className="form-group">
            <label className="label" htmlFor="worker-name">Имя воркера</label>
            <input id="worker-name" name="name" type="text" required className="input" placeholder="Имя воркера" />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="worker-rate">Ставка за подписчика ($)</label>
            <input id="worker-rate" name="ratePerSubscriber" type="number" step="0.01" min="0" defaultValue="0.60" className="input" />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="worker-tg">Telegram (Username)</label>
            <input id="worker-tg" name="telegram" type="text" className="input" placeholder="@username" />
          </div>

          <hr style={{ margin: "1rem 0", borderColor: "var(--color-border)" }} />

          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "1rem", fontWeight: 500 }}>
            🔗 Дополнительно (Трекинг)
          </p>

          <div className="form-group">
            <label className="label" htmlFor="tracking-model">Модель (сразу привязать ссылку)</label>
            <select id="tracking-model" name="modelId" className="select">
              <option value="">Без привязки (выбрать позже)</option>
              {models.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="label" htmlFor="tracking-url">Tracking URL (если выбрана модель)</label>
            <input id="tracking-url" name="url" type="url" className="input" placeholder="https://onlyfans.com/..." />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="tracking-name">Название ссылки (опционально)</label>
            <input id="tracking-name" name="linkName" type="text" className="input" placeholder="Instagram BIO, TikTok Main..." />
          </div>

          {error && <div className="error-text">{error}</div>}
          <div className="modal-actions">
            <button type="button" onClick={modal.close} className="btn btn-secondary">Отмена</button>
            <button type="submit" disabled={isPending} className="btn btn-primary">
              {isPending ? "Создание..." : "Создать"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
