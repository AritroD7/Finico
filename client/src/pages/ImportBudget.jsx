import { useState } from "react"
import Papa from "papaparse"

export default function ImportBudget(){
  const [rows, setRows] = useState([])
  const [cols, setCols] = useState([])
  const [map, setMap] = useState({ amount: "", category: "" })
  const [totals, setTotals] = useState(null)
  const categories = ["Fixed", "Variable", "Other"]

  function onFile(e){
    const file = e.target.files?.[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const r = res.data
        setRows(r)
        setCols(Object.keys(r[0] || {}))
      }
    })
  }

  function compute(){
    if (!map.amount || !map.category) return alert("Select amount and category columns")
    const agg = { Fixed:0, Variable:0, Other:0 }
    for (const r of rows){
      const amt = Number(String(r[map.amount]).replace(/[^0-9.-]/g,"")) || 0
      const cat = categories.includes(r[map.category]) ? r[map.category] : "Variable"
      agg[cat] += Math.abs(amt)  // treat expenses as positive
    }
    setTotals(agg)
  }

  return (
    <div className="container-page">
      <h1 className="section-title mb-2">Import Budget (CSV)</h1>
      <p className="section-subtitle mb-6">Upload a CSV (e.g., bank export) with columns for amount and category.</p>

      <div className="card mb-6">
        <input type="file" accept=".csv" onChange={onFile} />
        {cols.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Amount column</label>
              <select className="input" value={map.amount} onChange={e=>setMap(m=>({...m, amount:e.target.value}))}>
                <option value="">Select</option>
                {cols.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Category column</label>
              <select className="input" value={map.category} onChange={e=>setMap(m=>({...m, category:e.target.value}))}>
                <option value="">Select</option>
                {cols.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="text-xs text-slate-500 mt-1">Values must be one of: Fixed, Variable, Other</div>
            </div>
          </div>
        )}
        <div className="mt-4">
          <button className="btn" onClick={compute} disabled={!rows.length}>Compute Totals</button>
        </div>
      </div>

      {totals && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-3">Monthly Totals</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div><div className="text-slate-500 text-sm">Fixed</div><div className="text-xl font-semibold">${Math.round(totals.Fixed).toLocaleString()}</div></div>
            <div><div className="text-slate-500 text-sm">Variable</div><div className="text-xl font-semibold">${Math.round(totals.Variable).toLocaleString()}</div></div>
            <div><div className="text-slate-500 text-sm">Other</div><div className="text-xl font-semibold">${Math.round(totals.Other).toLocaleString()}</div></div>
          </div>
          <div className="mt-4 text-sm text-slate-600">
            Copy these into the Budget Planner to analyze cashflow and savings rate.
          </div>
        </div>
      )}
    </div>
  )
}
