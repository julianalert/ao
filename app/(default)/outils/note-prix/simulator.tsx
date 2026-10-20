'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  compensationTechnique, concurrentsHypothese, duelAuPrix, METHODES, noterCandidats, prixPourPasserPremier,
  type Candidat, type Methode, type ParamsNotation, type PrixPremier,
} from '@/lib/outils/note-prix'
import { EXEMPLE_NOTE_PRIX } from '@/lib/outils/note-prix-exemple'
import { fmtEur, fmtNum, fmtPct, parseNumber } from '@/lib/format'
import { Alert, Field, FormStep, inputClass, RadioCards, selectClass, Stat } from '@/components/outils/form'
import { CopyButton, PrintButton } from '@/components/outils/actions'

type Ligne = { id: string; nom: string; prix: string; noteTech: string }

const EX = EXEMPLE_NOTE_PRIX
const fmtNote = (n: number) => fmtNum(n, 2)
const kEur = (n: number) => `${fmtNum(n / 1000, n >= 100000 ? 0 : 1)} k€`

export default function NotePrixSimulator({ intro }: { intro: ReactNode }) {
  const [methode, setMethode] = useState<Methode>(EX.params.methode)
  const [nmax, setNmax] = useState(EX.params.nmax)
  const [poidsPrix, setPoidsPrix] = useState(String(EX.params.poidsPrix))
  const [k, setK] = useState(String(EX.params.k))
  const [monPrix, setMonPrix] = useState(String(EX.moi.prix))
  const [maNote, setMaNote] = useState(String(EX.moi.noteTech))
  const [mode, setMode] = useState<'connus' | 'hypothese'>('connus')
  const [lignes, setLignes] = useState<Ligne[]>(
    EX.concurrents.map((c) => ({ id: c.id, nom: c.nom, prix: String(c.prix), noteTech: String(c.noteTech) })),
  )
  const [hypNombre, setHypNombre] = useState(3)
  const [hypDispersion, setHypDispersion] = useState('10')
  const [hypNote, setHypNote] = useState(String(EX.moi.noteTech))
  const [ecart, setEcart] = useState('5')

  // Pré-remplissage depuis l'analyseur de RC (?methode=…&poids=…&nmax=…)
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const m = sp.get('methode')
    if (m && METHODES.some((x) => x.value === m)) setMethode(m as Methode)
    const poids = Number(sp.get('poids'))
    if (poids > 0 && poids <= 100) setPoidsPrix(String(poids))
    const n = Number(sp.get('nmax'))
    if (n === 10 || n === 20 || n === 100) setNmax(n)
  }, [])

  const params: ParamsNotation = {
    methode,
    nmax,
    poidsPrix: Math.min(100, Math.max(0, parseNumber(poidsPrix) || 0)),
    k: parseNumber(k) || 1,
  }
  const moi: Candidat = { id: 'moi', nom: 'Votre offre', prix: parseNumber(monPrix), noteTech: parseNumber(maNote) || 0, moi: true }

  const concurrents: Candidat[] = useMemo(() => {
    if (mode === 'hypothese') {
      return moi.prix > 0 ? concurrentsHypothese(moi.prix, hypNombre, parseNumber(hypDispersion) || 0, parseNumber(hypNote) || 0) : []
    }
    return lignes
      .map((l, i) => ({ id: l.id, nom: l.nom.trim() || `Concurrent ${String.fromCharCode(65 + i)}`, prix: parseNumber(l.prix), noteTech: parseNumber(l.noteTech) || 0 }))
      .filter((c) => c.prix > 0)
  }, [mode, lignes, moi.prix, hypNombre, hypDispersion, hypNote])

  const valide = moi.prix > 0 && concurrents.length > 0
  const classement = useMemo(() => (valide ? noterCandidats([moi, ...concurrents], params) : []), [valide, moi.prix, moi.noteTech, concurrents, params.methode, params.nmax, params.poidsPrix, params.k]) // eslint-disable-line react-hooks/exhaustive-deps
  const me = classement.find((c) => c.moi)
  const premier: PrixPremier | null = useMemo(
    () => (valide ? prixPourPasserPremier(moi, concurrents, params) : null),
    [valide, moi.prix, moi.noteTech, concurrents, params.methode, params.nmax, params.poidsPrix, params.k], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const tousPrix = classement.map((c) => c.prix)
  const compensation = valide
    ? compensationTechnique(parseNumber(ecart) || 0, Math.min(...tousPrix), Math.max(...tousPrix), params)
    : null

  function changeNmax(n: number) {
    const ratio = n / nmax
    const scale = (s: string) => {
      const v = parseNumber(s)
      return isNaN(v) ? s : String(Math.round(v * ratio * 100) / 100)
    }
    setMaNote(scale(maNote))
    setHypNote(scale(hypNote))
    setLignes(lignes.map((l) => ({ ...l, noteTech: scale(l.noteTech) })))
    setNmax(n)
  }

  const updateLigne = (id: string, patch: Partial<Ligne>) => setLignes(lignes.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  const poidsTech = 100 - params.poidsPrix

  const premierTexte = (p: PrixPremier | null): string => {
    if (!p) return '—'
    if (p.statut === 'toujours') return 'Vous restez 1er quel que soit votre prix'
    if (p.statut === 'impossible') return 'Impossible par le seul prix'
    return fmtEur(p.prix, 0)
  }

  const resumeTexte = () =>
    [
      'Simulation de note prix (mon-ao.com)',
      `Méthode : ${METHODES.find((m) => m.value === methode)?.label}, note sur ${nmax}, prix ${params.poidsPrix} % / technique ${poidsTech} %`,
      ...classement.map((c) => `${c.rang}. ${c.nom} : ${fmtEur(c.prix, 0)}, note prix ${fmtNote(c.notePrix)}, note finale ${fmtNote(c.noteFinale)}/${nmax}`),
      `Prix maximum pour finir 1er : ${premierTexte(premier)}`,
      compensation ? `Un écart de prix de ${ecart} % se compense par ${fmtNote(compensation.pointsTech)} pts de note technique` : '',
    ]
      .filter(Boolean)
      .join('\n')

  return (
    <>
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-5 lg:pt-4">{intro}</div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-xl shadow-blue-900/5 p-5 md:p-7">
            <FormStep n={1} title="La méthode de l'acheteur" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Méthode de notation du prix" htmlFor="np-methode" className="sm:col-span-2">
                <select id="np-methode" className={selectClass} value={methode} onChange={(e) => setMethode(e.target.value as Methode)}>
                  {METHODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <p className="mt-1.5 font-mono text-xs text-gray-500">{METHODES.find((m) => m.value === methode)?.formule}</p>
              </Field>
              <Field label="Note maximale" htmlFor="np-nmax">
                <select id="np-nmax" className={selectClass} value={nmax} onChange={(e) => changeNmax(Number(e.target.value))}>
                  {[10, 20, 100].map((n) => <option key={n} value={n}>{n} points</option>)}
                </select>
              </Field>
              <Field label="Pondération prix / technique" htmlFor="np-poids">
                <div className="flex items-center gap-2">
                  <input id="np-poids" inputMode="numeric" className={`${inputClass} text-center`} value={poidsPrix} onChange={(e) => setPoidsPrix(e.target.value)} />
                  <span className="text-gray-400">/</span>
                  <input aria-label="Pondération technique" disabled className={`${inputClass} text-center bg-gray-50 text-gray-500`} value={poidsTech} />
                  <span className="text-sm text-gray-400">%</span>
                </div>
              </Field>
              {methode === 'coefficient' && (
                <Field label="Coefficient k" hint="souvent entre 1 et 4" htmlFor="np-k">
                  <input id="np-k" inputMode="decimal" className={inputClass} value={k} onChange={(e) => setK(e.target.value)} />
                </Field>
              )}
            </div>

            <div className="border-t border-gray-100 my-6" />
            <FormStep n={2} title="Votre offre" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Votre prix HT" htmlFor="np-prix">
                <div className="relative">
                  <input id="np-prix" inputMode="decimal" className={`${inputClass} pr-8`} value={monPrix} onChange={(e) => setMonPrix(e.target.value)} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
                </div>
              </Field>
              <Field label="Votre note technique estimée" hint={`sur ${nmax}`} htmlFor="np-note">
                <input id="np-note" inputMode="decimal" className={inputClass} value={maNote} onChange={(e) => setMaNote(e.target.value)} />
              </Field>
            </div>

            <div className="border-t border-gray-100 my-6" />
            <FormStep n={3} title="Les concurrents" />
            <RadioCards
              name="mode"
              value={mode}
              onChange={setMode}
              columns={2}
              options={[
                { value: 'connus', label: 'Je connais leurs prix', hint: 'ouverture des plis, attribution précédente' },
                { value: 'hypothese', label: 'Je ne les connais pas', hint: 'simulation sur hypothèses' },
              ]}
            />

            {mode === 'connus' ? (
              <div className="mt-4 space-y-2">
                <div className="hidden sm:grid grid-cols-[1fr_9rem_6rem_2rem] gap-2 text-xs font-medium text-gray-500 px-1">
                  <span>Concurrent</span><span>Prix HT (€)</span><span>Note tech.</span><span />
                </div>
                {lignes.map((l, i) => (
                  <div key={l.id} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_9rem_6rem_2rem] gap-2 items-center">
                    <input aria-label="Nom du concurrent" className={`${inputClass} col-span-2 sm:col-span-1`} value={l.nom} placeholder={`Concurrent ${String.fromCharCode(65 + i)}`} onChange={(e) => updateLigne(l.id, { nom: e.target.value })} />
                    <input aria-label="Prix HT" inputMode="decimal" className={inputClass} value={l.prix} placeholder="Prix HT" onChange={(e) => updateLigne(l.id, { prix: e.target.value })} />
                    <input aria-label="Note technique" inputMode="decimal" className={inputClass} value={l.noteTech} placeholder={`/${nmax}`} onChange={(e) => updateLigne(l.id, { noteTech: e.target.value })} />
                    <button
                      type="button"
                      onClick={() => setLignes(lignes.filter((x) => x.id !== l.id))}
                      disabled={lignes.length <= 1}
                      className="h-9 w-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent"
                      aria-label="Supprimer ce concurrent"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {lignes.length < 10 && (
                  <button
                    type="button"
                    onClick={() => setLignes([...lignes, { id: `c${Date.now()}`, nom: '', prix: '', noteTech: maNote }])}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    + Ajouter un concurrent
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-4 grid sm:grid-cols-3 gap-4">
                <Field label="Nombre de concurrents" htmlFor="np-hn">
                  <select id="np-hn" className={selectClass} value={hypNombre} onChange={(e) => setHypNombre(Number(e.target.value))}>
                    {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </Field>
                <Field label="Écart de prix" hint="± % autour du vôtre" htmlFor="np-hd">
                  <input id="np-hd" inputMode="decimal" className={inputClass} value={hypDispersion} onChange={(e) => setHypDispersion(e.target.value)} />
                </Field>
                <Field label="Leur note technique" hint={`sur ${nmax}`} htmlFor="np-ht">
                  <input id="np-ht" inputMode="decimal" className={inputClass} value={hypNote} onChange={(e) => setHypNote(e.target.value)} />
                </Field>
              </div>
            )}

            <div className="border-t border-gray-100 my-6" />
            {valide && me && premier ? (
              <div className="grid sm:grid-cols-3 gap-3">
                <Stat label="Votre note finale" value={`${fmtNote(me.noteFinale)} / ${nmax}`} sub={`dont prix ${fmtNote(me.notePrixPond)}`} />
                <Stat label="Classement" value={`${me.rang}${me.rang === 1 ? 'er' : 'e'} sur ${classement.length}`} sub={me.rang === 1 ? 'vous êtes en tête' : `${fmtNote(classement[0].noteFinale - me.noteFinale)} pt de retard`} />
                <Stat
                  accent
                  label="Prix max. pour finir 1er"
                  value={premierTexte(premier)}
                  sub={premier.statut === 'ok' && moi.prix > 0 ? `${fmtPct(((premier.prix - moi.prix) / moi.prix) * 100, 1, true)} vs votre prix` : undefined}
                />
              </div>
            ) : (
              <p className="text-sm text-gray-400">Renseignez votre prix et au moins un concurrent pour lancer la simulation.</p>
            )}
            {valide && (
              <a href="#detail" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
                Voir le classement détaillé et la courbe ↓
              </a>
            )}
          </div>
        </div>
      </div>

      {valide && me && premier && (
        <div id="detail" className="scroll-mt-24 mt-12 lg:mt-16">
          <div id="note-prix-resultat" className="rounded-2xl border border-gray-200 bg-white p-5 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h2 className="text-lg font-bold text-gray-900">Classement simulé</h2>
              <div className="no-print flex flex-wrap gap-2">
                <CopyButton getText={resumeTexte} />
                <PrintButton targetId="note-prix-resultat" title="Simulation de note prix" />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    {['Rang', 'Candidat', 'Prix HT', `Note prix /${nmax}`, `Prix pondéré (${params.poidsPrix} %)`, `Technique pondérée (${poidsTech} %)`, `Note finale /${nmax}`].map((h) => (
                      <th key={h} scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {classement.map((c) => (
                    <tr key={c.id} className={c.moi ? 'bg-blue-50/70' : ''}>
                      <td className="px-4 py-3 font-bold text-gray-900">{c.rang}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={c.moi ? 'font-semibold text-blue-700' : 'text-gray-800'}>{c.nom}</span>
                        {c.hypothese && <span className="ml-2 text-xs text-gray-400">hypothèse</span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{fmtEur(c.prix, 0)}</td>
                      <td className="px-4 py-3">{fmtNote(c.notePrix)}</td>
                      <td className="px-4 py-3">{fmtNote(c.notePrixPond)}</td>
                      <td className="px-4 py-3">{fmtNote(c.noteTechPond)}</td>
                      <td className="px-4 py-3 font-bold text-gray-900">{fmtNote(c.noteFinale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid lg:grid-cols-2 gap-6">
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-2">Prix pour passer 1er</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {premier.statut === 'ok' && (
                    premier.prix >= moi.prix ? (
                      <>Vous êtes 1er tant que votre prix ne dépasse pas <strong className="text-gray-900">{fmtEur(premier.prix, 0)}</strong>, soit une marge de {fmtEur(premier.prix - moi.prix, 0)} au-dessus de votre offre actuelle, à notes techniques inchangées.</>
                    ) : (
                      <>Pour passer 1er à notes techniques inchangées, votre prix doit descendre sous <strong className="text-gray-900">{fmtEur(premier.prix, 0)}</strong>, soit une baisse de {fmtEur(moi.prix - premier.prix, 0)} ({fmtPct(((moi.prix - premier.prix) / moi.prix) * 100, 1)}).</>
                    )
                  )}
                  {premier.statut === 'toujours' && 'Votre avance technique est telle que vous restez 1er même avec un prix très supérieur à celui des concurrents.'}
                  {premier.statut === 'impossible' && 'Même avec un prix très bas, l\'écart de note technique ne peut pas être rattrapé par le prix : c\'est le mémoire technique qu\'il faut renforcer.'}
                </p>
              </div>

              {compensation && (
                <div className="rounded-xl border border-gray-200 p-5">
                  <h3 className="font-bold text-gray-900 mb-2">Points techniques nécessaires</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <label htmlFor="np-ecart">Être plus cher que le moins-disant de</label>
                    <input id="np-ecart" inputMode="decimal" className="form-input w-16 rounded-lg py-1 text-center text-sm" value={ecart} onChange={(e) => setEcart(e.target.value)} />
                    <span>%</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    coûte <strong className="text-gray-900">{fmtNote(compensation.perteNotePrix)} pt</strong> de note prix, soit{' '}
                    {fmtNote(compensation.perteFinale)} pt de note finale. Pour compenser, il faut{' '}
                    <strong className="text-gray-900">
                      {isFinite(compensation.pointsTech) ? `${fmtNote(compensation.pointsTech)} pt de note technique` : 'une pondération technique non nulle'}
                    </strong>{' '}
                    (sur {nmax}) de plus que lui.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-1">Votre note finale selon votre prix</h3>
              <p className="text-sm text-gray-500 mb-4">Les autres offres restent fixes. Là où la courbe bleue passe sous la grise, vous perdez la 1re place.</p>
              <ScoreChart moi={moi} concurrents={concurrents} params={params} premier={premier} />
            </div>
          </div>
          <div className="mt-4">
            <Alert>
              Simulation indicative : la note technique est votre estimation, et l'acheteur peut appliquer une méthode différente
              de celles proposées ici. Vérifiez toujours la formule annoncée dans le règlement de la consultation.
            </Alert>
          </div>
        </div>
      )}
    </>
  )
}

function ScoreChart({ moi, concurrents, params, premier }: { moi: Candidat; concurrents: Candidat[]; params: ParamsNotation; premier: PrixPremier }) {
  const W = 720
  const H = 300
  const pad = { l: 48, r: 16, t: 16, b: 36 }
  const prixRef = [...concurrents.map((c) => c.prix), moi.prix]
  const xmin = Math.min(...prixRef) * 0.8
  const xmax = Math.max(...prixRef) * 1.15
  const N = 90
  const pts = Array.from({ length: N + 1 }, (_, i) => {
    const prix = xmin + ((xmax - xmin) * i) / N
    return { prix, ...duelAuPrix(moi, concurrents, prix, params) }
  })
  const ys = pts.flatMap((p) => [p.moi, p.meilleur])
  const ymin = Math.max(0, Math.floor(Math.min(...ys) - 0.5))
  const ymax = Math.min(params.nmax, Math.ceil(Math.max(...ys) + 0.5))
  const x = (v: number) => pad.l + ((v - xmin) / (xmax - xmin)) * (W - pad.l - pad.r)
  const y = (v: number) => pad.t + (1 - (v - ymin) / (ymax - ymin || 1)) * (H - pad.t - pad.b)
  const path = (key: 'moi' | 'meilleur') => pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.prix).toFixed(1)},${y(p[key]).toFixed(1)}`).join('')
  const xTicks = Array.from({ length: 5 }, (_, i) => xmin + ((xmax - xmin) * i) / 4)
  const yStep = (ymax - ymin) / 4
  const yTicks = Array.from({ length: 5 }, (_, i) => ymin + yStep * i)
  const actuel = duelAuPrix(moi, concurrents, moi.prix, params)
  const pivot = premier.statut === 'ok' && premier.prix > xmin && premier.prix < xmax ? premier.prix : null

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Note finale en fonction de votre prix">
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="stroke-gray-100" />
            <text x={pad.l - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-gray-400 text-[11px]">{fmtNum(t, 1)}</text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 12} textAnchor="middle" className="fill-gray-400 text-[11px]">{kEur(t)}</text>
        ))}
        <path d={path('meilleur')} fill="none" strokeWidth="2" strokeDasharray="5 4" className="stroke-gray-400" />
        <path d={path('moi')} fill="none" strokeWidth="2.5" className="stroke-blue-500" />
        {pivot && (
          <g>
            <line x1={x(pivot)} x2={x(pivot)} y1={pad.t} y2={H - pad.b} strokeDasharray="3 3" className="stroke-emerald-500" />
            <text x={x(pivot) + 6} y={pad.t + 10} className="fill-emerald-600 text-[11px] font-semibold">1er jusqu'à {kEur(pivot)}</text>
          </g>
        )}
        <line x1={x(moi.prix)} x2={x(moi.prix)} y1={y(actuel.moi)} y2={H - pad.b} strokeDasharray="2 3" className="stroke-blue-300" />
        <circle cx={x(moi.prix)} cy={y(actuel.moi)} r="5" className="fill-blue-500 stroke-white" strokeWidth="2" />
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 bg-blue-500" />Votre note finale</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 border-t-2 border-dashed border-gray-400" />Meilleur concurrent</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" />Votre prix actuel</span>
      </div>
    </div>
  )
}
