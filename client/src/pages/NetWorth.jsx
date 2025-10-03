// FILE: client/src/pages/NetWorth.jsx
import { useEffect, useMemo, useState } from "react"

const gradientCard =
  "relative overflow-hidden rounded-2xl border border-transparent [background:linear-gradient(#fff,#fff)_padding-box,linear-gradient(120deg,#c7d2fe,#f5d0fe)_border-box] shadow-sm"
const LS_KEY = "finico.networth.v1"

export default function NetWorth() {
  const [rows, setRows] = useState(() => {
    try { const r = localStorage.getItem(LS_KEY); if (r) return JSON.parse(r) } catch {}
    return [
      { id: 1, type: "asset", name: "Cash", amount: 5000 },
      { id: 2, type: "asset", name: "Investments", amount: 12000 },
      { id: 3, type: "liability", name: "Credit Card", amount: 800 },
    ]
  })
  useEffect(() => { try { localStorage.setItem(LS_KEY, JSON.stringify(rows)) } catch {} }, [rows])

  const totals = useMemo(() => {
    const a = rows.filter(r => r.type === "asset").reduce((s, r) => s + (Number(r.amount) || 0), 0)
    const l = rows.filter(r => r.type === "liability").reduce((s, r) => s + (Number(r.amount) || 0), 0)
    return { assets: a, liabilities: l, net: a - l }
  }, [rows])

  const add = (type) => setRows(r => [...r, { id: Date.now(), type, name: type === "asset" ? "New asset" : "New liability", amount: 0 }])
  const upd = (id, patch) => setRows(r => r.map(x => x.id === id ? { ...x, ...patch } : x))
  const del = (id) => setRows(r => r.filter(x => x.id !== id))

  const donutPct = totals.assets + totals.liabilities > 0 ? totals.assets / (totals.assets + totals.liabilities) : 0
  const donutStyle = { background: `conic-gradient(rgb(34 197 94) ${donutPct * 360}deg, rgb(239 68 68) 0)` }

  return (
    <div className="mx-auto max-w-6xl">
      <div className={`${gradientCard} p-4 sm:p-6`}>
        <h1 className="text-3xl font-semibold">
          <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">Net Worth</span>
        </h1>
        <p className="mt-1 text-sm text-slate-600">Track assets and liabilities. Data stays local in your browser.</p>
        <div className="mt-4 h-[2px] w-full rounded-full bg-gradient-to-r from-indigo-200 via-fuchsia-200 to-transparent" />
      </div>

      <div className="mb-6 mt-4 grid gap-3 md:grid-cols-3">
        <Kpi label="Assets" value={currency(totals.assets)} />
        <Kpi label="Liabilities" value={currency(totals.liabilities)} />
        <Kpi label="Net worth" value={currency(totals.net)} highlight={totals.net >= 0} />
      </div>

      <div className="grid gap-4 md:grid-cols-[1.05fr_.95fr]">
        <div className={`${gradientCard} p-4`}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Items</h3>
            <div className="flex gap-2">
              <button onClick={() => add("asset")} className="btn">Add asset</button>
              <button onClick={() => add("liability")} className="btn">Add liability</button>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="grid grid-cols-[1fr_140px_120px_44px] bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
              <div>Name</div><div className="text-right">Amount</div><div className="text-center">Type</div><div/>
            </div>
            <ul className="divide-y divide-slate-200">
              {rows.map(row => (
                <li key={row.id} className="grid grid-cols-[1fr_140px_120px_44px] items-center px-3 py-2">
                  <input className="input mr-2 w-full" value={row.name} onChange={(e)=>upd(row.id,{name:e.target.value})}/>
                  <input type="number" className="input w-full text-right" value={row.amount} onChange={(e)=>upd(row.id,{amount:Number(e.target.value||0)})}/>
                  <Type value={row.type} onChange={(t)=>upd(row.id,{type:t})}/>
                  <button onClick={()=>del(row.id)} className="inline-grid h-9 w-9 place-items-center rounded-md border border-slate-200 hover:bg-slate-50">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/></svg>
                  </button>
                </li>
              ))}
              {rows.length===0 && <li className="px-3 py-6 text-center text-sm text-slate-500">No items yet.</li>}
            </ul>
          </div>
        </div>

        <div className={`${gradientCard} p-4`}>
          <h3 className="text-sm font-semibold text-slate-900">Assets vs liabilities</h3>
          <div className="mt-3 grid grid-cols-[140px_1fr] items-center gap-4">
            <div className="relative mx-auto aspect-square w-[140px]">
              <div className="absolute inset-0 rounded-full" style={donutStyle}/>
              <div className="absolute inset-[10%] grid place-items-center rounded-full bg-white shadow-inner">
                <div className="text-center">
                  <div className="text-lg font-semibold">{Math.round(donutPct*100)}%</div>
                  <div className="text-[11px] text-slate-500">assets share</div>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <Legend color="bg-emerald-500" label="Assets" value={currency(totals.assets)}/>
              <Legend color="bg-rose-500" label="Liabilities" value={currency(totals.liabilities)}/>
              <Legend color="bg-slate-500" label="Net" value={currency(totals.net)}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function currency(n){return new Intl.NumberFormat(undefined,{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n||0)}
function Kpi({label,value,highlight}){return(<div className={`${gradientCard} p-4`}><div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight?"text-emerald-700":"text-slate-900"}`}>{value}</div></div>)}
function Type({value,onChange}){const isA=value==="asset";return(<div className="mx-auto inline-flex rounded-lg border border-slate-200 p-0.5"><button onClick={()=>onChange("asset")} className={`px-2.5 py-1.5 text-xs font-medium rounded-md ${isA?"bg-emerald-600 text-white":"text-slate-700 hover:bg-slate-50"}`}>Asset</button><button onClick={()=>onChange("liability")} className={`px-2.5 py-1.5 text-xs font-medium rounded-md ${!isA?"bg-rose-600 text-white":"text-slate-700 hover:bg-slate-50"}`}>Liability</button></div>)}
function Legend({color,label,value}){return(<div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5"><span className={`h-2.5 w-2.5 rounded-full ${color}`}/><span className="text-slate-700">{label}</span><span className="ml-auto font-medium">{value}</span></div>)}
