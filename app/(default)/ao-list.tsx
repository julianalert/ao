import { getLatestAppelsOffre, type AoFilters } from '@/lib/getAppelsOffre'
import AoItem from './ao-item'
import Pagination from '@/components/pagination'

interface AoListProps {
  filters?: AoFilters
}

export default async function AoList({ filters = {} }: AoListProps) {
  const { data: appelsOffre, count, totalPages, page } = await getLatestAppelsOffre(filters)

  return (
    <div className="pb-8 md:pb-16">
      {count > 0 && (
        <div className="flex justify-end mb-4">
          <span className="text-sm text-gray-400">{count.toLocaleString('fr-FR')} appels d'offre</span>
        </div>
      )}

      {/* Liste */}
      <div className="flex flex-col gap-3">
        {appelsOffre.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-lg mb-2">Aucun appel d'offre pour le moment.</p>
            <p className="text-sm">Lance le cron BOAMP pour importer les données.</p>
          </div>
        ) : (
          appelsOffre.map((ao) => <AoItem key={ao.id} {...ao} />)
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} basePath="/" />
    </div>
  )
}
