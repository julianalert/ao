import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string      // e.g. "/travaux" or "/travaux/ile-de-france"
  searchParams?: Record<string, string>
}

function buildUrl(basePath: string, page: number, searchParams: Record<string, string>): string {
  const params = new URLSearchParams({ ...searchParams, page: String(page) })
  // Remove page=1 from URL to keep it clean
  if (page === 1) params.delete('page')
  const qs = params.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

export default function Pagination({ currentPage, totalPages, basePath, searchParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null

  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  // Show a window of page numbers around current
  const delta = 2
  const rangeStart = Math.max(1, currentPage - delta)
  const rangeEnd = Math.min(totalPages, currentPage + delta)
  const pages: (number | '…')[] = []

  if (rangeStart > 1) {
    pages.push(1)
    if (rangeStart > 2) pages.push('…')
  }
  for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i)
  if (rangeEnd < totalPages) {
    if (rangeEnd < totalPages - 1) pages.push('…')
    pages.push(totalPages)
  }

  const { page: _removed, ...paramsWithoutPage } = searchParams

  return (
    <nav className="flex items-center justify-center gap-1 pt-8 pb-4" aria-label="Pagination">
      {hasPrev ? (
        <Link
          href={buildUrl(basePath, currentPage - 1, paramsWithoutPage)}
          className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition"
        >
          ← Précédent
        </Link>
      ) : (
        <span className="px-3 py-2 text-sm font-medium text-gray-300 cursor-not-allowed">← Précédent</span>
      )}

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm text-gray-400">…</span>
          ) : (
            <Link
              key={p}
              href={buildUrl(basePath, p, paramsWithoutPage)}
              className={`w-9 h-9 flex items-center justify-center text-sm font-medium rounded-lg transition ${
                p === currentPage
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-600 hover:text-indigo-500 hover:bg-indigo-50'
              }`}
            >
              {p}
            </Link>
          ),
        )}
      </div>

      {hasNext ? (
        <Link
          href={buildUrl(basePath, currentPage + 1, paramsWithoutPage)}
          className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition"
        >
          Suivant →
        </Link>
      ) : (
        <span className="px-3 py-2 text-sm font-medium text-gray-300 cursor-not-allowed">Suivant →</span>
      )}
    </nav>
  )
}
