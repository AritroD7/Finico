export default function Card({ title, subtitle, right, children }) {
  return (
    <div className="card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <div>
          {title && <h3 style={{margin:0}}>{title}</h3>}
          {subtitle && <div className="helper">{subtitle}</div>}
        </div>
        {right}
      </div>
      {children}
    </div>
  )
}
