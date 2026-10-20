export const revalidate = 86400

import type { Metadata } from 'next'
import Link from 'next/link'
import { getOutil } from '@/lib/outils/catalog'
import { AUTEUR } from '@/lib/outils/author'
import { ToolJsonLd } from '@/components/json-ld'
import {
  Accent, ContentSection, Faq, GuidePart, LegalRefs, ToolFooter, ToolIntro, ToolShell, UpdatedAt,
  type FaqItem, type LegalRef,
} from '@/components/outils/sections'
import Recherche from './recherche'

const OUTIL = getOutil('qui-gagne-quoi')
const UPDATED = '2026-10-20'
const CCP = 'https://www.code-commande-publique.com'
const DATASET = 'https://www.data.gouv.fr/datasets/donnees-essentielles-de-la-commande-publique-consolidees-format-tabulaire'

export const metadata: Metadata = {
  title: { absolute: 'Qui gagne quoi : marchés publics attribués, attributaires et montants | mon-ao.com' },
  description:
    'Recherchez les marchés publics attribués par corps d\'état, département et acheteur : qui a gagné, à quel montant, face à combien d\'offres. Données essentielles de la commande publique, mises à jour chaque jour.',
  alternates: { canonical: OUTIL.href },
}

const LEGAL: LegalRef[] = [
  { ref: 'Art. L2196-2', objet: 'L\'acheteur publie les données essentielles de ses marchés.', href: `${CCP}/article-l2196-2` },
  { ref: 'Art. R2196-1', objet: 'Contenu et conditions de publication des données essentielles.', href: `${CCP}/article-r2196-1` },
  { ref: 'Jeu de données', objet: 'Données essentielles de la commande publique consolidées, Licence Ouverte 2.0.', href: DATASET },
]

const FAQ: FaqItem[] = [
  {
    q: 'D\'où viennent les données ?',
    a: 'Des données essentielles de la commande publique (DECP), que chaque acheteur doit publier pour ses marchés : objet, montant, titulaire, date de notification, procédure, nombre d\'offres reçues. mon-ao.com utilise le jeu consolidé publié sur data.gouv.fr, qui rassemble une soixantaine de sources et complète les noms des acheteurs et des entreprises à partir du répertoire Sirene.',
  },
  {
    q: 'Les montants sont-ils publics ?',
    a: 'Oui. Le montant, le titulaire et l\'objet font partie des données essentielles que la loi impose de publier en données ouvertes. Pour un accord-cadre, le montant indiqué est souvent le maximum prévu, pas la somme réellement dépensée. Les montants manifestement erronés (0 €, 1 € ou plusieurs milliards) sont écartés des calculs.',
  },
  {
    q: 'Pourquoi un marché n\'apparaît-il pas ?',
    a: 'Plusieurs raisons : l\'acheteur ne l\'a pas encore publié ou l\'a publié en retard, le marché est sous le seuil de publication, il relève du secret (défense, sécurité), ou ses données sont incomplètes. La recherche porte sur les marchés notifiés depuis trois ans au plus. Le classement par corps d\'état se fait sur le code CPV principal, qui ne décrit pas toujours tous les lots.',
  },
  {
    q: 'À quelle fréquence la base est-elle mise à jour ?',
    a: 'Chaque jour : le jeu consolidé est reconstruit chaque nuit, et mon-ao.com intègre chaque matin les données publiées depuis la veille. Comptez cependant plusieurs semaines entre la notification d\'un marché et la publication de ses données par l\'acheteur.',
  },
]

export default function QuiGagneQuoiPage() {
  return (
    <>
      <ToolJsonLd
        name={OUTIL.title}
        description={OUTIL.description}
        path={OUTIL.href}
        dateModified={UPDATED}
        faq={FAQ}
        author={{ name: AUTEUR.nom, url: AUTEUR.aProposHref }}
      />

      <ToolShell
        breadcrumb={[
          { name: 'Accueil', href: '/' },
          { name: 'Outils gratuits', href: '/outils' },
          { name: 'Qui gagne quoi', href: OUTIL.href },
        ]}
      >
        <Recherche
          intro={
            <ToolIntro
              title={<>Qui gagne les <Accent>marchés publics</Accent> de votre métier ?</>}
              promise="Cherchez par corps d'état, département ou acheteur : les marchés attribués, leurs titulaires, les montants et le nombre d'offres reçues, avec les entreprises qui gagnent le plus souvent."
              checks={['Données publiques officielles', 'Mises à jour chaque jour', 'Export CSV']}
            />
          }
        />
      </ToolShell>

      <ContentSection id="guide" eyebrow="Le guide" title="Lire les marchés attribués pour mieux répondre" muted>
        <GuidePart n={1} title="Comment ça marche">
          <p>
            Chaque acheteur public publie les données essentielles de ses marchés : objet, titulaire, montant, date de notification,
            procédure et nombre d'offres reçues. La recherche porte sur les marchés notifiés depuis trois ans, dans leur dernière
            version (après avenants éventuels). Un marché attribué à plusieurs entreprises apparaît sur plusieurs lignes, une par
            titulaire, mais n'est compté qu'une fois dans les moyennes.
          </p>
          <p>
            Chaque acheteur a sa fiche : volume de marchés par an, répartition par corps d'état, attributaires fréquents et appels
            d'offres en cours. <Link href="/acheteurs" className="font-medium text-blue-600 hover:underline">Voir les acheteurs publics →</Link>
          </p>
        </GuidePart>
        <GuidePart n={2} title="Ce que ces chiffres vous apprennent">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-gray-800">Le nombre moyen d'offres</strong> mesure la concurrence : à 2 ou 3 offres, vos chances sont réelles ; au-delà de 8, le prix pèse lourd.</li>
            <li><strong className="text-gray-800">Les attributaires fréquents</strong> d'un acheteur montrent s'il change souvent de prestataire ou s'il travaille toujours avec les mêmes.</li>
            <li><strong className="text-gray-800">Le montant moyen</strong> d'un segment indique la taille des marchés à votre portée, au regard du chiffre d'affaires exigé (1,5 fois le montant au plus).</li>
            <li><strong className="text-gray-800">Les marchés gagnés par vos concurrents</strong> vous donnent des prix de référence, utiles avec le <Link href="/outils/note-prix" className="text-blue-600 hover:underline">simulateur de note prix</Link>.</li>
          </ul>
        </GuidePart>
        <GuidePart n={3} title="Cadre juridique et sources">
          <p>Les données essentielles sont publiées en application du Code de la commande publique, sous Licence Ouverte.</p>
          <LegalRefs items={LEGAL} />
        </GuidePart>
      </ContentSection>

      <ContentSection id="faq" eyebrow="Questions fréquentes" title="Vos questions sur les marchés attribués">
        <Faq items={FAQ} />
      </ContentSection>

      <ToolFooter
        current={OUTIL.slug}
        updated={
          <UpdatedAt
            date={UPDATED}
            note="données synchronisées chaque matin"
            sources={[{ label: 'DECP consolidées (data.gouv.fr)', href: DATASET }]}
          />
        }
      />
    </>
  )
}
