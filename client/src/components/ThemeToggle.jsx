import { useEffect, useState } from 'react'


const KEY = 'finplan.theme.v1'


export default function ThemeToggle(){
const [theme, setTheme] = useState('light')


useEffect(()=>{
try{
const saved = localStorage.getItem(KEY)
const sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
const initial = saved || (sysDark ? 'dark' : 'light')
setTheme(initial)
document.documentElement.setAttribute('data-theme', initial)
}catch{}
},[])


const toggle = () => {
const next = theme === 'dark' ? 'light' : 'dark'
setTheme(next)
document.documentElement.setAttribute('data-theme', next)
try{ localStorage.setItem(KEY, next) }catch{}
}


return (
<button className="btn-ghost" onClick={toggle} aria-label="Toggle theme" title="Toggle theme">
{theme === 'dark' ? '🌙' : '☀️'}
</button>
)
}