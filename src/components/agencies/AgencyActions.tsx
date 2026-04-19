"use client";

import { useState } from "react";
import { createAgency } from "@/actions/agencies";
import { Modal, useModal } from "@/components/ui/Modal";

export function AgencyActions() {
  const modal = useModal();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError("");
    const result = await createAgency(formData);
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
      <button onClick={modal.open} className="btn btn-primary">+ Добавить агентство</button>
      <Modal isOpen={modal.isOpen} onClose={modal.close} title="Новое агентство">
        <form action={handleSubmit}>
          <div className="form-group">
            <label className="label" htmlFor="agency-name">Название</label>
            <input id="agency-name" name="name" type="text" required className="input" placeholder="Название агентства" />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="agency-rate">Ставка за подписчика ($)</label>
            <input id="agency-rate" name="ratePerSubscriber" type="number" step="0.01" min="0" defaultValue="1.00" required className="input" />
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
