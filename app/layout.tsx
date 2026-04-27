import './css/style.css'

import { Inter, Nothing_You_Could_Do } from 'next/font/google'

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

export const metadata = {
  title: {
    default: "Annuaire des appels d'offre publics France",
    template: "%s — Marchés publics France",
  },
  description: "Annuaire complet des appels d'offre publics français (BOAMP). Trouvez les marchés publics par catégorie, région et type : travaux, fournitures, services.",
  metadataBase: new URL('https://votre-domaine.fr'),
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
      </body>
    </html>
  )
}
