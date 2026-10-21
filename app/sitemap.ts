import type { MetadataRoute } from 'next'
import { AO_PAR_SITEMAP, countAosForSitemap, getAosForSitemap, getCategoriesEtRegionsForSitemap } from '@/lib/sitemap'
import { SITE_URL } from '@/lib/site'
import { getAllPosts, getBlogPageCount, getPostsByAuthor, getPostsByCategory } from '@/lib/blog/posts'
import { AUTHORS, CATEGORIES, blogPageHref, categoryHref } from '@/lib/blog/config'
import { OUTILS } from '@/lib/outils/catalog'
import { INDICES, indiceHref } from '@/lib/indices-catalog'
import { PIECES_AVEC_PAGE, pieceHref } from '@/lib/outils/pieces'
import { acheteurHref, acheteursIndex } from '@/lib/decp/marches'

export const revalidate = 3600
// Le fichier des pages agrège ~70 000 lignes et l'index des acheteurs : ~12 s à froid
export const maxDuration = 60

// Un fichier par lot : /sitemap/pages.xml (pages éditoriales, outils, catégories, régions)
// puis /sitemap/ao-0.xml, /sitemap/ao-1.xml… (fiches AO). L'index, sur /sitemap.xml, est servi
// par app/sitemap-index.xml/route.ts.
export async function generateSitemaps(): Promise<{ id: string }[]> {
  const nbFichiersAo = Math.max(1, Math.ceil((await countAosForSitemap()) / AO_PAR_SITEMAP))
  return [{ id: 'pages' }, ...Array.from({ length: nbFichiersAo }, (_, i) => ({ id: `ao-${i}` }))]
}

export default async function sitemap({ id }: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const fichier = await id
  if (fichier.startsWith('ao-')) return aoEntries(Number(fichier.slice(3)))
  return pageEntries()
}

async function aoEntries(chunk: number): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString()
  const entries: MetadataRoute.Sitemap = []

  // AO detail pages: /:categorie/:id-:slug
  for (const ao of await getAosForSitemap(chunk)) {
    if (!ao.slug) continue
    const cat = ao.categorie ?? 'autre'
    entries.push({
      url: `${SITE_URL}/${cat}/${ao.id}-${ao.slug}`,
      lastModified: ao.date_publication ?? now,
      changeFrequency: 'weekly',
      priority: 0.5,
    })
  }
  return entries
}

async function pageEntries(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = SITE_URL
  const now = new Date().toISOString()

  const { categories, categorieRegions, categorieDepartements } = await getCategoriesEtRegionsForSitemap()

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

  // Département pages (métiers du BTP): /:categorie/:departement-code
  for (const { categorie, slug } of categorieDepartements) {
    entries.push({
      url: `${siteUrl}/${categorie}/${slug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.6,
    })
  }

  return entries
}
