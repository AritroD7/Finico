// FILE: client/src/components/CurrencySwitcher.jsx
// Small dropdown to change currency + tweak rates. Use anywhere in your header.
import { useState } from 'react'
import { useCurrency } from '../context/Currency'

const CODES = ['USD','EUR','GBP','BDT']

export default function CurrencySwitcher(){
  const { base, setBase, usdPer, setUsdPer, refreshRates, lastUpdated, loadingRates } = useCurrency()
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position:'relative' }}>
      <button style={btnPill} onClick={()=>setOpen(o=>!o)} title="Change currency">
        {base} ▾
      </button>
      {open && (
        <div style={panel}>
          <div style={rowBetween}>
            <div style={muted}>Display & convert via USD</div>
            <button style={btnGhost} onClick={()=>refreshRates()} disabled={loadingRates}>
              {loadingRates ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
          {lastUpdated && <div style={{...muted, marginTop:6}}>Updated: {new Date(lastUpdated).toLocaleString()}</div>}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginTop:10 }}>
            {CODES.map(c => (
              <button key={c}
                style={{ ...btnGhost, ...(base===c?focusRing:{}), fontWeight:600 }}
                onClick={()=>setBase(c)}>{c}</button>
            ))}
          </div>
          <div style={{ ...muted, marginTop:10 }}>USD per 1 unit (edit if needed)</div>
          {CODES.map(code => (
            <div key={code} style={{ display:'grid', gridTemplateColumns:'60px 1fr', gap:8, alignItems:'center', marginTop:6 }}>
              <div style={muted}>{code}</div>
              <input type="number" step="0.0001" value={usdPer[code] ?? ''}
                onChange={e=>setUsdPer(p=>({ ...p, [code]: Number(e.target.value||0) }))}
                style={input} />
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:12 }}>
            <button style={btnGhost} onClick={()=>setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

const panel = {
  position:'absolute', right:0, marginTop:8, width:300, zIndex:30,
  background:'#fff', color:'#0f172a', border:'1px solid #e5e7eb', borderRadius:14, padding:12,
  boxShadow:'0 12px 24px rgba(0,0,0,.12)'
}
const input   = { width:'100%', border:'1px solid #e5e7eb', borderRadius:10, padding:'8px 10px' }
const btnPill = { border:'1px solid #e5e7eb', borderRadius:999, padding:'6px 10px', background:'#fff' }
const btnGhost= { border:'1px solid #e5e7eb', borderRadius:10, padding:'6px 10px', background:'#fff' }
const focusRing = { boxShadow:'0 0 0 4px rgba(79,70,229,.3)' }
const muted   = { fontSize:12, color:'#64748b' }
const rowBetween = { display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }
