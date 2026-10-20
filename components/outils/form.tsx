import type { ReactNode } from 'react'

export const inputClass = 'form-input w-full rounded-lg py-2.5 text-gray-800'
export const selectClass = 'form-select w-full rounded-lg py-2.5 text-gray-800'

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className = '',
}: {
  label: ReactNode
  hint?: ReactNode
  htmlFor?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="flex items-baseline gap-2 text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {hint && <span className="text-xs font-normal text-gray-400">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

export function FormStep({ n, title }: { n: number; title: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
      {n}. {title}
    </p>
  )
}

export function RadioCards<T extends string>({
  name,
  value,
  onChange,
  options,
  columns = 3,
}: {
  name: string
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string; hint?: string }[]
  columns?: 2 | 3 | 4
}) {
  const cols = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4' }[columns]
  return (
    <div className={`grid grid-cols-1 ${cols} gap-2`} role="radiogroup">
      {options.map((o) => {
        const checked = o.value === value
        return (
          <label
            key={o.value}
            className={`relative cursor-pointer rounded-xl border px-3 py-2.5 transition ${
              checked ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={checked}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            <span className={`block text-sm font-semibold ${checked ? 'text-blue-700' : 'text-gray-800'}`}>{o.label}</span>
            {o.hint && <span className="block text-xs text-gray-500 mt-0.5 leading-snug">{o.hint}</span>}
          </label>
        )
      })}
    </div>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode }) {
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none text-sm text-gray-700">
      <input type="checkbox" className="form-checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

/** Chiffre clé dans le bloc de résultat. */
export function Stat({ label, value, sub, accent = false }: { label: string; value: ReactNode; sub?: ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-xl px-4 py-3 ${accent ? 'bg-blue-500 text-white' : 'bg-gray-50 border border-gray-100'}`}>
      <div className={`text-xs font-medium mb-0.5 ${accent ? 'text-blue-100' : 'text-gray-500'}`}>{label}</div>
      <div className={`text-xl font-extrabold tracking-tight ${accent ? 'text-white' : 'text-gray-900'}`}>{value}</div>
      {sub && <div className={`text-xs mt-0.5 ${accent ? 'text-blue-100' : 'text-gray-500'}`}>{sub}</div>}
    </div>
  )
}

export function Alert({ tone = 'info', children }: { tone?: 'info' | 'warning'; children: ReactNode }) {
  const cls = tone === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-blue-50 border-blue-100 text-blue-800'
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${cls}`} role={tone === 'warning' ? 'alert' : undefined}>
      {children}
    </div>
  )
}

const MOIS_LABELS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

/** Sélecteur mois + année (value au format YYYY-MM), sans dépendre de <input type="month">. */
export function MonthPicker({
  id,
  value,
  onChange,
  fromYear,
  toYear,
}: {
  id?: string
  value: string
  onChange: (v: string) => void
  fromYear: number
  toYear: number
}) {
  const [y, m] = value.split('-')
  const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => String(toYear - i))
  return (
    <div className="grid grid-cols-[1fr_6rem] gap-2">
      <select id={id} aria-label="Mois" className={selectClass} value={m} onChange={(e) => onChange(`${y}-${e.target.value}`)}>
        {MOIS_LABELS.map((label, i) => {
          const mm = String(i + 1).padStart(2, '0')
          return <option key={mm} value={mm}>{label}</option>
        })}
      </select>
      <select aria-label="Année" className={selectClass} value={y} onChange={(e) => onChange(`${e.target.value}-${m}`)}>
        {years.map((year) => <option key={year} value={year}>{year}</option>)}
      </select>
    </div>
  )
}
