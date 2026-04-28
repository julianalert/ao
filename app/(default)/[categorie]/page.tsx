export const revalidate = 3600
export const dynamicParams = true

import { Suspense } from 'react'
import { getAppelsOffreByCategorie, getRegionsByCategorie, TYPE_MARCHE_SLUGS, type AoFilters } from '@/lib/getAppelsOffre'
import type { Metadata } from 'next'
import Link from 'next/link'
import SidebarWrapper from '@/components/sidebar-wrapper'
import AoItem from '../ao-item'
import Pagination from '@/components/pagination'

const TYPE_MARCHE_LABELS: Record<string, string> = {
  travaux: 'Travaux',
  services: 'Services',
  fournitures: 'Fournitures',
}

interface PageProps {
  params: Promise<{ categorie: string }>
  searchParams: Promise<Record<string, string>>
}

function getCategorieLabel(categorie: string, firstLabel?: string | null): string {
  if (TYPE_MARCHE_SLUGS.has(categorie)) return TYPE_MARCHE_LABELS[categorie] ?? categorie
  if (firstLabel) return firstLabel
  return categorie.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorie } = await params
  const label = getCategorieLabel(categorie)
  return {
    title: `Appels d'offre ${label} — Marchés publics France`,
    description: `Consultez tous les appels d'offre publics ${label}. Marchés mis à jour quotidiennement depuis le BOAMP.`,
    alternates: { canonical: `/${categorie}` },
  }
}

export default async function CategoriePage({ params, searchParams }: PageProps) {
  const { categorie } = await params
  const sp = await searchParams

  const filters: AoFilters = {
    procedure: sp.procedure || undefined,
    region: sp.region || undefined,
    date_limite: sp.date_limite || undefined,
    secteur: sp.secteur || undefined,
    page: sp.page ? parseInt(sp.page) : 1,
  }

  const [result, regions] = await Promise.all([
    getAppelsOffreByCategorie(categorie, filters),
    getRegionsByCategorie(categorie),
  ])

  const { data: appelsOffre, count, totalPages, page } = result
  const label = getCategorieLabel(categorie, appelsOffre[0]?.categorie_label)

  return (
    <>
      {/* Hero catégorie */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-blue-100 to-white pointer-events-none -z-10" aria-hidden="true" />
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-8">
          <div className="pt-28 pb-8 md:pt-36 md:pb-12">
            <div className="mb-3">
              <Link className="text-blue-500 font-medium hover:underline text-sm" href="/">
                ← Tous les marchés
              </Link>
            </div>
            <h1 className="h1 font-inter mb-4">
              Appels d'offre {label}
            </h1>
            <p className="text-lg text-gray-500 mb-6">
              {count > 0
                ? `${count.toLocaleString('fr-FR')} marchés publics, mis à jour quotidiennement.`
                : 'Aucun marché public dans cette catégorie pour le moment.'}
            </p>

            {/* Liens régions */}
            {regions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {regions.slice(0, 12).map((r) => (
                  <Link
                    key={r.region}
                    href={`/${categorie}/${r.region}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 transition shadow-xs"
                  >
                    {r.region_label}
                    <span className="text-xs text-gray-400">{r.count}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Liste */}
      <section>
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-8">
          <div className="py-8 md:py-16">
            <div className="md:flex" data-sticky-container>

              <Suspense fallback={<div className="mb-8 md:mb-0 md:w-1/3 md:mr-8 lg:mr-10 md:shrink-0" />}>
                <SidebarWrapper />
              </Suspense>

              <div className="md:grow">
                <div className="pb-8 md:pb-16">
                  {count > 0 && (
                    <div className="flex justify-end mb-4">
                      <span className="text-sm text-gray-400">{count.toLocaleString('fr-FR')} appels d'offre</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    {appelsOffre.length === 0 ? (
                      <div className="py-16 text-center text-gray-400">
                        <p className="text-lg mb-2">Aucun appel d'offre dans cette catégorie.</p>
                        <Link className="text-blue-500 hover:underline" href="/">Voir tous les marchés</Link>
                      </div>
                    ) : (
                      appelsOffre.map((ao) => <AoItem key={ao.id} {...ao} />)
                    )}
                  </div>

                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    basePath={`/${categorie}`}
                    searchParams={Object.fromEntries(Object.entries(sp).filter(([k]) => k !== 'page'))}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  )
}
