import Link from 'next/link'
import { getTopCategories } from '@/lib/getAppelsOffre'

export default async function Hero() {
  const categories = await getTopCategories(15)

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-indigo-100 to-white pointer-events-none -z-10" aria-hidden="true" />

      <div className="max-w-screen-2xl mx-auto px-6 sm:px-8">
        <div className="pt-24 pb-10 md:pt-32 md:pb-14">
          <h1 className="h1 font-inter mb-5 max-w-8xl">
            Trouvez les appels d'offre publics qui vous correspondent
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-8xl">
            Annuaire complet des appels d'offre publics français, mis à jour chaque jour depuis le
            BOAMP. Filtrez par secteur, région et type de marché.
          </p>

          {categories.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Secteurs populaires
              </p>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <Link
                    key={cat.categorie}
                    href={`/${cat.categorie}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition shadow-xs"
                  >
                    {cat.categorie_label}
                    <span className="text-gray-300">{cat.count}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
