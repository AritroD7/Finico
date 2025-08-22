export default function Footer(){
return (
<footer className="footer">
<div className="container-page" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
<div className="helper">© {new Date().getFullYear()} FinPlan. All rights reserved.</div>
<div style={{display:'flex',gap:10}}>
<a className="helper" href="#about">About</a>
<a className="helper" href="#privacy">Privacy</a>
<a className="helper" href="#terms">Terms</a>
</div>
</div>
</footer>
)
}