export const revalidate = 86400

import type { Metadata } from 'next'
import Link from 'next/link'
import { getOutil } from '@/lib/outils/catalog'
import { AUTEUR } from '@/lib/outils/author'
import { pieceHref, PIECES, PIECES_AVEC_PAGE, piecesPour } from '@/lib/outils/pieces'
import { ToolJsonLd } from '@/components/json-ld'
import {
  Accent, ContentSection, DataTable, Faq, GuidePart, LegalRefs, ToolFooter, ToolIntro, ToolShell, UpdatedAt,
  type FaqItem, type LegalRef,
} from '@/components/outils/sections'
import PiecesChecklist from './checklist'

const OUTIL = getOutil('pieces-candidature')
const UPDATED = '2026-10-20'
const CCP = 'https://www.code-commande-publique.com'

export const metadata: Metadata = {
  title: { absolute: 'Pièces de candidature d\'un marché public : DC1, DC2, DUME, attestations (checklist gratuite) | mon-ao.com' },
  description:
    'La liste des pièces à fournir pour répondre à un marché public selon votre situation : DC1, DC2 ou DUME, DC4, attestation de vigilance URSSAF, régularité fiscale, Kbis, assurances, avec leur durée de validité.',
  alternates: { canonical: OUTIL.href },
}

const LEGAL: LegalRef[] = [
  { ref: 'Art. R2143-3', objet: 'Déclaration sur l\'honneur du candidat (absence d\'interdiction de soumissionner).', href: `${CCP}/article-r2143-3` },
  { ref: 'Art. R2143-4', objet: 'Le DUME est accepté par l\'acheteur à la place des autres documents de candidature.', href: `${CCP}/article-r2143-4` },
  { ref: 'Art. R2143-13 et 14', objet: 'Pas de document que l\'acheteur peut obtenir en ligne gratuitement ou qu\'il détient déjà.', href: `${CCP}/article-r2143-13` },
  { ref: 'Art. R2142-7', objet: 'Chiffre d\'affaires minimum exigible plafonné à 1,5 fois le montant estimé.', href: `${CCP}/article-r2142-7/` },
  { ref: 'Art. R2144-1 et s.', objet: 'Vérification des candidatures et pièces exigées du candidat retenu.', href: `${CCP}/article-r2144-1` },
  { ref: 'Art. R2193-1 et s.', objet: 'Déclaration et acceptation des sous-traitants (DC4).', href: `${CCP}/article-r2193-1` },
  { ref: 'Code du travail', objet: 'Attestation de vigilance tous les 6 mois pour les contrats d\'au moins 5 000 € HT.', href: 'https://www.justice.fr/fiche/fournir-attestations-regularite-fiscale-vigilance-marche-public' },
]

const FAQ: FaqItem[] = [
  {
    q: 'DC1/DC2 ou DUME : lequel choisir ?',
    a: 'Les deux sont valables : l\'acheteur doit accepter le DUME, et les formulaires DC1 et DC2 restent acceptés partout. Le DC1/DC2 reste le format le plus courant en procédure adaptée. Le DUME devient intéressant si vous répondez souvent, car un DUME générique se réutilise d\'une consultation à l\'autre.',
  },
  {
    q: 'Quelles pièces fournir dès la candidature ?',
    a: 'En principe, le DC1 et le DC2 (ou un DUME), les éléments de capacité demandés par le règlement de la consultation (références, qualifications, chiffre d\'affaires) et, si vous sous-traitez, un DC4. Les attestations fiscales et sociales et le Kbis ne sont exigés que de l\'entreprise retenue, avant la signature. Certains règlements demandent plus tôt une attestation d\'assurance : lisez-le.',
  },
  {
    q: 'Que faire si une attestation expire pendant la consultation ?',
    a: 'Rien ne presse tant que vous n\'êtes pas retenu : l\'acheteur vérifie les attestations au moment de l\'attribution. Les attestations de vigilance et de régularité fiscale se téléchargent immédiatement en ligne si vous êtes à jour ; fournissez la plus récente quand l\'acheteur vous la demande. Sans réponse dans le délai fixé, l\'offre suivante peut être retenue.',
  },
  {
    q: 'Quelles pièces pour un groupement ?',
    a: 'Un DC1 unique pour le groupement, qui désigne le mandataire et liste les membres, et un DC2 ou un DUME par membre. Chaque membre fournit ses propres attestations s\'il est retenu. Une convention de groupement précise la répartition des prestations et la solidarité éventuelle.',
  },
  {
    q: 'Mon entreprise a moins d\'un an : puis-je candidater ?',
    a: 'Oui. Sans trois exercices comptables, indiquez le chiffre d\'affaires disponible et, si vous ne pouvez pas produire les documents demandés pour une raison justifiée, prouvez votre capacité financière par tout autre moyen que l\'acheteur juge approprié, par exemple une attestation bancaire. Pour les références, citez celles de vos dirigeants et décrivez vos moyens.',
  },
]

export default function PiecesCandidaturePage() {
  const exemple = piecesPour({ typeMarche: 'travaux', procedure: 'mapa', groupement: true, sousTraitance: false, etrangere: false, moinsUnAn: false })
  const aValidite = PIECES.filter((p) => p.etape === 'attributaire' || p.expire)

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
          { name: 'Pièces de candidature', href: OUTIL.href },
        ]}
      >
        <PiecesChecklist
          avecPage={PIECES_AVEC_PAGE.map((p) => p.slug)}
          intro={
            <ToolIntro
              title={<>Les <Accent>pièces de candidature</Accent> à fournir, sans en oublier</>}
              promise="Décrivez votre marché et votre façon de répondre : l'outil liste les pièces à préparer, avec leur durée de validité et l'endroit où les obtenir. Cochez au fur et à mesure, exportez en PDF."
              checks={['Sans inscription', 'DC1, DC2, DUME, DC4', 'Rappel avant expiration']}
            />
          }
        />
      </ToolShell>

      <ContentSection id="guide" eyebrow="Le guide" title="Le dossier de candidature expliqué" muted>
        <GuidePart n={1} title="Comment ça marche">
          <p>
            Une réponse à un marché public se compose de la <strong className="text-gray-800">candidature</strong>, qui prouve que vous
            avez le droit et la capacité de réaliser le marché, et de l'<strong className="text-gray-800">offre</strong>, qui dit ce que
            vous proposez et à quel prix. Les attestations fiscales et sociales ne sont exigées en principe que de l'entreprise retenue,
            juste avant la signature.
          </p>
          <p>
            L'acheteur ne peut pas vous demander un document qu'il peut obtenir gratuitement en ligne auprès d'un organisme officiel,
            ni un document que vous lui avez déjà transmis et qui reste valable. Le règlement de la consultation fixe la liste exacte :
            l'outil vous donne la base commune, à compléter avec ses exigences particulières.
          </p>
        </GuidePart>

        <GuidePart n={2} title="Exemple : un plombier en groupement sur un MAPA de travaux">
          <p>
            Une PME de plomberie répond avec un électricien à la rénovation des sanitaires d'un collège, en procédure adaptée. Elle est
            mandataire du groupement. Sa checklist compte {exemple.length} pièces :
          </p>
          <DataTable
            caption="Pièces de l'exemple"
            head={['Pièce', 'Pour qui']}
            rows={exemple.map((p) => [
              p.page ? <Link key={p.slug} href={pieceHref(p.slug)} className="font-medium text-blue-600 hover:underline">{p.nom}</Link> : p.nom,
              p.slug === 'dc1' || p.slug === 'groupement' ? 'Une pour le groupement' : p.etape === 'offre' ? 'Le groupement' : 'Chaque membre',
            ])}
          />
          <p>
            Le piège le plus fréquent : préparer le dossier du mandataire et oublier les attestations de l'électricien, qui seront
            exigées au même titre au moment de l'attribution.
          </p>
        </GuidePart>

        <GuidePart n={3} title="Durées de validité à surveiller">
          <DataTable
            caption="Validité des attestations"
            head={['Pièce', 'Validité', 'Où l\'obtenir']}
            rows={aValidite.map((p) => [
              p.page ? <Link key={p.slug} href={pieceHref(p.slug)} className="font-medium text-blue-600 hover:underline">{p.nom}</Link> : p.nom,
              p.validite,
              p.ou.label,
            ])}
          />
          <p>
            Beaucoup d'acheteurs récupèrent l'attestation de vigilance via la plateforme e-attestations : y créer votre compte une fois
            vous évite de la redéposer à chaque marché.
          </p>
        </GuidePart>

        <GuidePart n={4} title="Cadre juridique">
          <LegalRefs items={LEGAL} />
        </GuidePart>
      </ContentSection>

      <ContentSection id="faq" eyebrow="Questions fréquentes" title="Vos questions sur les pièces de candidature">
        <Faq items={FAQ} />
      </ContentSection>

      <ToolFooter
        current={OUTIL.slug}
        updated={
          <UpdatedAt
            date={UPDATED}
            note="durées de validité usuelles, le règlement de la consultation prévaut"
            sources={[
              { label: 'DAJ, formulaires de la commande publique', href: 'https://www.economie.gouv.fr/daj/commande-publique/formulaires-commande-publique' },
              { label: 'justice.fr, attestations fiscales et sociales', href: 'https://www.justice.fr/fiche/fournir-attestations-regularite-fiscale-vigilance-marche-public' },
            ]}
          />
        }
      />
    </>
  )
}
