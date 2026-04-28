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
    <Link
      href={href}
      className={`group block rounded-2xl border transition-all duration-200 ease-out hover:shadow-md hover:scale-[1.012] hover:-translate-y-px ${
        featured
          ? 'bg-blue-50 border-blue-100 hover:border-blue-300'
          : 'bg-white border-gray-100 hover:border-blue-200'
      }`}
    >
      <div className="px-5 py-4">
        <div className="sm:flex items-start gap-4">
          {/* Icône type marché */}
          <div className="shrink-0">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-transform duration-200 group-hover:scale-110 ${
                featured
                  ? 'bg-blue-200 text-blue-700'
                  : 'bg-gray-50 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600'
              }`}
            >
              {ao.type_marche === 'travaux' ? '🏗' : ao.type_marche === 'fournitures' ? '📦' : '🛠'}
            </div>
          </div>

          <div className="grow lg:flex items-start justify-between gap-4 mt-3 sm:mt-0">
            <div className="min-w-0 flex-1">
              {/* Acheteur */}
              <p className="text-xs text-gray-400 font-medium mb-1 truncate">
                {ao.acheteur ?? 'Organisme public'}
                {ao.region_label && <span> · {ao.region_label}</span>}
              </p>

              {/* Titre */}
              <h2 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 leading-snug line-clamp-2 transition-colors duration-150 mb-3">
                {ao.titre}
              </h2>

              {/* Tags */}
              <div className="-m-0.5 flex flex-wrap">
                {ao.type_marche && (
                  <span
                    className={`text-xs font-medium inline-flex px-2.5 py-0.5 rounded-full m-0.5 whitespace-nowrap ${
                      featured ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {TYPE_LABELS[ao.type_marche] ?? ao.type_marche}
                  </span>
                )}
                {ao.procedure && (
                  <span
                    className={`text-xs font-medium inline-flex px-2.5 py-0.5 rounded-full m-0.5 whitespace-nowrap ${
                      featured ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {PROCEDURE_LABELS[ao.procedure] ?? ao.procedure}
                  </span>
                )}
                {ao.categorie_label && !featured && (
                  <span className="text-xs font-medium inline-flex px-2.5 py-0.5 rounded-full m-0.5 whitespace-nowrap bg-gray-100 text-gray-400">
                    {ao.categorie_label}
                  </span>
                )}
              </div>
            </div>

            {/* Dates + flèche */}
            <div className="shrink-0 flex items-center lg:flex-col lg:items-end gap-2 lg:gap-1.5 mt-3 lg:mt-0 min-w-[130px]">
              <span className="text-xs text-gray-400">
                Publié {formatDate(ao.date_publication)}
              </span>

              {ao.date_limite && (
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    past
                      ? 'bg-gray-100 text-gray-400 line-through'
                      : urgent
                        ? 'bg-red-50 text-red-500'
                        : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  {urgent && '⚠ '}
                  {past ? 'Expiré' : `Limite ${formatDate(ao.date_limite)}`}
                </span>
              )}

              <span className="text-xs font-medium text-blue-500 opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-0.5 transition-all duration-150">
                Voir →
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
