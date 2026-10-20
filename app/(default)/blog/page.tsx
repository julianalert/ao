import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog/posts'
import { CATEGORIES, TRAVAUX_CATEGORY_LINKS, analysisCtaHref } from '@/lib/blog/config'
import { PostCard } from '@/components/blog/ui'
import { BlogJsonLd, BreadcrumbJsonLd } from '@/components/json-ld'

const TITLE = "Blog appels d'offres BTP : guides pour répondre et gagner"
const DESCRIPTION =
  "Guides pratiques pour les entreprises du BTP : trouver les bons appels d'offres, monter le dossier (DC1, DC2, DUME), rédiger le mémoire technique et gagner des marchés publics."

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: '/blog',
    types: { 'application/rss+xml': [{ url: '/blog/rss.xml', title: 'Blog mon-ao.com' }] },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'mon-ao.com',
    url: '/blog',
    title: TITLE,
    description: DESCRIPTION,
  },
}

export default function BlogIndexPage() {
  const posts = getAllPosts()
  const pillars = Object.entries(CATEGORIES).filter(([key]) => posts.some((p) => p.category === key))

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Accueil', href: '/' }, { name: 'Blog', href: '/blog' }]} />
      <BlogJsonLd posts={posts} name="Le blog mon-ao.com" description={DESCRIPTION} />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-blue-100 to-white" aria-hidden="true" />
        <div className="mx-auto max-w-screen-2xl px-6 sm:px-8">
          <div className="pt-28 pb-10 md:pt-36 md:pb-14">
            <nav aria-label="Fil d'Ariane" className="mb-5 flex items-center gap-1.5 text-sm">
              <Link className="text-blue-500 hover:underline" href="/">Accueil</Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-500">Blog</span>
            </nav>
            <div className="font-nycd mb-2 text-xl text-blue-500">Le blog mon-ao</div>
            <h1 className="h1 mb-5 max-w-4xl font-inter">Répondre aux appels d'offres du BTP, sans y passer vos soirées</h1>
            <p className="max-w-3xl text-lg text-gray-500">
              Des méthodes concrètes pour les dirigeants de TPE et PME du bâtiment : quels marchés viser, quelles pièces
              fournir, comment rédiger une offre qui marque des points. Chaque guide s'appuie sur les textes officiels et
              sur de vrais appels d'offres publiés sur mon-ao.com.
            </p>

            {pillars.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-1.5">
                {pillars.map(([key, cat]) => (
                  <span key={key} className="inline-flex rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 shadow-xs">
                    {cat.label}
                    <span className="ml-1 text-gray-300">{posts.filter((p) => p.category === key).length}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-screen-2xl px-6 sm:px-8">
          <div className="pb-12 md:pb-20">
            <h2 className="sr-only">Tous les articles</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => (
                <PostCard key={post.slug} post={post} priority={i < 3} headingLevel="h3" />
              ))}
            </div>

            {/* Maillage vers les pages catégories + CTA */}
            <div className="mt-16 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
                <h2 className="mb-2 text-xl font-extrabold text-gray-900">Les appels d'offres de travaux en cours</h2>
                <p className="mb-5 text-sm leading-6 text-gray-500">
                  Mis à jour chaque matin depuis le BOAMP, classés par métier et par région.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {TRAVAUX_CATEGORY_LINKS.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className="inline-flex rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 shadow-xs transition hover:border-blue-400 hover:text-blue-600"
                    >
                      {c.label}
                    </Link>
                  ))}
                  <Link
                    href="/travaux"
                    className="inline-flex rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 transition hover:border-blue-400"
                  >
                    Tous les marchés de travaux →
                  </Link>
                </div>
              </div>

              <a
                href={analysisCtaHref('blog-index')}
                target="_blank"
                rel="noopener"
                className="group flex flex-col rounded-2xl bg-blue-600 p-6 text-white transition hover:bg-blue-700 md:p-8"
              >
                <span className="mb-1 font-nycd text-xl text-blue-200">Offert</span>
                <span className="mb-2 text-xl font-extrabold">On analyse 3 appels d'offres pour vous</span>
                <span className="mb-5 text-sm leading-6 text-blue-100">
                  Envoyez votre métier et votre zone : vous recevez un avis go / no-go argumenté sur 3 AO en cours.
                </span>
                <span className="mt-auto text-sm font-semibold">
                  Demander mon analyse <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
