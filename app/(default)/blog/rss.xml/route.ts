export const dynamic = 'force-static'

import fs from 'fs'
import path from 'path'
import { getAllPosts } from '@/lib/blog/posts'
import { SITE_URL } from '@/lib/blog/config'

function fileSize(publicPath: string): number {
  try {
    return fs.statSync(path.join(process.cwd(), 'public', publicPath)).size
  } catch {
    return 0
  }
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function GET() {
  const posts = getAllPosts()
  const items = posts
    .map((p) => {
      const url = `${SITE_URL}${p.href}`
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(p.description)}</description>
      <category>${escapeXml(p.categoryLabel)}</category>
      <dc:creator>${escapeXml(p.authorData.name)}</dc:creator>
      <pubDate>${new Date(`${p.publishedAt}T08:00:00Z`).toUTCString()}</pubDate>
      <enclosure url="${SITE_URL}${p.cover}" type="image/jpeg" length="${fileSize(p.cover)}" />
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Le blog mon-ao.com</title>
    <link>${SITE_URL}/blog</link>
    <description>Guides pratiques pour répondre aux appels d'offres du BTP.</description>
    <language>fr-FR</language>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
    ${posts[0] ? `<lastBuildDate>${new Date(`${posts[0].updatedAt}T08:00:00Z`).toUTCString()}</lastBuildDate>` : ''}
${items}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
