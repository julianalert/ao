'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { FAMILLE_LABELS, getIndiceByCode, indiceHref, INDICES, type FamilleIndice } from '@/lib/indices-catalog'
import type { IndiceSerie } from '@/lib/indices'
import {
  calculerActualisation, calculerRevision, PARTIE_FIXE_DEFAUT, valeurIndice, type ValeurIndice,
} from '@/lib/outils/revision'
import { addMonths, fmtDate, fmtEur, fmtMonth, fmtNum, fmtPct, parseNumber } from '@/lib/format'
import { Alert, Field, FormStep, inputClass, MonthPicker, RadioCards, selectClass, Stat, Toggle } from '@/components/outils/form'
import { CopyButton, PrintButton } from '@/components/outils/actions'

type Mode = 'revision' | 'actualisation'
type Formule = 'simple' | 'multi'
type LigneTerme = { id: string; code: string; poids: string }
type Situation = { id: string; mois: string; montant: string }
type SerieState = IndiceSerie | null | 'loading'

const fmtIdx = (v: number) => fmtNum(v, 2, 1)
const fmtCoef = (v: number) => fmtNum(v, 4, 4)

function IndiceSelect({ id, value, onChange }: { id?: string; value: string; onChange: (v: string) => void }) {
  return (
    <select id={id} className={selectClass} value={value} onChange={(e) => onChange(e.target.value)}>
      {(['BT', 'TP', 'Divers'] as FamilleIndice[]).map((f) => (
        <optgroup key={f} label={FAMILLE_LABELS[f]}>
          {INDICES.filter((i) => i.famille === f).map((i) => (
            <option key={i.code} value={i.code}>
              {i.code} · {i.label}{i.arretee ? ' (série arrêtée)' : ''}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}

const STATUT_LABELS: Record<ValeurIndice['statut'], string> = {
  ok: 'définitive',
  provisoire: 'provisoire',
  'non-publie': 'non publiée',
  'hors-serie': 'indisponible',
  manuel: 'saisie manuelle',
}

export default function RevisionCalculator({
  initial,
  defaults,
  intro,
}: {
  initial: IndiceSerie | null
  defaults: { mois0: string; moisM: string; dernierMois: string }
  intro: ReactNode
}) {
  const [mode, setMode] = useState<Mode>('revision')
  const [formule, setFormule] = useState<Formule>('simple')
  const [montant, setMontant] = useState('250000')
  const [code, setCode] = useState(initial?.code ?? 'BT01')
  const [partieFixe, setPartieFixe] = useState(fmtNum(PARTIE_FIXE_DEFAUT, 3))
  const [partieFixeMulti, setPartieFixeMulti] = useState('0,15')
  const [termes, setTermes] = useState<LigneTerme[]>([
    { id: 't1', code: 'BT01', poids: '0,50' },
    { id: 't2', code: 'BT45', poids: '0,35' },
  ])
  const [mois0, setMois0] = useState(defaults.mois0)
  const [moisM, setMoisM] = useState(defaults.moisM)
  const [avance, setAvance] = useState(false)
  const [i0Manuel, setI0Manuel] = useState('')
  const [imManuel, setImManuel] = useState('')
  const [situationsOn, setSituationsOn] = useState(false)
  const [situations, setSituations] = useState<Situation[]>(() =>
    [-2, -1, 0].map((d, i) => ({ id: `s${i}`, mois: addMonths(defaults.moisM, d), montant: ['40000', '55000', '35000'][i] })),
  )
  const [series, setSeries] = useState<Record<string, SerieState>>(initial ? { [initial.code]: initial } : {})

  // Index présélectionné depuis une page /indices/xxx (?indice=BT45)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('indice')
    const def = q ? getIndiceByCode(q) : undefined
    if (def) setCode(def.code)
  }, [])

  const multi = mode === 'revision' && formule === 'multi'
  const codesUtiles = multi ? Array.from(new Set(termes.map((t) => t.code))) : [code]

  useEffect(() => {
    for (const c of codesUtiles) {
      if (c in series) continue
      setSeries((s) => ({ ...s, [c]: 'loading' }))
      fetch(`/api/indices/${encodeURIComponent(c)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data: IndiceSerie | null) => setSeries((s) => ({ ...s, [c]: data })))
        .catch(() => setSeries((s) => ({ ...s, [c]: null })))
    }
  }, [codesUtiles.join('|')]) // eslint-disable-line react-hooks/exhaustive-deps

  const obsOf = (c: string) => {
    const s = series[c]
    return s && s !== 'loading' ? s.obs : undefined
  }
  const chargement = codesUtiles.some((c) => series[c] === 'loading' || !(c in series))
  const indisponibles = codesUtiles.filter((c) => series[c] === null)

  const p0 = parseNumber(montant)
  const a = parseNumber(multi ? partieFixeMulti : partieFixe)
  const termesNum = multi
    ? termes.map((t) => ({ code: t.code, poids: parseNumber(t.poids) || 0 }))
    : [{ code, poids: 1 - (isNaN(a) ? 0 : a) }]

  const valeur = (useManual: boolean) => (c: string, mois: string, role: 'i0' | 'im') => {
    const manuel = !multi && useManual ? parseNumber(role === 'i0' ? i0Manuel : imManuel) : NaN
    return valeurIndice(c, obsOf(c), mois, manuel > 0 ? manuel : null)
  }

  const revision = useMemo(
    () => (mode === 'revision' ? calculerRevision(p0, isNaN(a) ? 0 : a, termesNum, mois0, moisM, valeur(true)) : null),
    [mode, p0, a, JSON.stringify(termesNum), mois0, moisM, series, i0Manuel, imManuel, multi], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const actualisation = useMemo(
    () => (mode === 'actualisation' ? calculerActualisation(p0, code, mois0, moisM, valeur(true)) : null),
    [mode, p0, code, mois0, moisM, series, i0Manuel, imManuel], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const res = revision ?? actualisation!
  const valeursUtilisees: { libelle: string; v: ValeurIndice }[] = revision
    ? revision.valeurs.flatMap((x) => [
        { libelle: `${x.terme.code} mois zéro`, v: x.i0 },
        { libelle: `${x.terme.code} mois de révision`, v: x.im },
      ])
    : [
        { libelle: `${code} mois zéro`, v: actualisation!.i0 },
        { libelle: `${code} d − 3 mois`, v: actualisation!.id3 },
      ]
  const nonPublies = valeursUtilisees.filter((x) => x.v.statut === 'non-publie')
  const provisoires = valeursUtilisees.filter((x) => x.v.statut === 'provisoire')
  const manquants = valeursUtilisees.filter((x) => x.v.statut === 'hors-serie')
  const sommePoidsKo = multi && revision && Math.abs(revision.sommePoids - 1) > 0.0005
  const partieFixeKo = isNaN(a) || a < 0 || a >= 1

  const formuleTexte = (() => {
    if (!res.coefficient || !(p0 > 0)) return null
    const af = fmtNum(isNaN(a) ? 0 : a, 3)
    if (actualisation) {
      if (!actualisation.applicable) return null
      return `${fmtEur(p0, 0)} × ${fmtIdx(actualisation.id3.valeur!)} / ${fmtIdx(actualisation.i0.valeur!)} = ${fmtEur(res.montant!)}`
    }
    const parts = revision!.valeurs.map((x) => `${fmtNum(x.terme.poids, 3)} × ${fmtIdx(x.im.valeur!)} / ${fmtIdx(x.i0.valeur!)}`)
    return `${fmtEur(p0, 0)} × (${af} + ${parts.join(' + ')}) = ${fmtEur(res.montant!)}`
  })()

  const situationsCalc = mode === 'revision' && situationsOn
    ? situations.map((s) => {
        const m = parseNumber(s.montant)
        const r = calculerRevision(m, isNaN(a) ? 0 : a, termesNum, mois0, s.mois, valeur(false))
        const nonPublie = r.valeurs.some((x) => x.im.statut === 'non-publie')
        return { ...s, m, r, nonPublie }
      })
    : []
  const totalSituations = situationsCalc.reduce(
    (acc, s) => ({ initial: acc.initial + (s.m || 0), revise: acc.revise + (s.r.montant ?? 0) }),
    { initial: 0, revise: 0 },
  )

  const resumeTexte = () =>
    [
      `${mode === 'revision' ? 'Révision' : 'Actualisation'} de prix (mon-ao.com)`,
      `Montant initial : ${fmtEur(p0)} HT · mois zéro : ${fmtMonth(mois0)} · ${mode === 'revision' ? 'mois de révision' : 'début d\'exécution'} : ${fmtMonth(moisM)}`,
      ...valeursUtilisees.map((x) => `${x.libelle} (${x.v.moisUtilise ? fmtMonth(x.v.moisUtilise) : '—'}) : ${x.v.valeur ? fmtIdx(x.v.valeur) : '—'} (${STATUT_LABELS[x.v.statut]})`),
      formuleTexte ? `Calcul : ${formuleTexte}` : '',
      res.coefficient ? `Coefficient : ${fmtCoef(res.coefficient)}` : '',
      res.montant ? `Montant ${mode === 'revision' ? 'révisé' : 'actualisé'} : ${fmtEur(res.montant)} HT (${fmtEur(res.ecart ?? 0)}, ${fmtPct(res.ecartPct ?? 0, 2, true)})` : '',
    ]
      .filter(Boolean)
      .join('\n')

  const anneeMax = Number(defaults.dernierMois.slice(0, 4)) + 1
  const pret = !chargement && res.coefficient !== null && res.montant !== null

  return (
    <>
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-5 lg:pt-4">{intro}</div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-xl shadow-blue-900/5 p-5 md:p-7">
            <FormStep n={1} title="Le type de prix" />
            <RadioCards
              name="mode"
              value={mode}
              onChange={setMode}
              columns={2}
              options={[
                { value: 'revision', label: 'Révision', hint: 'prix révisables, formule paramétrique' },
                { value: 'actualisation', label: 'Actualisation', hint: 'prix fermes, exécution > 3 mois après Mo' },
              ]}
            />

            <div className="border-t border-gray-100 my-6" />
            <FormStep n={2} title="Le marché" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Montant initial P₀ HT" htmlFor="rv-montant">
                <div className="relative">
                  <input id="rv-montant" inputMode="decimal" className={`${inputClass} pr-8`} value={montant} onChange={(e) => setMontant(e.target.value)} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
                </div>
              </Field>
              {!multi && (
                <Field label="Index de référence" htmlFor="rv-indice">
                  <IndiceSelect id="rv-indice" value={code} onChange={setCode} />
                </Field>
              )}
              <Field label="Mois zéro (Mo)" hint="établissement des prix" htmlFor="rv-mo">
                <MonthPicker id="rv-mo" value={mois0} onChange={setMois0} fromYear={2010} toYear={anneeMax} />
              </Field>
              <Field label={mode === 'revision' ? 'Mois d\'exécution' : 'Début d\'exécution (d)'} htmlFor="rv-mm">
                <MonthPicker id="rv-mm" value={moisM} onChange={setMoisM} fromYear={2010} toYear={anneeMax} />
              </Field>
            </div>

            {mode === 'revision' && (
              <div className="mt-5">
                <Toggle
                  checked={formule === 'multi'}
                  onChange={(v) => setFormule(v ? 'multi' : 'simple')}
                  label="Formule paramétrique multi-index (ex. 0,15 + 0,50 × BT01 + 0,35 × BT45)"
                />
              </div>
            )}

            {mode === 'revision' && !multi && (
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <Field label="Partie fixe a" hint="souvent 0,125" htmlFor="rv-a">
                  <input id="rv-a" inputMode="decimal" className={inputClass} value={partieFixe} onChange={(e) => setPartieFixe(e.target.value)} />
                </Field>
                <Field label="Partie variable b" hint="= 1 − a">
                  <input disabled className={`${inputClass} bg-gray-50 text-gray-500`} value={partieFixeKo ? '—' : fmtNum(1 - a, 3)} />
                </Field>
              </div>
            )}

            {multi && (
              <div className="mt-4 space-y-2">
                <Field label="Partie fixe" htmlFor="rv-a-multi">
                  <input id="rv-a-multi" inputMode="decimal" className={`${inputClass} sm:w-32`} value={partieFixeMulti} onChange={(e) => setPartieFixeMulti(e.target.value)} />
                </Field>
                <p className="text-sm font-medium text-gray-700 pt-2">Termes variables</p>
                {termes.map((t) => (
                  <div key={t.id} className="grid grid-cols-[5rem_1fr_2rem] gap-2 items-center">
                    <input aria-label="Coefficient" inputMode="decimal" className={`${inputClass} text-center`} value={t.poids} onChange={(e) => setTermes(termes.map((x) => (x.id === t.id ? { ...x, poids: e.target.value } : x)))} />
                    <IndiceSelect value={t.code} onChange={(v) => setTermes(termes.map((x) => (x.id === t.id ? { ...x, code: v } : x)))} />
                    <button
                      type="button"
                      onClick={() => setTermes(termes.filter((x) => x.id !== t.id))}
                      disabled={termes.length <= 1}
                      className="h-9 w-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30"
                      aria-label="Supprimer ce terme"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {termes.length < 6 && (
                  <button type="button" onClick={() => setTermes([...termes, { id: `t${Date.now()}`, code: 'BT01', poids: '0' }])} className="text-sm font-medium text-blue-600 hover:underline">
                    + Ajouter un index
                  </button>
                )}
                {revision && (
                  <p className={`text-xs ${sommePoidsKo ? 'text-amber-700' : 'text-gray-500'}`}>
                    Somme des coefficients : {fmtNum(revision.sommePoids, 3)} {sommePoidsKo ? '(elle devrait être égale à 1)' : '✓'}
                  </p>
                )}
              </div>
            )}

            {!multi && (
              <details className="mt-5 group" open={avance} onToggle={(e) => setAvance((e.target as HTMLDetailsElement).open)}>
                <summary className="cursor-pointer list-none text-sm font-medium text-gray-600 [&::-webkit-details-marker]:hidden">
                  <span className="text-blue-600 mr-1 inline-block transition group-open:rotate-90">›</span> Saisir les valeurs d'index manuellement <span className="font-normal text-gray-400">(ancienne base, index non publié…)</span>
                </summary>
                <div className="grid sm:grid-cols-2 gap-4 mt-3">
                  <Field label="I₀ manuel" htmlFor="rv-i0"><input id="rv-i0" inputMode="decimal" className={inputClass} value={i0Manuel} placeholder="valeur INSEE" onChange={(e) => setI0Manuel(e.target.value)} /></Field>
                  <Field label={mode === 'revision' ? 'Iₘ manuel' : 'I(d−3) manuel'} htmlFor="rv-im"><input id="rv-im" inputMode="decimal" className={inputClass} value={imManuel} placeholder="valeur INSEE" onChange={(e) => setImManuel(e.target.value)} /></Field>
                </div>
              </details>
            )}

            <div className="border-t border-gray-100 my-6" />
            {chargement ? (
              <p className="text-sm text-gray-400">Chargement des index INSEE…</p>
            ) : actualisation && !actualisation.applicable ? (
              <Alert>
                Pas d'actualisation : le début d'exécution ({fmtMonth(moisM)}) intervient moins de 3 mois après le mois zéro. Le prix
                ferme s'applique tel quel.
              </Alert>
            ) : pret ? (
              <div className="grid sm:grid-cols-3 gap-3">
                <Stat label="Coefficient" value={fmtCoef(res.coefficient!)} sub={mode === 'revision' ? 'de révision' : 'd\'actualisation'} />
                <Stat accent label={mode === 'revision' ? 'Montant révisé HT' : 'Montant actualisé HT'} value={fmtEur(res.montant!)} />
                <Stat label="Écart" value={fmtEur(res.ecart!)} sub={fmtPct(res.ecartPct!, 2, true)} />
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                {indisponibles.length
                  ? `Données INSEE indisponibles pour ${indisponibles.join(', ')} : saisissez les valeurs manuellement.`
                  : 'Complétez les champs pour obtenir le calcul.'}
              </p>
            )}
            {pret && (
              <a href="#detail" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
                Voir les index utilisés et le détail ↓
              </a>
            )}
          </div>
        </div>
      </div>

      {!chargement && (pret || manquants.length > 0) && (
        <div id="detail" className="scroll-mt-24 mt-12 lg:mt-16 space-y-4">
          <div id="revision-resultat" className="rounded-2xl border border-gray-200 bg-white p-5 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h2 className="text-lg font-bold text-gray-900">Détail du calcul</h2>
              {pret && (
                <div className="no-print flex flex-wrap gap-2">
                  <CopyButton getText={resumeTexte} />
                  <PrintButton targetId="revision-resultat" title={mode === 'revision' ? 'Révision de prix' : 'Actualisation de prix'} />
                </div>
              )}
            </div>

            {formuleTexte && (
              <div className="mb-5 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 font-mono text-sm text-gray-800 overflow-x-auto whitespace-nowrap">
                P = {formuleTexte}
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    {['Index', 'Mois', 'Valeur', 'Publié au JO', 'Statut'].map((h) => (
                      <th key={h} scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {valeursUtilisees.map((x, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link href={indiceHref(x.v.code)} className="font-medium text-blue-600 hover:underline">{x.v.code}</Link>
                        <span className="text-gray-500"> · {x.libelle.replace(`${x.v.code} `, '')}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{x.v.moisUtilise ? fmtMonth(x.v.moisUtilise) : fmtMonth(x.v.mois)}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{x.v.valeur ? fmtIdx(x.v.valeur) : '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{fmtDate(x.v.jo)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          x.v.statut === 'ok' || x.v.statut === 'manuel' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {STATUT_LABELS[x.v.statut]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 space-y-2">
              {nonPublies.map((x, i) => (
                <Alert key={i} tone="warning">
                  Index provisoire : {x.v.code} de {fmtMonth(x.v.mois)} n'est pas encore publié. Le calcul utilise la dernière valeur
                  connue ({fmtMonth(x.v.moisUtilise!)}) et devra être régularisé à la publication de l'index définitif.
                </Alert>
              ))}
              {provisoires.map((x, i) => (
                <Alert key={i} tone="warning">
                  La valeur de {x.v.code} pour {fmtMonth(x.v.mois)} est provisoire : la valeur définitive INSEE n'est pas encore
                  publiée.
                </Alert>
              ))}
              {manquants.map((x, i) => (
                <Alert key={i} tone="warning">
                  Pas de valeur INSEE pour {x.v.code} en {fmtMonth(x.v.mois)} (les séries base 2010 démarrent en octobre 2014).
                  {!multi && ' Saisissez la valeur manuellement, après application du coefficient de raccordement si besoin.'}
                </Alert>
              ))}
              {sommePoidsKo && <Alert tone="warning">La partie fixe et les coefficients doivent totaliser 1 : vérifiez la formule de votre CCAP.</Alert>}
            </div>

            {mode === 'revision' && (
              <div className="mt-6">
                <Toggle checked={situationsOn} onChange={setSituationsOn} label="Réviser des situations de travaux mois par mois" />
              </div>
            )}

            {situationsCalc.length > 0 && (
              <div className="mt-4">
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                      <tr>
                        {['Mois d\'exécution', 'Montant HT', 'Coefficient', 'Montant révisé', 'Écart', ''].map((h, i) => (
                          <th key={i} scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {situationsCalc.map((s) => (
                        <tr key={s.id}>
                          <td className="px-3 py-2 min-w-48">
                            <MonthPicker value={s.mois} onChange={(v) => setSituations(situations.map((x) => (x.id === s.id ? { ...x, mois: v } : x)))} fromYear={2010} toYear={anneeMax} />
                          </td>
                          <td className="px-3 py-2 min-w-32">
                            <input aria-label="Montant HT" inputMode="decimal" className={inputClass} value={s.montant} onChange={(e) => setSituations(situations.map((x) => (x.id === s.id ? { ...x, montant: e.target.value } : x)))} />
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {s.r.coefficient ? fmtCoef(s.r.coefficient) : '—'}
                            {s.nonPublie && <span className="ml-1 text-xs text-amber-600" title="Index non publié : dernière valeur connue">*</span>}
                          </td>
                          <td className="px-4 py-2 font-semibold text-gray-900 whitespace-nowrap">{s.r.montant !== null ? fmtEur(s.r.montant) : '—'}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{s.r.ecart !== null ? fmtEur(s.r.ecart) : '—'}</td>
                          <td className="px-2 py-2">
                            <button type="button" onClick={() => setSituations(situations.filter((x) => x.id !== s.id))} disabled={situations.length <= 1} className="h-9 w-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30" aria-label="Supprimer cette situation">✕</button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-semibold">
                        <td className="px-4 py-3">Total</td>
                        <td className="px-4 py-3 whitespace-nowrap">{fmtEur(totalSituations.initial)}</td>
                        <td />
                        <td className="px-4 py-3 whitespace-nowrap text-blue-600">{fmtEur(totalSituations.revise)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{fmtEur(totalSituations.revise - totalSituations.initial)}</td>
                        <td />
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const last = situations[situations.length - 1]
                      setSituations([...situations, { id: `s${Date.now()}`, mois: addMonths(last?.mois ?? moisM, 1), montant: '' }])
                    }}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    + Ajouter un mois
                  </button>
                  {situationsCalc.some((s) => s.nonPublie) && (
                    <span className="text-xs text-amber-700">* index non publié : dernière valeur connue, à régulariser</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
