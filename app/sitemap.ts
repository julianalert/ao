import type { MetadataRoute } from 'next'
import {
  getAosForSitemap,
  getAllCategoriesForSitemap,
  getAllCategorieRegionsForSitemap,
} from '@/lib/sitemap'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://votre-domaine.fr'
  const now = new Date().toISOString()

  const [categories, categorieRegions, aos] = await Promise.all([
    getAllCategoriesForSitemap(),
    getAllCategorieRegionsForSitemap(),
    getAosForSitemap(),
  ])

  const entries: MetadataRoute.Sitemap = [
    // Homepage
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  // Category pages: /travaux, /services, /fournitures, /:cpv-slug
  for (const cat of categories) {
    entries.push({
      url: `${siteUrl}/${cat}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    })
  }

  // Region pages: /:categorie/:region
  for (const { categorie, region } of categorieRegions) {
    entries.push({
      url: `${siteUrl}/${categorie}/${region}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.6,
    })
  }

  // AO detail pages: /:categorie/:id-:slug
  for (const ao of aos) {
    if (!ao.slug) continue
    const cat = ao.categorie ?? 'autre'
    entries.push({
      url: `${siteUrl}/${cat}/${ao.id}-${ao.slug}`,
      lastModified: ao.date_publication ?? now,
      changeFrequency: 'weekly',
      priority: 0.5,
    })
  }

  return entries
}
