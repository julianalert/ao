export const revalidate = 3600

import type { Metadata } from 'next'
import { getEcbRateChanges, lastRateChange, semesterRates } from '@/lib/ecb'
import { calculerMoratoires, EXEMPLE_MORATOIRES, INDEMNITE_FORFAITAIRE, TYPES_ACHETEUR } from '@/lib/outils/moratoires'
import { getOutil } from '@/lib/outils/catalog'
import { AUTEUR } from '@/lib/outils/author'
import { fmtDate, fmtDateLong, fmtEur, fmtPct, todayParis } from '@/lib/format'
import { ToolJsonLd } from '@/components/json-ld'
import {
  Accent, ContentSection, DataTable, Faq, Formula, GuidePart, LegalRefs, ToolFooter, ToolIntro, ToolShell, UpdatedAt,
  type FaqItem, type LegalRef,
} from '@/components/outils/sections'
import MoratoiresCalculator from './calculator'

const OUTIL = getOutil('interets-moratoires')
const UPDATED = '2026-10-20'

export const metadata: Metadata = {
  title: { absolute: 'Calcul des intérêts moratoires d\'un marché public (gratuit) | mon-ao.com' },
  description:
    'Calculez les intérêts moratoires et l\'indemnité forfaitaire de 40 € dus par un acheteur public qui paie en retard, au taux BCE + 8 points. Courrier de réclamation prêt à envoyer.',
  alternates: { canonical: OUTIL.href },
}

const LEGIFRANCE = 'https://www.legifrance.gouv.fr'

const LEGAL: LegalRef[] = [
  { ref: 'Art. L2192-13', objet: 'Le retard de paiement fait courir de plein droit des intérêts moratoires et une indemnité forfaitaire.', href: `${LEGIFRANCE}/codes/id/LEGISCTA000037703783` },
  { ref: 'Art. R2192-10', objet: 'Délai de paiement de 30 jours pour les pouvoirs adjudicateurs.', href: `${LEGIFRANCE}/codes/article_lc/LEGIARTI000037729711` },
  { ref: 'Art. R2192-11', objet: 'Délais de 50 jours (établissements publics de santé) et 60 jours (entreprises publiques).', href: `${LEGIFRANCE}/codes/section_lc/LEGITEXT000037701019/LEGISCTA000037724989` },
  { ref: 'Art. R2192-27 à 30', objet: 'Interruption du délai de paiement, une seule fois, si la demande est incomplète.', href: `${LEGIFRANCE}/codes/section_lc/LEGITEXT000037701019/LEGISCTA000037725037/` },
  { ref: 'Art. R2192-31', objet: 'Taux : taux de refinancement de la BCE majoré de huit points.', href: `${LEGIFRANCE}/codes/article_lc/LEGIARTI000037729653` },
  { ref: 'Art. R2192-32', objet: 'Les intérêts courent du lendemain de la date limite jusqu\'à la mise en paiement incluse.', href: `${LEGIFRANCE}/codes/article_lc/LEGIARTI000038808532` },
  { ref: 'Art. R2192-33', objet: 'Assiette : montant TTC de l\'acompte ou du solde, diminué de la retenue de garantie.', href: `${LEGIFRANCE}/codes/section_lc/LEGITEXT000037701019/LEGISCTA000037725047/` },
  { ref: 'Art. D2192-35', objet: 'Montant de l\'indemnité forfaitaire pour frais de recouvrement : 40 €.', href: `${LEGIFRANCE}/codes/article_lc/LEGIARTI000037729645` },
  { ref: 'Art. R2192-36', objet: 'Versement des intérêts et de l\'indemnité dans les 45 jours suivant le paiement du principal.', href: `${LEGIFRANCE}/codes/article_lc/LEGIARTI000037729643` },
]

function buildFaq(tauxS2_2025: string): FaqItem[] {
  return [
    {
      q: 'Les intérêts moratoires sont-ils automatiques ?',
      a: 'Oui. Le retard de paiement fait courir les intérêts moratoires et l\'indemnité forfaitaire de 40 € de plein droit, sans formalité ni mise en demeure (article L2192-13 du Code de la commande publique). L\'acheteur doit les verser dans les 45 jours qui suivent le paiement du principal. Dans les faits, ils sont souvent oubliés : un courrier de réclamation chiffré reste le moyen le plus sûr de les obtenir.',
    },
    {
      q: 'Le délai de paiement peut-il être suspendu ?',
      a: 'Le Code parle d\'interruption. L\'acheteur peut interrompre le délai une seule fois, lorsque la demande de paiement ne comporte pas toutes les pièces et mentions prévues ou qu\'elles sont erronées ou incohérentes. Il doit vous notifier les motifs et les pièces à fournir par un moyen qui donne une date certaine. À réception des pièces, un nouveau délai s\'ouvre : 30 jours, ou le solde du délai initial s\'il est plus long (articles R2192-27 à R2192-30).',
    },
    {
      q: 'Comment réclamer les intérêts moratoires ?',
      a: 'Adressez un courrier au service ordonnateur de l\'acheteur, avec copie au comptable public, qui rappelle la date de réception de votre demande de paiement, la date de paiement, le taux applicable et le montant réclamé. Le générateur de cette page le rédige pour vous. Sans réponse, une mise en demeure puis un recours devant le tribunal administratif sont possibles. Pour l\'État, les collectivités et leurs établissements publics, la créance se prescrit par quatre ans à compter du 1er janvier qui suit l\'année du paiement.',
    },
    {
      q: 'Quid du sous-traitant en paiement direct ?',
      a: 'Le sous-traitant payé directement par l\'acheteur bénéficie des mêmes règles : même délai de paiement, mêmes intérêts moratoires et même indemnité de 40 €, à la charge de l\'acheteur. Le délai court à compter de la réception par l\'acheteur de sa demande de paiement acceptée par le titulaire, ou de l\'expiration du délai de 15 jours laissé au titulaire pour se prononcer.',
    },
    {
      q: 'Les intérêts moratoires se cumulent-ils avec les pénalités de retard ?',
      a: 'Oui, ce sont deux mécanismes indépendants : les pénalités sanctionnent l\'entreprise qui exécute en retard, les intérêts moratoires sanctionnent l\'acheteur qui paie en retard. Les pénalités appliquées réduisent le montant dû, et donc la base de calcul des intérêts, mais elles ne justifient pas à elles seules un paiement tardif.',
    },
    {
      q: 'Faut-il calculer les intérêts sur le HT ou le TTC ?',
      a: 'Sur le TTC. Les intérêts portent sur le montant de l\'acompte ou du solde toutes taxes comprises, diminué de la retenue de garantie, après application des clauses de révision ou d\'actualisation et des pénalités (article R2192-33).',
    },
    {
      q: 'Quel taux appliquer si le retard chevauche deux semestres ?',
      a: `Un seul taux pour tout le retard : celui du semestre au cours duquel les intérêts ont commencé à courir. Si la date limite de paiement était le 20 décembre 2025 et que le paiement intervient en mars 2026, tout le retard est calculé au taux du 2e semestre 2025, soit ${tauxS2_2025}.`,
    },
  ]
}

export default async function InteretsMoratoiresPage() {
  const changes = await getEcbRateChanges()
  const today = todayParis()
  const rates = semesterRates(changes, today)
  const dernier = lastRateChange(changes)
  const actuel = rates[rates.length - 1]

  const ex = EXEMPLE_MORATOIRES
  const exemple = calculerMoratoires({ delai: 30, ...ex }, rates)
  const s2_2025 = rates.find((r) => r.start === '2025-07-01')
  const faq = buildFaq(s2_2025 ? fmtPct(s2_2025.taux) : 'le taux BCE de juillet 2025 majoré de 8 points')

  return (
    <>
      <ToolJsonLd
        name={OUTIL.title}
        description={OUTIL.description}
        path={OUTIL.href}
        dateModified={UPDATED}
        faq={faq}
        author={{ name: AUTEUR.nom, url: AUTEUR.aProposHref }}
      />

      <ToolShell
        breadcrumb={[
          { name: 'Accueil', href: '/' },
          { name: 'Outils gratuits', href: '/outils' },
          { name: 'Intérêts moratoires', href: OUTIL.href },
        ]}
      >
        <MoratoiresCalculator
          rates={rates}
          intro={
            <ToolIntro
              title={<>Calcul des <Accent>intérêts moratoires</Accent> d'un marché public</>}
              promise="Un acheteur public vous a payé en retard ? Indiquez le montant et les dates : l'outil calcule le retard, le taux applicable, les intérêts et l'indemnité de 40 €, puis rédige le courrier de réclamation."
              checks={['Sans inscription', `Taux à jour : ${actuel ? fmtPct(actuel.taux) : 'BCE + 8 pts'}`, 'Courrier prêt à envoyer']}
            />
          }
        />
      </ToolShell>

      <ContentSection id="guide" eyebrow="Le guide" title="Intérêts moratoires : le calcul expliqué" muted>
        <GuidePart n={1} title="Comment ça marche">
          <p>
            Chaque demande de paiement (acompte, situation de travaux, solde) doit être réglée dans un délai maximal qui dépend
            de l'acheteur. Le délai court à compter de la réception de la demande par l'acheteur.
          </p>
          <DataTable
            caption="Délais de paiement selon l'acheteur"
            head={['Acheteur', 'Délai maximal', 'Référence']}
            rows={TYPES_ACHETEUR.map((t) => [t.label, `${t.delai} jours`, t.delai === 30 ? 'art. R2192-10' : 'art. R2192-11'])}
          />
          <p>
            Dès le lendemain de la date limite, les intérêts moratoires courent jusqu'au jour de la mise en paiement inclus. Ils se
            calculent au prorata des jours de retard :
          </p>
          <Formula legend="Intérêts simples, sur une base de 365 jours.">
            Intérêts = Montant TTC × Taux × Jours de retard / 365
          </Formula>
          <p>
            <strong className="text-gray-800">Le taux</strong> est celui des opérations principales de refinancement de la Banque
            centrale européenne en vigueur au 1er jour du semestre au cours duquel les intérêts ont commencé à courir, majoré de
            8 points. Il reste le même pour toute la durée du retard.
          </p>
          <p>
            <strong className="text-gray-800">Le montant</strong> est le montant TTC de l'acompte ou du solde, diminué de la retenue
            de garantie, après révision de prix et pénalités éventuelles.
          </p>
          <p>
            S'y ajoute une <strong className="text-gray-800">indemnité forfaitaire pour frais de recouvrement de {INDEMNITE_FORFAITAIRE} €</strong>{' '}
            par demande de paiement réglée en retard. Si vos frais réels de recouvrement sont plus élevés, une indemnisation
            complémentaire peut être demandée sur justificatifs.
          </p>
        </GuidePart>

        <GuidePart n={2} title="Exemple chiffré : une situation de travaux payée en retard">
          <p>
            Une entreprise de gros œuvre adresse sa situation de travaux n° 4 à une commune, qui la reçoit le{' '}
            {fmtDateLong(ex.dateReception)}. Montant : {fmtEur(ex.montant, 0)} TTC, retenue de garantie déduite. La commune dispose
            de 30 jours : la date limite de paiement est le {fmtDateLong(exemple.dateLimite)}.
          </p>
          <p>
            Le virement arrive le {fmtDateLong(ex.datePaiement)}, soit <strong className="text-gray-800">{exemple.joursRetard} jours de retard</strong>.
            Les intérêts ont commencé à courir le {fmtDateLong(exemple.departInterets)}, au {exemple.semestre?.label} : taux BCE au{' '}
            {exemple.semestre && fmtDateLong(exemple.semestre.start)} de {exemple.semestre && fmtPct(exemple.semestre.ecb)}, plus 8 points ={' '}
            <strong className="text-gray-800">{exemple.semestre && fmtPct(exemple.semestre.taux)}</strong>.
          </p>
          <DataTable
            caption="Calcul de l'exemple"
            head={['Poste', 'Calcul', 'Montant']}
            rows={[
              ['Intérêts moratoires', `${fmtEur(ex.montant, 0)} × ${exemple.semestre && fmtPct(exemple.semestre.taux)} × ${exemple.joursRetard} / 365`, fmtEur(exemple.interets)],
              ['Indemnité forfaitaire', 'art. D2192-35', fmtEur(exemple.indemnite)],
              [<strong key="t" className="text-gray-900">Total réclamable</strong>, '', <strong key="v" className="text-blue-600">{fmtEur(exemple.total)}</strong>],
            ]}
          />
          <p>
            Sur une année, avec plusieurs situations payées avec quelques semaines de retard, ces sommes représentent souvent
            plusieurs milliers d'euros qui ne sont jamais réclamés.
          </p>
        </GuidePart>

        <GuidePart n={3} title="Taux des intérêts moratoires depuis 2013">
          <p>
            Le taux applicable change au 1er janvier et au 1er juillet de chaque année, en fonction du dernier taux de
            refinancement fixé par la BCE. Le tableau est mis à jour automatiquement à partir des données de la BCE.
          </p>
          <DataTable
            caption="Taux des intérêts moratoires par semestre"
            head={['Semestre', 'Taux BCE au 1er jour', 'Taux des intérêts moratoires']}
            rows={[...rates].reverse().map((r) => [
              r.label,
              fmtPct(r.ecb),
              <strong key={r.start} className="text-gray-900">{fmtPct(r.taux)}</strong>,
            ])}
          />
        </GuidePart>

        <GuidePart n={4} title="Cadre juridique">
          <p>
            Les règles de délai de paiement et d'intérêts moratoires sont fixées par le Code de la commande publique. Le marché ne
            peut pas prévoir un délai de paiement plus long que le délai réglementaire.
          </p>
          <LegalRefs items={LEGAL} />
        </GuidePart>
      </ContentSection>

      <ContentSection id="faq" eyebrow="Questions fréquentes" title="Vos questions sur les intérêts moratoires">
        <Faq items={faq} />
      </ContentSection>

      <ToolFooter
        current={OUTIL.slug}
        updated={
          <UpdatedAt
            date={UPDATED}
            note={dernier ? `taux BCE vérifié chaque jour, dernière décision prise en compte : ${fmtPct(dernier.rate)} au ${fmtDate(dernier.date)}` : undefined}
            sources={[
              { label: 'Banque centrale européenne', href: 'https://data.ecb.europa.eu/data/datasets/FM/FM.B.U2.EUR.4F.KR.MRR_FR.LEV' },
              { label: 'Code de la commande publique (Légifrance)', href: `${LEGIFRANCE}/codes/texte_lc/LEGITEXT000037701019/` },
            ]}
          />
        }
      />
    </>
  )
}
