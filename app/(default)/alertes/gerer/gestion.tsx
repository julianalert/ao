'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fmtDate } from '@/lib/format'
import { inputClass, selectClass } from '@/components/outils/form'

type AlerteVue = { id: string; nom: string | null; resume: string; frequence: 'quotidienne' | 'hebdomadaire'; actif: boolean }
type FavoriVue = { id: number; titre: string; href: string; dateLimite: string | null }
type RappelVue = { id: string; piece: string; expireLe: string; envoye: boolean }

const carte = 'rounded-2xl border border-gray-200 bg-white p-5'

export default function Gestion({ token, email, alertes, favoris, rappels }: {
  token: string
  email: string
  alertes: AlerteVue[]
  favoris: FavoriVue[]
  rappels: RappelVue[]
}) {
  const router = useRouter()
  const [enCours, setEnCours] = useState<string | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)

  async function appel(cle: string, url: string, init: RequestInit) {
    setEnCours(cle)
    setErreur(null)
    try {
      const sep = url.includes('?') ? '&' : '?'
      const res = await fetch(`${url}${sep}t=${encodeURIComponent(token)}`, { ...init, headers: { 'Content-Type': 'application/json' } })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Erreur')
      router.refresh()
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Une erreur est survenue.')
    } finally {
      setEnCours(null)
    }
  }

  return (
    <div className="space-y-10">
      <p className="text-gray-600">Connecté en tant que <strong className="text-gray-900">{email}</strong>, via votre lien personnel.</p>
      {erreur && <p className="text-sm text-red-600" role="alert">{erreur}</p>}

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Mes alertes ({alertes.length})</h2>
        {alertes.length === 0 ? (
          <p className="text-gray-500">Aucune alerte pour le moment.</p>
        ) : (
          <ul className="space-y-3">
            {alertes.map((a) => (
              <li key={a.id} className={`${carte} ${a.actif ? '' : 'opacity-60'}`}>
                <p className="font-semibold text-gray-900">{a.nom ?? 'Alerte'}</p>
                <p className="text-sm text-gray-600 mt-1">{a.resume}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <select
                    aria-label="Fréquence"
                    className={`${selectClass} w-auto`}
                    value={a.frequence}
                    disabled={enCours === a.id}
                    onChange={(e) => appel(a.id, `/api/alertes/${a.id}`, { method: 'PATCH', body: JSON.stringify({ frequence: e.target.value }) })}
                  >
                    <option value="quotidienne">Chaque matin</option>
                    <option value="hebdomadaire">Chaque lundi</option>
                  </select>
                  <button type="button" disabled={enCours === a.id} onClick={() => appel(a.id, `/api/alertes/${a.id}`, { method: 'PATCH', body: JSON.stringify({ actif: !a.actif }) })} className="btn-sm bg-white border border-gray-200 text-gray-700 hover:border-blue-300">
                    {a.actif ? 'Mettre en pause' : 'Réactiver'}
                  </button>
                  <button type="button" disabled={enCours === a.id} onClick={() => confirm('Supprimer cette alerte ?') && appel(a.id, `/api/alertes/${a.id}`, { method: 'DELETE' })} className="btn-sm text-red-600 hover:bg-red-50">
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">AO suivis ({favoris.length})</h2>
        {favoris.length === 0 ? (
          <p className="text-gray-500">Cliquez sur « Suivre cet AO » sur une fiche pour recevoir un rappel 7 jours et 2 jours avant la date limite.</p>
        ) : (
          <ul className={`${carte} divide-y divide-gray-100 py-1`}>
            {favoris.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-4 py-3">
                <span>
                  <Link href={f.href} className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1">{f.titre}</Link>
                  {f.dateLimite && <span className="text-xs text-gray-500">Date limite : {fmtDate(f.dateLimite)}</span>}
                </span>
                <button type="button" disabled={enCours === `f${f.id}`} onClick={() => appel(`f${f.id}`, `/api/favoris?ao=${f.id}`, { method: 'DELETE' })} className="btn-sm text-gray-500 hover:text-red-600 shrink-0">
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {rappels.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Rappels d'attestation</h2>
          <ul className={`${carte} divide-y divide-gray-100 py-1`}>
            {rappels.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 py-3">
                <span className="text-sm text-gray-700">
                  <strong className="text-gray-900">{r.piece}</strong> · expire le {fmtDate(r.expireLe)}
                  {r.envoye && <span className="ml-2 text-xs text-emerald-700">rappel envoyé</span>}
                </span>
                <button type="button" disabled={enCours === r.id} onClick={() => appel(r.id, `/api/rappels/${r.id}`, { method: 'DELETE' })} className="btn-sm text-gray-500 hover:text-red-600">
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={async () => {
            if (!confirm('Ne plus recevoir aucun email de mon-ao.com ?')) return
            await fetch(`/api/alertes/desinscription?t=${encodeURIComponent(token)}`, { method: 'POST' })
            router.push('/alertes/desinscrit')
          }}
          className="text-sm text-gray-500 underline hover:text-red-600"
        >
          Me désinscrire de tous les emails
        </button>
      </div>
    </div>
  )
}

/** Demande du lien magique, quand on arrive sans lien valide. */
export function DemandeLien() {
  const [email, setEmail] = useState('')
  const [envoye, setEnvoye] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErreur(null)
    const res = await fetch('/api/alertes/lien', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    if (res.ok) setEnvoye(true)
    else setErreur((await res.json()).error ?? 'Une erreur est survenue.')
  }

  return envoye ? (
    <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
      Si une alerte existe pour {email}, vous allez recevoir un lien pour la gérer. Pensez à vérifier vos courriers indésirables.
    </p>
  ) : (
    <form onSubmit={submit} className={carte}>
      <p className="font-semibold text-gray-900">Recevez votre lien de gestion</p>
      <p className="text-sm text-gray-600 mt-1 mb-4">Pas de mot de passe : nous vous envoyons un lien personnel par email.</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <input type="email" required autoComplete="email" aria-label="Votre email" className={`${inputClass} sm:flex-1`} value={email} placeholder="vous@entreprise.fr" onChange={(e) => setEmail(e.target.value)} />
        <button type="submit" className="btn text-white bg-blue-500 hover:bg-blue-600">Recevoir mon lien</button>
      </div>
      {erreur && <p className="mt-2 text-sm text-red-600">{erreur}</p>}
    </form>
  )
}
