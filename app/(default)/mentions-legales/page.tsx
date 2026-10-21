import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { Badge, Breadcrumb, ContentSection } from '@/components/outils/sections'
import { EDITEUR, HEBERGEUR, LEGAL_MAJ, type ChampLegal } from '@/lib/legal'
import { SITE_URL } from '@/lib/site'
import { fmtDateLong } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: "Éditeur, directeur de la publication et hébergeur du site mon-ao.com.",
  alternates: { canonical: '/mentions-legales' },
  robots: { index: false, follow: true },
}

const linkClass = 'font-medium text-blue-600 hover:underline'

function Champ({ value }: { value: ChampLegal }) {
  return value ? <>{value}</> : <span className="font-medium text-red-600">à compléter</span>
}

function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 px-5 py-3.5 sm:grid-cols-[13rem_1fr] sm:gap-6">
      <dt className="text-sm font-semibold text-gray-900">{term}</dt>
      <dd className="text-sm text-gray-600 leading-relaxed">{children}</dd>
    </div>
  )
}

export default function MentionsLegalesPage() {
  return (
    <>
      <section className="relative">
        <div className="absolute inset-x-0 top-0 h-80 bg-linear-to-b from-blue-100 to-white pointer-events-none -z-10" aria-hidden="true" />
        <div className="max-w-3xl mx-auto px-6 sm:px-8 pt-28 md:pt-36">
          <Breadcrumb items={[{ name: 'Accueil', href: '/' }, { name: 'Mentions légales', href: '/mentions-legales' }]} />
          <div className="mb-5"><Badge>Informations légales</Badge></div>
          <h1 className="h1 font-inter tracking-tight text-gray-900 mb-4">Mentions légales</h1>
          <p className="text-gray-500">Mises à jour le {fmtDateLong(LEGAL_MAJ)}.</p>
        </div>
      </section>

      <ContentSection id="editeur" title="Éditeur du site">
        <p className="text-gray-600 leading-relaxed mb-6">
          Le site <a className={linkClass} href={SITE_URL}>mon-ao.com</a> est édité par {EDITEUR.nomCommercial}, agence
          d'automatisation IA dédiée aux entreprises du bâtiment.
        </p>
        <dl className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
          <Fact term="Raison sociale"><Champ value={EDITEUR.raisonSociale} /></Fact>
          <Fact term="Forme juridique et capital">
            <Champ value={EDITEUR.formeJuridique} />, capital de <Champ value={EDITEUR.capital} />
          </Fact>
          <Fact term="Immatriculation"><Champ value={EDITEUR.rcs} /></Fact>
          <Fact term="Siège social"><Champ value={EDITEUR.siege} /></Fact>
          <Fact term="Directeur de la publication"><Champ value={EDITEUR.directeurPublication} /></Fact>
          <Fact term="Contact">
            {EDITEUR.email ? <a className={linkClass} href={`mailto:${EDITEUR.email}`}>{EDITEUR.email}</a> : <Champ value={null} />}
            {' · '}
            <a className={linkClass} href={EDITEUR.contact} target="_blank" rel="noopener">formulaire de contact</a>
          </Fact>
        </dl>
      </ContentSection>

      <ContentSection id="hebergeur" title="Hébergement" muted>
        <dl className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
          <Fact term="Hébergeur">{HEBERGEUR.nom}</Fact>
          <Fact term="Adresse">{HEBERGEUR.adresse}</Fact>
          <Fact term="Site">
            <a className={linkClass} href={HEBERGEUR.site} target="_blank" rel="noopener noreferrer">{HEBERGEUR.site.replace('https://', '')}</a>
          </Fact>
        </dl>
      </ContentSection>

      <ContentSection id="donnees" title="Données publiées">
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Les appels d'offres sont repris des données ouvertes du BOAMP, publiées par la Direction de l'information légale et
            administrative (DILA), et les marchés attribués des données essentielles de la commande publique (DECP). Les index BT et
            TP proviennent de l'INSEE. Ces données sont réutilisées dans les conditions de la Licence Ouverte d'Etalab.
          </p>
          <p>
            Chaque fiche renvoie vers l'avis officiel, qui seul fait foi. Une erreur dans un avis ? Signalez-la via le{' '}
            <a className={linkClass} href={EDITEUR.contact} target="_blank" rel="noopener">formulaire de contact</a>.
          </p>
          <p>
            Les textes, outils et guides du site sont la propriété de l'éditeur. Pour vos données personnelles, voir la page{' '}
            <Link className={linkClass} href="/confidentialite">Confidentialité et cookies</Link>.
          </p>
        </div>
      </ContentSection>
    </>
  )
}
