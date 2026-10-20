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
      { label: 'À propos', href: '/a-propos' },
      { label: 'BOAMP, le bulletin officiel', href: 'https://www.boamp.fr', externe: true },
    ],
  },
]

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
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Les appels d'offre publics français, mis à jour chaque jour depuis le BOAMP, et des outils gratuits pour y répondre.
            </p>
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
