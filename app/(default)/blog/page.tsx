import type { Metadata } from 'next'
import BlogIndex, { BLOG_DESCRIPTION } from './blog-index'

const TITLE = "Blog appels d'offres BTP : guides pour répondre et gagner"

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: BLOG_DESCRIPTION,
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
    description: BLOG_DESCRIPTION,
  },
}

export default function BlogIndexPage() {
  return <BlogIndex page={1} />
}
