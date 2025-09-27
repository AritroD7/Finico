// FILE: client/src/pages/RiskModeling.jsx
import { useEffect, useRef, useState } from "react"
import { postMonteCarlo } from "../api"
import { useToaster } from "../components/Toaster"

const formatMoney = (n, code = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: code }).format(Number(n || 0))

export default function RiskModeling() {
  const { push } = useToaster()

  const [initial, setInitial] = useState(1000)
  const [monthly, setMonthly] = useState(300)
  const [years, setYears] = useState(10)
  const [meanReturn, setMeanReturn] = useState(7)
  const [stdevReturn, setStdevReturn] = useState(15)
  const [inflation, setInflation] = useState(2.5)
  const [fee, setFee] = useState(0.2)
  const [sims, setSims] = useState(500)
  const [seed, setSeed] = useState(0)

  const [res, setRes] = useState(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    try {
      const r = await postMonteCarlo({
        initial, monthly, years,
        mean_annual_return_pct: meanReturn,
        stdev_annual_return_pct: stdevReturn,
        annual_inflation_pct: inflation,
        annual_fee_pct: fee,
        simulations: sims, seed,
      })
      setRes(r)
    } catch (e) {
      push({ title: "Monte Carlo error", message: e.message, type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-page">
      <div className="max-w-5xl mx-auto">
        <div className="card">
          <h1 className="text-lg font-semibold mb-2">Risk Modeling (Monte Carlo)</h1>
          <p className="text-sm text-slate-600 mb-4">Currency: <span className="font-medium">USD</span></p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                <Num label="Initial" val={initial} setVal={setInitial} />
                <Num label="Monthly contribution" val={monthly} setVal={setMonthly} />
                <Num label="Years" val={years} setVal={setYears} step={1} />
                <Num label="Mean annual return (%)" val={meanReturn} setVal={setMeanReturn} />
                <Num label="Stdev annual return (%)" val={stdevReturn} setVal={setStdevReturn} />
                <Num label="Annual inflation (%)" val={inflation} setVal={setInflation} />
                <Num label="Annual fee (%)" val={fee} setVal={setFee} />
                <Num label="Simulations" val={sims} setVal={setSims} step={50} />
                <Num label="Random seed (0 = random)" val={seed} setVal={setSeed} step={1} />
                <button className="btn" onClick={run} disabled={loading}>
                  {loading ? "Running…" : "Run simulation"}
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 border rounded-2xl p-3 bg-white">
              <MonteChart res={res} />
              {res ? (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Ending label="P10 ending" v={res.ending.p10} />
                  <Ending label="Median ending (P50)" v={res.ending.p50} />
                  <Ending label="P90 ending" v={res.ending.p90} />
                </div>
              ) : (
                <div className="text-sm text-slate-500">Enter inputs and run simulation.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Num({ label, val, setVal, step = 0.01 }) {
  return (
    <label className="block">
      <div className="text-sm font-medium mb-1">{label}</div>
      <input type="number" step={step} className="input w-full" value={val} onChange={(e) => setVal(Number(e.target.value || 0))} />
    </label>
  )
}
function Ending({ label, v }) {
  return (
    <div className="p-3 rounded-xl border bg-white">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-base font-semibold">{formatMoney(v)}</div>
    </div>
  )
}
function MonteChart({ res }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!res || !ref.current) return
    let chart; let cancelled = false
    ;(async () => {
      try {
        const ChartJS = (await import('chart.js/auto')).default
        if (cancelled) return
        const ctx = ref.current.getContext('2d')
        const labels = Array.from({ length: (res.months || 0) + 1 }, (_, i) => i)
        const data = {
          labels,
          datasets: [
            { label: 'P10', data: res.p10 || [], tension: 0.2 },
            { label: 'P50', data: res.p50 || [], tension: 0.2 },
            { label: 'P90', data: res.p90 || [], tension: 0.2 },
          ],
        }
        chart = new ChartJS(ctx, {
          type: 'line',
          data,
          options: {
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { position: 'bottom' } },
            scales: { x: { title: { display: true, text: 'Months' } }, y: { title: { display: true, text: 'Balance' } } },
          },
        })
      } catch (e) { console.warn('Chart.js not available', e) }
    })()
    return () => { cancelled = true; try { chart?.destroy() } catch {} }
  }, [res])
  return <canvas ref={ref} height={260} />
}
