// FILE: client/src/hooks/useLocalScenarios.jsx
import { useEffect, useMemo, useState } from "react"

const KEY = (ns) => `finplan.scenarios.${ns}.v1`

export function useLocalScenarios(namespace) {
  const storageKey = KEY(namespace)
  const [items, setItems] = useState([])
  const [currentId, setCurrentId] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        setItems(parsed.items || [])
        setCurrentId(parsed.currentId || null)
      }
    } catch {}
  }, [storageKey])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ items, currentId }))
    } catch {}
  }, [items, currentId, storageKey])

  const current = useMemo(() => items.find(x => x.id === currentId) || null, [items, currentId])

  const saveNew = (name, data) => {
    const id = crypto.randomUUID()
    const now = Date.now()
    const item = { id, name: name || "Untitled", updatedAt: now, data }
    setItems(prev => [item, ...prev])
    setCurrentId(id)
    return id
  }
  const updateCurrent = (data) => {
    if (!currentId) return
    const now = Date.now()
    setItems(prev => prev.map(x => x.id === currentId ? { ...x, data, updatedAt: now } : x))
  }
  const load = (id) => { setCurrentId(id) }
  const remove = (id) => {
    setItems(prev => prev.filter(x => x.id !== id))
    if (id === currentId) setCurrentId(null)
  }
  const rename = (id, name) => {
    setItems(prev => prev.map(x => x.id === id ? { ...x, name } : x))
  }

  return { items, current, currentId, setCurrentId, saveNew, updateCurrent, load, remove, rename }
}
