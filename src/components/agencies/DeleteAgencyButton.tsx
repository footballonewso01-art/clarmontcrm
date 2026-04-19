"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteAgency } from "@/actions/agencies";
import { Modal } from "@/components/ui/Modal";

interface DeleteAgencyButtonProps {
  agencyId: string;
  agencyName: string;
}

export function DeleteAgencyButton({ agencyId, agencyName }: DeleteAgencyButtonProps) {
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
    const result = await deleteAgency(agencyId);
    
    if (result.error) {
      alert(result.error);
      setIsDeleting(false);
    } else {
      router.push("/dashboard/agencies");
      router.refresh();
    }
  }

  return (
    <>
      <button 
        onClick={handleOpen} 
        className="btn btn-danger"
      >
        Удалить агентство
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Удаление агентства">
        <div>
          <p style={{ color: "var(--color-text)", marginBottom: "1rem", lineHeight: 1.5 }}>
            Вы собираетесь безвозвратно удалить агентство <strong style={{ color: "var(--color-danger)" }}>{agencyName}</strong>.
          </p>
          <div style={{ padding: "1rem", background: "rgba(239, 68, 68, 0.1)", borderRadius: "var(--radius-md)", border: "1px solid rgba(239, 68, 68, 0.2)", marginBottom: "1.5rem" }}>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
              <strong>Внимание:</strong> Будет произведено Мягкое Удаление. 
            </p>
            <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
              <li>Агентство исчезнет из списков</li>
              <li>Все модели этого агентства исчезнут из списков</li>
              <li>Прибыль агентства останется зафиксирована в Дашборде</li>
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
