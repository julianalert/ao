'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { CPV_CORPS_ETAT } from '@/lib/decp/cpv'
import { PERIODES } from '@/lib/decp/filtres'
import { DEPARTEMENTS } from '@/lib/alertes/geo'
import { nomAffiche } from '@/lib/acheteurs'
import type { Marche, Stats } from '@/lib/decp/marches'
import { fmtDate, fmtEur, fmtNum } from '@/lib/format'
import { Field, inputClass, selectClass, Stat } from '@/components/outils/form'

type Resultat = { items: (Marche & { acheteur_href: string })[]; total: number; source: 'base' | 'api'; stats: (Stats & { echantillon: number }) | null }

const CHAMPS = ['corps', 'cpv', 'departement', 'acheteur', 'periode', 'type', 'min', 'max', 'q'] as const
type Valeurs = Record<(typeof CHAMPS)[number], string>
const VIDE: Valeurs = { corps: '', cpv: '', departement: '', acheteur: '', periode: '12m', type: '', min: '', max: '', q: '' }

const eurCourt = (n: number) => (n >= 1e6 ? `${fmtNum(n / 1e6, 1)} M€` : n >= 1e3 ? `${fmtNum(n / 1e3, 0)} k€` : fmtEur(n, 0))

function enParams(v: Valeurs): string {
  const p = new URLSearchParams()
  for (const k of CHAMPS) if (v[k] && !(k === 'periode' && v[k] === '12m')) p.set(k, v[k])
  return p.toString()
}

export default function Recherche({ intro }: { intro: ReactNode }) {
  const [v, setV] = useState<Valeurs>(VIDE)
  const [page, setPage] = useState(1)
  const [res, setRes] = useState<Resultat | null>(null)
  const [stats, setStats] = useState<Resultat['stats']>(null)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [exportOuvert, setExportOuvert] = useState(false)
  const [email, setEmail] = useState('')
  const [exportEtat, setExportEtat] = useState<string | null>(null)

  async function chercher(valeurs: Valeurs, p = 1) {
    setChargement(true)
    setErreur(null)
    const qs = enParams(valeurs)
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
    try {
      const r = await fetch(`/api/qui-gagne-quoi?${qs}${qs ? '&' : ''}page=${p}`)
      if (!r.ok) throw new Error()
      const json: Resultat = await r.json()
      setRes(json)
      if (p === 1) setStats(json.stats)
      setPage(p)
    } catch {
      setErreur('La recherche n\'a pas abouti, réessayez.')
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    if (!CHAMPS.some((k) => sp.get(k))) return
    const init = { ...VIDE }
    for (const k of CHAMPS) init[k] = sp.get(k) ?? init[k]
    setV(init)
    chercher(init)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k: keyof Valeurs) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV({ ...v, [k]: e.target.value })
  const pages = res ? Math.ceil(res.total / 20) : 0

  async function exporter(e: React.FormEvent) {
    e.preventDefault()
    setExportEtat('Préparation du fichier…')
    try {
      const r = await fetch('/api/qui-gagne-quoi/export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, params: enParams(v) }) })
      if (!r.ok) throw new Error((await r.json()).error ?? 'Export impossible.')
      const blob = await r.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `marches-attribues-mon-ao-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(a.href)
      setExportEtat('Fichier téléchargé (2 000 lignes maximum).')
    } catch (err) {
      setExportEtat(err instanceof Error ? err.message : 'Export impossible.')
    }
  }

  return (
    <>
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-5 lg:pt-4">{intro}</div>
        <form
          className="lg:col-span-7"
          onSubmit={(e) => {
            e.preventDefault()
            chercher(v)
          }}
        >
          <div className="rounded-2xl border border-gray-200 bg-white shadow-xl shadow-blue-900/5 p-5 md:p-7">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Corps d'état" htmlFor="q-corps">
                <select id="q-corps" className={selectClass} value={v.corps} onChange={set('corps')}>
                  <option value="">Tous</option>
                  {CPV_CORPS_ETAT.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
                </select>
              </Field>
              <Field label="ou code CPV" hint="premiers chiffres" htmlFor="q-cpv">
                <input id="q-cpv" inputMode="numeric" className={inputClass} value={v.cpv} placeholder="4533" onChange={set('cpv')} />
              </Field>
              <Field label="Département de l'acheteur" htmlFor="q-dep">
                <select id="q-dep" className={selectClass} value={v.departement} onChange={set('departement')}>
                  <option value="">Toute la France</option>
                  {Object.entries(DEPARTEMENTS).map(([code, nom]) => <option key={code} value={code}>{code} · {nom}</option>)}
                </select>
              </Field>
              <Field label="Acheteur" hint="nom ou SIRET" htmlFor="q-ach">
                <input id="q-ach" className={inputClass} value={v.acheteur} placeholder="Vénissieux" onChange={set('acheteur')} />
              </Field>
              <Field label="Période de notification" htmlFor="q-per">
                <select id="q-per" className={selectClass} value={v.periode} onChange={set('periode')}>
                  {PERIODES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </Field>
              <Field label="Type de marché" htmlFor="q-type">
                <select id="q-type" className={selectClass} value={v.type} onChange={set('type')}>
                  <option value="">Tous</option>
                  <option value="travaux">Travaux</option>
                  <option value="services">Services</option>
                  <option value="fournitures">Fournitures</option>
                </select>
              </Field>
              <Field label="Montant minimum" hint="€ HT" htmlFor="q-min"><input id="q-min" inputMode="numeric" className={inputClass} value={v.min} onChange={set('min')} /></Field>
              <Field label="Montant maximum" hint="€ HT" htmlFor="q-max"><input id="q-max" inputMode="numeric" className={inputClass} value={v.max} onChange={set('max')} /></Field>
              <Field label="Mot-clé dans l'objet" htmlFor="q-q" className="sm:col-span-2"><input id="q-q" className={inputClass} value={v.q} placeholder="gymnase, réhabilitation…" onChange={set('q')} /></Field>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="submit" disabled={chargement} className="btn text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-60">
                {chargement ? 'Recherche…' : 'Rechercher les marchés attribués'}
              </button>
              {!res && (
                <button
                  type="button"
                  className="text-sm font-medium text-blue-600 hover:underline"
                  onClick={() => {
                    const ex = { ...VIDE, corps: 'cvc-plomberie', departement: '69' }
                    setV(ex)
                    chercher(ex)
                  }}
                >
                  Exemple : plomberie et chauffage dans le Rhône
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {erreur && <p className="mt-6 text-sm text-red-600" role="alert">{erreur}</p>}
      {chargement && !res && (
        <p className="mt-10 text-center text-sm text-gray-500" role="status">Recherche dans les données essentielles de la commande publique…</p>
      )}

      {res && (
        <div id="resultats" className={`mt-12 lg:mt-16 space-y-6 transition ${chargement ? 'opacity-50' : ''}`}>
          {stats && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-7">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Ce segment en chiffres</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Stat accent label="Marchés attribués" value={fmtNum(res.total, 0)} sub={res.source === 'api' ? 'lignes marché × titulaire' : undefined} />
                <Stat label="Montant moyen" value={stats.montantMoyen ? eurCourt(stats.montantMoyen) : '—'} />
                <Stat label="Offres reçues en moyenne" value={stats.offresMoyenne ? fmtNum(stats.offresMoyenne, 1) : '—'} />
                <Stat label="Montant cumulé" value={stats.montantTotal ? eurCourt(stats.montantTotal) : '—'} sub={`sur ${fmtNum(stats.nbMarches, 0)} marchés analysés`} />
              </div>
              {stats.topTitulaires.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Attributaires les plus fréquents</h3>
                  <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
                    {stats.topTitulaires.map((t, i) => (
                      <li key={t.id || t.nom} className="flex justify-between gap-3 border-b border-gray-100 py-1.5">
                        <span className="text-gray-800"><span className="text-gray-400 mr-2">{i + 1}.</span>{t.nom}</span>
                        <span className="shrink-0 text-gray-500">{t.nb} marché{t.nb > 1 ? 's' : ''}{t.montant ? ` · ${eurCourt(t.montant)}` : ''}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-2 text-xs text-gray-400">Calculé sur les {fmtNum(stats.echantillon, 0)} marchés les plus récents du segment.</p>
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-bold text-gray-900">{fmtNum(res.total, 0)} résultats</h2>
              <button type="button" onClick={() => setExportOuvert(!exportOuvert)} className="btn-sm bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600">
                Exporter en CSV
              </button>
            </div>
            {exportOuvert && (
              <form onSubmit={exporter} className="mb-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <p className="text-sm text-gray-700 mb-2">Indiquez votre email pour télécharger les résultats (2 000 lignes maximum).</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input type="email" required autoComplete="email" aria-label="Votre email" className={`${inputClass} sm:flex-1`} value={email} placeholder="vous@entreprise.fr" onChange={(e) => setEmail(e.target.value)} />
                  <button type="submit" className="btn text-white bg-blue-500 hover:bg-blue-600">Télécharger</button>
                </div>
                {exportEtat && <p className="mt-2 text-sm text-gray-600" role="status">{exportEtat}</p>}
              </form>
            )}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    {['Notifié le', 'Objet', 'Acheteur', 'Attributaire', 'Montant HT', 'Offres', 'Procédure'].map((h) => (
                      <th key={h} scope="col" className="px-3 py-3 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {res.items.map((m) => (
                    <tr key={m.id} className="align-top">
                      <td className="px-3 py-3 whitespace-nowrap text-gray-500">{fmtDate(m.date_notification)}</td>
                      <td className="px-3 py-3 min-w-64 text-gray-900">{m.objet ?? '—'}</td>
                      <td className="px-3 py-3 min-w-40">
                        <Link href={m.acheteur_href} className="text-blue-600 hover:underline">{nomAffiche(m.acheteur_nom) ?? m.acheteur_id}</Link>
                      </td>
                      <td className="px-3 py-3 min-w-40 text-gray-800">
                        {m.titulaire_nom ?? '—'}
                        {m.titulaire_id && <span className="block text-xs text-gray-400">{m.titulaire_id}</span>}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap font-semibold text-gray-900">{m.montant ? fmtEur(m.montant, 0) : '—'}</td>
                      <td className="px-3 py-3 text-center">{m.offres_recues ?? '—'}</td>
                      <td className="px-3 py-3 text-gray-500 min-w-32">{m.procedure ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pages > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <button type="button" disabled={page <= 1 || chargement} onClick={() => chercher(v, page - 1)} className="btn-sm bg-white border border-gray-200 disabled:opacity-40">← Précédents</button>
                <span className="text-gray-500">Page {page} sur {fmtNum(pages, 0)}</span>
                <button type="button" disabled={page >= pages || chargement} onClick={() => chercher(v, page + 1)} className="btn-sm bg-white border border-gray-200 disabled:opacity-40">Suivants →</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
