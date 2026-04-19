"use client";

import { useState } from "react";
import { processWorkerPayout } from "@/actions/payouts";
import { ConfirmDialog, useModal } from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";

interface PayoutButtonProps {
  workerId: string;
  modelId: string;
  modelName: string;
  canPayout: boolean;
  amount: number;
  subscribers: number;
}

export function PayoutButton({ workerId, modelId, modelName, canPayout, amount, subscribers }: PayoutButtonProps) {
  const modal = useModal();
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  async function handlePayout() {
    setIsPending(true);
    setResult(null);
    const res = await processWorkerPayout(workerId, modelId);
    setResult(res);
    setIsPending(false);
    if (res.success) {
      modal.close();
    }
  }

  return (
    <>
      <button
        onClick={modal.open}
        disabled={!canPayout}
        className="btn btn-success btn-lg"
      >
        💸 Выплатить {formatCurrency(amount)}
      </button>

      <ConfirmDialog
        isOpen={modal.isOpen}
        onClose={modal.close}
        onConfirm={handlePayout}
        title="Подтверждение выплаты"
        message={`Выплатить ${formatCurrency(amount)} за ${subscribers} подписчиков (Модель: ${modelName})? Это действие необратимо.`}
        confirmLabel={`Выплатить ${formatCurrency(amount)}`}
        variant="success"
        isPending={isPending}
      />

      {result?.error && (
        <div style={{
          marginTop: "0.5rem",
          padding: "0.5rem",
          borderRadius: "var(--radius-md)",
          background: "var(--color-danger-muted)",
          color: "var(--color-danger)",
          fontSize: "0.8125rem",
        }}>
          {result.error}
        </div>
      )}
    </>
  );
}
