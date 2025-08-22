import { useEffect, useMemo, useRef, useState } from "react"
import { Line, Bar } from "react-chartjs-2"
import { Chart as ChartJS, LineElement, LinearScale, PointElement, Tooltip, Legend, CategoryScale, BarElement } from "chart.js"
import SliderInput from "../components/SliderInput.jsx"
import StatMini from "../components/StatMini.jsx"
import Modal from "../components/Modal.jsx"
import InfoTip from "../components/InfoTip.jsx"
import { postCompound } from "../api.js"
import { useAuth } from "../hooks/useAuth"
import { useCurrency } from "../context/Currency"
import { saveScenario, listScenarios } from "../services/scenarios"
import { exportElementToPDF } from "../utils/exportPdf"

ChartJS.register(LineElement, LinearScale, PointElement, Tooltip, Legend, CategoryScale, BarElement)

const SCENARIOS = {
  conservative: { name: "Conservative", annual_return_pct: 5, annual_inflation_pct: 3, annual_fee_pct: 0.2 },
  base:         { name: "Base",         annual_return_pct: 7, annual_inflation_pct: 2.5, annual_fee_pct: 0.1 },
  aggressive:   { name: "Aggressive",   annual_return_pct: 9, annual_inflation_pct: 2.2, annual_fee_pct: 0.1 }
}

const a2m = (annualPct) => (Math.pow(1 + Number(annualPct||0)/100, 1/12) - 1) * 100
const m2a = (monthlyPct) => (Math.pow(1 + Number(monthlyPct||0)/100, 12) - 1) * 100
const round = (x, d=4) => Number.isFinite(x) ? Number(x.toFixed(d)) : 0

export default function WealthForecast(){
  const { user } = useAuth()
  const { base, format, toUSD } = useCurrency() // format: USD→base; toUSD: base→USD

  // Inputs (typed in BASE currency)
  const [initial, setInitial] = useState(5000)
  const [monthly, setMonthly] = useState(300)

  // Rate mode & synced rates
  const [rateMode, setRateMode] = useState("annual")
  const [ret, setRet] = useState(7)
  const [infl, setInfl] = useState(2.5)
  const [retM, setRetM] = useState(round(a2m(7)))
  const [inflM, setInflM] = useState(round(a2m(2.5)))

  const [esc, setEsc] = useState(0)   // annual contribution escalation %
  const [fee, setFee] = useState(0.1) // annual fee drag %
  const [years, setYears] = useState(20)

  const [tab, setTab] = useState("single") // single | compare | sensitivity | stress
  const [res, setRes] = useState(null)
  const [loading, setLoading] = useState(false)
  const [openInfo, setOpenInfo] = useState(false)
  const [errMsg, setErrMsg] = useState("")

  // Compare
  const [scA, setScA] = useState(SCENARIOS.conservative)
  const [scB, setScB] = useState(SCENARIOS.base)
  const [scC, setScC] = useState(SCENARIOS.aggressive)
  const [resA, setResA] = useState(null)
  const [resB, setResB] = useState(null)
  const [resC, setResC] = useState(null)
  const [cmpLoading, setCmpLoading] = useState(false)

  // Sensitivity
  const [sens, setSens] = useState(null)
  const [sensLoading, setSensLoading] = useState(false)
  const bump = 0.1

  // Stress (frontend sim)
  const [stress, setStress] = useState({ pauseMonths: 0, drawdownPct: 0, drawdownMonth: 1, inflSpikePctMo: 0, inflSpikeMonths: 0 })
  const [stressRes, setStressRes] = useState(null)

  // Saved
  const [saved, setSaved] = useState([])
  useEffect(()=> { (async () => { if (user) setSaved(await listScenarios(user, "forecast")) })() }, [user])

  const reportRef = useRef(null)

  // SYNC handlers
  const onAnnualReturnChange = (val) => { setRet(val); setRetM(round(a2m(val))) }
  const onMonthlyReturnChange = (val) => { setRetM(val); setRet(round(m2a(val))) }
  const onAnnualInflChange   = (val) => { setInfl(val); setInflM(round(a2m(val))) }
  const onMonthlyInflChange  = (val) => { setInflM(val); setInfl(round(m2a(val))) }

  const switchToAnnual = () => { onMonthlyReturnChange(retM); onMonthlyInflChange(inflM); setRateMode("annual") }
  const switchToMonthly = () => { onAnnualReturnChange(ret);  onAnnualInflChange(infl);   setRateMode("monthly") }

  // Run single
  const run = async () => {
    setErrMsg(""); setLoading(true)
    try {
      const payload = {
        initial: toUSD(initial, base),
        monthly_contrib: toUSD(monthly, base),
        years,
        rate_mode: rateMode,
        annual_return_pct: ret,
        annual_inflation_pct: infl,
        monthly_return_pct: retM,
        monthly_inflation_pct: inflM,
        contrib_escalation_pct: esc,
        annual_fee_pct: fee
      }
      const r = await postCompound(payload) // USD series
      setRes(r)
    } catch (e) { setErrMsg(e?.message || "Failed to run forecast.") }
    finally { setLoading(false) }
  }

  // Charts
  const labels = useMemo(() => res?.months?.map(m => (m%12===0 ? `Y${m/12}` : "")) || [], [res])
  const singleData = useMemo(()=>({
    labels,
    datasets: [
      { label: "Nominal", data: res?.balances_nominal || [], tension:.25, borderWidth:2 },
      { label: "Real (inflation-adjusted)", data: res?.balances_real || [], tension:.25, borderWidth:2 }
    ]
  }), [labels, res])
  const chartOptions = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ position:"bottom" }, tooltip:{ callbacks:{
      label:(ctx)=> `${ctx.dataset.label}: ${format(Number(ctx.raw))}`
    }}},
    scales:{ x:{ grid:{ color:"rgba(148,163,184,0.15)" } }, y:{ grid:{ color:"rgba(148,163,184,0.15)" } } },
    animation:{ duration:450, easing:"easeOutQuart" }
  }
  const finalNom = res?.balances_nominal?.slice(-1)[0] || 0
  const finalReal = res?.balances_real?.slice(-1)[0] || 0
  const meta = res?.meta

  // Compare
  async function runScenario(opts){
    const payload = {
      initial: toUSD(initial, base),
      monthly_contrib: toUSD(monthly, base),
      years,
      rate_mode: "annual",
      annual_return_pct: opts.annual_return_pct,
      annual_inflation_pct: opts.annual_inflation_pct,
      monthly_return_pct: 0, monthly_inflation_pct: 0,
      contrib_escalation_pct: esc,
      annual_fee_pct: opts.annual_fee_pct ?? fee
    }
    return postCompound(payload)
  }
  const runCompare = async () => {
    setErrMsg(""); setCmpLoading(true)
    try {
      const [A,B,C] = await Promise.all([runScenario(scA), runScenario(scB), runScenario(scC)])
      setResA(A); setResB(B); setResC(C)
    } catch (e) { setErrMsg(e?.message || "Compare failed.") }
    finally { setCmpLoading(false) }
  }
  const cmpLabels = useMemo(()=> resA?.months?.map(m => (m%12===0 ? `Y${m/12}` : "")) || [], [resA])
  const cmpData = useMemo(()=>({
    labels: cmpLabels,
    datasets: [
      { label: `${scA.name} (Real)`, data: resA?.balances_real || [], tension:.25, borderWidth:2 },
      { label: `${scB.name} (Real)`, data: resB?.balances_real || [], tension:.25, borderWidth:2 },
      { label: `${scC.name} (Real)`, data: resC?.balances_real || [], tension:.25, borderWidth:2 }
    ]
  }), [cmpLabels, resA, resB, resC, scA, scB, scC])
  const fA = resA?.balances_real?.slice(-1)[0] || 0
  const fB = resB?.balances_real?.slice(-1)[0] || 0
  const fC = resC?.balances_real?.slice(-1)[0] || 0

  // Sensitivity
  const baseInput = useMemo(()=>({
    initial: toUSD(initial, base),
    monthly_contrib: toUSD(monthly, base),
    years,
    rate_mode: "annual",
    annual_return_pct: ret,
    annual_inflation_pct: infl,
    monthly_return_pct: 0, monthly_inflation_pct: 0,
    contrib_escalation_pct: esc, annual_fee_pct: fee
  }), [initial, monthly, years, ret, infl, esc, fee, base, toUSD])

  async function runSens(){
    setSensLoading(true); setErrMsg("")
    try{
      const baseRun = await postCompound(baseInput)
      const baseFinal = baseRun.balances_real.slice(-1)[0]
      const runners = [
        { key:"annual_return_pct", label:"Return", up: baseInput.annual_return_pct*(1+bump) },
        { key:"annual_inflation_pct", label:"Inflation", up: baseInput.annual_inflation_pct*(1+bump) },
        { key:"monthly_contrib", label:"Contribution", up: baseInput.monthly_contrib*(1+bump) },
        { key:"years", label:"Years", up: Math.round(baseInput.years*(1+bump)) },
        { key:"annual_fee_pct", label:"Fees", up: baseInput.annual_fee_pct*(1+bump) },
        { key:"contrib_escalation_pct", label:"Escalation", up: baseInput.contrib_escalation_pct*(1+bump) },
      ]
      const results = []
      for (const r of runners){
        const p = { ...baseInput, [r.key]: r.up }
        const out = await postCompound(p)
        const f = out.balances_real.slice(-1)[0]
        const pct = ((f - baseFinal) / (baseFinal || 1)) * 100
        results.push({ label: r.label, pct })
      }
      results.sort((a,b)=> Math.abs(b.pct)-Math.abs(a.pct))
      setSens({ baseFinal, bars: results })
    }catch(e){ setErrMsg(e?.message || "Sensitivity failed.") }
    finally{ setSensLoading(false) }
  }
  const tornadoData = useMemo(()=>({
    labels: sens?.bars?.map(b=>b.label) || [],
    datasets: [{ label: "% change in final real balance (↑10% input)", data: sens?.bars?.map(b=>Number(b.pct.toFixed(2))) || [] }]
  }), [sens])
  const tornadoOpts = {
    indexAxis: 'y', responsive:true, maintainAspectRatio:false,
    plugins: { legend: { position:"bottom" } },
    scales: { x:{ grid:{ color:"rgba(148,163,184,0.15)" }, ticks:{ callback:v=>`${v}%` } }, y:{ grid:{ display:false } } }
  }

  // Stress (frontend)
  function simulateStress() {
    const r_m = (1 + ret/100) ** (1/12) - 1
    const i_m = (1 + infl/100) ** (1/12) - 1
    const fee_m = (1 + fee/100) ** (1/12) - 1
    const esc_m = (1 + esc/100) ** (1/12) - 1
    const r_eff = r_m - fee_m

    const months = years * 12
    let bal = toUSD(initial, base)
    let real = 1
    let contrib = toUSD(monthly, base)

    const nom = [bal]
    const rea = [bal]
    for (let m=1; m<=months; m++){
      if (stress.drawdownPct && m === Number(stress.drawdownMonth || 1)) {
        bal = bal * (1 - (Math.max(0, stress.drawdownPct) / 100))
      }
      const add = (m <= stress.pauseMonths) ? 0 : contrib
      bal = bal * (1 + r_eff) + add
      const i_extra = (m <= stress.inflSpikeMonths) ? (Math.max(0, stress.inflSpikePctMo)/100) : 0
      real *= (1 + i_m + i_extra)
      contrib *= (1 + esc_m)
      nom.push(bal)
      rea.push(bal / real)
    }
    return { months: Array.from({length: months+1}, (_,i)=>i), balances_nominal: nom, balances_real: rea }
  }
  const runStress = () => setStressRes(simulateStress())

  // Save & Export
  async function onSave(name="Forecast Scenario"){
    if (!user) return setErrMsg("Sign in to save scenarios.")
    const inputs = { baseCurrency: base, initial, monthly, rateMode, ret, infl, retM, inflM, esc, fee, years, stress }
    const results = { res, resA, resB, resC, sens, stressRes }
    await saveScenario(user, { name, page: "forecast", inputs, results })
    setSaved(await listScenarios(user, "forecast"))
  }
  async function onExport(){
    if (!reportRef.current) return
    await exportElementToPDF(reportRef.current, "forecast-report.pdf")
  }

  // Hints
  const hintAnnual     = `≈ ${round(a2m(ret),2)}% per month`
  const hintMonthly    = `≈ ${round(m2a(retM),2)}% per year`
  const hintInflAnnual = `≈ ${round(a2m(infl),2)}% per month`
  const hintInflMonthly= `≈ ${round(m2a(inflM),2)}% per year`

  return (
    <div className="container-page">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="section-title">
            Wealth Forecast <InfoTip text="Annual↔Monthly auto-convert: m=(1+a)^(1/12)−1, a=(1+m)^(12)−1" />
          </h1>
          <p className="section-subtitle mt-1">You’re entering values in <strong>{base}</strong>.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary focus-ring" onClick={()=>setOpenInfo(true)}>Methodology</button>
          <button className="btn-secondary focus-ring" onClick={onExport}>Export PDF</button>
          <button className="btn focus-ring" onClick={()=>onSave()}>Save</button>
        </div>
      </div>

      {saved?.length > 0 && user && (
        <div className="card mb-4">
          <div className="text-sm text-slate-600 mb-2">Saved Scenarios</div>
          <div className="flex flex-wrap gap-2">{saved.map(s => <span key={s.id} className="pill">{s.name}</span>)}</div>
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <button className={`btn-secondary ${rateMode==="annual" ? "ring-2 ring-blue-500/50" : ""}`} onClick={switchToAnnual}>Annual</button>
        <button className={`btn-secondary ${rateMode==="monthly" ? "ring-2 ring-blue-500/50" : ""}`} onClick={switchToMonthly}>Monthly</button>
      </div>

      {errMsg && <div className="text-rose-600 text-sm mb-3">{errMsg}</div>}

      <div className="mb-5 flex gap-2">
        {["single","compare","sensitivity","stress"].map(t => (
          <button key={t} className={`btn-secondary ${tab===t ? "ring-2 ring-blue-500/40" : ""}`} onClick={()=>setTab(t)}>
            {t==="single" ? "Single" : t==="compare" ? "Compare" : t==="sensitivity" ? "Sensitivity" : "Stress"}
          </button>
        ))}
      </div>

      {tab === "single" && (
        <div className="grid gap-6 lg:grid-cols-2" ref={reportRef}>
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Assumptions</h2>
            <div className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Initial ({base})</label>
                  <input className="input" type="number" value={initial} onChange={(e)=>setInitial(Number(e.target.value||0))}/>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Monthly Contribution ({base})</label>
                  <input className="input" type="number" value={monthly} onChange={(e)=>setMonthly(Number(e.target.value||0))}/>
                </div>
              </div>

              {rateMode === "annual" ? (
                <>
                  <SliderInput label="Expected Annual Return" hint={hintAnnual} value={ret} onChange={onAnnualReturnChange} min={-5} max={20} step={0.1} suffix="%" />
                  <SliderInput label="Annual Inflation" hint={hintInflAnnual} value={infl} onChange={onAnnualInflChange} min={0} max={10} step={0.1} suffix="%" />
                </>
              ) : (
                <>
                  <SliderInput label="Monthly Return" hint={hintMonthly} value={retM} onChange={onMonthlyReturnChange} min={-2} max={5} step={0.01} suffix="%/mo" />
                  <SliderInput label="Monthly Inflation" hint={hintInflMonthly} value={inflM} onChange={onMonthlyInflChange} min={0} max={2} step={0.01} suffix="%/mo" />
                </>
              )}
              <SliderInput label="Years" value={years} onChange={setYears} min={1} max={50} step={1} />
              <SliderInput label="Contribution Escalation (per year)" value={esc} onChange={setEsc} min={0} max={15} step={0.1} suffix="%" />
              <SliderInput label="Annual Fee (drag)" value={fee} onChange={setFee} min={0} max={3} step={0.05} suffix="%" />
            </div>
            <div className="mt-6 flex gap-3">
              <button className="btn" onClick={run} disabled={loading}>{loading ? "Running…" : "Run Forecast"}</button>
              <button className="btn-secondary" onClick={()=>{ setRes(null) }}>Clear</button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Projection</h2>
            {!res ? (
              <div className="helper py-10 text-center">Set assumptions and run a forecast.</div>
            ) : (
              <>
                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  <StatMini label="Final (Nominal)" value={format(finalNom)} accent="text-blue-700" />
                  <StatMini label="Final (Real)" value={format(finalReal)} accent="text-emerald-700" />
                  <StatMini label="Years" value={years} />
                </div>
                {meta && (
                  <div className="grid sm:grid-cols-3 gap-3 mb-4">
                    <div className="pill">r_month: {(meta.r_month*100).toFixed(3)}%</div>
                    <div className="pill">i_month: {(meta.i_month*100).toFixed(3)}%</div>
                    <div className="pill">fee_month: {(meta.fee_month*100).toFixed(3)}%</div>
                  </div>
                )}
                <div style={{height: 340}}>
                  <Line data={singleData} options={chartOptions}/>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {tab === "compare" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Scenarios</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <ScenarioCard label="A" sc={scA} setSc={setScA} />
              <ScenarioCard label="B" sc={scB} setSc={setScB} />
              <ScenarioCard label="C" sc={scC} setSc={setScC} />
            </div>
            <div className="mt-6 flex gap-3">
              <button className="btn" onClick={runCompare} disabled={cmpLoading}>{cmpLoading ? "Running…" : "Run Compare"}</button>
              <button className="btn-secondary" onClick={() => { setResA(null); setResB(null); setResC(null) }}>Clear</button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Comparison (Real)</h2>
            {(!resA || !resB || !resC) ? (
              <div className="helper">Configure scenarios and run.</div>
            ) : (
              <>
                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  <StatMini label={`${scA.name} (Y${years})`} value={format(fA)} />
                  <StatMini label={`${scB.name} (Y${years})`} value={format(fB)} />
                  <StatMini label={`${scC.name} (Y${years})`} value={format(fC)} />
                </div>
                <div style={{height: 340}}>
                  <Line data={cmpData} options={chartOptions} />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {tab === "sensitivity" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Inputs (Baseline)</h2>
            <div className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Initial ({base})</label>
                  <input className="input" type="number" value={initial} onChange={(e)=>setInitial(Number(e.target.value||0))}/>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Monthly Contribution ({base})</label>
                  <input className="input" type="number" value={monthly} onChange={(e)=>setMonthly(Number(e.target.value||0))}/>
                </div>
              </div>
              <SliderInput label="Expected Annual Return" value={ret} onChange={onAnnualReturnChange} min={-5} max={20} step={0.1} suffix="%" />
              <SliderInput label="Annual Inflation" value={infl} onChange={onAnnualInflChange} min={0} max={10} step={0.1} suffix="%" />
              <SliderInput label="Years" value={years} onChange={setYears} min={1} max={50} step={1} />
              <SliderInput label="Contribution Escalation (per year)" value={esc} onChange={setEsc} min={0} max={15} step={0.1} suffix="%" />
              <SliderInput label="Annual Fee (drag)" value={fee} onChange={setFee} min={0} max={3} step={0.05} suffix="%" />
            </div>
            <div className="mt-6 flex gap-3">
              <button className="btn" onClick={runSens} disabled={sensLoading}>{sensLoading ? "Calculating…" : "Run Sensitivity"}</button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Tornado Impact (↑10% change)</h2>
            {!sens ? (
              <div className="helper">Run sensitivity to see ranked impacts.</div>
            ) : (
              <>
                <div className="mb-3 text-sm text-slate-600">Baseline final (real): <strong>{format(sens.baseFinal)}</strong></div>
                <div style={{height: 360}}>
                  <Bar data={tornadoData} options={tornadoOpts} />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {tab === "stress" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Stress Settings</h2>
            <div className="grid gap-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Pause Contributions (months)</label>
                  <input className="input" type="number" value={stress.pauseMonths} onChange={e=>setStress(s=>({...s, pauseMonths: Math.max(0, Number(e.target.value||0))}))}/>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Market Drawdown % (one month)</label>
                  <input className="input" type="number" value={stress.drawdownPct} onChange={e=>setStress(s=>({...s, drawdownPct: Number(e.target.value||0)}))}/>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Drawdown at Month</label>
                  <input className="input" type="number" value={stress.drawdownMonth} onChange={e=>setStress(s=>({...s, drawdownMonth: Math.max(1, Number(e.target.value||1))}))}/>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Inflation Spike +%/mo</label>
                  <input className="input" type="number" value={stress.inflSpikePctMo} onChange={e=>setStress(s=>({...s, inflSpikePctMo: Math.max(0, Number(e.target.value||0))}))}/>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Inflation Spike Months</label>
                  <input className="input" type="number" value={stress.inflSpikeMonths} onChange={e=>setStress(s=>({...s, inflSpikeMonths: Math.max(0, Number(e.target.value||0))}))}/>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button className="btn" onClick={runStress}>Run Stress</button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Stressed Projection</h2>
            {!stressRes ? (
              <div className="helper">Set stress settings and run.</div>
            ) : (
              <div style={{height: 360}}>
                <Line data={{
                  labels: stressRes.months.map(m => (m%12===0 ? `Y${m/12}` : "")),
                  datasets: [
                    { label: "Nominal (stressed)", data: stressRes.balances_nominal, tension:.25, borderWidth:2 },
                    { label: "Real (stressed)", data: stressRes.balances_real, tension:.25, borderWidth:2 }
                  ]
                }} options={chartOptions} />
              </div>
            )}
          </div>
        </div>
      )}

      <Modal open={openInfo} title="Forecast Methodology" onClose={()=>setOpenInfo(false)}>
        <ul className="list-disc pl-5 space-y-1">
          <li>User inputs are in your selected currency; backend runs in USD.</li>
          <li>Annual ↔ Monthly: m = (1+a)^(1/12) − 1, a = (1+m)^(12) − 1 (percents).</li>
          <li>Fees & escalation are annual; applied monthly during compounding.</li>
          <li>Displayed balances convert USD → your selected currency with English numerals.</li>
        </ul>
      </Modal>
    </div>
  )
}

function ScenarioCard({ label, sc, setSc }) {
  return (
    <div className="card">
      <div className="mb-2 font-semibold">Scenario {label}: {sc.name}</div>
      <div className="grid gap-3">
        <div>
          <label className="block text-sm text-slate-600 mb-1">Label</label>
          <input className="input" value={sc.name} onChange={e=>setSc({ ...sc, name: e.target.value })}/>
        </div>
        <div className="grid grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs text-slate-600 mb-1">Return % (annual)</label>
            <input className="input" type="number" value={sc.annual_return_pct} onChange={e=>setSc({...sc, annual_return_pct: Number(e.target.value||0)})}/>
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Inflation % (annual)</label>
            <input className="input" type="number" value={sc.annual_inflation_pct} onChange={e=>setSc({...sc, annual_inflation_pct: Number(e.target.value||0)})}/>
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Fee % (annual)</label>
            <input className="input" type="number" value={sc.annual_fee_pct ?? 0} onChange={e=>setSc({...sc, annual_fee_pct: Number(e.target.value||0)})}/>
          </div>
        </div>
      </div>
    </div>
  )
}
