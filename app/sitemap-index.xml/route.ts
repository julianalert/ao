import { generateSitemaps } from '../sitemap'
import { SITE_URL } from '@/lib/site'

export const revalidate = 3600

// Index des fichiers sitemap générés par app/sitemap.ts (/sitemap/pages.xml, /sitemap/ao-0.xml…).
// Servi sur /sitemap.xml par une réécriture (next.config.js) : avec generateSitemaps, Next ne
// génère pas d'index et une route app/sitemap.xml entre en conflit avec app/sitemap.ts.
export async function GET() {
  const fichiers = await generateSitemaps()
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${fichiers.map(({ id }) => `  <sitemap><loc>${SITE_URL}/sitemap/${id}.xml</loc></sitemap>`).join('\n')}
</sitemapindex>
`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
