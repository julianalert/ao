export const revalidate = 86400

import type { Metadata } from 'next'
import Link from 'next/link'
import { acheteurHref, acheteursIndex } from '@/lib/decp/marches'
import { departementLabel } from '@/lib/alertes/geo'
import { nomAffiche } from '@/lib/acheteurs'
import { fmtDate, fmtNum } from '@/lib/format'
import { Accent, Badge, Breadcrumb } from '@/components/outils/sections'

export const metadata: Metadata = {
  title: { absolute: 'Acheteurs publics : marchés attribués et appels d\'offres en cours | mon-ao.com' },
  description: 'Les acheteurs publics les plus actifs : nombre de marchés attribués sur 3 ans, attributaires fréquents et appels d\'offres en cours, à partir des données essentielles de la commande publique.',
  alternates: { canonical: '/acheteurs' },
}

export default async function AcheteursPage() {
  const acheteurs = await acheteursIndex(5, 200)

  return (
    <section className="relative">
      <div className="absolute inset-x-0 top-0 h-[26rem] bg-linear-to-b from-blue-100 to-white pointer-events-none -z-10" aria-hidden="true" />
      <div className="max-w-screen-xl mx-auto px-6 sm:px-8 pt-28 md:pt-36 pb-16">
        <Breadcrumb items={[{ name: 'Accueil', href: '/' }, { name: 'Acheteurs publics', href: '/acheteurs' }]} />
        <div className="mb-5"><Badge>Données essentielles</Badge></div>
        <h1 className="h1 font-inter tracking-tight text-gray-900 mb-5 max-w-4xl">
          Les <Accent>acheteurs publics</Accent> et leurs marchés
        </h1>
        <p className="text-lg text-gray-500 max-w-3xl mb-6">
          Pour chaque acheteur : marchés attribués sur trois ans, montants, attributaires fréquents, concurrence et appels d'offres en
          cours. Cherchez un acheteur par son nom dans l'outil Qui gagne quoi.
        </p>
        <Link href="/qui-gagne-quoi" className="btn text-white bg-blue-500 hover:bg-blue-600 shadow-xs mb-10">Rechercher un acheteur ou un marché →</Link>

        {acheteurs.length ? (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <caption className="sr-only">Acheteurs publics les plus actifs</caption>
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                <tr>{['Acheteur', 'Localisation', 'Marchés (3 ans)', 'Dernier marché'].map((h) => <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {acheteurs.map((a) => (
                  <tr key={a.acheteur_id}>
                    <td className="px-4 py-3"><Link href={acheteurHref(a.nom, a.acheteur_id)} className="font-medium text-blue-600 hover:underline">{nomAffiche(a.nom) ?? a.acheteur_id}</Link></td>
                    <td className="px-4 py-3 text-gray-600">{[a.commune, a.departement ? departementLabel(a.departement) : null].filter(Boolean).join(', ')}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums">{fmtNum(a.nb_marches, 0)}</td>
                    <td className="px-4 py-3 text-gray-500">{fmtDate(a.dernier_marche)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-600">
            L'annuaire des acheteurs est en cours de constitution. En attendant, recherchez un acheteur par son nom ou son SIRET dans{' '}
            <Link href="/qui-gagne-quoi" className="font-medium text-blue-600 hover:underline">Qui gagne quoi</Link> : chaque résultat mène à sa fiche.
          </p>
        )}
      </div>
    </section>
  )
}
