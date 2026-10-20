export const revalidate = 3600
export const dynamicParams = false

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CATEGORIES, analysisCtaHref, categoryHref, getCategoryBySlug } from '@/lib/blog/config'
import { getPostsByCategory } from '@/lib/blog/posts'
import { getOutil } from '@/lib/outils/catalog'
import { OpenAos, PostCard } from '@/components/blog/ui'
import { ToolCard } from '@/components/outils/sections'
import { BlogCategoryJsonLd, BreadcrumbJsonLd } from '@/components/json-ld'

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return Object.values(CATEGORIES).map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const cat = getCategoryBySlug(slug)
  if (!cat) return {}
  const path = categoryHref(cat.key)
  return {
    title: { absolute: cat.seoTitle },
    description: cat.metaDescription,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'fr_FR',
      siteName: 'mon-ao.com',
      url: path,
      title: cat.seoTitle,
      description: cat.metaDescription,
    },
  }
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { slug } = await params
  const cat = getCategoryBySlug(slug)
  if (!cat) notFound()

  const path = categoryHref(cat.key)
  const posts = getPostsByCategory(cat.key)
  const outils = (cat.outils ?? []).map(getOutil)
  const autres = Object.entries(CATEGORIES).filter(([key]) => key !== cat.key)

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Accueil', href: '/' },
          { name: 'Blog', href: '/blog' },
          { name: cat.label, href: path },
        ]}
      />
      <BlogCategoryJsonLd name={cat.title} description={cat.metaDescription} path={path} posts={posts} />

      {/* ── En-tête du silo ── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-blue-100 to-white" aria-hidden="true" />
        <div className="mx-auto max-w-screen-xl px-6 sm:px-8">
          <div className="pt-28 pb-10 md:pt-36 md:pb-14">
            <nav aria-label="Fil d'Ariane" className="mb-5 flex flex-wrap items-center gap-1.5 text-sm">
              <Link className="text-blue-500 hover:underline" href="/">Accueil</Link>
              <span className="text-gray-300">/</span>
              <Link className="text-blue-500 hover:underline" href="/blog">Blog</Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-500" aria-current="page">{cat.label}</span>
            </nav>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-semibold tracking-wider text-blue-600 uppercase shadow-xs">
              <span aria-hidden="true">{cat.emoji}</span> {cat.label}
            </div>
            <h1 className="h1 mb-5 max-w-4xl font-inter">{cat.title}</h1>
            <div className="max-w-3xl space-y-4 text-lg text-gray-500">
              {cat.intro.map((p) => <p key={p}>{p}</p>)}
            </div>
            <p className="mt-6 text-sm font-medium text-gray-400">
              {posts.length > 0 && <>{posts.length} {posts.length > 1 ? 'guides' : 'guide'}</>}
              {posts.length > 0 && outils.length > 0 && ' · '}
              {outils.length > 0 && <>{outils.length} {outils.length > 1 ? 'outils gratuits' : 'outil gratuit'}</>}
            </p>
          </div>
        </div>
      </section>

      {/* ── L'essentiel du thème ── */}
      <section>
        <div className="mx-auto max-w-screen-xl px-6 sm:px-8">
          <div className="pb-12 md:pb-16">
            <h2 className="mb-6 text-2xl font-extrabold text-gray-900 md:text-3xl">L'essentiel en {cat.steps.length} étapes</h2>
            <ol className="grid gap-5 md:grid-cols-3">
              {cat.steps.map((step, i) => (
                <li key={step.title} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6">
                  <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3 className="mb-2 text-lg font-bold text-gray-900">{step.title}</h3>
                  <p className="mb-5 text-sm leading-6 text-gray-600">{step.text}</p>
                  {step.href && (
                    <Link href={step.href} className="mt-auto text-sm font-medium text-blue-600 hover:underline">
                      {step.cta ?? 'Lire le guide'} →
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Articles du silo ── */}
      {posts.length > 0 && (
        <section className="border-y border-gray-100 bg-gray-50">
          <div className="mx-auto max-w-screen-xl px-6 sm:px-8">
            <div className="py-12 md:py-16">
              <h2 className="mb-6 text-2xl font-extrabold text-gray-900 md:text-3xl">
                Les guides <span className="font-normal text-gray-400">({posts.length})</span>
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post, i) => (
                  <PostCard key={post.slug} post={post} priority={i < 3} headingLevel="h3" />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Outils liés ── */}
      {outils.length > 0 && (
        <section>
          <div className="mx-auto max-w-screen-xl px-6 sm:px-8">
            <div className="pt-12 md:pt-16">
              <div className="mb-6 flex items-end justify-between gap-4">
                <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">Les outils gratuits</h2>
                <Link href="/outils" className="whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">Tous les outils →</Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {outils.map((o) => <ToolCard key={o.slug} outil={o} />)}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── AO en cours + autres thèmes ── */}
      <section>
        <div className="mx-auto max-w-screen-xl px-6 sm:px-8">
          <div className="pb-12 md:pb-20">
            <div className="max-w-3xl">
              <OpenAos categorie="travaux" />
            </div>

            <div className="mt-16 grid gap-6 lg:grid-cols-2">
              <nav aria-labelledby="autres-themes" className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
                <h2 id="autres-themes" className="mb-4 text-xl font-extrabold text-gray-900">Les autres thèmes du blog</h2>
                <ul className="space-y-1">
                  {autres.map(([key, c]) => (
                    <li key={key}>
                      <Link href={categoryHref(key)} className="group flex gap-3 rounded-xl p-2.5 -mx-2.5 transition hover:bg-blue-50">
                        <span className="text-lg" aria-hidden="true">{c.emoji}</span>
                        <span>
                          <span className="block text-sm font-semibold text-gray-900 group-hover:text-blue-600">{c.label}</span>
                          <span className="block text-xs leading-snug text-gray-500">{c.description}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <a
                href={analysisCtaHref(`silo-${cat.slug}`)}
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
