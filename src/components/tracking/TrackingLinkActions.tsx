"use client";

import { useState } from "react";
import { createTrackingLink } from "@/actions/conversions";
import { Modal, useModal } from "@/components/ui/Modal";

interface TrackingLinkActionsProps {
  workers: Array<{ id: string; name: string }>;
  models: Array<{ id: string; name: string }>;
}

export function TrackingLinkActions({ workers, models }: TrackingLinkActionsProps) {
  const modal = useModal();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError("");
    const result = await createTrackingLink(formData);
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
      <button onClick={modal.open} className="btn btn-primary">+ Добавить ссылку</button>
      <Modal isOpen={modal.isOpen} onClose={modal.close} title="Новый tracking link">
        <form action={handleSubmit}>
          <div className="form-group">
            <label className="label">Воркер</label>
            <select name="workerId" className="select" required>
              <option value="">Выберите воркера</option>
              {workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Модель</label>
            <select name="modelId" className="select" required>
              <option value="">Выберите модель</option>
              {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">URL</label>
            <input name="url" type="url" required className="input" placeholder="https://onlyfans.com/..." />
          </div>
          <div className="form-group">
            <label className="label">Название (опционально)</label>
            <input name="name" type="text" className="input" placeholder="Instagram BIO, TikTok Main..." />
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
