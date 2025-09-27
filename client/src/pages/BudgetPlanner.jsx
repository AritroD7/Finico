// FILE: src/pages/BudgetPlanner.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";

/* Currency hook (optional) */
let useCurrencySafe = null;
try {
  const mod = require("../context/Currency.jsx");
  useCurrencySafe = mod?.useCurrency || null;
} catch (_) {}
const useFallbackCurrency = () => {
  const fmt = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  return { code: "USD", format: (n) => fmt.format(n ?? 0) };
};

const LS_KEY = "finico:budget:v1";
const initialSeed = () => ({
  income: 3200,
  categories: [
    { id: uuid(), name: "Rent", amount: 1200, type: "fixed" },
    { id: uuid(), name: "Utilities", amount: 150, type: "fixed" },
    { id: uuid(), name: "Groceries", amount: 300, type: "variable" },
    { id: uuid(), name: "Transport", amount: 120, type: "variable" },
  ],
});

export default function BudgetPlanner() {
  const nav = useNavigate();
  const currency = (useCurrencySafe ? useCurrencySafe() : useFallbackCurrency()) || useFallbackCurrency();

  const [data, setData] = useState(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return initialSeed();
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") throw new Error("bad");
      return parsed;
    } catch {
      return initialSeed();
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }, [data]);

  const totals = useMemo(() => {
    const fixed = sumByType(data.categories, "fixed");
    const variable = sumByType(data.categories, "variable");
    const expenses = fixed + variable;
    const savings = Math.max(0, (data.income || 0) - expenses);
    const rate = data.income > 0 ? savings / data.income : 0;
    return { fixed, variable, expenses, savings, rate };
  }, [data]);

  const addCategory = (type = "variable") => {
    setData((d) => ({
      ...d,
      categories: [...d.categories, { id: uuid(), name: type === "fixed" ? "New fixed" : "New variable", amount: 0, type }],
    }));
  };
  const removeCategory = (id) => setData((d) => ({ ...d, categories: d.categories.filter((c) => c.id !== id) }));
  const updateCategory = (id, patch) =>
    setData((d) => ({ ...d, categories: d.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));

  /* Import / Export */
  const fileRef = useRef(null);
  const triggerImport = () => fileRef.current?.click();
  const importJson = async (file) => {
    try {
      const obj = JSON.parse(await file.text());
      if (!obj || typeof obj !== "object" || !Array.isArray(obj.categories)) throw new Error("bad");
      setData({
        income: Number(obj.income) || 0,
        categories: obj.categories
          .filter((c) => c && typeof c === "object")
          .map((c) => ({
            id: c.id || uuid(),
            name: String(c.name || "Untitled"),
            amount: Number(c.amount) || 0,
            type: c.type === "fixed" ? "fixed" : "variable",
          })),
      });
    } catch {
      alert("Invalid JSON file.");
    }
  };
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: "finico-budget.json" });
    a.click();
    URL.revokeObjectURL(url);
  };

  const donutPercent = clamp01(totals.expenses > 0 ? totals.fixed / totals.expenses : 0);
  const donutStyle = { background: `conic-gradient(#6366f1 ${donutPercent * 360}deg, #22c55e 0)` };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-800">Budget</h1>
          <p className="text-slate-500 mt-1">Track income and expenses. See fixed vs variable, savings, and export your plan.</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importJson(f);
              e.currentTarget.value = "";
            }}
          />

          {/* Buttons use inline utilities to avoid any style collisions */}
          <button
            type="button"
            onClick={triggerImport}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium
                       border border-indigo-200 text-indigo-700 bg-indigo-50/80
                       hover:bg-indigo-100 active:bg-indigo-200 active:translate-y-[0.5px]
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-1
                       transition"
            title="Import from JSON"
          >
            <IconImport /> Import
          </button>

          <button
            type="button"
            onClick={exportJson}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium
                       border border-indigo-200 text-indigo-700 bg-indigo-50/80
                       hover:bg-indigo-100 active:bg-indigo-200 active:translate-y-[0.5px]
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-1
                       transition"
            title="Export to JSON"
          >
            <IconExport /> Export
          </button>

          <button
            type="button"
            onClick={() => nav('/forecast')}
            className="hidden sm:inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium
                       text-white border border-transparent
                       bg-gradient-to-r from-indigo-500 to-fuchsia-500
                       hover:opacity-95 active:translate-y-[0.5px]
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-1
                       transition"
          >
            <IconForecast /> Forecast
          </button>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid md:grid-cols-4 gap-3 mb-6">
        <StatCard label="MONTHLY INCOME">{currency.format(data.income)}</StatCard>
        <StatCard label="EXPENSES (TOTAL)">{currency.format(totals.expenses)}</StatCard>
        <StatCard label="SAVINGS RATE">{(totals.rate * 100).toFixed(0)}%</StatCard>
        <StatCard label="REMAINING">
          <span className={totals.savings >= 0 ? "text-emerald-600" : "text-rose-600"}>
            {currency.format(totals.savings)}
          </span>
        </StatCard>
      </div>

      {/* Snapshot row */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full shadow-inner" style={donutStyle} />
            <div>
              <div className="text-sm text-slate-500">Snapshot</div>
              <div className="text-slate-700 mt-1">
                <span className="inline-flex items-center gap-1 mr-4">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  Fixed: <strong>{currency.format(totals.fixed)}</strong>
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Variable: <strong>{currency.format(totals.variable)}</strong>
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">Fixed share: <strong>{Math.round(donutPercent * 100)}%</strong></div>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="text-sm text-slate-500">Savings</div>
          <div className="mt-2">
            <div className="flex items-center justify-between text-sm">
              <span>Saved</span>
              <span className="font-medium">{currency.format(totals.savings)}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded mt-2 overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${clamp01(totals.rate) * 100}%` }} />
            </div>
            <div className="text-xs text-slate-500 mt-2">Rate: <strong>{(totals.rate * 100).toFixed(0)}%</strong> of income</div>
          </div>
        </div>

        <div className="card p-4">
          <div className="text-sm text-slate-500">Quick edit</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-xs text-slate-500">Income</span>
              <input
                type="number"
                inputMode="decimal"
                className="input"
                value={data.income}
                onChange={(e) => setData((d) => ({ ...d, income: Number(e.target.value) || 0 }))}
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Groceries (quick)</span>
              <input
                type="number"
                inputMode="decimal"
                className="input"
                value={findAmount(data.categories, "Groceries")}
                onChange={(e) => setByName(setData, data.categories, "Groceries", Number(e.target.value) || 0)}
              />
            </label>
          </div>
          <div className="mt-3 text-xs text-slate-500">Tip: use the table below for full control over categories.</div>
        </div>
      </div>

      {/* Categories */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b">
          <div className="text-sm text-slate-600">Categories</div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium
                         border border-indigo-200 text-indigo-700 bg-indigo-50/80
                         hover:bg-indigo-100 active:bg-indigo-200 active:translate-y-[0.5px]
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-1
                         transition"
              onClick={() => addCategory("fixed")}
            >
              <IconPlus /> Add fixed
            </button>

            <button
              className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium
                         border border-indigo-200 text-indigo-700 bg-indigo-50/80
                         hover:bg-indigo-100 active:bg-indigo-200 active:translate-y-[0.5px]
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-1
                         transition"
              onClick={() => addCategory("variable")}
            >
              <IconPlus /> Add variable
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="text-left font-medium px-3 sm:px-4 py-3">Name</th>
                <th className="text-left font-medium px-3 sm:px-4 py-3">Type</th>
                <th className="text-right font-medium px-3 sm:px-4 py-3">Amount</th>
                <th className="w-12 sm:w-20"></th>
              </tr>
            </thead>
            <tbody>
              {data.categories.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-3 sm:px-4 py-2.5">
                    <input className="input !py-1.5" value={c.name} onChange={(e) => updateCategory(c.id, { name: e.target.value })} />
                  </td>
                  <td className="px-3 sm:px-4 py-2.5">
                    <select
                      className="input !py-1.5"
                      value={c.type}
                      onChange={(e) => updateCategory(c.id, { type: e.target.value === "fixed" ? "fixed" : "variable" })}
                    >
                      <option value="fixed">Fixed</option>
                      <option value="variable">Variable</option>
                    </select>
                  </td>
                  <td className="px-3 sm:px-4 py-2.5 text-right">
                    <input
                      type="number"
                      inputMode="decimal"
                      className="input text-right !py-1.5"
                      value={c.amount}
                      onChange={(e) => updateCategory(c.id, { amount: Number(e.target.value) || 0 })}
                    />
                  </td>
                  <td className="px-3 sm:px-4 py-2.5 text-right">
                    <button
                      className="text-rose-500 hover:text-rose-600"
                      onClick={() => removeCategory(c.id)}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 border-t">
                <td className="px-3 sm:px-4 py-3 font-medium text-slate-600">Totals</td>
                <td className="px-3 sm:px-4 py-3 text-slate-500">
                  Fixed: {currency.format(totals.fixed)} · Variable: {currency.format(totals.variable)}
                </td>
                <td className="px-3 sm:px-4 py-3 text-right font-semibold">{currency.format(totals.expenses)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-slate-500 mt-4">Data is saved locally in your browser. Export JSON to back up or share.</div>
    </div>
  );
}

/* -------- helpers & atoms -------- */
const clamp01 = (n) => Math.max(0, Math.min(1, Number(n) || 0));
const sumByType = (arr, type) => arr.filter((x) => x.type === type).reduce((s, x) => s + (Number(x.amount) || 0), 0);
const findAmount = (arr, name) => (arr.find((x) => x.name.toLowerCase() === name.toLowerCase())?.amount ?? 0);
const setByName = (setData, arr, name, amount) => {
  const row = arr.find((x) => x.name.toLowerCase() === name.toLowerCase());
  if (!row) return;
  setData((d) => ({ ...d, categories: d.categories.map((c) => (c.id === row.id ? { ...c, amount } : c)) }));
};

function StatCard({ label, children }) {
  return (
    <div className="card p-4">
      <div className="text-[11px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-semibold text-slate-800">{children}</div>
    </div>
  );
}

/* inline icons */
function IconImport(props) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 3v10m0 0l-3-3m3 3l3-3M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconExport(props) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 21V11m0 0l3 3m-3-3l-3 3M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"
        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconPlus(props) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  );
}
function IconForecast(props) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M4 16l6-6 4 4 6-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="4" cy="16" r="1.5" fill="currentColor"/>
      <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
      <circle cx="14" cy="14" r="1.5" fill="currentColor"/>
      <circle cx="20" cy="8" r="1.5" fill="currentColor"/>
    </svg>
  );
}
