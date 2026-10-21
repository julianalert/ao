export const revalidate = 3600

export const metadata = {
  title: "Appels d'offres publics en France, mis à jour chaque jour",
  description: "Tous les appels d'offres publics du BOAMP, mis à jour chaque matin et classés par métier et par région : travaux, services, fournitures. Gratuit, sans inscription.",
  alternates: { canonical: '/' },
}

import { Suspense } from 'react'
import Hero from '@/components/hero'
import HomeSections from '@/components/home-sections'
import SidebarWrapper from '@/components/sidebar-wrapper'
import AoList from './ao-list'
import { getChiffresAccueil, type AoFilters } from '@/lib/getAppelsOffre'
import { WebSiteJsonLd } from '@/components/json-ld'

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams
  const filters: AoFilters = {
    type: params.type || undefined,
    procedure: params.procedure || undefined,
    region: params.region || undefined,
    date_limite: params.date_limite || undefined,
    secteur: params.secteur || undefined,
    page: params.page ? parseInt(params.page) : 1,
  }

  const chiffres = await getChiffresAccueil()

  return (
    <>
      <WebSiteJsonLd />
      <Hero chiffres={chiffres} />

      <section id="appels-offres" className="scroll-mt-20">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-8">
          <div className="py-8 md:py-12">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-6">
              Derniers appels d'offres publiés
            </h2>
            <div className="md:flex" data-sticky-container>

              <Suspense fallback={<div className="mb-8 md:mb-0 md:w-1/3 md:mr-8 lg:mr-10 md:shrink-0" />}>
                <SidebarWrapper />
              </Suspense>

              <div className="md:grow min-w-0">
                <AoList filters={filters} />
              </div>

            </div>
          </div>
        </div>
      </section>

      <HomeSections />
    </>
  )
}
