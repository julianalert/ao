import type { MetadataRoute } from 'next'
import {
  getAosForSitemap,
  getAllCategoriesForSitemap,
  getAllCategorieRegionsForSitemap,
} from '@/lib/sitemap'
import { getAllPosts, getBlogPageCount, getPostsByAuthor, getPostsByCategory } from '@/lib/blog/posts'
import { AUTHORS, CATEGORIES, blogPageHref, categoryHref } from '@/lib/blog/config'
import { OUTILS } from '@/lib/outils/catalog'
import { INDICES, indiceHref } from '@/lib/indices-catalog'
import { PIECES_AVEC_PAGE, pieceHref } from '@/lib/outils/pieces'
import { acheteurHref, acheteursIndex } from '@/lib/decp/marches'

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

  entries.push({ url: `${siteUrl}/a-propos`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 })

  // Blog: index, articles, auteurs
  const posts = getAllPosts()
  entries.push({
    url: `${siteUrl}/blog`,
    lastModified: posts[0]?.updatedAt ?? now,
    changeFrequency: 'weekly',
    priority: 0.8,
  })
  for (let page = 2; page <= getBlogPageCount(); page++) {
    entries.push({ url: `${siteUrl}${blogPageHref(page)}`, lastModified: now, changeFrequency: 'weekly', priority: 0.3 })
  }
  for (const post of posts) {
    entries.push({
      url: `${siteUrl}${post.href}`,
      lastModified: post.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.8,
      images: [`${siteUrl}${post.cover}`],
    })
  }
  for (const category of Object.keys(CATEGORIES)) {
    entries.push({
      url: `${siteUrl}${categoryHref(category)}`,
      lastModified: getPostsByCategory(category)[0]?.updatedAt ?? now,
      changeFrequency: 'weekly',
      priority: 0.7,
    })
  }
  for (const author of Object.keys(AUTHORS)) {
    entries.push({
      url: `${siteUrl}/blog/auteur/${author}`,
      lastModified: getPostsByAuthor(author)[0]?.updatedAt ?? now,
      changeFrequency: 'monthly',
      priority: 0.4,
    })
  }

  // Outils gratuits : hub + pages outils
  entries.push({ url: `${siteUrl}/outils`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 })
  for (const outil of OUTILS) {
    entries.push({ url: `${siteUrl}${outil.href}`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 })
  }

  // Lot 2 : seuils, pièces de candidature, acheteurs publics (fiches indexées dès 5 marchés)
  entries.push({ url: `${siteUrl}/seuils-marches-publics`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 })
  for (const piece of PIECES_AVEC_PAGE) {
    entries.push({ url: `${siteUrl}${pieceHref(piece.slug)}`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 })
  }
  entries.push({ url: `${siteUrl}/acheteurs`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 })
  for (const a of await acheteursIndex(5)) {
    entries.push({
      url: `${siteUrl}${acheteurHref(a.nom, a.acheteur_id)}`,
      lastModified: a.dernier_marche ?? now,
      changeFrequency: 'weekly',
      priority: 0.5,
    })
  }

  // Index BT / TP (INSEE, mis à jour chaque mois)
  entries.push({ url: `${siteUrl}/indices`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 })
  for (const indice of INDICES) {
    entries.push({
      url: `${siteUrl}${indiceHref(indice.code)}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: indice.arretee ? 0.3 : 0.6,
    })
  }

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
