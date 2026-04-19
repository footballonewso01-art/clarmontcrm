"use client";

import { useState } from "react";
import { createModel } from "@/actions/models";
import { Modal, useModal } from "@/components/ui/Modal";

interface ModelActionsProps {
  agencies: Array<{ id: string; name: string }>;
}

export function ModelActions({ agencies }: ModelActionsProps) {
  const modal = useModal();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError("");
    const result = await createModel(formData);
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
      <button onClick={modal.open} className="btn btn-primary">+ Добавить модель</button>
      <Modal isOpen={modal.isOpen} onClose={modal.close} title="Новая модель">
        <form action={handleSubmit}>
          <div className="form-group">
            <label className="label" htmlFor="model-name">Имя модели</label>
            <input id="model-name" name="name" type="text" required className="input" placeholder="Имя модели" />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="model-agency">Агентство</label>
            <select id="model-agency" name="agencyId" className="select" required>
              <option value="">Выберите агентство</option>
              {agencies.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
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
