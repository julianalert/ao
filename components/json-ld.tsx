import type { Author } from '@/lib/blog/config'
import type { PostMeta } from '@/lib/blog/posts'
import { COVER_HEIGHT, COVER_WIDTH, SITE_URL } from '@/lib/blog/config'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://votre-domaine.fr'

// ─── BreadcrumbList ────────────────────────────────────────────────────────────

type BreadcrumbItem = {
  name: string
  href: string
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.href}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// ─── WebSite + Organization ────────────────────────────────────────────────────

export function WebSiteJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: "Annuaire Marchés Publics",
        description: "Annuaire complet des appels d'offre publics français (BOAMP).",
        inLanguage: 'fr-FR',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/?secteur={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        url: siteUrl,
        name: "Annuaire Marchés Publics",
        description: "Annuaire de référence des appels d'offre publics français issus du BOAMP.",
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// ─── Blog ──────────────────────────────────────────────────────────────────────


function JsonLdScript({ schema }: { schema: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  )
}

const blogPublisher = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'mon-ao.com',
  url: SITE_URL,
  logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.svg` },
}

export function personSchema(author: Author) {
  return {
    '@type': 'Person',
    '@id': `${SITE_URL}/blog/auteur/${author.slug}#person`,
    name: author.name,
    url: `${SITE_URL}/blog/auteur/${author.slug}`,
    image: `${SITE_URL}${author.image}`,
    jobTitle: author.role,
    description: author.shortBio,
    knowsAbout: author.knowsAbout,
    ...(author.worksFor ? { worksFor: { '@type': 'Organization', ...author.worksFor } } : {}),
    ...(author.sameAs.length > 0 ? { sameAs: author.sameAs } : {}),
  }
}

export function BlogPostingJsonLd({ post }: { post: PostMeta }) {
  const url = `${SITE_URL}${post.href}`
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: {
      '@type': 'ImageObject',
      url: `${SITE_URL}${post.cover}`,
      width: COVER_WIDTH,
      height: COVER_HEIGHT,
      caption: post.coverAlt,
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    inLanguage: 'fr-FR',
    articleSection: post.categoryLabel,
    keywords: post.keywords?.join(', '),
    wordCount: post.wordCount,
    timeRequired: `PT${post.readingTime}M`,
    author: personSchema(post.authorData),
    publisher: blogPublisher,
    isPartOf: { '@type': 'Blog', '@id': `${SITE_URL}/blog#blog` },
    ...(post.sources?.length
      ? { citation: post.sources.map((s) => ({ '@type': 'CreativeWork', name: s.label, url: s.url })) }
      : {}),
  }
  return <JsonLdScript schema={schema} />
}

export function FaqJsonLd({ items }: { items: { q: string; a: string }[] }) {
  if (items.length === 0) return null
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
  return <JsonLdScript schema={schema} />
}

export function BlogJsonLd({ posts, name, description }: { posts: PostMeta[]; name: string; description: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE_URL}/blog#blog`,
    url: `${SITE_URL}/blog`,
    name,
    description,
    inLanguage: 'fr-FR',
    publisher: blogPublisher,
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      '@id': `${SITE_URL}${p.href}#article`,
      headline: p.title,
      url: `${SITE_URL}${p.href}`,
      datePublished: p.publishedAt,
      dateModified: p.updatedAt,
      image: `${SITE_URL}${p.cover}`,
      author: { '@id': `${SITE_URL}/blog/auteur/${p.authorData.slug}#person`, name: p.authorData.name },
    })),
  }
  return <JsonLdScript schema={schema} />
}

export function ProfilePageJsonLd({ author, posts }: { author: Author; posts: PostMeta[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: `${SITE_URL}/blog/auteur/${author.slug}`,
    inLanguage: 'fr-FR',
    mainEntity: personSchema(author),
    hasPart: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `${SITE_URL}${p.href}`,
      datePublished: p.publishedAt,
    })),
  }
  return <JsonLdScript schema={schema} />
}
