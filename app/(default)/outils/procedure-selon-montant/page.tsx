export const revalidate = 3600

import type { Metadata } from 'next'
import Link from 'next/link'
import { getSeuils, derniereRevision } from '@/lib/seuils'
import { determinerProcedure, NIVEAU_LABELS, periodeEuropeenne, seuilApplicable } from '@/lib/outils/procedure'
import { getOutil } from '@/lib/outils/catalog'
import { AUTEUR } from '@/lib/outils/author'
import { fmtDate, fmtDateLong, fmtEur, todayParis } from '@/lib/format'
import { ToolJsonLd } from '@/components/json-ld'
import {
  Accent, ContentSection, DataTable, Faq, GuidePart, LegalRefs, ToolFooter, ToolIntro, ToolShell, UpdatedAt,
  type FaqItem, type LegalRef,
} from '@/components/outils/sections'
import ProcedureSimulator from './simulator'

const OUTIL = getOutil('procedure-selon-montant')
const UPDATED = '2026-10-20'
const CCP = 'https://www.code-commande-publique.com'

export const metadata: Metadata = {
  title: { absolute: 'Seuils des marchés publics : quelle procédure selon le montant ? (outil gratuit) | mon-ao.com' },
  description:
    'Saisissez le montant et le type de marché : procédure applicable (sans publicité, MAPA, appel d\'offres), publicité obligatoire et délais minimum, avec les seuils 2026 à jour.',
  alternates: { canonical: OUTIL.href },
}

const LEGAL: LegalRef[] = [
  { ref: 'Art. R2121-1 et s.', objet: 'Calcul de la valeur estimée du besoin : montant total HT, options et reconductions comprises.', href: `${CCP}/article-r2121-1` },
  { ref: 'Art. R2122-8', objet: 'Marchés passés sans publicité ni mise en concurrence sous le seuil de dispense.', href: `${CCP}/article-r2122-8` },
  { ref: 'Art. R2123-1', objet: 'Procédure adaptée : sous les seuils européens, et pour les petits lots.', href: `${CCP}/article-r2123-1` },
  { ref: 'Art. R2124-1 et s.', objet: 'Procédures formalisées : appel d\'offres, procédure avec négociation, dialogue compétitif.', href: `${CCP}/article-r2124-1` },
  { ref: 'Art. R2131-12', objet: 'Publicité des procédures adaptées de l\'État et des collectivités (BOAMP ou JAL dès 90 000 € HT).', href: `${CCP}/article-r2131-12` },
  { ref: 'Art. R2131-16', objet: 'Publicité des procédures formalisées : BOAMP et JOUE.', href: `${CCP}/article-r2131-16` },
  { ref: 'Art. R2161-2 et s.', objet: 'Délais minimaux de réception des candidatures et des offres.', href: `${CCP}/article-r2161-2/` },
  { ref: 'Avis du 13 janvier 2026', objet: 'Seuils de procédure applicables au 1er janvier 2026 (annexe 2 du Code).', href: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053346567' },
]

const FAQ: FaqItem[] = [
  {
    q: 'Comment calculer la valeur estimée d\'un marché ?',
    a: 'C\'est le montant total hors taxes du besoin, sur toute la durée du marché, reconductions et options comprises. Pour un marché alloti, on additionne tous les lots. Pour des fournitures ou services, on additionne les achats homogènes de l\'année ; pour des travaux, tous les travaux d\'une même opération. C\'est cette valeur, et non le montant de votre lot ou d\'une année, qui se compare aux seuils.',
  },
  {
    q: 'Que se passe-t-il si le marché est alloti ?',
    a: 'Le seuil se compare à la valeur totale de tous les lots. Si l\'opération dépasse le seuil européen, chaque lot suit la procédure formalisée. Exception : les « petits lots », dont le montant cumulé ne dépasse pas 20 % du total, peuvent être passés en procédure adaptée (moins de 1 000 000 € HT en travaux, 80 000 € HT en fournitures et services), et les lots de travaux de moins de 100 000 € HT sans publicité ni mise en concurrence.',
  },
  {
    q: 'Peut-on passer un marché sans publicité ?',
    a: 'Oui, sous le seuil de dispense : 100 000 € HT pour les travaux en 2026 (140 000 € HT à partir du 1er janvier 2027) et 60 000 € HT pour les fournitures et services depuis le 1er avril 2026. L\'acheteur doit quand même choisir une offre pertinente, faire une bonne utilisation de l\'argent public et ne pas contracter systématiquement avec la même entreprise. D\'autres cas existent au-delà de ces montants (urgence impérieuse, appel d\'offres infructueux, prestataire unique), mais ils sont strictement encadrés.',
  },
  {
    q: 'Quelle différence entre MAPA et procédure formalisée ?',
    a: 'En procédure adaptée (MAPA), l\'acheteur fixe lui-même les règles : support de publicité, délai, négociation éventuelle. Il doit ensuite respecter ce qu\'il a annoncé. En procédure formalisée, au-dessus des seuils européens, les règles sont fixées par le Code : appel d\'offres, procédure avec négociation ou dialogue compétitif, publication au BOAMP et au JOUE, délais minimaux de 30 à 35 jours.',
  },
  {
    q: 'Quand les seuils changent-ils ?',
    a: 'Les seuils européens des procédures formalisées sont révisés tous les deux ans, au 1er janvier des années paires : les seuils actuels s\'appliquent en 2026 et 2027. Les seuils nationaux (dispense, publicité des MAPA) changent par décret, presque chaque année depuis 2020. Le seuil applicable est celui en vigueur à la date de lancement de la consultation, d\'où le champ de date dans l\'outil.',
  },
]

export default async function ProcedureSelonMontantPage() {
  const { seuils, source } = await getSeuils()
  const today = todayParis()
  const revision = derniereRevision(seuils, today)

  const s = (code: string, famille: 'travaux' | 'fournitures-services' | null, acheteur: 'etat' | 'collectivite' | 'entite-adjudicatrice' | null) =>
    seuilApplicable(seuils, code, famille, acheteur, today)
  const dispenseT = s('dispense', 'travaux', null)
  const dispenseFS = s('dispense', 'fournitures-services', null)
  const formT = s('formalise', 'travaux', 'collectivite')
  const formEtat = s('formalise', 'fournitures-services', 'etat')
  const formColl = s('formalise', 'fournitures-services', 'collectivite')
  const formEA = s('formalise', 'fournitures-services', 'entite-adjudicatrice')
  const pubMapa = s('publicite-mapa', null, 'collectivite')
  const dispenseT2027 = seuils.find((x) => x.code === 'dispense' && x.type_marche === 'travaux' && x.valid_from > today)

  const exemple = determinerProcedure(
    { typeMarche: 'travaux', acheteur: 'collectivite', montant: 1_400_000, date: today, alloti: true, montantLot: 85_000, pac: false },
    seuils,
  )

  const ligne = (label: string, x: typeof dispenseT) =>
    x ? [label, <strong key={x.id} className="text-gray-900 whitespace-nowrap">{fmtEur(x.montant, 0)} HT</strong>, `depuis le ${fmtDate(x.valid_from)}`, x.reference] : null

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
          { name: 'Procédure selon le montant', href: OUTIL.href },
        ]}
      >
        <ProcedureSimulator
          seuils={seuils}
          today={today}
          intro={
            <ToolIntro
              title={<>Quelle <Accent>procédure</Accent> selon le montant du marché ?</>}
              promise="Indiquez le type de marché, l'acheteur et le montant estimé : l'outil donne la procédure applicable, la publicité obligatoire et les délais minimum, avec les seuils en vigueur."
              checks={['Sans inscription', formT ? `Seuils ${periodeEuropeenne(formT)} à jour` : 'Seuils à jour', 'Lots et petits lots']}
            />
          }
        />
      </ToolShell>

      <ContentSection id="guide" eyebrow="Le guide" title="Seuils et procédures : le calcul expliqué" muted>
        <GuidePart n={1} title="Comment ça marche">
          <p>
            Le montant estimé du marché le place dans l'une des trois tranches : sous le seuil de dispense, le marché peut être
            passé sans publicité ni mise en concurrence ; entre la dispense et le seuil européen, l'acheteur passe une procédure
            adaptée (MAPA) ; au-dessus, il doit suivre une procédure formalisée.
          </p>
          <DataTable
            caption="Seuils en vigueur"
            head={['Seuil', 'Montant', 'En vigueur', 'Texte']}
            rows={[
              ligne('Dispense, travaux', dispenseT),
              ligne('Dispense, fournitures et services', dispenseFS),
              ligne('Publicité BOAMP ou JAL (MAPA de l\'État et des collectivités)', pubMapa),
              ligne('Procédure formalisée, fournitures et services de l\'État', formEtat),
              ligne('Procédure formalisée, fournitures et services des collectivités', formColl),
              ligne('Procédure formalisée, fournitures et services des entités adjudicatrices', formEA),
              ligne('Procédure formalisée, travaux (tous acheteurs)', formT),
            ].filter((r): r is NonNullable<typeof r> => r !== null)}
          />
          {dispenseT2027 && (
            <p>
              À noter : le seuil de dispense des travaux passera à <strong className="text-gray-800">{fmtEur(dispenseT2027.montant, 0)} HT</strong> pour
              les consultations lancées à partir du {fmtDateLong(dispenseT2027.valid_from)} ({dispenseT2027.reference}). Changez la date
              dans l'outil pour voir son effet.
            </p>
          )}
          <p>
            Tous les montants sont hors taxes et s'apprécient sur la valeur totale du besoin. Le détail des seuils et leur historique
            sont sur notre page <Link href="/seuils-marches-publics" className="font-medium text-blue-600 hover:underline">seuils des marchés publics</Link>.
          </p>
        </GuidePart>

        {exemple && (
          <GuidePart n={2} title="Exemple chiffré : un lot de 85 000 € dans une rénovation d'école">
            <p>
              Une commune lance la rénovation d'une école, estimée à {fmtEur(1_400_000, 0)} HT et découpée en huit lots. Une entreprise
              de peinture vise le lot 6, estimé à {fmtEur(85_000, 0)} HT. Le seuil se compare aux {fmtEur(1_400_000, 0)} de l'opération,
              pas aux {fmtEur(85_000, 0)} du lot.
            </p>
            <DataTable
              caption="Résultat de l'exemple"
              head={['Question', 'Réponse']}
              rows={[
                ['Procédure de l\'opération', NIVEAU_LABELS[exemple.niveau]],
                ['Publicité', `${exemple.publicite.titre} (${exemple.publicite.reference})`],
                ['Votre lot', exemple.lot?.titre ?? '—'],
              ]}
            />
            <p>
              Conséquence pratique : ce lot sera très probablement publié au BOAMP ou dans un journal d'annonces légales, avec un délai
              de réponse fixé par la commune. Mais si la commune le classe parmi ses petits lots, elle peut aussi consulter directement
              quelques entreprises : être connu de ses services techniques compte autant que la veille.
            </p>
          </GuidePart>
        )}

        <GuidePart n={3} title="Cadre juridique">
          <p>
            Les seuils de procédure figurent dans le Code de la commande publique et dans son annexe 2, mise à jour à chaque
            révision des seuils européens. Les règles de publicité et les délais minimaux en découlent.
          </p>
          <LegalRefs items={LEGAL} />
        </GuidePart>
      </ContentSection>

      <ContentSection id="faq" eyebrow="Questions fréquentes" title="Vos questions sur les seuils et les procédures">
        <Faq items={FAQ} />
      </ContentSection>

      <ToolFooter
        current={OUTIL.slug}
        updated={
          <UpdatedAt
            date={UPDATED}
            note={revision ? `seuils en vigueur depuis le ${fmtDate(revision)}${source === 'fichier' ? ' (fichier de référence)' : ''}` : undefined}
            sources={[
              { label: 'Avis du 13 janvier 2026 (Légifrance)', href: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053346567' },
              { label: 'DAJ, décrets 2025-1383 et 2025-1386', href: 'https://www.economie.gouv.fr/daj/publication-de-deux-decrets-relatifs-la-commande-publique' },
            ]}
          />
        }
      />
    </>
  )
}
