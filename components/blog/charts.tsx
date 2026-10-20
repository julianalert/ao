// Graphiques chiffrés des articles : HTML/CSS, texte indexable, tableau accessible.

const eur = (n: number) => `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n)} €`
const keur = (n: number) => `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(n / 1000)} k€`

// Étiquette de barre : montant complet sur grand écran, en k€ sur mobile
function BarLabel({ full, short }: { full: string; short: string }) {
  return (
    <span className="mb-1 text-[10px] font-semibold whitespace-nowrap text-gray-800 sm:text-[11px]">
      <span className="sm:hidden">{short}</span>
      <span className="hidden sm:inline">{full}</span>
    </span>
  )
}

// ─── Article « Coût d'une réponse » : arbre de calcul ─────────────────────────

function CalcCard({ label, value, detail, tone = 'neutral' }: { label: string; value: string; detail?: string; tone?: 'neutral' | 'result' | 'margin' }) {
  const tones = {
    neutral: 'border-gray-200 bg-white',
    result: 'border-blue-200 bg-blue-50',
    margin: 'border-emerald-200 bg-emerald-50',
  }
  return (
    <div className={`rounded-xl border p-3 ${tones[tone]}`}>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`text-lg font-extrabold ${tone === 'result' ? 'text-blue-700' : tone === 'margin' ? 'text-emerald-700' : 'text-gray-900'}`}>{value}</p>
      {detail && <p className="text-xs leading-snug text-gray-500">{detail}</p>}
    </div>
  )
}

function Op({ children }: { children: string }) {
  return (
    <span className="flex items-center justify-center text-lg font-bold text-gray-400" aria-hidden="true">
      {children}
    </span>
  )
}

export function CostTree({ caption }: { caption?: string }) {
  return (
    <figure className="my-10">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-bold text-gray-900">Arbre de calcul</p>
          <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Exemple d'une PME fictive de 12 salariés</p>
        </div>

        <div className="grid items-stretch gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <CalcCard label="Heures" value={eur(1100)} detail="22 h × 50 €/h" />
          <Op>+</Op>
          <CalcCard label="Frais" value={eur(100)} detail="Visite, signature, impressions" />
          <Op>=</Op>
          <CalcCard label="Coût d'une réponse" value={eur(1200)} tone="result" />
        </div>

        <div className="my-2 flex justify-center text-lg font-bold text-gray-400 sm:justify-end sm:pr-[12%]" aria-hidden="true">↓</div>

        <div className="grid items-stretch gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <CalcCard label="Coût d'une réponse" value={eur(1200)} />
          <Op>÷</Op>
          <CalcCard label="Taux de réussite" value="20 %" detail="4 marchés gagnés sur 20 réponses" />
          <Op>=</Op>
          <CalcCard label="Coût par marché gagné" value={eur(6000)} tone="result" />
        </div>

        <div className="my-2 flex justify-center text-lg font-bold text-gray-400 sm:justify-end sm:pr-[12%]" aria-hidden="true">↓</div>

        <div className="grid items-stretch gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <CalcCard label="Marge nette d'un lot gagné" value={eur(6400)} detail="80 000 € HT × 8 %" tone="margin" />
          <Op>−</Op>
          <CalcCard label="Coût par marché gagné" value={eur(6000)} />
          <Op>=</Op>
          <CalcCard label="Ce qu'il reste" value={eur(400)} detail="Presque toute la marge part dans les réponses" />
        </div>
      </div>
      {caption && <figcaption className="mt-3 text-center text-sm leading-6 text-gray-500">{caption}</figcaption>}
    </figure>
  )
}

// ─── Article « Coût d'une réponse » : coût par marché gagné selon le taux ─────

const COST_PER_RESPONSE = 1200
const MARGIN = 6400
const RATES = [0.1, 0.15, 0.2, 0.25, 0.33, 0.5]
const Y_MAX = 13000

export function CostByWinRate({ caption }: { caption?: string }) {
  const rows = RATES.map((rate) => {
    const cost = COST_PER_RESPONSE / rate
    const exact = Number.isInteger(cost)
    return {
      rate,
      cost,
      label: `${exact ? '' : '≈ '}${eur(exact ? cost : Math.round(cost / 100) * 100)}`,
      short: `${exact ? '' : '≈ '}${keur(exact ? cost : Math.round(cost / 100) * 100)}`,
      loss: cost > MARGIN,
    }
  })
  const marginPct = (MARGIN / Y_MAX) * 100

  return (
    <figure className="my-10">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-bold text-gray-900">Coût par marché gagné selon le taux de réussite</p>
        </div>
        <p className="mb-6 text-xs text-gray-500">Calculé à partir de l'exemple : 1 200 € par réponse, lot de 80 000 € HT à 8 % de marge</p>

        <div className="relative h-64 sm:h-72" aria-hidden="true">
          {/* Grille */}
          {[0, 4000, 8000, 12000].map((v) => (
            <div key={v} className="absolute inset-x-0 border-t border-gray-200" style={{ bottom: `${(v / Y_MAX) * 100}%` }}>
              <span className="absolute -top-2 left-0 bg-gray-50 pr-1 text-[10px] text-gray-400">{v === 0 ? '0' : `${v / 1000} k€`}</span>
            </div>
          ))}
          {/* Ligne de marge */}
          <div className="absolute inset-x-0 z-10 border-t-2 border-dashed border-gray-700" style={{ bottom: `${marginPct}%` }}>
            <span className="absolute -top-5 right-0 rounded bg-gray-700 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              Marge d'un lot : 6 400 €
            </span>
          </div>
          {/* Barres */}
          <div className="absolute inset-0 left-10 flex items-end justify-around gap-2">
            {rows.map((r) => (
              <div key={r.rate} className="group relative flex h-full w-full min-w-0 max-w-14 flex-col items-center justify-end" title={`Taux de réussite ${Math.round(r.rate * 100)} % : ${r.label} par marché gagné`}>
                <BarLabel full={r.label} short={r.short} />
                <div
                  className={`w-full rounded-t ${r.loss ? 'bg-red-400' : 'bg-emerald-500'} transition group-hover:opacity-80`}
                  style={{ height: `${(r.cost / Y_MAX) * 100}%` }}
                />
              </div>
            ))}
          </div>
        </div>
        {/* Axe X */}
        <div className="ml-10 flex justify-around gap-2 border-t border-gray-300 pt-2" aria-hidden="true">
          {rows.map((r) => (
            <div key={r.rate} className="w-full min-w-0 max-w-14 text-center">
              <p className="text-xs font-semibold text-gray-700">{Math.round(r.rate * 100)} %</p>
              <p className={`text-[10px] font-medium ${r.loss ? 'text-red-600' : 'text-emerald-700'}`}>{r.loss ? '✕ perte' : '✓ bénéfice'}</p>
            </div>
          ))}
        </div>
        <p className="mt-1 text-center text-[11px] text-gray-500" aria-hidden="true">Taux de réussite (marchés gagnés ÷ réponses déposées)</p>

        <table className="sr-only">
          <caption>Coût par marché gagné selon le taux de réussite</caption>
          <thead><tr><th>Taux de réussite</th><th>Coût par marché gagné</th><th>Comparé à la marge de 6 400 €</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.rate}><td>{Math.round(r.rate * 100)} %</td><td>{r.label}</td><td>{r.loss ? 'Perte' : 'Bénéfice'}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && <figcaption className="mt-3 text-center text-sm leading-6 text-gray-500">{caption}</figcaption>}
    </figure>
  )
}

// ─── Seuils des marchés de travaux (à mettre à jour à chaque changement) ──────

export const SEUILS_TRAVAUX = {
  dispense: 100_000,       // R2122-8, depuis le 1er janvier 2026
  dispense2027: 140_000,   // au 1er janvier 2027
  publiciteMapa: 90_000,   // R2131-12 : BOAMP ou JAL au-dessus
  europeen: 5_404_000,     // seuil européen travaux 2026-2027
}

const SCALE = {
  publicite: {
    title: 'Où est publié un marché de travaux',
    subtitle: 'Art. R2131-12 du CCP, seuils 2026',
    zones: [
      {
        range: `Moins de ${eur(SEUILS_TRAVAUX.dispense)} HT`,
        title: 'Pas de publicité obligatoire',
        lines: ["L'acheteur peut demander des devis directement.", 'Visible nulle part : il faut être connu de l\'acheteur.'],
      },
      {
        range: `${eur(SEUILS_TRAVAUX.dispense)} à ${eur(SEUILS_TRAVAUX.europeen)} HT`,
        title: 'MAPA : BOAMP ou journal d\'annonces légales',
        lines: ["L'acheteur choisit l'un ou l'autre.", 'Dossier sur le profil d\'acheteur.'],
        focus: true,
      },
      {
        range: `${eur(SEUILS_TRAVAUX.europeen)} HT et plus`,
        title: 'Procédure formalisée : BOAMP et JOUE',
        lines: ['Avis publié aux deux endroits.', 'Visible par toute veille sérieuse.'],
      },
    ],
    note: 'Montants HT, appréciés sur la valeur totale de l\'opération. Règles de l\'État et des collectivités (art. R2131-12) ; seuil de dispense des travaux à 140 000 € HT au 1er janvier 2027.',
  },
  procedure: {
    title: 'Procédure applicable à un lot de travaux',
    subtitle: 'Seuils 2026, art. R2122-8 et R2123-1 du CCP',
    zones: [
      {
        range: `Moins de ${eur(SEUILS_TRAVAUX.dispense)} HT`,
        title: 'Dispense de procédure',
        lines: ['Ni publicité ni mise en concurrence obligatoires.', "L'acheteur consulte qui il veut, sans toujours choisir la même entreprise."],
      },
      {
        range: `${eur(SEUILS_TRAVAUX.dispense)} à ${eur(SEUILS_TRAVAUX.europeen)} HT`,
        title: 'Procédure adaptée (MAPA)',
        lines: ["L'acheteur fixe ses règles dans le RC…", '… puis doit les respecter.'],
        focus: true,
      },
      {
        range: `${eur(SEUILS_TRAVAUX.europeen)} HT et plus`,
        title: 'Procédure formalisée',
        lines: ['Appel d\'offres, procédure avec négociation…', 'Délais minimaux fixés par le Code.'],
      },
    ],
    note: 'Le seuil se compare à la valeur totale de l\'opération, tous lots compris, pas au montant de votre lot. Exception : les petits lots. Dispense à 140 000 € HT au 1er janvier 2027.',
  },
}

export function TravauxScale({ variant, caption }: { variant: keyof typeof SCALE; caption?: string }) {
  const s = SCALE[variant]
  return (
    <figure className="my-10">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-bold text-gray-900">{s.title}</p>
          <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">{s.subtitle}</p>
        </div>
        {/* Échelle */}
        <div className="mb-3 hidden h-2 overflow-hidden rounded-full sm:flex" aria-hidden="true">
          <div className="w-1/4 bg-gray-300" />
          <div className="w-1/2 bg-orange-400" />
          <div className="w-1/4 bg-blue-600" />
        </div>
        <ol className="grid gap-2 sm:grid-cols-[1fr_2fr_1fr]">
          {s.zones.map((z, i) => (
            <li
              key={z.title}
              className={`rounded-xl border bg-white p-3 ${'focus' in z && z.focus ? 'border-orange-300 ring-2 ring-orange-100' : 'border-gray-200'}`}
            >
              <p className={`mb-1 text-xs font-bold ${i === 0 ? 'text-gray-500' : i === 1 ? 'text-orange-700' : 'text-blue-700'}`}>{z.range}</p>
              <p className="mb-1.5 text-sm font-bold leading-snug text-gray-900">{z.title}</p>
              {z.lines.map((l) => (
                <p key={l} className="text-xs leading-snug text-gray-600">{l}</p>
              ))}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[11px] text-gray-500">{s.note}</p>
      </div>
      {caption && <figcaption className="mt-3 text-center text-sm leading-6 text-gray-500">{caption}</figcaption>}
    </figure>
  )
}

// ─── Article « Seuils 2026 » : historique du seuil de dispense travaux ────────

export type ThresholdStep = { date: string; value: number; text: string; temporary?: boolean; future?: boolean }

export function ThresholdHistory({ steps, caption, subtitle }: { steps: ThresholdStep[]; caption?: string; subtitle?: string }) {
  const max = Math.max(...steps.map((s) => s.value)) * 1.15
  return (
    <figure className="my-10">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
        <p className="font-bold text-gray-900">Seuil de dispense des marchés de travaux</p>
        {subtitle && <p className="mb-6 text-xs text-gray-500">{subtitle}</p>}

        <div className="relative h-60 sm:h-64" aria-hidden="true">
          {[50_000, 100_000, 150_000].map((v) => (
            <div key={v} className="absolute inset-x-0 border-t border-gray-200" style={{ bottom: `${(v / max) * 100}%` }}>
              <span className="absolute -top-2 left-0 bg-gray-50 pr-1 text-[10px] text-gray-400">{v / 1000} k€</span>
            </div>
          ))}
          <div className="absolute inset-0 left-10 flex items-end justify-around gap-1.5 sm:gap-3">
            {steps.map((s) => (
              <div key={s.date} className="flex h-full w-full min-w-0 max-w-16 flex-col items-center justify-end" title={`${s.date} : ${eur(s.value)} HT. ${s.text}`}>
                <BarLabel full={eur(s.value)} short={keur(s.value)} />
                <div
                  className={`w-full rounded-t ${
                    s.future
                      ? 'border-2 border-b-0 border-dashed border-orange-400 bg-orange-50'
                      : s.temporary
                        ? 'bg-blue-300'
                        : 'bg-blue-600'
                  }`}
                  style={{ height: `${(s.value / max) * 100}%` }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="ml-10 flex justify-around gap-1.5 border-t border-gray-300 pt-2 sm:gap-3" aria-hidden="true">
          {steps.map((s) => (
            <p key={s.date} className="w-full min-w-0 max-w-16 text-center text-[10px] leading-tight font-semibold text-gray-700 sm:text-[11px]">{s.date}</p>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-gray-600" aria-hidden="true">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-blue-600" /> Seuil inscrit dans le Code</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-blue-300" /> Seuil temporaire</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border-2 border-dashed border-orange-400 bg-orange-50" /> Voté, à venir</span>
        </div>

        <table className="mt-4 w-full text-left text-xs text-gray-600">
          <caption className="sr-only">Évolution du seuil de dispense des marchés de travaux</caption>
          <thead className="sr-only"><tr><th>Date</th><th>Seuil HT</th><th>Texte</th></tr></thead>
          <tbody className="divide-y divide-gray-200">
            {steps.map((s) => (
              <tr key={s.date}>
                <td className="py-1.5 pr-3 font-semibold whitespace-nowrap text-gray-800">{s.date}</td>
                <td className="py-1.5 pr-3 whitespace-nowrap">{eur(s.value)} HT</td>
                <td className="py-1.5">{s.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && <figcaption className="mt-3 text-center text-sm leading-6 text-gray-500">{caption}</figcaption>}
    </figure>
  )
}

// Historique vérifié (DAJ, marche-public.fr, octobre 2026)
const DISPENSE_STEPS: ThresholdStep[] = [
  { date: 'Avant oct. 2015', value: 15_000, text: 'Seuil historique de dispense.' },
  { date: 'Oct. 2015', value: 25_000, text: 'Décret n° 2015-1163, en vigueur le 1er octobre 2015.' },
  { date: 'Janv. 2020', value: 40_000, text: 'Décret n° 2019-1344, en vigueur le 1er janvier 2020.' },
  { date: 'Juil. 2020', value: 70_000, text: 'Décret n° 2020-893, mesure temporaire (jusqu\'au 10 juillet 2021).', temporary: true },
  { date: 'Déc. 2020', value: 100_000, text: 'Loi ASAP, art. 142 : temporaire jusqu\'à fin 2022, puis prorogé jusqu\'à fin 2024 (décret 2022-1683) et fin 2025 (décret 2024-1217).', temporary: true },
  { date: 'Janv. 2026', value: 100_000, text: 'Décret n° 2025-1386 : inscrit durablement dans le Code (art. R2122-8).' },
  { date: 'Janv. 2027', value: 140_000, text: 'Loi n° 2026-403, art. 13 : aligné sur le seuil européen des fournitures et services de l\'État.', future: true },
]

export function DispenseHistory({ caption }: { caption?: string }) {
  return (
    <ThresholdHistory
      steps={DISPENSE_STEPS}
      caption={caption}
      subtitle="Montants HT, 2015-2027 · décrets 2015-1163, 2019-1344, 2020-893, loi ASAP, décret 2025-1386, loi 2026-403"
    />
  )
}

// ─── Article « Critères d'attribution » ───────────────────────────────────────

// Simulation fictive : pondération 60 / 40, formule proportionnelle (mêmes valeurs que le simulateur Excel)
const SIMU = { tech: 0.6, prix: 0.4, offers: [
  { name: 'Offre A', desc: 'La moins chère, mémoire générique', priceGap: 0, techNote: 11 },
  { name: 'Offre B', desc: '+8 %, mémoire spécifique', priceGap: 0.08, techNote: 16 },
  { name: 'Offre C', desc: '+15 %, meilleur mémoire', priceGap: 0.15, techNote: 16.5 },
] }

export function NotationSimulation({ caption }: { caption?: string }) {
  const rows = SIMU.offers.map((o) => {
    const prixNote = 20 / (1 + o.priceGap)
    const techPts = (o.techNote / 20) * SIMU.tech * 100
    const prixPts = (prixNote / 20) * SIMU.prix * 100
    return { ...o, prixNote, techPts, prixPts, total: techPts + prixPts }
  })
  const best = Math.max(...rows.map((r) => r.total))
  const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })

  return (
    <figure className="my-10">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
        <p className="font-bold text-gray-900">Trois offres sur un même lot</p>
        <p className="mb-5 text-xs text-gray-500">Simulation fictive · valeur technique 60 %, prix 40 %, formule proportionnelle</p>

        <ul className="space-y-4">
          {rows.map((r) => (
            <li key={r.name}>
              <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900">
                  {r.name} <span className="font-normal text-gray-500">· {r.desc}</span>
                </p>
                <p className={`text-sm font-extrabold ${r.total === best ? 'text-emerald-700' : 'text-gray-800'}`}>
                  {fmt(r.total)} / 100 {r.total === best && '✓ retenue'}
                </p>
              </div>
              <div className="flex h-7 w-full gap-0.5 overflow-hidden rounded-md bg-white" title={`${r.name} : technique ${fmt(r.techPts)}, prix ${fmt(r.prixPts)}`}>
                <div className="flex items-center rounded-l-md bg-blue-600 px-2 text-[11px] font-semibold text-white" style={{ width: `${r.techPts}%` }}>
                  Technique {fmt(r.techPts)}
                </div>
                <div className="flex items-center rounded-r-md bg-orange-500 px-2 text-[11px] font-semibold text-white" style={{ width: `${r.prixPts}%` }}>
                  Prix {fmt(r.prixPts)}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <table className="mt-5 w-full text-left text-xs text-gray-600">
          <thead>
            <tr className="border-b border-gray-200 text-[11px] text-gray-500 uppercase">
              <th className="py-1.5 pr-2 font-semibold">Offre</th>
              <th className="py-1.5 pr-2 font-semibold">Note technique</th>
              <th className="py-1.5 pr-2 font-semibold">Note prix</th>
              <th className="py-1.5 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.name}>
                <td className="py-1.5 pr-2 font-semibold text-gray-800">{r.name}</td>
                <td className="py-1.5 pr-2">{fmt(r.techNote)} / 20 → {fmt(r.techPts)} pts</td>
                <td className="py-1.5 pr-2">{r.prixNote.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} / 20 → {fmt(r.prixPts)} pts</td>
                <td className="py-1.5 font-semibold text-gray-900">{fmt(r.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && <figcaption className="mt-3 text-center text-sm leading-6 text-gray-500">{caption}</figcaption>}
    </figure>
  )
}

// Hausse de prix qui compense 1 point de valeur technique (sur 20), formule proportionnelle
const POINT_VALUE_WEIGHTS = [0.3, 0.4, 0.5, 0.6, 0.7]

export function PointValue({ caption }: { caption?: string }) {
  const rows = POINT_VALUE_WEIGHTS.map((t) => {
    const p = 1 - t
    const x = 1 / (1 - t / (20 * p)) - 1
    return { t, x }
  })
  const max = 0.15
  const pct = (n: number) => `${(n * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`

  return (
    <figure className="my-10">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
        <p className="font-bold text-gray-900">Combien vaut 1 point de mémoire technique (sur 20) ?</p>
        <p className="mb-6 text-xs text-gray-500">
          Hausse de prix qui garde la même note globale · formule proportionnelle, prix et valeur technique seuls, écart mesuré par rapport au prix le plus bas
        </p>
        <ul className="space-y-2.5">
          {rows.map((r) => (
            <li key={r.t} className="grid grid-cols-[7.5rem_1fr] items-center gap-3 sm:grid-cols-[9rem_1fr]">
              <span className="text-xs font-semibold text-gray-700">Technique à {Math.round(r.t * 100)} %</span>
              <span className="flex items-center gap-2">
                <span className="h-5 rounded-r bg-blue-600" style={{ width: `${(r.x / max) * 100}%` }} title={`${pct(r.x)} de prix`} />
                <span className="text-xs font-bold whitespace-nowrap text-gray-900">{pct(r.x)}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[11px] text-gray-500">Lecture : à 60 % de valeur technique, une offre 8,1 % plus chère mais meilleure d'1 point sur le mémoire garde la même note.</p>
      </div>
      {caption && <figcaption className="mt-3 text-center text-sm leading-6 text-gray-500">{caption}</figcaption>}
    </figure>
  )
}

// ─── Article « DPGF » : où va l'argent du lot ─────────────────────────────────

const LOT_SPLIT = [
  { label: 'Déboursé sec', value: 18200, color: 'bg-gray-400', note: 'main-d\'œuvre, matériaux, matériel' },
  { label: 'Frais généraux', value: 4368, color: 'bg-orange-500', note: '24 % du déboursé sec' },
  { label: 'Marge', value: 1456, color: 'bg-blue-600', note: '8 % du déboursé sec' },
]

export function LotMoneySplit({ caption }: { caption?: string }) {
  const total = LOT_SPLIT.reduce((s, r) => s + r.value, 0)
  return (
    <figure className="my-10">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
        <p className="font-bold text-gray-900">Où va l'argent du lot</p>
        <p className="mb-5 text-xs text-gray-500">Calculé à partir de l'exemple · lot de maçonnerie fictif de {eur(total)} HT, coefficient de vente 1,32</p>
        <div className="mb-5 flex h-8 w-full gap-0.5 overflow-hidden rounded-md" aria-hidden="true">
          {LOT_SPLIT.map((r) => (
            <div key={r.label} className={`${r.color} flex items-center justify-center text-[11px] font-semibold text-white`} style={{ width: `${(r.value / total) * 100}%` }}>
              {Math.round((r.value / total) * 100)} %
            </div>
          ))}
        </div>
        <ul className="space-y-2">
          {LOT_SPLIT.map((r) => (
            <li key={r.label} className="grid grid-cols-[1fr_auto] items-baseline gap-3 border-b border-gray-200 pb-2 text-sm last:border-0">
              <span className="flex items-center gap-2">
                <span className={`h-3 w-3 shrink-0 rounded-sm ${r.color}`} aria-hidden="true" />
                <span className="font-semibold text-gray-900">{r.label}</span>
                <span className="text-xs text-gray-500">{r.note}</span>
              </span>
              <span className="font-bold text-gray-900">{eur(r.value)}</span>
            </li>
          ))}
        </ul>
      </div>
      {caption && <figcaption className="mt-3 text-center text-sm leading-6 text-gray-500">{caption}</figcaption>}
    </figure>
  )
}
