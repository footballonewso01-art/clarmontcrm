"use client";

import { useState } from "react";
import { processAgencyPayout } from "@/actions/payouts";
import { Modal, useModal } from "@/components/ui/Modal";

interface AgencyPayoutButtonProps {
  agencyId: string;
  maxAmount: number;
}

export function AgencyPayoutButton({ agencyId, maxAmount }: AgencyPayoutButtonProps) {
  const modal = useModal();
  const [amount, setAmount] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function handlePayout() {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError("Введите корректную сумму");
      return;
    }
    if (num > maxAmount) {
      setError(`Максимальная сумма: $${maxAmount.toFixed(2)}`);
      return;
    }
    setIsPending(true);
    setError("");
    const result = await processAgencyPayout(agencyId, num);
    if (result?.error) {
      setError(result.error);
    } else {
      modal.close();
      setAmount("");
    }
    setIsPending(false);
  }

  return (
    <>
      <button
        onClick={modal.open}
        disabled={maxAmount <= 0}
        className="btn btn-success"
      >
        📥 Подтвердить оплату
      </button>

      <Modal isOpen={modal.isOpen} onClose={modal.close} title="Поступление от агентства">
        <div className="form-group">
          <label className="label">Сумма поступления ($)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max={maxAmount}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input"
            placeholder={`Максимум: $${maxAmount.toFixed(2)}`}
          />
        </div>
        <div style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}>
          <button
            type="button"
            onClick={() => setAmount((maxAmount * 0.25).toFixed(2))}
            className="btn btn-ghost btn-sm"
          >25%</button>
          <button
            type="button"
            onClick={() => setAmount((maxAmount * 0.5).toFixed(2))}
            className="btn btn-ghost btn-sm"
          >50%</button>
          <button
            type="button"
            onClick={() => setAmount(maxAmount.toFixed(2))}
            className="btn btn-ghost btn-sm"
          >100%</button>
        </div>
        {error && <div className="error-text">{error}</div>}
        <div className="modal-actions">
          <button onClick={modal.close} className="btn btn-secondary">Отмена</button>
          <button onClick={handlePayout} disabled={isPending} className="btn btn-success">
            {isPending ? "Обработка..." : "Записать доход"}
          </button>
        </div>
      </Modal>
    </>
  );
}
