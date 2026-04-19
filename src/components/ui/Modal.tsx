"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <h2 className="modal-title" style={{ margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: "0.25rem 0.5rem", fontSize: "1.25rem", lineHeight: 1 }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "danger" | "success";
  isPending?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Подтвердить",
  variant = "danger",
  isPending = false,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{title}</h2>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
          {message}
        </p>
        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-secondary" disabled={isPending}>
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className={`btn ${variant === "danger" ? "btn-danger" : "btn-success"}`}
            disabled={isPending}
          >
            {isPending ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((v) => !v),
  };
}
