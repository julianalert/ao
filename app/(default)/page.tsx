export const revalidate = 3600

export const metadata = {
  title: "Appels d'offre publics France — Annuaire BOAMP",
  description: "Consultez les derniers appels d'offre publics français. Marchés publics mis à jour chaque jour depuis le BOAMP, filtrables par catégorie, région et type.",
}

import { Suspense } from 'react'
import Hero from '@/components/hero'
import SidebarWrapper from '@/components/sidebar-wrapper'
import AoList from './ao-list'
import type { AoFilters } from '@/lib/getAppelsOffre'

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

  return (
    <>
      <Hero />

      <section>
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-8">
          <div className="py-8 md:py-12">
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
    </>
  )
}
