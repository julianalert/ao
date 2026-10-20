'use client'

import { useState } from 'react'

const eur = (n: number) =>
  Number.isFinite(n) ? `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n)} €` : '—'

type Field = { key: keyof Values; label: string; suffix: string; step: number }
type Values = { heures: number; taux: number; frais: number; reponses: number; gagnes: number; montant: number; marge: number }

// Valeurs de départ = exemple de l'article
const DEFAULTS: Values = { heures: 22, taux: 50, frais: 100, reponses: 20, gagnes: 4, montant: 80000, marge: 8 }

const FIELDS: Field[] = [
  { key: 'heures', label: 'Heures par réponse (toutes personnes)', suffix: 'h', step: 1 },
  { key: 'taux', label: 'Taux horaire chargé moyen', suffix: '€/h', step: 5 },
  { key: 'frais', label: 'Frais par réponse', suffix: '€', step: 10 },
  { key: 'reponses', label: 'Réponses déposées sur 12 mois', suffix: '', step: 1 },
  { key: 'gagnes', label: 'Marchés gagnés sur 12 mois', suffix: '', step: 1 },
  { key: 'montant', label: "Montant moyen d'un lot gagné (HT)", suffix: '€', step: 5000 },
  { key: 'marge', label: 'Marge nette moyenne', suffix: '%', step: 1 },
]

// Calculateur du coût par marché gagné, rendu dans l'article
export default function CostCalculator() {
  const [v, setV] = useState<Values>(DEFAULTS)

  const coutReponse = v.heures * v.taux + v.frais
  const tauxReussite = v.reponses > 0 ? v.gagnes / v.reponses : 0
  const coutParMarche = tauxReussite > 0 ? coutReponse / tauxReussite : NaN
  const margeMarche = v.montant * (v.marge / 100)
  const reste = margeMarche - coutParMarche

  const verdict = !Number.isFinite(coutParMarche)
    ? { text: 'Aucun marché gagné : le coût par marché gagné ne se calcule pas encore.', tone: 'border-gray-200 bg-gray-50 text-gray-700' }
    : reste < 0
      ? { text: 'Perte : chaque marché gagné ne rembourse pas les réponses qu\'il porte.', tone: 'border-red-200 bg-red-50 text-red-700' }
      : reste < margeMarche * 0.25
        ? { text: 'Fragile : les réponses mangent plus des trois quarts de la marge.', tone: 'border-orange-200 bg-orange-50 text-orange-700' }
        : { text: 'Rentable : vos marchés publics remboursent vos réponses.', tone: 'border-emerald-200 bg-emerald-50 text-emerald-700' }

  return (
    <div className="my-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-xs sm:p-6">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-bold text-gray-900">Calculateur : votre coût par marché gagné</p>
        <button
          type="button"
          onClick={() => setV(DEFAULTS)}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          Revenir à l'exemple
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <label key={field.key} className="block">
            <span className="mb-1 block text-xs font-medium text-gray-600">{field.label}</span>
            <span className="flex items-center rounded-lg border border-gray-300 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={field.step}
                value={Number.isFinite(v[field.key]) ? v[field.key] : ''}
                onChange={(e) => setV({ ...v, [field.key]: e.target.value === '' ? 0 : Number(e.target.value) })}
                className="w-full min-w-0 rounded-lg border-0 bg-transparent px-3 py-2 text-sm focus:ring-0"
              />
              {field.suffix && <span className="pr-3 text-xs text-gray-400">{field.suffix}</span>}
            </span>
          </label>
        ))}
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-gray-50 p-3">
          <dt className="text-xs text-gray-500">Coût d'une réponse</dt>
          <dd className="text-lg font-extrabold text-gray-900">{eur(coutReponse)}</dd>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <dt className="text-xs text-gray-500">Taux de réussite</dt>
          <dd className="text-lg font-extrabold text-gray-900">{Math.round(tauxReussite * 100)} %</dd>
        </div>
        <div className="rounded-xl bg-blue-50 p-3">
          <dt className="text-xs text-blue-600">Coût par marché gagné</dt>
          <dd className="text-lg font-extrabold text-blue-700">{eur(coutParMarche)}</dd>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <dt className="text-xs text-gray-500">Marge sur un marché gagné</dt>
          <dd className="text-lg font-extrabold text-gray-900">{eur(margeMarche)}</dd>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <dt className="text-xs text-gray-500">Ce qu'il reste</dt>
          <dd className={`text-lg font-extrabold ${reste < 0 ? 'text-red-600' : 'text-gray-900'}`}>{eur(reste)}</dd>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <dt className="text-xs text-gray-500">Coût des réponses sur 12 mois</dt>
          <dd className="text-lg font-extrabold text-gray-900">{eur(coutReponse * v.reponses)}</dd>
        </div>
      </dl>

      <p className={`mt-4 rounded-xl border px-4 py-3 text-sm font-semibold ${verdict.tone}`} aria-live="polite">
        {verdict.text}
      </p>
    </div>
  )
}
