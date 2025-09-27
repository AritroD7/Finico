// FILE: client/src/context/CurrencySwitcher.jsx
import { useCurrency } from './Currency'

export default function CurrencySwitcher() {
  const { base } = useCurrency()
  return (
    <span className="inline-flex items-center px-2 py-1 border rounded-md bg-white text-xs text-slate-700">
      {base}
    </span>
  )
}
