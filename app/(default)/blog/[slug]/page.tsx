export const revalidate = 3600
// Pas de dynamicParams = false : sinon /blog/inconnu retomberait sur [categorie]/[segment]
// (page 200 vide). Un slug inconnu passe par notFound() → vraie 404.

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { getAllPosts, getPost, getRelatedPosts, remarkHeadingIds, type TocItem } from '@/lib/blog/posts'
import { COVER_HEIGHT, COVER_WIDTH, SITE_URL } from '@/lib/blog/config'
import { mdxComponents } from '@/components/blog/mdx'
import Toc from '@/components/blog/toc'
import ReadingProgress from '@/components/blog/reading-progress'
import {
  AnalysisCtaCard,
  ArticleCta,
  AuthorBox,
  AuthorByline,
  CategoryPill,
  OpenAos,
  PostCard,
  formatPostDate,
} from '@/components/blog/ui'
import { BlogPostingJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/json-ld'

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  const m = post.meta
  const title = m.seoTitle ?? m.title

  return {
    title: { absolute: title },
    description: m.description,
    keywords: m.keywords,
    authors: [{ name: m.authorData.name, url: `/blog/auteur/${m.author}` }],
    alternates: { canonical: m.href },
    openGraph: {
      type: 'article',
      locale: 'fr_FR',
      siteName: 'mon-ao.com',
      url: m.href,
      title,
      description: m.description,
      publishedTime: m.publishedAt,
      modifiedTime: m.updatedAt,
      authors: [`${SITE_URL}/blog/auteur/${m.author}`],
      section: m.categoryLabel,
      tags: m.keywords,
      images: [{ url: m.cover, width: COVER_WIDTH, height: COVER_HEIGHT, alt: m.coverAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: m.description,
      images: [m.cover],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  }
}

// Sections ajoutées par la page après le contenu MDX
const SECTION_IDS = {
  faq: 'questions-frequentes',
  cta: 'passez-a-l-action',
  aos: 'appels-d-offres-en-cours',
  sources: 'sources',
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()
  const { meta, body } = post

  const toc: TocItem[] = []
  const { content } = await compileMDX({
    source: body,
    components: mdxComponents,
    options: {
      mdxOptions: { remarkPlugins: [remarkGfm, remarkHeadingIds(toc, Object.values(SECTION_IDS))] },
    },
  })

  const faq = meta.faq ?? []
  const tocItems: TocItem[] = [
    ...toc,
    ...(faq.length > 0 ? [{ id: SECTION_IDS.faq, text: 'Questions fréquentes' }] : []),
    { id: SECTION_IDS.cta, text: "Passez à l'action" },
    ...(meta.aoCategory ? [{ id: SECTION_IDS.aos, text: "Appels d'offres en cours" }] : []),
    ...(meta.sources?.length ? [{ id: SECTION_IDS.sources, text: 'Sources' }] : []),
  ]

  const related = getRelatedPosts(meta, 3)

  return (
    <>
      <ReadingProgress />
      <BreadcrumbJsonLd
        items={[
          { name: 'Accueil', href: '/' },
          { name: 'Blog', href: '/blog' },
          { name: meta.title, href: meta.href },
        ]}
      />
      <BlogPostingJsonLd post={meta} />
      <FaqJsonLd items={faq} />

      <section className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-linear-to-b from-blue-100 to-white" aria-hidden="true" />

        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="pt-28 pb-12 md:pt-36 md:pb-20 lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-14">

            {/* ── Sommaire + CTA (desktop) ── */}
            <aside className="hidden lg:block">
              <div className="sticky top-8 space-y-8">
                <Toc items={tocItems} />
                <AnalysisCtaCard campaign={meta.slug} />
              </div>
            </aside>

            {/* ── Article ── */}
            <article id="article-body" className="min-w-0 max-w-3xl">
              <header>
                <nav aria-label="Fil d'Ariane" className="mb-5 flex flex-wrap items-center gap-1.5 text-sm">
                  <Link className="text-blue-500 hover:underline" href="/">Accueil</Link>
                  <span className="text-gray-300">/</span>
                  <Link className="text-blue-500 hover:underline" href="/blog">Blog</Link>
                  <span className="text-gray-300">/</span>
                  <span className="text-gray-500">{meta.categoryLabel}</span>
                </nav>

                <div className="mb-4">
                  <CategoryPill label={meta.categoryLabel} />
                </div>

                <h1 className="mb-5 text-3xl font-extrabold leading-tight text-gray-900 md:text-[2.75rem] md:leading-[1.15]">
                  {meta.title}
                </h1>
                <p className="mb-7 text-lg leading-relaxed text-gray-600">{meta.description}</p>

                <AuthorByline post={meta} />
              </header>

              <Image
                src={meta.cover}
                alt={meta.coverAlt}
                width={COVER_WIDTH}
                height={COVER_HEIGHT}
                priority
                sizes="(min-width: 1024px) 768px, 100vw"
                className="mt-8 w-full rounded-2xl border border-gray-200 object-cover"
              />

              {/* Sommaire mobile */}
              <details className="group mt-8 rounded-2xl border border-gray-200 bg-gray-50 lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-gray-800">
                  Sur cette page
                  <span className="text-xs text-gray-400 transition-transform group-open:rotate-90">▶</span>
                </summary>
                <ol className="space-y-2 border-t border-gray-200 px-5 py-4 text-sm">
                  {tocItems.map((item) => (
                    <li key={item.id}>
                      <a href={`#${item.id}`} className="text-gray-600 hover:text-blue-600">{item.text}</a>
                    </li>
                  ))}
                </ol>
              </details>

              {/* Contenu */}
              <div className="mt-4 text-[1.0625rem] text-gray-700">{content}</div>

              {/* FAQ */}
              {faq.length > 0 && (
                <section aria-labelledby={SECTION_IDS.faq} className="mt-14">
                  <h2 id={SECTION_IDS.faq} className="mb-5 scroll-mt-28 text-2xl font-extrabold text-gray-900 md:text-[1.75rem] md:leading-tight">
                    Questions fréquentes
                  </h2>
                  <div className="space-y-3">
                    {faq.map((item) => (
                      <div key={item.q} className="rounded-2xl border border-gray-200 bg-white p-5">
                        <h3 className="mb-2 font-bold text-gray-900">{item.q}</h3>
                        <p className="leading-7 text-gray-600">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <ArticleCta post={meta} />

              {meta.aoCategory && <OpenAos categorie={meta.aoCategory} />}

              {/* Sources + fraîcheur */}
              {meta.sources && meta.sources.length > 0 && (
                <section aria-labelledby={SECTION_IDS.sources} className="mt-14">
                  <h2 id={SECTION_IDS.sources} className="mb-4 scroll-mt-28 text-xl font-extrabold text-gray-900">
                    Sources
                  </h2>
                  <ul className="space-y-2 text-sm">
                    {meta.sources.map((s) => (
                      <li key={s.url} className="flex gap-2">
                        <span className="text-gray-300" aria-hidden="true">↗</span>
                        <a href={s.url} target="_blank" rel="noopener" className="text-gray-600 underline decoration-gray-300 underline-offset-2 hover:text-blue-600 hover:decoration-blue-400">
                          {s.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 text-sm text-gray-500">
                    Publié le {formatPostDate(meta.publishedAt)}, dernière mise à jour le{' '}
                    <time dateTime={meta.updatedAt}>{formatPostDate(meta.updatedAt)}</time>. Les données
                    d'appels d'offres proviennent du BOAMP et sont actualisées chaque jour sur mon-ao.com.
                  </p>
                </section>
              )}

              <AuthorBox author={meta.authorData} />
            </article>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-gray-100 bg-gray-50">
          <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8 md:py-16">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="text-2xl font-extrabold text-gray-900">Articles similaires</h2>
              <Link href="/blog" className="text-sm font-medium text-blue-600 hover:underline">Tous les articles →</Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => <PostCard key={p.slug} post={p} headingLevel="h3" />)}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
