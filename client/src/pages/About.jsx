export default function About(){
  return (
    <div className="container-page">
      <h1 className="section-title mb-2">About</h1>
      <p className="section-subtitle mb-6">
        Finance Forecaster is a math‑driven budgeting and forecasting tool. It helps you model cashflow,
        compounding, and risk using actuarial concepts—without giving investment advice.
      </p>

      <div className="card space-y-3">
        <h2 className="text-lg font-semibold">Mission</h2>
        <p className="text-slate-700">
          Make rigorous financial modeling accessible to anyone—students, families, and builders—so they can make informed decisions with numbers, not noise.
        </p>

        <h2 className="text-lg font-semibold pt-2">What you’ll find here</h2>
        <ul className="list-disc pl-5 text-slate-700 space-y-1">
          <li>Budget planner with insights and suggestions</li>
          <li>Wealth projections with monthly compounding</li>
          <li>Monte Carlo risk modeling and goal planning</li>
          <li>Scenario comparison, sensitivity (tornado), stress testing</li>
        </ul>

        <h2 className="text-lg font-semibold pt-2">Disclaimer</h2>
        <p className="text-slate-700">
          This platform provides mathematical models and educational content. It is <strong>not</strong> financial, investment, tax, or legal advice. Outcomes are estimates and depend on your inputs.
        </p>

        <h2 className="text-lg font-semibold pt-2">Contact</h2>
        <p className="text-slate-700">Questions or ideas? Email: <a className="underline" href="mailto:hello@example.com">hello@example.com</a></p>
      </div>
    </div>
  )
}
