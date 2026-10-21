// Identité et URL publique du site, partagées par les métadonnées, le sitemap,
// robots.txt et les données structurées.
//
// Le domaine principal est www.mon-ao.com : mon-ao.com y redirige, donc les URL
// canoniques doivent pointer sur www. Sur Vercel, NEXT_PUBLIC_SITE_URL doit valoir
// https://www.mon-ao.com.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mon-ao.com').replace(/\/+$/, '')

export const SITE_NAME = 'mon-ao.com'
