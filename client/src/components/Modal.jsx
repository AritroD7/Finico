import { useEffect } from "react"

export default function Modal({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return
    const onEsc = (e) => e.key === "Escape" && onClose?.()
    window.addEventListener("keydown", onEsc)
    return () => window.removeEventListener("keydown", onEsc)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-[min(700px,92vw)] rounded-2xl bg-white shadow-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="px-2 py-1 text-slate-500 hover:text-slate-800" onClick={onClose}>✕</button>
        </div>
        <div className="text-sm text-slate-700 leading-6">{children}</div>
      </div>
    </div>
  )
}
