import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://votre-domaine.fr'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/signin', '/post-a-job'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
