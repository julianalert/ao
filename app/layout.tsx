import './css/style.css'

import type { Metadata } from 'next'
import { Inter, Nothing_You_Could_Do } from 'next/font/google'
import Script from 'next/script'

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mon-ao.com'
const siteName = "Annuaire Marchés Publics"
const defaultDescription = "Annuaire complet des appels d'offre publics français (BOAMP). Trouvez les marchés publics par catégorie, région et type : travaux, fournitures, services."

export const metadata: Metadata = {
  title: {
    default: "Annuaire des appels d'offre publics France",
    template: "%s — Marchés publics France",
  },
  description: defaultDescription,
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName,
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
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-E93XWNNZ16"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-E93XWNNZ16');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${nycd.variable} font-inter antialiased bg-white text-gray-800 tracking-tight`}>
        <div className="flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip">
          {children}
        </div>
      </body>
    </html>
  )
}
