// FILE: client/src/components/ScenarioBar.jsx
import { useRef, useState } from "react"

export default function ScenarioBar({ scenarios, current, onSaveNew, onUpdate, onLoad, onRemove, onRename, exportJSON, exportCSV, onImportJSON }) {
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(current?.name || "")
  const fileRef = useRef(null)

  const triggerImport = () => fileRef.current?.click()
  const handleFile = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const text = await f.text()
    onImportJSON(text)
    e.target.value = ""
  }

  return (
    <div className="rounded-2xl border bg-white p-3 flex flex-wrap items-center gap-2">
      <div className="text-sm font-medium">Scenario</div>

      <div className="flex items-center gap-2">
        <select className="select" value={current?.id || ""} onChange={(e)=>onLoad(e.target.value)}>
          <option value="">— none —</option>
          {scenarios.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        {renaming ? (
          <>
            <input className="input" value={name} onChange={e=>setName(e.target.value)} />
            <button className="btn-secondary" onClick={()=>{ onRename(current.id, name || "Untitled"); setRenaming(false) }}>Save</button>
            <button className="btn-secondary" onClick={()=>{ setRenaming(false); setName(current?.name || "") }}>Cancel</button>
          </>
        ) : (
          <>
            <button className="btn-secondary" onClick={()=>onSaveNew(prompt("Name this scenario:", "My Budget") || "Untitled")}>Save new</button>
            <button className="btn-secondary" onClick={onUpdate} disabled={!current}>Update</button>
            <button className="btn-secondary" onClick={()=>{ if (current && confirm("Delete scenario?")) onRemove(current.id) }} disabled={!current}>Delete</button>
            <button className="btn-secondary" onClick={()=>{ if (current) { setRenaming(true); setName(current.name) }}} disabled={!current}>Rename</button>
          </>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="btn-secondary" onClick={()=>downloadFile("budget.json", exportJSON())}>Export JSON</button>
        <button className="btn-secondary" onClick={()=>downloadFile("budget.csv", exportCSV())}>Export CSV</button>
        <button className="btn-secondary" onClick={triggerImport}>Import JSON</button>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleFile} />
      </div>
    </div>
  )
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
