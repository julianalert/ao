import Link from 'next/link'
import { OUTILS } from '@/lib/outils/catalog'
import { VISIONBTP_URL } from '@/lib/outils/author'

type Lien = { label: string; href: string; externe?: boolean }

const COLONNES: { titre: string; liens: Lien[] }[] = [
  {
    titre: 'Marchés publics',
    liens: [
      { label: 'Tous les appels d\'offre', href: '/' },
      { label: 'Marchés de travaux', href: '/travaux' },
      { label: 'Marchés de services', href: '/services' },
      { label: 'Marchés de fournitures', href: '/fournitures' },
    ],
  },
  {
    titre: 'Outils gratuits',
    liens: [
      ...OUTILS.map((o) => ({ label: o.title, href: o.href })),
      { label: 'Index BT et TP', href: '/indices' },
      { label: 'Tous les outils', href: '/outils' },
    ],
  },
  {
    titre: 'Ressources',
    liens: [
      { label: 'Blog', href: '/blog' },
      { label: 'BOAMP, le bulletin officiel', href: 'https://www.boamp.fr', externe: true },
      { label: 'VisionBTP.com', href: VISIONBTP_URL, externe: true },
    ],
  },
]

const socialClass =
  'flex justify-center items-center text-blue-500 bg-blue-100 hover:text-white hover:bg-blue-500 rounded-full transition duration-150 ease-in-out'

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50/60">
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-8">
        <div className="grid gap-10 py-12 md:py-16 md:grid-cols-12">
          {/* Marque */}
          <div className="md:col-span-4 lg:col-span-5">
            <Link className="inline-flex items-center gap-2.5 mb-4" href="/" aria-label="mon-ao.com, accueil">
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fill="#2563eb" d="M13.853 18.14 1 10.643 31 1l-.019.058z" />
                <path fill="#93c5fd" d="M13.853 18.14 30.981 1.058 21.357 31l-7.5-12.857z" />
              </svg>
              <span className="text-lg font-extrabold tracking-tight text-gray-900">mon-ao.com</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mb-6">
              Les appels d'offre publics français, mis à jour chaque jour depuis le BOAMP, et des outils gratuits pour y répondre.
            </p>
            <div className="flex items-center gap-4">
              <div className="text-xl font-nycd text-blue-500">Suivez-nous</div>
              <ul className="inline-flex gap-3">
                <li>
                  <a className={socialClass} href="#0" aria-label="Twitter / X">
                    <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                      <path d="m13.063 9 3.495 4.475L20.601 9h2.454l-5.359 5.931L24 23h-4.938l-3.866-4.893L10.771 23H8.316l5.735-6.342L8 9h5.063Zm-.74 1.347h-1.457l8.875 11.232h1.36l-8.778-11.232Z" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a className={socialClass} href="#0" aria-label="LinkedIn">
                    <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23.3 8H8.7c-.4 0-.7.3-.7.7v14.7c0 .3.3.6.7.6h14.7c.4 0 .7-.3.7-.7V8.7c-.1-.4-.4-.7-.8-.7zM12.7 21.6h-2.3V14h2.4v7.6h-.1zM11.6 13c-.8 0-1.4-.7-1.4-1.4 0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4-.1.7-.7 1.4-1.4 1.4zm10 8.6h-2.4v-3.7c0-.9 0-2-1.2-2s-1.4 1-1.4 2v3.8h-2.4V14h2.3v1c.3-.6 1.1-1.2 2.2-1.2 2.4 0 2.8 1.6 2.8 3.6v4.2h.1z" />
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Colonnes de liens */}
          <div className="md:col-span-8 lg:col-span-7 grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLONNES.map((col) => (
              <nav key={col.titre} aria-label={col.titre} className={col.titre === 'Outils gratuits' ? 'col-span-2 sm:col-span-1' : ''}>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">{col.titre}</h2>
                <ul className="space-y-2.5 text-sm">
                  {col.liens.map((l) => (
                    <li key={l.href}>
                      {l.externe ? (
                        <a className="text-gray-600 hover:text-blue-600 transition" href={l.href} target="_blank" rel="noopener">
                          {l.label}
                        </a>
                      ) : (
                        <Link className="text-gray-600 hover:text-blue-600 transition" href={l.href}>
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Bas de page */}
        <div className="flex flex-col gap-2 border-t border-gray-200 py-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>
            Mon-ao.com © {new Date().getFullYear()} Annuaire Marchés Publics. Données issues du{' '}
            <a className="hover:underline" href="https://www.boamp.fr" target="_blank" rel="noopener noreferrer">BOAMP</a>
          </p>
          <p>
            Plateforme propulsée par{' '}
            <a className="font-semibold text-gray-700 hover:text-blue-600 transition" href={VISIONBTP_URL} target="_blank" rel="noopener">
              VisionBTP.com
            </a>{' '}
            🇫🇷
          </p>
        </div>
      </div>
    </footer>
  )
}
