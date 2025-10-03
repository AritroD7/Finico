// FILE: client/src/components/NewsTicker.jsx
import { useEffect, useRef, useState } from "react"
import { API_BASE } from "../api"

export default function NewsTicker() {
  const [items, setItems] = useState([])
  const trackRef = useRef(null)

  useEffect(() => {
    let timer
    const load = async () => {
      try {
        const r = await fetch(`${API_BASE}/api/news/ticker`)
        const d = await r.json()
        setItems(Array.isArray(d.items) ? d.items : [])
      } catch (e) {
        // fail silently; ticker just hides
      }
      timer = setTimeout(load, 5 * 60 * 1000) // refresh every 5 minutes
    }
    load()
    return () => clearTimeout(timer)
  }, [])

  if (!items.length) return null

  // duplicate items so the marquee loops seamlessly
  const loop = [...items, ...items]

  const pause = (on) => {
    if (!trackRef.current) return
    trackRef.current.style.animationPlayState = on ? "paused" : "running"
  }

  return (
    <div className="sticky top-16 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
        <span className="rounded-full border border-slate-300 px-2 py-0.5 text-xs font-semibold text-slate-700">
          News
        </span>

        <div
          className="relative h-6 w-full overflow-hidden"
          onMouseEnter={() => pause(true)}
          onMouseLeave={() => pause(false)}
        >
          <div
            ref={trackRef}
            className="whitespace-nowrap"
            style={{ animation: "marquee var(--speed, 36s) linear infinite" }}
          >
            {loop.map((it, i) => (
              <a
                key={`${i}-${it.url}`}
                href={it.url}
                target="_blank"
                rel="noreferrer"
                className="mx-6 inline-flex items-center gap-2 text-sm text-slate-700 underline-offset-2 hover:text-blue-700 hover:underline"
              >
                <span className="text-slate-400">•</span>
                {it.title}
                <span className="text-xs text-slate-400">({it.source})</span>
              </a>
            ))}
          </div>
        </div>

        <a href="/help" className="text-sm text-blue-700 hover:underline">
          View insights →
        </a>
      </div>

      {/* local keyframes so you don't need to touch global CSS */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
