export default function NumberInput({ label, value, onChange, step=0.01, min=0, suffix }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <input className="input" type="number" step={step} min={min}
               value={value} onChange={e => onChange(parseFloat(e.target.value || 0))}/>
        {suffix && <span className="badge">{suffix}</span>}
      </div>
    </div>
  )
}
