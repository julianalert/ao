import './css/style.css'

import type { Metadata } from 'next'
import { Inter, Nothing_You_Could_Do } from 'next/font/google'
import Analytics from '@/components/analytics'
import { SITE_NAME, SITE_URL } from '@/lib/site'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const nycd = Nothing_You_Could_Do({
  subsets: ['latin'],
  variable: '--font-nycd',
  weight: '400',
  display: 'swap'
})

const defaultDescription = "Tous les appels d'offres publics du BOAMP, mis à jour chaque matin et classés par métier et par région, et des outils gratuits pour y répondre."

export const metadata: Metadata = {
  title: {
    default: `Appels d'offres publics en France, mis à jour chaque jour | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: defaultDescription,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
  },
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } }
    : {}),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${nycd.variable} font-inter antialiased bg-white text-gray-800 tracking-tight`}>
        <div className="flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  )
}
