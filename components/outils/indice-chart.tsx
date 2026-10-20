import type { IndiceObs } from '@/lib/indices'
import { fmtMonth, fmtNum } from '@/lib/format'

/** Courbe d'un index, rendue côté serveur (SVG statique). */
export default function IndiceChart({ code, obs }: { code: string; obs: IndiceObs[] }) {
  if (obs.length < 2) return null
  const W = 800
  const H = 300
  const pad = { l: 44, r: 12, t: 16, b: 32 }
  const values = obs.map((o) => o.v)
  const vmin = Math.min(...values)
  const vmax = Math.max(...values)
  // Graduations rondes (1, 2, 5, 10, 20…)
  const raw = (vmax - vmin || 1) / 4
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const step = [1, 2, 5, 10].map((k) => k * mag).find((s) => s >= raw) ?? 10 * mag
  const ymin = Math.floor(vmin / step) * step
  const ymax = Math.ceil(vmax / step) * step
  const x = (i: number) => pad.l + (i / (obs.length - 1)) * (W - pad.l - pad.r)
  const y = (v: number) => pad.t + (1 - (v - ymin) / (ymax - ymin)) * (H - pad.t - pad.b)
  const line = obs.map((o, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(o.v).toFixed(1)}`).join('')
  const area = `${line}L${x(obs.length - 1).toFixed(1)},${H - pad.b}L${pad.l},${H - pad.b}Z`
  const yTicks = Array.from({ length: Math.round((ymax - ymin) / step) + 1 }, (_, i) => ymin + step * i)
  const years = obs.map((o, i) => ({ i, p: o.p })).filter((o) => o.p.endsWith('-01'))
  const yearStep = Math.ceil(years.length / 7)
  const last = obs[obs.length - 1]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      aria-label={`Évolution de l'index ${code} de ${fmtMonth(obs[0].p)} à ${fmtMonth(last.p)}`}
    >
      <defs>
        <linearGradient id={`grad-${code}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="stroke-gray-100" />
          <text x={pad.l - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-gray-400 text-[11px]">{fmtNum(t, 0)}</text>
        </g>
      ))}
      {years.filter((_, k) => k % yearStep === 0).map((o) => (
        <text key={o.p} x={x(o.i)} y={H - 10} textAnchor="middle" className="fill-gray-400 text-[11px]">{o.p.slice(0, 4)}</text>
      ))}
      <path d={area} fill={`url(#grad-${code})`} />
      <path d={line} fill="none" strokeWidth="2.25" strokeLinejoin="round" className="stroke-blue-500" />
      <circle cx={x(obs.length - 1)} cy={y(last.v)} r="4.5" className="fill-blue-500 stroke-white" strokeWidth="2" />
    </svg>
  )
}
