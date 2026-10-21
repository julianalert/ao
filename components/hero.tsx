import Link from 'next/link'
import type { ChiffresAccueil } from '@/lib/getAppelsOffre'
import { OUTILS } from '@/lib/outils/catalog'

const nombre = (n: number) => n.toLocaleString('fr-FR')

export default function Hero({ chiffres }: { chiffres: ChiffresAccueil | null }) {
  // Sans chiffres (base indisponible), le hero s'affiche sans compteurs
  const preuves = !chiffres ? [] : [
    { valeur: nombre(chiffres.ouverts), label: "appels d'offres ouverts" },
    { valeur: nombre(chiffres.nouveauxSemaine), label: 'publiés ces 7 derniers jours' },
    { valeur: String(OUTILS.length), label: 'outils gratuits pour y répondre' },
    { valeur: '0 €', label: 'sans inscription ni abonnement' },
  ]

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-blue-100 to-white pointer-events-none -z-10" aria-hidden="true" />

      <div className="max-w-screen-2xl mx-auto px-6 sm:px-8">
        <div className="pt-24 pb-8 md:pt-32 md:pb-12">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-3 py-1 text-xs font-semibold text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            Mis à jour ce matin depuis le BOAMP
          </p>
          <h1 className="h1 max-sm:text-4xl font-inter mb-5 max-w-4xl">
            Les appels d'offres publics, triés pour les entreprises du BTP
          </h1>
          <p className="text-lg text-gray-600 mb-7 max-w-3xl">
            {chiffres && `${nombre(chiffres.ouvertsTravaux)} marchés de travaux sont ouverts aujourd'hui. `}Trouvez ceux de votre métier et de votre
            région, faites analyser le règlement de consultation en quelques minutes et décidez vite si vous répondez.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row mb-10">
            <Link href="/travaux" className="btn text-white bg-blue-500 hover:bg-blue-600 shadow-xs">
              Voir les appels d'offres de travaux →
            </Link>
            <Link href="/outils/analyse-rc" className="btn text-gray-800 bg-white border border-gray-200 hover:border-blue-300 shadow-xs">
              Analyser un RC gratuitement
            </Link>
          </div>

          {chiffres && chiffres.metiers.length > 0 && (
            <div className="mb-10">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Appels d'offres ouverts par métier
              </p>
              <div className="flex flex-wrap gap-1.5 max-sm:[&>a:nth-child(n+9)]:hidden">
                {chiffres.metiers.map((m) => (
                  <Link
                    key={m.categorie}
                    href={`/${m.categorie}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 transition shadow-xs"
                  >
                    {m.label}
                    <span className="text-xs text-gray-400">{nombre(m.ouverts)}</span>
                  </Link>
                ))}
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Pas dans le BTP ?{' '}
                <Link href="/services" className="font-medium text-blue-600 hover:underline">Marchés de services</Link>
                {' · '}
                <Link href="/fournitures" className="font-medium text-blue-600 hover:underline">Marchés de fournitures</Link>
              </p>
            </div>
          )}

          {preuves.length > 0 && (
            <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {preuves.map((p) => (
                <div key={p.label} className="flex flex-col-reverse justify-end rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-xs">
                  <dt className="text-xs text-gray-500 mt-0.5">{p.label}</dt>
                  <dd className="text-xl md:text-2xl font-extrabold text-gray-900">{p.valeur}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </section>
  )
}
