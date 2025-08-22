export default function StatMini({ label, value, accent }) {
  return (
    <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`text-xl font-bold ${accent || "text-slate-900"}`}>{value}</div>
    </div>
  )
}
