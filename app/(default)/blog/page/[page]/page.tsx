export const dynamicParams = false

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBlogPageCount } from '@/lib/blog/posts'
import { blogPageHref } from '@/lib/blog/config'
import BlogIndex, { BLOG_DESCRIPTION } from '../../blog-index'

interface PageProps {
  params: Promise<{ page: string }>
}

// Pages 2 à N ; la page 1 est /blog (/blog/page/1 redirige, cf. next.config.js)
export function generateStaticParams() {
  return Array.from({ length: getBlogPageCount() - 1 }, (_, i) => ({ page: String(i + 2) }))
}

function parsePage(raw: string): number | null {
  const page = Number(raw)
  return Number.isInteger(page) && page >= 2 && page <= getBlogPageCount() ? page : null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = parsePage((await params).page)
  if (!page) return {}
  const title = `Blog appels d'offres BTP : tous les guides, page ${page}`
  const description = `${BLOG_DESCRIPTION} Page ${page} sur ${getBlogPageCount()}.`
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: blogPageHref(page) },
    openGraph: { type: 'website', locale: 'fr_FR', siteName: 'mon-ao.com', url: blogPageHref(page), title, description },
  }
}

export default async function BlogPaginatedPage({ params }: PageProps) {
  const page = parsePage((await params).page)
  if (!page) notFound()
  return <BlogIndex page={page} />
}
