// Simple "?" badge that shows a tooltip on hover/focus.
// Usage: <InfoTip text="Your help text or formula here" />
export default function InfoTip({ text, className = "" }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs bg-slate-200 text-slate-700 ml-2 cursor-help ${className}`}
      title={text}
      aria-label={text}
      tabIndex={0}
    >
      ?
    </span>
  )
}
