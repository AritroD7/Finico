// FILE: src/components/Toaster.jsx
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

const ToastCtx = createContext(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToasterProvider>");
  return ctx;
}

export function ToasterProvider({ children, limit = 3, duration = 3000 }) {
  const [items, setItems] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message, opts = {}) => {
      const id = ++idRef.current;
      const next = {
        id,
        message: String(message ?? ""),
        type: opts.type || "info",
        duration: Number.isFinite(opts.duration) ? opts.duration : duration,
      };
      setItems((prev) => [...prev, next].slice(-limit));
      if (next.duration > 0) {
        const t = setTimeout(() => dismiss(id), next.duration);
        return () => clearTimeout(t);
      }
      return id;
    },
    [duration, limit, dismiss]
  );

  const api = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="fixed right-4 bottom-4 z-[999] space-y-2">
        {items.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const color =
    toast.type === "error"
      ? "text-rose-700 border-rose-200"
      : toast.type === "success"
      ? "text-emerald-700 border-emerald-200"
      : "text-slate-700 border-slate-200";

  const dot =
    toast.type === "error"
      ? "bg-rose-500"
      : toast.type === "success"
      ? "bg-emerald-500"
      : "bg-indigo-500";

  return (
    <div className={`card px-3 py-2 flex items-center gap-2 border ${color}`}>
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      <span className="text-sm">{toast.message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-slate-400 hover:text-slate-600"
        aria-label="Close"
        title="Close"
      >
        ✕
      </button>
    </div>
  );
}

/* Support both import styles: */
export default ToasterProvider;        // default
export { ToasterProvider as Toaster }; // optional alias if you used this anywhere
export { useToast as useToaster };     // <-- legacy alias to satisfy existing imports
