'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export type SidebarCategory = {
  categorie: string
  categorie_label: string
  count: number
}

const REGIONS = [
  { value: '', label: 'Toutes les régions' },
  { value: 'auvergne-rhone-alpes', label: 'Auvergne-Rhône-Alpes' },
  { value: 'bourgogne-franche-comte', label: 'Bourgogne-Franche-Comté' },
  { value: 'bretagne', label: 'Bretagne' },
  { value: 'centre-val-de-loire', label: 'Centre-Val de Loire' },
  { value: 'corse', label: 'Corse' },
  { value: 'grand-est', label: 'Grand Est' },
  { value: 'guadeloupe', label: 'Guadeloupe' },
  { value: 'guyane', label: 'Guyane' },
  { value: 'hauts-de-france', label: 'Hauts-de-France' },
  { value: 'ile-de-france', label: 'Île-de-France' },
  { value: 'la-reunion', label: 'La Réunion' },
  { value: 'martinique', label: 'Martinique' },
  { value: 'mayotte', label: 'Mayotte' },
  { value: 'normandie', label: 'Normandie' },
  { value: 'nouvelle-aquitaine', label: 'Nouvelle-Aquitaine' },
  { value: 'occitanie', label: 'Occitanie' },
  { value: 'pays-de-la-loire', label: 'Pays de la Loire' },
  { value: 'provence-alpes-cote-d-azur', label: "Provence-Alpes-Côte d'Azur" },
]

interface SidebarProps {
  topCategories?: SidebarCategory[]
}

export default function Sidebar({ topCategories = [] }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) { params.set(name, value) } else { params.delete(name) }
      params.delete('page') // reset pagination on filter change
      return params.toString()
    },
    [searchParams],
  )

  const handleFilter = (name: string, value: string) => {
    router.push(`${pathname}?${createQueryString(name, value)}`)
  }

  const handleClear = () => router.push(pathname)

  const currentProcedure = searchParams.get('procedure') ?? ''
  const currentRegion = searchParams.get('region') ?? ''
  const currentDateLimite = searchParams.get('date_limite') ?? ''
  const currentSecteur = searchParams.get('secteur') ?? ''

  const hasFilters = currentProcedure || currentRegion || currentDateLimite || currentSecteur

  return (
    <aside className="mb-8 md:mb-0 md:w-1/3 md:mr-8 lg:mr-10 md:shrink-0 md:self-start md:sticky md:top-8">
        <div className="relative bg-gray-50 rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm font-semibold text-gray-800">Filtres</span>
            {hasFilters && (
              <button className="text-xs font-medium text-indigo-500 hover:underline" onClick={handleClear}>
                Effacer tout
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Procédure */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Procédure</div>
              <ul className="space-y-1.5">
                {[
                  { value: 'ouvert', label: "Appel d'offres ouvert" },
                  { value: 'restreint', label: "Appel d'offres restreint" },
                  { value: 'mapa', label: 'MAPA' },
                  { value: 'negociee', label: 'Procédure négociée' },
                ].map(({ value, label }) => (
                  <li key={value}>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={currentProcedure === value}
                        onChange={() => handleFilter('procedure', currentProcedure === value ? '' : value)}
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-800">{label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Secteur CPV — dynamique */}
            {topCategories.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Secteur</div>
                <div className="flex flex-wrap gap-1.5">
                  {topCategories.map((cat) => (
                    <button
                      key={cat.categorie}
                      onClick={() => handleFilter('secteur', currentSecteur === cat.categorie ? '' : cat.categorie)}
                      className={`text-xs px-2 py-1 rounded-md border transition ${
                        currentSecteur === cat.categorie
                          ? 'bg-indigo-500 text-white border-indigo-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                      }`}
                    >
                      {cat.categorie_label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Région */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Région</div>
              <select
                className="form-select w-full text-sm"
                value={currentRegion}
                onChange={(e) => handleFilter('region', e.target.value)}
              >
                {REGIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Date limite */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Date limite avant le</div>
              <input
                type="date"
                className="form-input w-full text-sm"
                value={currentDateLimite}
                onChange={(e) => handleFilter('date_limite', e.target.value)}
              />
            </div>
          </div>
        </div>
    </aside>
  )
}
