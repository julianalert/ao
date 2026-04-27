import Link from 'next/link'

export function formatDate(dateStr: string | null, short = true): string {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: short ? 'short' : 'long',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function isUrgent(dateLimite: string | null): boolean {
  if (!dateLimite) return false
  const diff = new Date(dateLimite).getTime() - Date.now()
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000
}

export function isPast(dateLimite: string | null): boolean {
  if (!dateLimite) return false
  return new Date(dateLimite).getTime() < Date.now()
}

export const TYPE_LABELS: Record<string, string> = {
  travaux: 'Travaux',
  fournitures: 'Fournitures',
  services: 'Services',
}

export const PROCEDURE_LABELS: Record<string, string> = {
  ouvert: 'AO Ouvert',
  restreint: 'AO Restreint',
  mapa: 'MAPA',
  negociee: 'Négociée',
}

export function aoHref(ao: Pick<AppelOffre, 'id' | 'slug' | 'categorie'>): string {
  if (ao.categorie) return `/${ao.categorie}/${ao.id}-${ao.slug}`
  return `/posts/${ao.id}`
}

interface AoItemProps extends AppelOffre {
  featured?: boolean
}

export default function AoItem({ featured = false, ...ao }: AoItemProps) {
  const href = aoHref(ao)
  const urgent = isUrgent(ao.date_limite)
  const past = isPast(ao.date_limite)

  return (
    <div className={`group ${!featured ? 'border-b border-gray-200' : ''}`}>
      <div className={`px-4 py-5 ${featured ? 'bg-indigo-50 rounded-xl' : ''}`}>
        <div className="sm:flex items-start space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Icône type marché */}
          <div className="shrink-0">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${featured ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
              {ao.type_marche === 'travaux' ? '🏗' : ao.type_marche === 'fournitures' ? '📦' : '🛠'}
            </div>
          </div>

          <div className="grow lg:flex items-start justify-between space-y-3 lg:space-x-4 lg:space-y-0">
            <div className="min-w-0 flex-1">
              {/* Acheteur */}
              <div className="text-sm text-gray-500 font-medium mb-1 truncate">
                {ao.acheteur ?? 'Organisme public'}
                {ao.region_label && <span className="text-gray-400"> · {ao.region_label}</span>}
              </div>

              {/* Titre */}
              <div className="mb-2">
                <Link
                  className="text-base font-bold text-gray-800 hover:text-indigo-600 leading-snug line-clamp-2"
                  href={href}
                >
                  {ao.titre}
                </Link>
              </div>

              {/* Tags */}
              <div className="-m-1 flex flex-wrap">
                {ao.type_marche && (
                  <span className={`text-xs font-medium inline-flex px-2 py-0.5 rounded-md m-1 whitespace-nowrap ${featured ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                    {TYPE_LABELS[ao.type_marche] ?? ao.type_marche}
                  </span>
                )}
                {ao.procedure && (
                  <span className={`text-xs font-medium inline-flex px-2 py-0.5 rounded-md m-1 whitespace-nowrap ${featured ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                    {PROCEDURE_LABELS[ao.procedure] ?? ao.procedure}
                  </span>
                )}
                {ao.categorie_label && !featured && (
                  <span className="text-xs font-medium inline-flex px-2 py-0.5 rounded-md m-1 whitespace-nowrap bg-gray-100 text-gray-400">
                    {ao.categorie_label}
                  </span>
                )}
              </div>
            </div>

            {/* Dates + CTA */}
            <div className="shrink-0 flex items-center lg:flex-col lg:items-end gap-2 lg:gap-1.5 min-w-[130px]">
              {/* Date publication */}
              <div className="text-xs text-gray-400">
                Publié {formatDate(ao.date_publication)}
              </div>

              {/* Date limite */}
              {ao.date_limite && (
                <div className={`text-sm font-semibold ${past ? 'text-gray-400 line-through' : urgent ? 'text-red-500' : 'text-gray-700'}`}>
                  {urgent && <span className="mr-1">⚠</span>}
                  {past ? 'Expiré' : `Limite ${formatDate(ao.date_limite)}`}
                </div>
              )}

              {/* CTA */}
              <div className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-150 mt-1">
                <Link
                  className="btn-sm py-1.5 px-3 text-white bg-indigo-500 hover:bg-indigo-600 shadow-xs whitespace-nowrap text-xs"
                  href={href}
                >
                  Voir le marché →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
