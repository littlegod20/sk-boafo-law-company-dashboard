"use client";

import { useEffect, useRef } from "react";
import { Icon } from "./Icons";

// ---------------------------------------------------------------------------
// Modal — generic overlay container
// ---------------------------------------------------------------------------
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(11,35,73,0.5)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9]">
          <h2 className="text-[15px] font-semibold text-[#0B2349]">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-[#F5F7FA] transition-colors text-[#94A3B8] hover:text-[#0B2349]"
          >
            <Icon name="x" className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ConfirmDialog — binary confirm / cancel overlay
// ---------------------------------------------------------------------------
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "danger" | "success" | "primary";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  variant = "primary",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const cfg = {
    danger:  { bg: "#DC2626", iconBg: "#FFF5F5", icon: "xmark-circle" as const },
    success: { bg: "#059669", iconBg: "#ECFDF5", icon: "check-circle"  as const },
    primary: { bg: "#0B2349", iconBg: "#EFF4FF", icon: "alert"         as const },
  }[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(11,35,73,0.5)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-6 pt-6 pb-5">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
            style={{ background: cfg.iconBg }}
          >
            <Icon
              name={cfg.icon}
              className="w-5 h-5"
              style={{ color: cfg.bg } as React.CSSProperties}
            />
          </div>
          <h3 className="text-[15px] font-semibold text-[#0B2349] mb-1">{title}</h3>
          <p className="text-[13px] text-[#64748B] leading-relaxed">{message}</p>
        </div>
        <div className="px-6 pb-5 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-[13px] font-medium text-[#64748B] hover:bg-[#F5F7FA] transition-colors border border-[#E2E8F0]"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="rounded-lg px-4 py-2 text-[13px] font-medium text-white transition-colors"
            style={{ background: cfg.bg }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FormField — reusable labeled input / select / textarea
// ---------------------------------------------------------------------------
interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, required, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// Common input class string (exported so pages can reuse)
export const inputCls =
  "w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-[13px] text-[#1e293b] outline-none focus:border-[#0B2349] transition-colors bg-white";

// ---------------------------------------------------------------------------
// ModalFooter — consistent save/cancel row
// ---------------------------------------------------------------------------
interface ModalFooterProps {
  onClose: () => void;
  confirmLabel?: string;
  onConfirm?: () => void;
}

export function ModalFooter({ onClose, confirmLabel = "Save", onConfirm }: ModalFooterProps) {
  return (
    <div className="flex gap-3 justify-end pt-4 border-t border-[#F1F5F9] mt-1">
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg px-4 py-2 text-[13px] font-medium text-[#64748B] hover:bg-[#F5F7FA] transition-colors border border-[#E2E8F0]"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm ?? onClose}
        className="rounded-lg px-4 py-2 text-[13px] font-medium text-white transition-colors"
        style={{ background: "#0B2349" }}
      >
        {confirmLabel}
      </button>
    </div>
  );
}
