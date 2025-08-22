import { NavLink } from 'react-router-dom'


export default function Home(){
return (
<div>
{/* Hero */}
<section className="container-page hero">
<div className="badge" style={{margin:'0 auto 10px', width:'fit-content'}}>
<span role="img" aria-label="lab">🧪</span>
<span>Actuarial‑inspired budgeting & forecasting</span>
</div>
<h1 className="hero-title text-gradient" style={{textAlign:'center'}}>Plan Smarter. Predict Better.</h1>
<p className="hero-sub" style={{textAlign:'center',maxWidth:760,margin:'8px auto 0'}}>
Budgeting, compounding, and risk simulations—explained with clear visuals and interactive tools.
</p>
<div className="hero-actions">
<NavLink to="/budget" className="btn btn-lg">Start Budgeting</NavLink>
<NavLink to="/forecast" className="btn-outline btn-lg">Run a Forecast</NavLink>
</div>
</section>


{/* How it works */}
<section className="container-page section">
<h2 className="section-title">How it works</h2>
<p className="section-subtitle">Four quick steps to build confidence in your plan.</p>
<div className="section" style={{display:'grid',gap:16,gridTemplateColumns:'repeat(1,minmax(0,1fr))'}}>
<div className="card glass" style={{display:'grid',gap:8}}>
<div className="step">1</div>
<div className="text-sm font-semibold">Input</div>
<div className="section-subtitle">Enter income, expenses, and assumptions.</div>
</div>
<div className="card glass" style={{display:'grid',gap:8}}>
<div className="step">2</div>
<div className="text-sm font-semibold">Model</div>
<div className="section-subtitle">We apply compound growth and/or stochastic returns.</div>
</div>
<div className="card glass" style={{display:'grid',gap:8}}>
<div className="step">3</div>
<div className="text-sm font-semibold">Simulate</div>
<div className="section-subtitle">Run Monte Carlo to understand ranges of outcomes.</div>
</div>
<div className="card glass" style={{display:'grid',gap:8}}>
<div className="step">4</div>
<div className="text-sm font-semibold">Decide</div>
<div className="section-subtitle">Use KPIs, percentiles, and charts to plan actions.</div>
</div>
</div>
</section>


{/* Tools */}
<section className="container-page section">
<div className="grid-2">
<div className="card">
<h3 className="text-md font-semibold">Budget Planner</h3>
<p className="section-subtitle">Track income, expense allocation, and savings rate.</p>
<div className="spacer"/>
<NavLink to="/budget" className="btn-outline">Open →</NavLink>
</div>
<div className="card">
<h3 className="text-md font-semibold">Wealth Forecast</h3>
<p className="section-subtitle">Compound growth vs inflation with clear charts.</p>
<div className="spacer"/>
<NavLink to="/forecast" className="btn-outline">Open →</NavLink>
</div>
<div className="card">
<h3 className="text-md font-semibold">Risk Modeling</h3>
<p className="section-subtitle">Monte Carlo: p5 / median / p95 projections.</p>
<div className="spacer"/>
<NavLink to="/risk" className="btn-outline">Open →</NavLink>
</div>
<div className="card">
<h3 className="text-md font-semibold">Goal Planner</h3>
<p className="section-subtitle">Required monthly to hit a target probability.</p>
<div className="spacer"/>
<NavLink to="/goal" className="btn-outline">Open →</NavLink>
</div>
</div>
</section>
</div>
)
}