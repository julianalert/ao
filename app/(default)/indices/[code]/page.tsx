export const revalidate = 86400
export const dynamicParams = false

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FAMILLE_LABELS, getIndiceByCode, indiceHref, indiceSlug, INDICES, inseeSerieUrl } from '@/lib/indices-catalog'
import { getIndiceSerie, lastObs, variation } from '@/lib/indices'
import { fmtDate, fmtMonth, fmtNum, fmtPct, MOIS_COURTS } from '@/lib/format'
import { IndiceDatasetJsonLd } from '@/components/json-ld'
import { Badge, Breadcrumb, ContentSection, Formula, GuidePart, UpdatedAt } from '@/components/outils/sections'
import { Stat } from '@/components/outils/form'
import IndiceChart from '@/components/outils/indice-chart'

interface PageProps {
  params: Promise<{ code: string }>
}

export function generateStaticParams() {
  return INDICES.map((i) => ({ code: indiceSlug(i.code) }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params
  const def = getIndiceByCode(code)
  if (!def) return {}
  const serie = await getIndiceSerie(def)
  const last = lastObs(serie)
  return {
    title: { absolute: `Index ${def.code} (${def.label}) : dernière valeur et historique | mon-ao.com` },
    description: last
      ? `Index ${def.code} base 2010 : ${fmtNum(last.v, 1)} en ${fmtMonth(last.p)} (INSEE). Historique mensuel depuis 2014, graphique et calcul de révision de prix avec le ${def.code}.`
      : `Index ${def.code} base 2010 (INSEE) : dernière valeur, historique mensuel et calcul de révision de prix.`,
    alternates: { canonical: indiceHref(def.code) },
  }
}

const FAMILLE_TEXTE = {
  BT: 'Les index bâtiment (BT) mesurent l\'évolution du coût des facteurs de production d\'un corps d\'état du bâtiment : salaires et charges, matériaux, matériel, transport, énergie et frais divers, pondérés selon la structure de coût du métier.',
  TP: 'Les index travaux publics (TP) mesurent l\'évolution du coût des facteurs de production d\'un type d\'ouvrage de travaux publics : salaires et charges, matériaux, matériel, énergie, transport et frais divers.',
  Divers: 'Les index divers de la construction couvrent des postes ou des activités spécifiques (matériel, transports, ingénierie, espaces verts, signalisation…), utilisés seuls ou dans des formules de révision multi-index.',
}

export default async function IndicePage({ params }: PageProps) {
  const { code } = await params
  const def = getIndiceByCode(code)
  if (!def) notFound()

  const serie = await getIndiceSerie(def)
  const last = lastObs(serie)
  const v1 = serie ? variation(serie, 1) : null
  const v12 = serie ? variation(serie, 12) : null
  const path = indiceHref(def.code)
  const voisins = INDICES.filter((i) => i.famille === def.famille && i.code !== def.code)

  // Historique : une ligne par année, de la plus récente à la plus ancienne
  const parAnnee = new Map<string, Map<string, number>>()
  for (const o of serie?.obs ?? []) {
    const [y, m] = o.p.split('-')
    if (!parAnnee.has(y)) parAnnee.set(y, new Map())
    parAnnee.get(y)!.set(m, o.v)
  }
  const annees = Array.from(parAnnee.keys()).sort().reverse()

  const precedent12 = last && serie ? serie.obs.find((o) => o.p === `${Number(last.p.slice(0, 4)) - 1}${last.p.slice(4)}`) : null

  return (
    <>
      <IndiceDatasetJsonLd
        code={def.code}
        label={def.label}
        path={path}
        description={`Valeurs mensuelles de l'index ${def.code} (${def.label}), base 2010, publiées par l'INSEE.`}
        dateModified={serie?.lastUpdate ?? null}
        inseeUrl={inseeSerieUrl(def.idbank)}
      />

      <section className="relative">
        <div className="absolute inset-x-0 top-0 h-[30rem] bg-linear-to-b from-blue-100 to-white pointer-events-none -z-10" aria-hidden="true" />
        <div className="max-w-screen-xl mx-auto px-6 sm:px-8">
          <div className="pt-28 md:pt-36 pb-10">
            <Breadcrumb
              items={[
                { name: 'Accueil', href: '/' },
                { name: 'Index BT et TP', href: '/indices' },
                { name: def.code, href: path },
              ]}
            />
            <div className="mb-5"><Badge>{FAMILLE_LABELS[def.famille]}</Badge></div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.08] mb-4">
              Index {def.code} : <span className="text-blue-500">{def.label}</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-3xl mb-8">
              Valeurs mensuelles de l'index {def.code} en base 2010, publiées par l'INSEE au Journal officiel, avec l'historique
              complet et le calcul de révision de prix.
            </p>

            {def.arretee && last && (
              <div className="mb-6 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Série arrêtée par l'INSEE : la dernière valeur publiée date de {fmtMonth(last.p)}. Pour un marché récent, utilisez
                l'un des index voisins listés plus bas.
              </div>
            )}

            {last ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  <Stat accent label="Dernière valeur" value={fmtNum(last.v, 1)} sub={fmtMonth(last.p)} />
                  <Stat label="Publié au JO le" value={fmtDate(last.jo)} sub={last.def ? 'valeur définitive' : 'valeur provisoire'} />
                  <Stat label="Sur 1 mois" value={v1 === null ? '—' : fmtPct(v1, 1, true)} />
                  <Stat label="Sur 12 mois" value={v12 === null ? '—' : fmtPct(v12, 1, true)} sub={precedent12 ? `${fmtNum(precedent12.v, 1)} en ${fmtMonth(precedent12.p)}` : undefined} />
                </div>
                <Link href={`/outils/revision-de-prix?indice=${def.code}`} className="btn text-white bg-blue-500 hover:bg-blue-600 shadow-xs">
                  Calculer une révision de prix avec le {def.code} →
                </Link>
              </>
            ) : (
              <p className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
                Les données INSEE sont momentanément indisponibles. Consultez la{' '}
                <a href={inseeSerieUrl(def.idbank)} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">série sur insee.fr</a>.
              </p>
            )}
          </div>

          {serie && serie.obs.length > 1 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-7 mb-10">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Évolution de l'index {def.code}</h2>
              <p className="text-sm text-gray-500 mb-4">De {fmtMonth(serie.obs[0].p)} à {fmtMonth(last!.p)}, base 2010.</p>
              <IndiceChart code={def.code} obs={serie.obs} />
            </div>
          )}

          {annees.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-4">Historique mensuel de l'index {def.code}</h2>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <caption className="sr-only">Valeurs mensuelles de l'index {def.code}</caption>
                  <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th scope="col" className="px-3 py-3 font-semibold">Année</th>
                      {MOIS_COURTS.map((m) => <th key={m} scope="col" className="px-3 py-3 font-semibold text-right">{m}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {annees.map((y) => (
                      <tr key={y}>
                        <th scope="row" className="px-3 py-2.5 font-semibold text-gray-900 text-left">{y}</th>
                        {Array.from({ length: 12 }, (_, i) => {
                          const v = parAnnee.get(y)!.get(String(i + 1).padStart(2, '0'))
                          return <td key={i} className="px-3 py-2.5 text-right tabular-nums text-gray-700">{v === undefined ? '' : fmtNum(v, 1)}</td>
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      <ContentSection eyebrow="Comprendre" title={`À quoi sert l'index ${def.code} ?`} muted>
        <GuidePart n={1} title="Ce que mesure l'index">
          <p>{FAMILLE_TEXTE[def.famille]}</p>
          <p>
            L'index {def.code} ({def.label.toLowerCase()}) est publié chaque mois en base 100 en 2010, environ deux mois et demi
            après le mois concerné. Il sert de référence dans les clauses de révision et d'actualisation des prix des marchés
            publics et privés de travaux.
          </p>
        </GuidePart>
        <GuidePart n={2} title="L'utiliser dans une formule de révision">
          <p>Avec une partie fixe de 0,125, le prix révisé d'un marché indexé sur le {def.code} se calcule ainsi :</p>
          <Formula legend={`${def.code}₀ : valeur du mois zéro · ${def.code}ₘ : valeur du mois d'exécution`}>
            P = P₀ × (0,125 + 0,875 × {def.code}ₘ / {def.code}₀)
          </Formula>
          {last && precedent12 && (
            <p>
              Pour des prix établis en {fmtMonth(precedent12.p)} ({fmtNum(precedent12.v, 1)}) et des travaux exécutés en{' '}
              {fmtMonth(last.p)} ({fmtNum(last.v, 1)}), le coefficient de révision vaut{' '}
              <strong className="text-gray-800">{fmtNum(0.125 + (0.875 * last.v) / precedent12.v, 4, 4)}</strong>.
            </p>
          )}
          <p>
            <Link href={`/outils/revision-de-prix?indice=${def.code}`} className="font-medium text-blue-600 hover:underline">
              Faire le calcul pour mon marché avec le calculateur de révision de prix →
            </Link>
          </p>
        </GuidePart>

        <UpdatedAt
          date={serie?.lastUpdate ?? new Date().toISOString().slice(0, 10)}
          note="données synchronisées chaque jour avec l'INSEE"
          sources={[{ label: `INSEE, série ${def.idbank}`, href: inseeSerieUrl(def.idbank) }]}
        />
      </ContentSection>

      <section>
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-12 md:py-16">
          <div className="flex items-end justify-between gap-4 mb-5">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Autres {FAMILLE_LABELS[def.famille].toLowerCase()}</h2>
            <Link href="/indices" className="text-sm font-medium text-blue-600 hover:underline whitespace-nowrap">Tous les index →</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {voisins.map((i) => (
              <Link
                key={i.code}
                href={indiceHref(i.code)}
                title={i.label}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 shadow-xs transition hover:border-blue-400 hover:text-blue-600"
              >
                <span className="font-semibold text-gray-800">{i.code}</span>
                <span className="hidden sm:inline max-w-56 truncate text-gray-500">{i.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
