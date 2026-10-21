import Link from 'next/link'
import type { StatsSegment } from '@/lib/stats-segment'
import { Faq, type FaqItem } from '@/components/outils/sections'
import { FaqJsonLd } from '@/components/json-ld'

const nombre = (n: number) => n.toLocaleString('fr-FR')
const euros = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(n / 1000) * 1000)

const PROCEDURES: Record<string, string> = {
  mapa: 'procédure adaptée (MAPA)',
  ouvert: "appel d'offres ouvert",
  restreint: "appel d'offres restreint",
  negociee: 'procédure négociée',
  autre: 'autres procédures',
}

const POUR_REPONDRE = [
  { href: '/outils/analyse-rc', label: 'Analyser un règlement de consultation' },
  { href: '/blog/lire-reglement-consultation-rc', label: 'Lire un RC en 15 minutes' },
  { href: '/blog/repondre-appel-offres-btp-dossier', label: 'Monter le dossier de réponse' },
  { href: '/outils/note-prix', label: 'Simuler sa note prix' },
]

/** « depuis mars 2026 » tant que l'historique fait moins d'un an, sinon « ces 12 derniers mois ». */
function periode(depuis: string | null): string {
  if (!depuis || Date.now() - new Date(depuis).getTime() > 350 * 86_400_000) return 'ces 12 derniers mois'
  return `depuis ${new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(depuis))}`
}

/**
 * Chiffres, acheteurs actifs et FAQ d'une page de liste (catégorie, région ou département).
 * `label` : « plomberie (travaux) » ; `lieu` : « en Grand Est », « dans le département 69 (Rhône) » ou rien.
 */
export default function SegmentStats({ stats, label, lieu = '' }: { stats: StatsSegment; label: string; lieu?: string }) {
  const sujet = `appels d'offres ${label}${lieu ? ` ${lieu}` : ''}`
  const quand = periode(stats.depuis)
  const part = (p: string) => stats.procedures.find((x) => x.procedure === p)?.part ?? 0
  const mixProcedures = stats.procedures
    .filter((p) => p.part >= 5)
    .slice(0, 3)
    .map((p) => `${p.part} % en ${PROCEDURES[p.procedure] ?? p.procedure}`)
    .join(', ')

  const tuiles = [
    { valeur: nombre(stats.ouverts), label: "ouverts aujourd'hui" },
    { valeur: nombre(stats.publies30j), label: 'publiés ces 30 derniers jours' },
    stats.montantMedian && { valeur: euros(stats.montantMedian), label: 'montant estimé médian (HT)' },
    stats.delaiMedianJours && { valeur: `${Math.round(stats.delaiMedianJours)} jours`, label: 'délai médian pour répondre' },
  ].filter((t): t is { valeur: string; label: string } => !!t)

  const faq: FaqItem[] = [
    {
      q: `Combien d'${sujet} sont publiés ?`,
      a: `${nombre(stats.publies)} ${quand}, dont ${nombre(stats.publies30j)} ces 30 derniers jours. ${nombre(stats.ouverts)} sont encore ouverts aujourd'hui. La liste ci-dessus est mise à jour chaque matin à partir du BOAMP.`,
    },
    ...(mixProcedures
      ? [{
          q: `Quelle procédure pour ces marchés ?`,
          a: `Elle dépend du montant estimé et du type de marché. Sur les ${sujet} publiés ${quand} : ${mixProcedures}. Le simulateur « Quelle procédure selon le montant ? » donne la procédure applicable et les délais minimum pour un montant donné.`,
        }]
      : []),
    ...(stats.delaiMedianJours
      ? [{
          q: 'Combien de temps pour répondre ?',
          a: `En médiane, ${Math.round(stats.delaiMedianJours)} jours séparent la publication de l'avis et la date limite de réponse. Le délai exact figure sur chaque fiche : vérifiez-le avant de décider si vous répondez.`,
        }]
      : []),
    {
      q: `Comment répondre à ces appels d'offres ?`,
      a: "Ouvrez la fiche de l'appel d'offres pour accéder au dossier de consultation (DCE). Lisez le règlement de consultation : notre analyseur en tire les dates, les critères et les pièces à fournir en quelques minutes. Préparez ensuite la candidature (DC1 et DC2, ou DUME) et l'offre, puis déposez-la sur la plateforme indiquée dans l'avis.",
    },
  ]

  return (
    <section className="border-t border-gray-100 bg-gray-50/60">
      <FaqJsonLd items={faq} />
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
              Les {sujet} en chiffres
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              {nombre(stats.publies)} {sujet} ont été publiés au BOAMP {quand}, dont {nombre(stats.publies30j)} ces 30 derniers jours ;{' '}
              {nombre(stats.ouverts)} sont encore ouverts aujourd'hui.
              {part('mapa') > 0 && <> {part('mapa')} % passent par une procédure adaptée (MAPA).</>}
              {stats.montantMedian && <> Quand l'acheteur l'indique, le montant estimé médian est de {euros(stats.montantMedian)} HT.</>}
              {stats.delaiMedianJours && <> Les entreprises disposent en médiane de {Math.round(stats.delaiMedianJours)} jours pour répondre.</>}
            </p>

            <dl className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-10">
              {tuiles.map((t) => (
                <div key={t.label} className="flex flex-col-reverse justify-end rounded-2xl border border-gray-200 bg-white px-4 py-3">
                  <dt className="text-xs text-gray-500 mt-0.5">{t.label}</dt>
                  <dd className="text-xl font-extrabold text-gray-900">{t.valeur}</dd>
                </div>
              ))}
            </dl>

            <h3 className="text-lg font-bold text-gray-900 mb-2">Questions fréquentes</h3>
            <Faq items={faq} />
          </div>

          <div className="lg:col-span-5 space-y-6">
            {stats.acheteurs.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="font-bold text-gray-900 mb-1">Les acheteurs les plus actifs</h3>
                <p className="text-xs text-gray-500 mb-4">Appels d'offres publiés {quand}</p>
                <ol className="space-y-2.5">
                  {stats.acheteurs.map((a) => (
                    <li key={a.nom} className="flex items-baseline justify-between gap-3 text-sm">
                      <Link href={`/qui-gagne-quoi?acheteur=${encodeURIComponent(a.nom)}`} className="text-gray-700 hover:text-blue-600 hover:underline">
                        {a.nom}
                      </Link>
                      <span className="shrink-0 font-semibold text-gray-900">{a.nb}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-xs text-gray-500">Un nom mène à ses marchés attribués et à leurs titulaires.</p>
              </div>
            )}

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="font-bold text-gray-900 mb-3">Pour répondre</h3>
              <ul className="space-y-2 text-sm">
                {POUR_REPONDRE.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="font-medium text-blue-600 hover:underline">{l.label} →</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
