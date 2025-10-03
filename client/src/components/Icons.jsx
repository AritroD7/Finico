// FILE: client/src/components/Icons.jsx
import React from 'react';

export function Icon({ name, className = "h-4 w-4", stroke = "currentColor" }) {
  const p = { fill: "none", stroke, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }
  switch (name) {
    case "flash":   return (<svg viewBox="0 0 24 24" className={className} {...p}><path d="M13 2L3 14h7l-1 8L21 8h-7l-1-6z"/></svg>)
    case "lock":    return (<svg viewBox="0 0 24 24" className={className} {...p}><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>)
    case "export":  return (<svg viewBox="0 0 24 24" className={className} {...p}><path d="M12 3v12"/><path d="M7 8l5-5 5 5"/><rect x="4" y="15" width="16" height="6" rx="2"/></svg>)
    case "calc":    return (<svg viewBox="0 0 24 24" className={className} {...p}><rect x="3" y="2" width="18" height="20" rx="2"/><path d="M7 6h10M7 10h4M7 14h4M7 18h10"/></svg>)
    case "book":    return (<svg viewBox="0 0 24 24" className={className} {...p}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M20 22H6.5A2.5 2.5 0 014 19.5V5.6A2.6 2.6 0 016.6 3H20v19z"/><path d="M8 3v14"/></svg>)
    case "arrow":   return (<svg viewBox="0 0 24 24" className={className} {...p}><path d="M5 12h14M13 5l7 7-7 7"/></svg>)
    case "sparkle": return (<svg viewBox="0 0 24 24" className={className} {...p}><path d="M12 3l1.7 3.3L17 8l-3.3 1.7L12 13l-1.7-3.3L7 8l3.3-1.7L12 3zM5 17l.8 1.5L7 20l-1.5.8L5 22l-.8-1.2L3 20l1.2-1.5L5 17zM19 14l.8 1.5L21 17l-1.5.8L19 19l-.8-1.2L17 17l1.2-1.5L19 14z"/></svg>)
    default:        return null
  }
}