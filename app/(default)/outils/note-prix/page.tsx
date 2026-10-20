export const revalidate = 3600

import type { Metadata } from 'next'
import { compensationTechnique, METHODES, noterCandidats, notePrix, prixPourPasserPremier } from '@/lib/outils/note-prix'
import { EXEMPLE_NOTE_PRIX } from '@/lib/outils/note-prix-exemple'
import { getOutil } from '@/lib/outils/catalog'
import { AUTEUR } from '@/lib/outils/author'
import { fmtEur, fmtNum, fmtPct } from '@/lib/format'
import { ToolJsonLd } from '@/components/json-ld'
import {
  Accent, ContentSection, DataTable, Faq, Formula, GuidePart, LegalRefs, ToolFooter, ToolIntro, ToolShell, UpdatedAt,
  type FaqItem, type LegalRef,
} from '@/components/outils/sections'
import NotePrixSimulator from './simulator'

const OUTIL = getOutil('note-prix')
const UPDATED = '2026-10-20'
const LEGIFRANCE = 'https://www.legifrance.gouv.fr'

export const metadata: Metadata = {
  title: { absolute: 'Simulateur de note prix d\'un appel d\'offres : calcul et classement (gratuit) | mon-ao.com' },
  description:
    'Calculez votre note prix selon la méthode de notation de l\'acheteur (proportionnelle, linéaire, min-max), votre note finale, votre classement et le prix qui vous fait passer 1er.',
  alternates: { canonical: OUTIL.href },
}

const LEGAL: LegalRef[] = [
  { ref: 'Art. L2152-7', objet: 'Attribution à l\'offre économiquement la plus avantageuse, sur des critères objectifs liés à l\'objet du marché.', href: `${LEGIFRANCE}/codes/article_lc/LEGIARTI000048246726` },
  { ref: 'Art. R2152-7', objet: 'Choix des critères d\'attribution : prix ou coût, seul ou avec des critères qualitatifs, environnementaux ou sociaux.', href: `${LEGIFRANCE}/codes/article_lc/LEGIARTI000037730485` },
  { ref: 'Art. R2152-11 et 12', objet: 'Publication des critères d\'attribution et de leur pondération ou hiérarchisation.', href: `${LEGIFRANCE}/codes/id/LEGISCTA000037730475` },
  { ref: 'Art. L2152-5', objet: 'Définition de l\'offre anormalement basse.', href: `${LEGIFRANCE}/codes/article_lc/LEGIARTI000037703657` },
  { ref: 'Art. L2152-6', objet: 'L\'acheteur met en œuvre tous moyens pour détecter les offres anormalement basses.', href: `${LEGIFRANCE}/codes/article_lc/LEGIARTI000037703659` },
  { ref: 'Art. R2152-3 à 5', objet: 'Demande de justifications et rejet des offres anormalement basses.', href: `${LEGIFRANCE}/codes/section_lc/LEGITEXT000037701019/LEGISCTA000037724202/` },
]

const FAQ: FaqItem[] = [
  {
    q: 'L\'acheteur doit-il annoncer sa formule de notation ?',
    a: 'Non. Il doit publier les critères d\'attribution et leur pondération, ou leur hiérarchisation, dans les documents de la consultation, mais il n\'est pas tenu d\'indiquer la méthode de notation qu\'il appliquera (Conseil d\'État, 3 novembre 2014, Commune de Belleville-sur-Loire, n° 373362). Beaucoup d\'acheteurs la précisent tout de même dans le règlement de la consultation. La méthode reste encadrée : elle ne doit pas priver un critère de sa portée, neutraliser sa pondération, ni empêcher que la meilleure note revienne à la meilleure offre.',
  },
  {
    q: 'Comment est calculée la note finale d\'une offre ?',
    a: 'Chaque critère est noté sur la même échelle (sur 10, 20 ou 100), puis multiplié par sa pondération. Avec une note prix de 18 sur 20 pondérée à 40 % et une note technique de 15 sur 20 pondérée à 60 %, la note finale est 18 × 0,4 + 15 × 0,6 = 16,2 sur 20. L\'offre qui obtient la meilleure note finale est l\'offre économiquement la plus avantageuse.',
  },
  {
    q: 'Qu\'est-ce qu\'une offre anormalement basse ?',
    a: 'Une offre dont le prix est manifestement sous-évalué et de nature à compromettre la bonne exécution du marché (article L2152-5). Aucun seuil chiffré n\'est fixé par les textes : certains acheteurs s\'appuient sur un écart important avec la moyenne des offres ou avec leur estimation, mais ils doivent toujours demander des justifications au candidat avant de rejeter son offre. Viser le prix pour passer 1er ne doit jamais conduire à descendre sous votre prix de revient.',
  },
  {
    q: 'La méthode proportionnelle favorise-t-elle le moins-disant ?',
    a: 'Elle donne la note maximale au moins-disant, mais pénalise modérément les écarts : une offre 10 % plus chère garde environ 91 % de la note prix (20 / 1,1 = 18,18 sur 20). Les méthodes linéaire à coefficient et min-max sont bien plus sévères ; avec la min-max, l\'offre la plus chère obtient 0, quel que soit l\'écart. En pratique, le poids réel du prix dépend surtout de la dispersion des offres : si tous les prix sont proches, le prix départage peu et la technique fait la différence.',
  },
  {
    q: 'Peut-on contester une méthode de notation ?',
    a: 'Oui. Avant la signature du marché, par un référé précontractuel devant le tribunal administratif, si la méthode est irrégulière et vous a lésé. Après la signature, par un recours en contestation de la validité du contrat dans les deux mois qui suivent la publication de l\'avis d\'attribution. Le juge vérifie notamment que la méthode ne neutralise pas la pondération annoncée. Commencez par demander à l\'acheteur les motifs du rejet de votre offre et les caractéristiques de l\'offre retenue.',
  },
  {
    q: 'Faut-il baisser son prix ou améliorer son mémoire technique ?',
    a: 'Cela dépend de la pondération et de la méthode. Le simulateur calcule combien de points techniques compensent un écart de prix : avec une pondération 40/60 et la méthode proportionnelle, être 5 % plus cher que le moins-disant se compense par environ 0,6 point de note technique sur 20. Gagner ces points par un mémoire plus précis coûte souvent moins cher qu\'une remise.',
  },
]

export default function NotePrixPage() {
  const ex = EXEMPLE_NOTE_PRIX
  const classement = noterCandidats([ex.moi, ...ex.concurrents], ex.params)
  const moi = classement.find((c) => c.moi)!
  const premier = prixPourPasserPremier(ex.moi, ex.concurrents, ex.params)
  const prix = classement.map((c) => c.prix)
  const comp = compensationTechnique(5, Math.min(...prix), Math.max(...prix), ex.params)
  const n = (v: number) => fmtNum(v, 2)

  // Note prix d'une offre 10 % plus chère que le moins-disant, pour chaque méthode
  const effet = METHODES.map((m) => {
    const p = { ...ex.params, methode: m.value }
    const note = notePrix(110, 100, 120, p)
    return [m.label, <code key={m.value} className="font-mono text-xs text-gray-800">{m.formule}</code>, `${fmtNum(note, 2)} / 20`]
  })

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
          { name: 'Simulateur de note prix', href: OUTIL.href },
        ]}
      >
        <NotePrixSimulator
          intro={
            <ToolIntro
              title={<>Calculez votre <Accent>note prix</Accent> et le prix pour passer 1er</>}
              promise="Choisissez la méthode de notation de l'acheteur, saisissez votre offre et celles de vos concurrents : note prix, note finale, classement, et le prix maximum qui vous place en tête."
              checks={['Sans inscription', '4 méthodes de notation', 'Prix d\'équilibre calculé']}
            />
          }
        />
      </ToolShell>

      <ContentSection id="guide" eyebrow="Le guide" title="Note prix d'un appel d'offres : le calcul expliqué" muted>
        <GuidePart n={1} title="Comment ça marche">
          <p>
            L'acheteur classe les offres sur plusieurs critères annoncés dans le règlement de la consultation, le plus souvent le
            prix et la valeur technique. Chaque critère reçoit une note, sur 10, 20 ou 100, puis la note est multipliée par sa
            pondération :
          </p>
          <Formula legend="Les pondérations s'additionnent à 100 %.">
            Note finale = Note prix × Poids prix + Note technique × Poids technique
          </Formula>
          <p>
            La note prix dépend de la méthode de notation, qui compare votre prix au prix le plus bas (Pmin) et parfois au plus élevé
            (Pmax). Ci-dessous, la note prix sur 20 d'une offre 10 % plus chère que le moins-disant (avec k = 2, et une offre la
            plus chère à +20 % pour la méthode min–max) :
          </p>
          <DataTable caption="Méthodes de notation du prix" head={['Méthode', 'Formule', 'Offre à +10 %']} rows={effet} />
          <p>
            Le simulateur calcule ensuite deux repères. <strong className="text-gray-800">Le prix pour passer 1er</strong> est le prix
            maximum auquel votre note finale dépasse celle du meilleur concurrent, notes techniques inchangées.{' '}
            <strong className="text-gray-800">Les points techniques nécessaires</strong> sont les points de note technique qui
            compensent un prix supérieur de X % à celui du moins-disant.
          </p>
        </GuidePart>

        <GuidePart n={2} title="Exemple chiffré : un lot gros œuvre noté 40 % prix, 60 % technique">
          <p>
            Une entreprise répond au lot gros œuvre d'un groupe scolaire. Le règlement annonce une notation sur 20, prix 40 % et
            valeur technique 60 %, avec la méthode proportionnelle. Elle propose {fmtEur(ex.moi.prix, 0)} HT et estime sa note
            technique à {ex.moi.noteTech} sur 20. À l'ouverture des plis, trois concurrents :
          </p>
          <DataTable
            caption="Classement de l'exemple"
            head={['Rang', 'Candidat', 'Prix HT', 'Note prix', 'Note finale']}
            rows={classement.map((c) => [
              c.rang,
              c.moi ? <strong key={c.id} className="text-blue-600">{c.nom}</strong> : c.nom,
              fmtEur(c.prix, 0),
              n(c.notePrix),
              <strong key={`${c.id}-f`} className="text-gray-900">{n(c.noteFinale)}</strong>,
            ])}
          />
          <p>
            Elle termine {moi.rang}e. Le simulateur indique qu'elle passerait 1re sous{' '}
            <strong className="text-gray-800">{premier.statut === 'ok' ? fmtEur(premier.prix, 0) : '—'}</strong>
            {premier.statut === 'ok' && <> HT, soit une baisse de {fmtPct(((ex.moi.prix - premier.prix) / ex.moi.prix) * 100, 1)}</>}.
            Autre lecture : être 5 % plus cher que le moins-disant lui coûte {n(comp.perteNotePrix)} point de note prix, que{' '}
            <strong className="text-gray-800">{n(comp.pointsTech)} point de note technique</strong> suffit à compenser. Un mémoire
            technique plus solide sur la méthodologie ou le planning peut rapporter davantage qu'une remise.
          </p>
        </GuidePart>

        <GuidePart n={3} title="Cadre juridique">
          <p>
            Le Code de la commande publique impose d'attribuer le marché à l'offre économiquement la plus avantageuse, sur des
            critères annoncés à l'avance avec leur pondération. La méthode de notation, elle, relève du choix de l'acheteur, sous
            le contrôle du juge.
          </p>
          <LegalRefs items={LEGAL} />
        </GuidePart>
      </ContentSection>

      <ContentSection id="faq" eyebrow="Questions fréquentes" title="Vos questions sur la notation du prix">
        <Faq items={FAQ} />
      </ContentSection>

      <ToolFooter
        current={OUTIL.slug}
        updated={
          <UpdatedAt
            date={UPDATED}
            note="calcul 100 % dans votre navigateur, aucune donnée transmise"
            sources={[
              { label: 'Code de la commande publique (Légifrance)', href: `${LEGIFRANCE}/codes/texte_lc/LEGITEXT000037701019/` },
            ]}
          />
        }
      />
    </>
  )
}
