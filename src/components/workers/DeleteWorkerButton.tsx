"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteWorker } from "@/actions/workers";
import { Modal } from "@/components/ui/Modal";

interface DeleteWorkerButtonProps {
  workerId: string;
  workerName: string;
}

export function DeleteWorkerButton({ workerId, workerName }: DeleteWorkerButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isOpen, countdown]);

  function handleOpen() {
    setCountdown(5);
    setIsOpen(true);
  }

  async function handleDelete() {
    if (countdown > 0) return;
    
    setIsDeleting(true);
    const result = await deleteWorker(workerId);
    
    if (result.error) {
      alert(result.error);
      setIsDeleting(false);
    } else {
      router.push("/dashboard/workers");
      router.refresh();
    }
  }

  return (
    <>
      <button 
        onClick={handleOpen} 
        className="btn btn-danger"
      >
        Удалить воркера
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Удаление воркера">
        <div>
          <p style={{ color: "var(--color-text)", marginBottom: "1rem", lineHeight: 1.5 }}>
            Вы собираетесь безвозвратно удалить воркера <strong style={{ color: "var(--color-danger)" }}>{workerName}</strong>.
          </p>
          <div style={{ padding: "1rem", background: "rgba(239, 68, 68, 0.1)", borderRadius: "var(--radius-md)", border: "1px solid rgba(239, 68, 68, 0.2)", marginBottom: "1.5rem" }}>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
              <strong>Внимание:</strong> Вместе с воркером будут удалены все связанные с ним данные, включая:
            </p>
            <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
              <li>Все его трекинг-ссылки</li>
              <li>Все истории конверсий и зачислений этого воркера</li>
              <li>Вся история выплат этому воркера</li>
            </ul>
          </div>

          <div className="modal-actions">
            <button 
              onClick={() => setIsOpen(false)} 
              className="btn btn-secondary"
              disabled={isDeleting}
            >
              Отмена
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-danger"
              disabled={countdown > 0 || isDeleting}
              style={{ minWidth: "140px" }}
            >
              {isDeleting ? "Удаление..." : countdown > 0 ? `Подтвердить (${countdown} сек)` : "Удалить навсегда"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
