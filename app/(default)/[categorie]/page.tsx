export const revalidate = 3600
// Les chiffres du segment (lib/stats-segment.ts) se calculent en quelques secondes à froid
export const maxDuration = 60
export const dynamicParams = true

import { Suspense } from 'react'
import { getAppelsOffreByCategorie, getCategorieLabel, TYPE_MARCHE_SLUGS, type AoFilters } from '@/lib/getAppelsOffre'
import { minusculeInitiale } from '@/lib/format'
import { getStatsSegment, SEUIL_INDEXATION } from '@/lib/stats-segment'
import { regionLabel } from '@/lib/alertes/geo'
import SegmentStats from '@/components/segment-stats'
import type { Metadata } from 'next'
import Link from 'next/link'
import SidebarWrapper from '@/components/sidebar-wrapper'
import AoItem from '../ao-item'
import Pagination from '@/components/pagination'
import AlerteSignup from '@/components/alertes/alerte-signup'

interface PageProps {
  params: Promise<{ categorie: string }>
  searchParams: Promise<Record<string, string>>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorie } = await params
  const [label, stats] = await Promise.all([
    getCategorieLabel(categorie).then(minusculeInitiale),
    getStatsSegment({ categorie }),
  ])
  return {
    // Catégorie quasi vide sur 12 mois : page trop mince pour être indexée
    ...(stats && stats.publies < SEUIL_INDEXATION ? { robots: { index: false, follow: true } } : {}),
    title: `Appels d'offres ${label}, mis à jour chaque jour`,
    description: `Les appels d'offres publics ${label} publiés au BOAMP, mis à jour chaque matin : acheteur, date limite, montant estimé et accès au dossier. Gratuit, sans inscription.`,
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

  const [result, stats, label] = await Promise.all([
    getAppelsOffreByCategorie(categorie, filters),
    getStatsSegment({ categorie }),
    getCategorieLabel(categorie),
  ])

  const { data: appelsOffre, count, totalPages, page } = result
  const regions = Object.entries(stats?.parRegion ?? {})
    .map(([region, nb]) => ({ region, label: regionLabel(region), nb }))
    .sort((a, b) => b.nb - a.nb)

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
              Appels d'offres {minusculeInitiale(label)}
            </h1>
            <p className="text-lg text-gray-500 mb-6">
              {stats && stats.publies > 0
                ? `${stats.ouverts.toLocaleString('fr-FR')} ouverts aujourd'hui, ${stats.publies30j.toLocaleString('fr-FR')} publiés ces 30 derniers jours. Mis à jour chaque matin depuis le BOAMP.`
                : count > 0
                  ? `${count.toLocaleString('fr-FR')} marchés publics, mis à jour chaque matin depuis le BOAMP.`
                  : 'Aucun marché public dans cette catégorie pour le moment.'}
            </p>

            {/* Liens régions */}
            {regions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {regions.map((r) => (
                  <Link
                    key={r.region}
                    href={`/${categorie}/${r.region}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 transition shadow-xs"
                  >
                    {r.label}
                    <span className="text-xs text-gray-400">{r.nb}</span>
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
                  <div className="mb-6">
                    <AlerteSignup
                      source={`liste/${categorie}`}
                      criteres={{
                        categories: TYPE_MARCHE_SLUGS.has(categorie) ? [] : [categorie],
                        types: TYPE_MARCHE_SLUGS.has(categorie) ? [categorie as 'travaux' | 'fournitures' | 'services'] : [],
                      }}
                      contexte={label.toLowerCase()}
                    />
                  </div>
                  {count > 0 && (
                    <div className="flex justify-end mb-4">
                      <span className="text-sm text-gray-400">{count.toLocaleString('fr-FR')} appels d'offres</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    {appelsOffre.length === 0 ? (
                      <div className="py-16 text-center text-gray-400">
                        <p className="text-lg mb-2">Aucun appel d'offres dans cette catégorie.</p>
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

      {stats && stats.publies >= SEUIL_INDEXATION && <SegmentStats stats={stats} label={minusculeInitiale(label)} />}
    </>
  )
}
