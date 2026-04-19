"use client";

import { useState } from "react";
import { recordConversion } from "@/actions/conversions";
import { Modal, useModal } from "@/components/ui/Modal";

interface ConversionActionsProps {
  workers: Array<{ id: string; name: string }>;
  models: Array<{ id: string; name: string }>;
}

export function ConversionActions({ workers, models }: ConversionActionsProps) {
  const modal = useModal();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError("");
    const result = await recordConversion(formData);
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
      <button onClick={modal.open} className="btn btn-primary">+ Записать конверсию</button>
      <Modal isOpen={modal.isOpen} onClose={modal.close} title="Новая конверсия">
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
            <label className="label">Общее кол-во подписчиков</label>
            <input name="subscribersTotal" type="number" min="0" required className="input" placeholder="0" />
          </div>
          <div className="form-group">
            <label className="label">Общий доход ($)</label>
            <input name="revenueTotal" type="number" step="0.01" min="0" required className="input" placeholder="0.00" />
          </div>
          {error && <div className="error-text">{error}</div>}
          <div className="modal-actions">
            <button type="button" onClick={modal.close} className="btn btn-secondary">Отмена</button>
            <button type="submit" disabled={isPending} className="btn btn-primary">
              {isPending ? "Запись..." : "Записать"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
