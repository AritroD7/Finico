// FILE: client/src/pages/LoanCalculator.jsx
import { useMemo, useState } from "react"

const gradientCard =
  "relative overflow-hidden rounded-2xl border border-transparent [background:linear-gradient(#fff,#fff)_padding-box,linear-gradient(120deg,#c7d2fe,#f5d0fe)_border-box] shadow-sm"

export default function LoanCalculator() {
  const [p, setP] = useState({
    mode: "payment",         // "payment" | "term"
    principal: 250000,
    rate: 6.5,               // % APR
    years: 30,               // used in "payment" mode
    freq: 12,                // payments per year
    extra: 0,                // extra per payment
    desiredPayment: 1800,    // used in "term" mode (periodic payment)
  })

  const calc = useMemo(
    () =>
      amortize({
        mode: p.mode,
        principal: p.principal,
        apr: p.rate,
        years: p.years,
        freq: p.freq,
        extra: p.extra,
        desiredPayment: p.desiredPayment,
      }),
    [p]
  )

  const onExport = () => downloadCsv(calc.schedule)

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className={`${gradientCard} p-4 sm:p-6`}>
        <h1 className="text-3xl font-semibold">
          <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
            Loan Calculator
          </span>
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Calculate payment or payoff time. Choose monthly/bi-weekly/yearly schedules, add extra payments, export the full amortization table.
        </p>
        <div className="mt-4 h-[2px] w-full rounded-full bg-gradient-to-r from-indigo-200 via-fuchsia-200 to-transparent" />
      </div>

      {/* KPIs */}
      <div className="mb-6 mt-4 grid gap-3 md:grid-cols-4">
        <Kpi label={p.mode === "payment" ? "Payment" : "Using payment"} value={currency(calc.payment)} />
        <Kpi label="Total interest" value={currency(calc.totalInterest)} />
        <Kpi label="Total paid" value={currency(calc.totalPaid)} />
        <Kpi label="Months to payoff" value={Number.isFinite(calc.months) ? `${calc.months} mo` : "—"} />
      </div>

      <div className="grid gap-4 md:grid-cols-[1.05fr_.95fr]">
        {/* Inputs */}
        <div className={`${gradientCard} p-4`}>
          {/* Mode toggle */}
          <div className="mb-3 inline-flex rounded-xl border border-slate-200 p-0.5">
            <button
              onClick={() => setP((x) => ({ ...x, mode: "payment" }))}
              className={`px-3 py-1.5 text-sm rounded-lg ${p.mode === "payment" ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-slate-50"}`}
            >
              Solve for Payment (given years)
            </button>
            <button
              onClick={() => setP((x) => ({ ...x, mode: "term" }))}
              className={`px-3 py-1.5 text-sm rounded-lg ${p.mode === "term" ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-slate-50"}`}
            >
              Solve for Term (given payment)
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Num label="Principal" value={p.principal} onChange={(v) => setP((x) => ({ ...x, principal: pos(v) }))} />
            <Num label="APR % (annual)" value={p.rate} step={0.01} onChange={(v) => setP((x) => ({ ...x, rate: clamp(v, 0, 100) }))} />

            {p.mode === "payment" ? (
              <>
                <Num label="Years (term)" value={p.years} onChange={(v) => setP((x) => ({ ...x, years: clamp(v, 1, 50) }))} />
                <Num label="Payments per year" value={p.freq} onChange={(v) => setP((x) => ({ ...x, freq: clamp(v, 1, 52) }))} hint="12=monthly, 26=bi-weekly, 1=yearly" />
              </>
            ) : (
              <>
                <Num
                  label="Desired payment (per period)"
                  value={p.desiredPayment}
                  onChange={(v) => setP((x) => ({ ...x, desiredPayment: pos(v) }))}
                  hint="Enter the installment you plan to pay each period"
                />
                <Num label="Payments per year" value={p.freq} onChange={(v) => setP((x) => ({ ...x, freq: clamp(v, 1, 52) }))} hint="12=monthly, 26=bi-weekly, 1=yearly" />
              </>
            )}

            <Num label="Extra per payment" value={p.extra} onChange={(v) => setP((x) => ({ ...x, extra: pos(v) }))} />
          </div>

          {/* Warnings */}
          {calc.neverAmortizes && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Your payment is too low to cover interest — the loan will never amortize. Increase “Desired payment” or reduce APR/Principal.
            </div>
          )}
        </div>

        {/* Table */}
        <div className={`${gradientCard} p-4`}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Amortization</h3>
            <button onClick={onExport} className="btn btn-primary text-white">Export CSV</button>
          </div>
          <div className="overflow-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <Th>#</Th><Th>Payment</Th><Th>Interest</Th><Th>Principal</Th><Th>Balance</Th>
                </tr>
              </thead>
              <tbody>
                {calc.schedule.slice(0, 120).map((r) => (
                  <tr key={r.n} className="odd:bg-white even:bg-slate-50/50">
                    <Td>{r.n}</Td>
                    <Td>{currency(r.payment)}</Td>
                    <Td>{currency(r.interest)}</Td>
                    <Td>{currency(r.principal)}</Td>
                    <Td>{currency(r.balance)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-xs text-slate-500">Showing first 120 payments. Export CSV for the full schedule.</div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- logic ---------------- */
function amortize({ mode, principal, apr, years, freq, extra, desiredPayment }) {
  principal = Math.max(0, Number(principal) || 0)
  freq = Math.max(1, Math.round(freq) || 12)
  const r = (Number(apr) || 0) / 100 / freq
  const extraPmt = Math.max(0, Number(extra) || 0)

  // Compute periodic payment
  let paymentBase
  if (mode === "payment") {
    const n = Math.round(Math.max(1, years) * freq)
    if (r === 0) paymentBase = principal / n
    else paymentBase = (principal * r) / (1 - Math.pow(1 + r, -n))
  } else {
    paymentBase = Math.max(0, Number(desiredPayment) || 0)
  }
  const payment = paymentBase + extraPmt

  // Build schedule iteratively
  const schedule = []
  let bal = principal
  let neverAmortizes = false
  let i = 0
  const hardCap = 100 * 12 * 60 // 100 years at 12*60 ~= 72000 steps safety

  while (bal > 0.01 && i < hardCap) {
    i++
    const interest = r * bal
    let principalPortion = payment - interest

    if (principalPortion <= 0 && r > 0) {
      // Payment too low → balance grows
      neverAmortizes = true
      // Prevent infinite loop: stop at 600 steps and report
      if (i > 600) break
      principalPortion = 0
    }

    if (principalPortion > bal) principalPortion = bal
    bal = Math.max(0, bal - principalPortion)

    schedule.push({ n: i, payment, interest, principal: principalPortion, balance: bal })
    // For zero-interest + too-small payment, still terminate by hardCap
  }

  const months = Number.isFinite(i) ? i : Infinity
  const totalPaid = schedule.reduce((a, r) => a + r.payment, 0)
  const totalInterest = schedule.reduce((a, r) => a + r.interest, 0)

  return { payment, totalPaid, totalInterest, months, schedule, neverAmortizes }
}

/* ---------------- UI helpers ---------------- */
const clamp = (n, a, b) => Math.min(b, Math.max(a, Number(n) || 0))
const pos = (n) => Math.max(0, Number(n) || 0)
const currency = (n) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0)

function Kpi({ label, value }) {
  return (
    <div className={`${gradientCard} p-4`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  )
}
function Num({ label, value, onChange, min, max, step = 1, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-600">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="input w-full"
      />
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </label>
  )
}
function Th({ children }) { return <th className="px-3 py-2 text-left font-semibold">{children}</th> }
function Td({ children }) { return <td className="px-3 py-2">{children}</td> }
function downloadCsv(schedule) {
  const headers = ["n", "payment", "interest", "principal", "balance"]
  const csv = [headers.join(","), ...schedule.map(r => headers.map(h => r[h]).join(","))].join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement("a"), { href: url, download: "loan-schedule.csv" })
  a.click()
  URL.revokeObjectURL(url)
}
