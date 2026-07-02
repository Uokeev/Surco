"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

// ─── Types ───────────────────────────────────────────────
export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

// ─── Context ─────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration = 5000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, message, duration }]);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}

      {/* Toast container — fixed al fondo */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col-reverse gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none"
        aria-live="polite"
        aria-relevant="additions removals"
        role="status"
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Toast Item ──────────────────────────────────────────
function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Pequeño delay para animación de entrada
    const enterTimer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(enterTimer);
  }, []);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const dismissTimer = setTimeout(() => {
        setExiting(true);
        setTimeout(onDismiss, 300);
      }, toast.duration);
      return () => clearTimeout(dismissTimer);
    }
  }, [toast.duration, onDismiss]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(onDismiss, 300);
  };

  const styles: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "✓",
      text: "text-green-800",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "✕",
      text: "text-red-800",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "ℹ",
      text: "text-blue-800",
    },
    warning: {
      bg: "bg-warm-50",
      border: "border-warm-200",
      icon: "⚠",
      text: "text-warm-800",
    },
  };

  const s = styles[toast.type];

  return (
    <div
      className={`
        pointer-events-auto rounded-xl border px-4 py-3 shadow-lg
        flex items-start gap-3 text-sm font-medium transition-all duration-300
        ${s.bg} ${s.text}
        ${visible && !exiting ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
      `}
      role="alert"
    >
      <span className="shrink-0 text-base leading-none mt-0.5">{s.icon}</span>
      <p className="flex-1 leading-relaxed">{toast.message}</p>
      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity text-sm font-bold leading-none"
        aria-label="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  );
}

// ─── Hook ────────────────────────────────────────────────
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast debe usarse dentro de un ToastProvider");
  }
  return ctx;
}

/** Atajo: toast.success("Mensaje") */
export function useToastHelpers() {
  const { addToast } = useToast();
  return {
    success: (msg: string, duration?: number) => addToast("success", msg, duration),
    error: (msg: string, duration?: number) => addToast("error", msg, duration),
    info: (msg: string, duration?: number) => addToast("info", msg, duration),
    warning: (msg: string, duration?: number) => addToast("warning", msg, duration),
  };
}
