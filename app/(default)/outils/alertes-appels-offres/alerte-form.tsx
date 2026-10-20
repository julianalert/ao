'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { chercherCategories, CORPS_ETAT } from '@/lib/alertes/corps-etat'
import { CRITERES_VIDES, criteresDepuisParams, criteresVides, PROCEDURE_LABELS, type Criteres, type Frequence } from '@/lib/alertes/criteres'
import { DEPARTEMENTS, departementLabel, REGIONS } from '@/lib/alertes/geo'
import { Field, FormStep, inputClass, RadioCards, selectClass } from '@/components/outils/form'
import { fmtDate, fmtEur, parseNumber } from '@/lib/format'

type Categorie = { slug: string; label: string; count: number }
type Apercu = { total: number; items: { id: number; href: string; titre: string; acheteur: string | null; date_limite: string | null }[] }

function Chip({ actif, onClick, children }: { actif: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      className={`rounded-full border px-3 py-1.5 text-sm transition ${
        actif ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
      }`}
    >
      {children}
    </button>
  )
}

function Retirable({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 pl-3 pr-1 py-1 text-sm text-blue-700">
      {label}
      <button type="button" onClick={onRemove} className="h-5 w-5 rounded-full hover:bg-blue-100" aria-label={`Retirer ${label}`}>×</button>
    </span>
  )
}

export default function AlerteForm({ categories, intro }: { categories: Categorie[]; intro: ReactNode }) {
  const [c, setC] = useState<Criteres>(CRITERES_VIDES)
  const [recherche, setRecherche] = useState('')
  const [frequence, setFrequence] = useState<Frequence>('quotidienne')
  const [email, setEmail] = useState('')
  const [motsCles, setMotsCles] = useState('')
  const [exclus, setExclus] = useState('')
  const [montantMin, setMontantMin] = useState('')
  const [montantMax, setMontantMax] = useState('')
  const [apercu, setApercu] = useState<Apercu | null>(null)
  const [envoi, setEnvoi] = useState(false)
  const [resultat, setResultat] = useState<{ ok: boolean; message: string } | null>(null)

  useEffect(() => {
    const pre = criteresDepuisParams(new URLSearchParams(window.location.search))
    setC((x) => ({ ...x, ...pre }))
  }, [])

  const labels = useMemo(() => Object.fromEntries(categories.map((x) => [x.slug, x.label])), [categories])
  const suggestions = useMemo(() => chercherCategories(recherche, categories).filter((s) => !c.categories.includes(s.slug)), [recherche, categories, c.categories])
  const estCpv = /^\d{2,8}$/.test(recherche.trim())

  const criteres: Criteres = {
    ...c,
    motsCles: motsCles.split(',').map((s) => s.trim()).filter((s) => s.length >= 2),
    exclus: exclus.split(',').map((s) => s.trim()).filter((s) => s.length >= 2),
    montantMin: parseNumber(montantMin) > 0 ? parseNumber(montantMin) : null,
    montantMax: parseNumber(montantMax) > 0 ? parseNumber(montantMax) : null,
  }
  const cle = JSON.stringify(criteres)

  // Aperçu des AO correspondants sur 30 jours
  useEffect(() => {
    if (criteresVides(criteres)) {
      setApercu(null)
      return
    }
    const t = setTimeout(() => {
      fetch('/api/alertes/apercu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ criteres }) })
        .then((r) => r.json())
        .then(setApercu)
        .catch(() => setApercu(null))
    }, 450)
    return () => clearTimeout(t)
  }, [cle]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleListe = <K extends 'categories' | 'regions' | 'types' | 'procedures' | 'departements'>(k: K, v: Criteres[K][number]) =>
    setC((x) => ({ ...x, [k]: (x[k] as string[]).includes(v as string) ? (x[k] as string[]).filter((y) => y !== v) : [...(x[k] as string[]), v] }))

  const corpsActif = (slugs: string[]) => slugs.every((s) => c.categories.includes(s))
  const toggleCorps = (slugs: string[]) =>
    setC((x) => ({
      ...x,
      categories: corpsActif(slugs) ? x.categories.filter((s) => !slugs.includes(s)) : Array.from(new Set([...x.categories, ...slugs])),
    }))
  const couvertes = new Set(CORPS_ETAT.filter((g) => corpsActif(g.categories)).flatMap((g) => g.categories))

  async function soumettre(e: React.FormEvent) {
    e.preventDefault()
    setEnvoi(true)
    setResultat(null)
    try {
      const form = e.target as HTMLFormElement
      const res = await fetch('/api/alertes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, criteres, frequence, source: window.location.pathname, website: (form.elements.namedItem('website') as HTMLInputElement)?.value }),
      })
      const json = await res.json()
      if (!res.ok) setResultat({ ok: false, message: json.error ?? 'Une erreur est survenue.' })
      else if (json.status === 'alerte-creee') setResultat({ ok: true, message: 'Alerte créée : vous recevrez les prochains AO dès demain matin.' })
      else setResultat({ ok: true, message: `Dernière étape : cliquez sur le lien envoyé à ${email} pour activer votre alerte.` })
    } catch {
      setResultat({ ok: false, message: 'Une erreur est survenue, réessayez.' })
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      <div className="lg:col-span-5 lg:pt-4">{intro}</div>

      <form onSubmit={soumettre} className="lg:col-span-7">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-xl shadow-blue-900/5 p-5 md:p-7">
          <FormStep n={1} title="Votre métier" />
          <div className="flex flex-wrap gap-2">
            {CORPS_ETAT.map((g) => (
              <Chip key={g.slug} actif={corpsActif(g.categories)} onClick={() => toggleCorps(g.categories)}>{g.label}</Chip>
            ))}
          </div>
          <div className="relative mt-4">
            <input
              aria-label="Rechercher un métier ou un code CPV"
              className={inputClass}
              value={recherche}
              placeholder="Autre métier ou code CPV : plomberie, désamiantage, 45330000…"
              onChange={(e) => setRecherche(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (estCpv) {
                    setC((x) => ({ ...x, cpv: Array.from(new Set([...x.cpv, recherche.trim()])) }))
                    setRecherche('')
                  } else if (suggestions[0]) {
                    toggleListe('categories', suggestions[0].slug)
                    setRecherche('')
                  }
                }
              }}
            />
            {(suggestions.length > 0 || estCpv) && (
              <ul className="absolute z-10 mt-1 w-full rounded-xl border border-gray-200 bg-white p-1 shadow-lg max-h-64 overflow-auto">
                {estCpv && (
                  <li>
                    <button type="button" className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-blue-50" onClick={() => { setC((x) => ({ ...x, cpv: Array.from(new Set([...x.cpv, recherche.trim()])) })); setRecherche('') }}>
                      Ajouter les codes CPV commençant par <strong>{recherche.trim()}</strong>
                    </button>
                  </li>
                )}
                {suggestions.map((s) => (
                  <li key={s.slug}>
                    <button type="button" className="flex w-full justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-blue-50" onClick={() => { toggleListe('categories', s.slug); setRecherche('') }}>
                      <span>{s.label}</span>
                      <span className="text-gray-400">{s.count} AO</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {(c.categories.some((s) => !couvertes.has(s)) || c.cpv.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {c.categories.filter((s) => !couvertes.has(s)).map((s) => <Retirable key={s} label={labels[s] ?? s} onRemove={() => toggleListe('categories', s)} />)}
              {c.cpv.map((p) => <Retirable key={p} label={`CPV ${p}…`} onRemove={() => setC((x) => ({ ...x, cpv: x.cpv.filter((y) => y !== p) }))} />)}
            </div>
          )}

          <div className="border-t border-gray-100 my-6" />
          <FormStep n={2} title="Votre zone" />
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((r) => <Chip key={r.slug} actif={c.regions.includes(r.slug)} onClick={() => toggleListe('regions', r.slug)}>{r.label}</Chip>)}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              aria-label="Ajouter un département"
              className={`${selectClass} sm:w-72`}
              value=""
              onChange={(e) => e.target.value && setC((x) => ({ ...x, departements: Array.from(new Set([...x.departements, e.target.value])) }))}
            >
              <option value="">+ Ajouter un département</option>
              {Object.entries(DEPARTEMENTS).map(([code, nom]) => <option key={code} value={code}>{code} · {nom}</option>)}
            </select>
            {c.departements.map((d) => <Retirable key={d} label={departementLabel(d)} onRemove={() => toggleListe('departements', d)} />)}
          </div>
          {!c.regions.length && !c.departements.length && <p className="mt-2 text-xs text-gray-500">Sans zone choisie, l'alerte couvre toute la France.</p>}

          <details className="mt-6 group rounded-xl border border-gray-200">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-gray-700 [&::-webkit-details-marker]:hidden">
              <span className="text-blue-600 mr-1 inline-block transition group-open:rotate-90">›</span> Affiner <span className="font-normal text-gray-400">(montant, mots-clés, procédure)</span>
            </summary>
            <div className="grid sm:grid-cols-2 gap-4 px-4 pb-4">
              <Field label="Montant estimé minimum" hint="€ HT" htmlFor="al-min"><input id="al-min" inputMode="numeric" className={inputClass} value={montantMin} onChange={(e) => setMontantMin(e.target.value)} placeholder="50 000" /></Field>
              <Field label="Montant estimé maximum" hint="€ HT" htmlFor="al-max"><input id="al-max" inputMode="numeric" className={inputClass} value={montantMax} onChange={(e) => setMontantMax(e.target.value)} placeholder="2 000 000" /></Field>
              <Field label="Mots-clés" hint="au moins un, séparés par des virgules" htmlFor="al-mc"><input id="al-mc" className={inputClass} value={motsCles} onChange={(e) => setMotsCles(e.target.value)} placeholder="école, gymnase" /></Field>
              <Field label="Mots exclus" hint="séparés par des virgules" htmlFor="al-ex"><input id="al-ex" className={inputClass} value={exclus} onChange={(e) => setExclus(e.target.value)} placeholder="maintenance, fourniture" /></Field>
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-gray-700 mb-1.5">Type de marché</p>
                <div className="flex flex-wrap gap-2">
                  {(['travaux', 'fournitures', 'services'] as const).map((t) => <Chip key={t} actif={c.types.includes(t)} onClick={() => toggleListe('types', t)}>{t[0].toUpperCase() + t.slice(1)}</Chip>)}
                </div>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-gray-700 mb-1.5">Procédure</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(PROCEDURE_LABELS) as Criteres['procedures']).map((p) => <Chip key={p} actif={c.procedures.includes(p)} onClick={() => toggleListe('procedures', p)}>{PROCEDURE_LABELS[p]}</Chip>)}
                </div>
              </div>
              <p className="sm:col-span-2 text-xs text-gray-500">Les AO sans montant estimé restent inclus quand vous fixez une fourchette : beaucoup d'avis ne l'indiquent pas.</p>
            </div>
          </details>

          <div className="border-t border-gray-100 my-6" />
          <FormStep n={3} title="Réception" />
          <RadioCards
            name="frequence"
            value={frequence}
            onChange={setFrequence}
            columns={2}
            options={[
              { value: 'quotidienne', label: 'Chaque matin', hint: 'les AO publiés la veille' },
              { value: 'hebdomadaire', label: 'Chaque lundi', hint: 'le récapitulatif de la semaine' },
            ]}
          />
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <input type="email" required autoComplete="email" aria-label="Votre email" className={`${inputClass} sm:flex-1`} value={email} placeholder="vous@entreprise.fr" onChange={(e) => setEmail(e.target.value)} />
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            <button type="submit" disabled={envoi || criteresVides(criteres)} className="btn text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50">
              {envoi ? 'Création…' : 'Créer mon alerte gratuite'}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Gratuit, sans compte. Un email de confirmation vous sera envoyé. Désinscription en un clic.
            {criteresVides(criteres) && ' Choisissez d\'abord au moins un métier.'}
          </p>
          {resultat && <p className={`mt-3 text-sm font-medium ${resultat.ok ? 'text-emerald-700' : 'text-red-600'}`} role="status">{resultat.message}</p>}

          {apercu && (
            <div className="mt-6 rounded-xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">{apercu.total} AO</strong> correspondent à ces critères sur les 30 derniers jours, soit
                environ {Math.max(1, Math.round(apercu.total / 4))} par semaine.
              </p>
              {apercu.items.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {apercu.items.map((ao) => (
                    <li key={ao.id} className="text-sm">
                      <Link href={ao.href} className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1">{ao.titre}</Link>
                      <span className="block text-xs text-gray-500">{[ao.acheteur, ao.date_limite ? `limite ${fmtDate(ao.date_limite)}` : null].filter(Boolean).join(' · ')}</span>
                    </li>
                  ))}
                </ul>
              )}
              {criteres.montantMin && criteres.montantMax && criteres.montantMin > criteres.montantMax && (
                <p className="mt-2 text-xs text-amber-700">Le montant minimum ({fmtEur(criteres.montantMin, 0)}) dépasse le maximum.</p>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
