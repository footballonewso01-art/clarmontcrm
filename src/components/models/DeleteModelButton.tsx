"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteModel } from "@/actions/models";
import { Modal } from "@/components/ui/Modal";

interface DeleteModelButtonProps {
  modelId: string;
  modelName: string;
}

export function DeleteModelButton({ modelId, modelName }: DeleteModelButtonProps) {
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
    const result = await deleteModel(modelId);
    
    if (result.error) {
      alert(result.error);
      setIsDeleting(false);
    } else {
      setIsOpen(false);
      router.refresh();
    }
  }

  return (
    <>
      <button 
        onClick={handleOpen} 
        className="btn btn-ghost btn-sm"
        style={{ color: "var(--color-danger)" }}
        title="Удалить модель"
      >
        Удалить
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Удаление модели">
        <div>
          <p style={{ color: "var(--color-text)", marginBottom: "1rem", lineHeight: 1.5 }}>
            Вы собираетесь бессрочно скрыть модель <strong style={{ color: "var(--color-danger)" }}>{modelName}</strong>.
          </p>
          <div style={{ padding: "1rem", background: "rgba(239, 68, 68, 0.1)", borderRadius: "var(--radius-md)", border: "1px solid rgba(239, 68, 68, 0.2)", marginBottom: "1.5rem" }}>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
              <strong>Внимание:</strong> Будет произведено Мягкое Удаление. 
            </p>
            <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
              <li>Модель пропадет из списков</li>
              <li>Все трекинг-ссылки, ведущие на эту модель, перестанут отображаться</li>
              <li>Вся накопленная прибыль сохранится в Дашборде и Агентстве</li>
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
