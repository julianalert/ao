export const dynamicParams = false

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { AUTHORS } from '@/lib/blog/config'
import { getPostsByAuthor } from '@/lib/blog/posts'
import { PostCard } from '@/components/blog/ui'
import { BreadcrumbJsonLd, ProfilePageJsonLd } from '@/components/json-ld'

interface PageProps {
  params: Promise<{ author: string }>
}

export function generateStaticParams() {
  return Object.keys(AUTHORS).map((author) => ({ author }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { author: slug } = await params
  const author = AUTHORS[slug]
  if (!author) return {}
  const title = `${author.name}, auteur du blog mon-ao.com`
  return {
    title: { absolute: title },
    description: author.shortBio,
    alternates: { canonical: `/blog/auteur/${author.slug}` },
    openGraph: {
      type: 'profile',
      locale: 'fr_FR',
      siteName: 'mon-ao.com',
      url: `/blog/auteur/${author.slug}`,
      title,
      description: author.shortBio,
      images: [{ url: author.image, width: 400, height: 400, alt: `Photo de ${author.name}` }],
    },
  }
}

// Engagements éditoriaux affichés sur la page auteur (EEAT)
const EDITORIAL_RULES = [
  "Une question concrète par article, avec la réponse dans les premières lignes.",
  "Des exemples tirés de vrais appels d'offres publiés sur mon-ao.com.",
  'Les textes de référence cités : Code de la commande publique, BOAMP, DAJ de Bercy.',
  'Une date de mise à jour visible, et une revue des articles réglementaires chaque 1er janvier et 1er avril.',
]

export default async function AuthorPage({ params }: PageProps) {
  const { author: slug } = await params
  const author = AUTHORS[slug]
  if (!author) notFound()
  const posts = getPostsByAuthor(slug)

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Accueil', href: '/' },
          { name: 'Blog', href: '/blog' },
          { name: author.name, href: `/blog/auteur/${author.slug}` },
        ]}
      />
      <ProfilePageJsonLd author={author} posts={posts} />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-blue-100 to-white" aria-hidden="true" />
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <div className="pt-28 pb-10 md:pt-36 md:pb-14">
            <nav aria-label="Fil d'Ariane" className="mb-8 flex items-center gap-1.5 text-sm">
              <Link className="text-blue-500 hover:underline" href="/">Accueil</Link>
              <span className="text-gray-300">/</span>
              <Link className="text-blue-500 hover:underline" href="/blog">Blog</Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-500">{author.name}</span>
            </nav>

            <div className="sm:flex sm:items-start sm:gap-8">
              <Image
                src={author.image}
                alt={`Photo de ${author.name}`}
                width={160}
                height={160}
                priority
                className="mb-6 h-32 w-32 shrink-0 rounded-2xl object-cover shadow-md ring-4 ring-white sm:mb-0 sm:h-40 sm:w-40"
              />
              <div>
                <p className="mb-1 text-xs font-semibold tracking-wider text-blue-600 uppercase">Auteur</p>
                <h1 className="mb-2 text-4xl font-extrabold text-gray-900">{author.name}</h1>
                <p className="mb-5 text-gray-500">{author.role}</p>
                <div className="space-y-4 text-[1.0625rem] leading-8 text-gray-700">
                  {author.bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
                {(author.worksFor || author.sameAs.length > 0) && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {author.sameAs.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener me"
                        className="btn-sm border border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600"
                      >
                        {url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <div className="grid gap-6 pb-10 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-3 text-lg font-extrabold text-gray-900">Domaines d'expertise</h2>
              <div className="flex flex-wrap gap-1.5">
                {author.knowsAbout.map((topic) => (
                  <span key={topic} className="rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-3 text-lg font-extrabold text-gray-900">Comment nous écrivons</h2>
              <ul className="space-y-2 text-sm leading-6 text-gray-600">
                {EDITORIAL_RULES.map((rule) => (
                  <li key={rule} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" aria-hidden="true" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <div className="pb-12 md:pb-20">
            <h2 className="mb-6 text-2xl font-extrabold text-gray-900">
              Articles de {author.name} <span className="font-normal text-gray-400">({posts.length})</span>
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {posts.map((post) => <PostCard key={post.slug} post={post} headingLevel="h3" />)}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
