import type { Metadata } from 'next'
import { getOutil } from '@/lib/outils/catalog'
import { AUTEUR } from '@/lib/outils/author'
import { ANALYSES_GRATUITES } from '@/lib/analyse-rc/quota'
import { ToolJsonLd } from '@/components/json-ld'
import {
  Accent, ContentSection, DataTable, Faq, GuidePart, LegalRefs, ToolFooter, ToolIntro, ToolShell, UpdatedAt,
  type FaqItem, type LegalRef,
} from '@/components/outils/sections'
import Analyseur from './analyseur'

const OUTIL = getOutil('analyse-rc')
const UPDATED = '2026-10-20'
const CCP = 'https://www.code-commande-publique.com'

export const metadata: Metadata = {
  title: { absolute: 'Analyse de règlement de consultation et de DCE par IA (gratuit) | mon-ao.com' },
  description:
    'Déposez le RC ou le DCE d\'un appel d\'offres : dates, lots, critères et pondérations, pièces exigées, conditions et points d\'attention en moins de 2 minutes, avec la page source de chaque information.',
  alternates: { canonical: OUTIL.href },
}

const LEGAL: LegalRef[] = [
  { ref: 'Art. R2132-2', objet: 'Documents de la consultation gratuits et en ligne sur le profil d\'acheteur.', href: `${CCP}/article-r2132-2` },
  { ref: 'Art. R2152-11 et 12', objet: 'Les critères d\'attribution et leur pondération figurent dans les documents de la consultation.', href: 'https://www.legifrance.gouv.fr/codes/id/LEGISCTA000037730475' },
  { ref: 'Art. R2152-7', objet: 'Critères d\'attribution liés à l\'objet du marché.', href: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037730485' },
  { ref: 'Art. R2142-7', objet: 'Chiffre d\'affaires minimum exigible plafonné à 1,5 fois le montant estimé.', href: `${CCP}/article-r2142-7/` },
]

const FAQ: FaqItem[] = [
  {
    q: 'Mes documents sont-ils conservés ?',
    a: 'Non. Le fichier est déposé dans un espace de stockage temporaire, lu, puis supprimé dès la fin de l\'analyse ; un nettoyage automatique efface aussi les fichiers d\'une analyse interrompue. Le texte est transmis à Anthropic, notre fournisseur d\'intelligence artificielle, pour produire la fiche, sans être utilisé pour entraîner ses modèles. La fiche s\'affiche dans votre navigateur et n\'est pas enregistrée.',
  },
  {
    q: 'L\'analyse remplace-t-elle une lecture complète du DCE ?',
    a: 'Non. Elle vous fait gagner le premier tri : décider en quelques minutes si le marché vaut une réponse, repérer les dates et les pièces, et savoir où regarder. Avant de remettre une offre, lisez le RC, le CCAP et le CCTP en entier : chaque information de la fiche renvoie à sa page pour aller vite au bon endroit.',
  },
  {
    q: 'Quels formats sont acceptés ?',
    a: 'Les PDF (y compris scannés), les DOCX et les archives ZIP du DCE complet, jusqu\'à 60 Mo. Dans un ZIP, l\'outil lit en priorité le RC, l\'acte d\'engagement et le CCAP, puis la décomposition du prix et le CCTP. Les tableurs et les plans ne sont pas analysés.',
  },
  {
    q: 'Que faire si une information est manquante ?',
    a: 'Une information absente de la fiche n\'a pas été trouvée dans les documents, ou son extrait n\'a pas pu être retrouvé mot pour mot : l\'outil préfère un champ vide à une information inventée. Vérifiez dans le document concerné, et si elle n\'y figure pas, posez la question à l\'acheteur via la plateforme de dématérialisation avant la date limite des questions.',
  },
  {
    q: 'Combien d\'analyses puis-je faire gratuitement ?',
    a: `${ANALYSES_GRATUITES} analyses sans laisser d'email, puis l'outil reste gratuit avec votre adresse email.`,
  },
]

export default function AnalyseRcPage() {
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
          { name: 'Analyse de RC et DCE', href: OUTIL.href },
        ]}
      >
        <Analyseur
          intro={
            <ToolIntro
              title={<>Analysez un <Accent>règlement de consultation</Accent> en 2 minutes</>}
              promise="Déposez le RC ou le DCE complet : l'outil en tire une fiche de synthèse (dates, lots, critères, pièces, conditions, points d'attention) où chaque information renvoie à sa page dans le document."
              checks={[`${ANALYSES_GRATUITES} analyses sans email`, 'Source de chaque information', 'Fichiers supprimés après analyse']}
            />
          }
        />
      </ToolShell>

      <ContentSection id="guide" eyebrow="Le guide" title="Ce que l'analyse lit, et comment elle se vérifie" muted>
        <GuidePart n={1} title="Comment ça marche">
          <p>
            L'outil extrait le texte de chaque document, page par page (les PDF scannés sont lus comme des images), puis un modèle
            d'intelligence artificielle remplit une fiche de synthèse en sept blocs. Pour chaque information, il doit citer un extrait
            recopié mot pour mot, avec le document et la page.
          </p>
          <p>
            Avant affichage, chaque extrait est recherché dans le texte des documents. S'il n'y figure pas, l'information est retirée
            de la fiche : un champ vide vaut mieux qu'une date ou un critère inventés. Pour un PDF scanné, cette vérification
            automatique n'est pas possible et la source est marquée « à vérifier ».
          </p>
          <DataTable
            caption="Contenu de la fiche"
            head={['Bloc', 'Ce qui est extrait']}
            rows={[
              ['Identité', 'Acheteur, objet, référence, procédure, montant estimé si indiqué'],
              ['Calendrier', 'Date limite de remise, visite, démarrage, durée, validité des offres'],
              ['Lots', 'Liste, montants, possibilité de répondre à plusieurs lots'],
              ['Critères', 'Critères, pondérations, sous-critères, méthode de notation du prix'],
              ['Pièces exigées', 'Candidature et offre, en liste à cocher'],
              ['Conditions', 'Visite obligatoire, variantes, PSE, groupement, sous-traitance, avance, retenue de garantie, pénalités'],
              ['Points d\'attention', 'Clauses inhabituelles, pénalités élevées, délais courts, incohérences entre RC et CCAP'],
            ]}
          />
        </GuidePart>

        <GuidePart n={2} title="Exemple type : un RC de lot gros œuvre">
          <p>
            Sur un règlement de consultation de 18 pages pour la construction d'un groupe scolaire, la fiche fait typiquement ressortir
            en tête des points d'attention une visite obligatoire avec attestation à joindre sous peine d'irrecevabilité, un critère
            « valeur technique » à 60 % découpé en trois sous-critères, et une exigence de qualification à vérifier. Le bouton
            « Simuler ma note prix » ouvre ensuite le simulateur avec la méthode de notation du RC, et la checklist des pièces s'ouvre
            pré-remplie avec les pièces exigées.
          </p>
          <p className="text-sm text-gray-500">Exemple illustratif, sans reprise d'un dossier réel.</p>
        </GuidePart>

        <GuidePart n={3} title="Cadre juridique et confidentialité">
          <p>
            Le règlement de la consultation fixe les règles de la procédure : critères et pondérations, pièces à remettre, date limite.
            L'acheteur doit s'y tenir, d'où l'intérêt de le lire avec méthode. Les fichiers déposés sont supprimés dès la fin de
            l'analyse et ne servent qu'à produire votre fiche.
          </p>
          <LegalRefs items={LEGAL} />
        </GuidePart>
      </ContentSection>

      <ContentSection id="faq" eyebrow="Questions fréquentes" title="Vos questions sur l'analyse de RC">
        <Faq items={FAQ} />
      </ContentSection>

      <ToolFooter
        current={OUTIL.slug}
        updated={
          <UpdatedAt
            date={UPDATED}
            note="analyse par intelligence artificielle, sources vérifiées automatiquement"
            sources={[{ label: 'Code de la commande publique (Légifrance)', href: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000037701019/' }]}
          />
        }
      />
    </>
  )
}
