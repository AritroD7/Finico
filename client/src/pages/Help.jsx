// FILE: client/src/pages/Help.jsx
export default function Help() {
  return (
    <div className="container-page">
      <div className="card max-w-3xl">
        <h1 className="text-lg font-semibold mb-2">Help</h1>
        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2">
          <li>Sign in from the navbar for saved scenarios (optional).</li>
          <li>Use <strong>Budget</strong> to summarize income/expenses and savings rate.</li>
          <li>Use <strong>Forecast</strong> for compounding projections (nominal vs real).</li>
          <li>Use <strong>Risk</strong> for Monte Carlo bands (P10/P50/P90).</li>
          <li>Use <strong>Goal</strong> to solve required monthly contributions.</li>
        </ul>
      </div>
    </div>
  )
}
