// A compact slider + numeric input combo with optional hint and suffix.
export default function SliderInput({
  label,
  hint,            // <-- NEW: small helper text under the label (e.g., "≈ 0.74% / mo")
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix = "",
}) {
  const handle = (v) => {
    const n = Number(v)
    if (Number.isFinite(n)) onChange(n)
  }

  return (
    <div>
      <label className="block text-sm text-slate-700 mb-1">
        {label}
      </label>
      {hint && <div className="text-xs text-slate-500 mb-2">{hint}</div>}

      <div className="grid grid-cols-5 gap-3 items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => handle(e.target.value)}
          className="col-span-3 w-full"
        />
        <div className="col-span-2 flex items-center gap-2">
          <input
            type="number"
            value={value}
            onChange={(e) => handle(e.target.value)}
            className="input w-full"
          />
          {suffix && <span className="text-sm text-slate-600">{suffix}</span>}
        </div>
      </div>
    </div>
  )
}
