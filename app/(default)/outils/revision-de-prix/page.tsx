export const revalidate = 86400

import type { Metadata } from 'next'
import Link from 'next/link'
import { getIndiceByCode, indiceHref } from '@/lib/indices-catalog'
import { getAllIndicesLatest, getIndiceSerie, lastObs, variation } from '@/lib/indices'
import { calculerActualisation, calculerRevision, PARTIE_FIXE_DEFAUT, valeurIndice } from '@/lib/outils/revision'
import { getOutil } from '@/lib/outils/catalog'
import { AUTEUR } from '@/lib/outils/author'
import { addMonths, fmtDate, fmtEur, fmtMonth, fmtNum, fmtPct, todayParis } from '@/lib/format'
import { ToolJsonLd } from '@/components/json-ld'
import {
  Accent, ContentSection, DataTable, Faq, Formula, GuidePart, LegalRefs, ToolFooter, ToolIntro, ToolShell, UpdatedAt,
  type FaqItem, type LegalRef,
} from '@/components/outils/sections'
import RevisionCalculator from './calculator'

const OUTIL = getOutil('revision-de-prix')
const UPDATED = '2026-10-20'
const LEGIFRANCE = 'https://www.legifrance.gouv.fr'

export const metadata: Metadata = {
  title: { absolute: 'Calcul de révision de prix d\'un marché public avec les index BT et TP (gratuit) | mon-ao.com' },
  description:
    'Calculez le prix révisé ou actualisé de votre marché public avec les index BT01, BT et TP de l\'INSEE, mis à jour chaque mois : coefficient, montant révisé, formule multi-index et situations mensuelles.',
  alternates: { canonical: OUTIL.href },
}

const LEGAL: LegalRef[] = [
  { ref: 'Art. R2112-9 à 12', objet: 'Prix fermes : définition et conditions d\'actualisation.', href: `${LEGIFRANCE}/codes/id/LEGISCTA000037730971/` },
  { ref: 'Art. R2112-10', objet: 'Un marché de travaux à prix ferme doit prévoir les modalités d\'actualisation de son prix.', href: `${LEGIFRANCE}/codes/article_lc/LEGIARTI000037730967` },
  { ref: 'Art. R2112-11', objet: 'Actualisation si plus de 3 mois séparent la remise du prix et le début d\'exécution, aux conditions économiques de d − 3 mois.', href: `${LEGIFRANCE}/codes/id/LEGISCTA000037730971/` },
  { ref: 'Art. R2112-13', objet: 'Prix révisables : date du prix initial, modalités et périodicité de la révision, formule pouvant inclure un terme fixe.', href: `${LEGIFRANCE}/codes/article_lc/LEGIARTI000037955789` },
  { ref: 'Art. R2112-14', objet: 'Clause de révision obligatoire si le marché dure plus de 3 mois et dépend de matières premières cotées.', href: `${LEGIFRANCE}/codes/article_lc/LEGIARTI000037730955` },
]

const FAQ: FaqItem[] = [
  {
    q: 'Quelle est la différence entre révision et actualisation ?',
    a: 'L\'actualisation concerne les prix fermes : le prix est ajusté une seule fois, si plus de trois mois séparent le mois d\'établissement du prix (mois zéro) et le début d\'exécution, avec l\'index du mois d − 3. La révision concerne les prix révisables : le prix évolue pendant toute l\'exécution, en général chaque mois, selon une formule prévue par le marché et les index du mois de réalisation des prestations.',
  },
  {
    q: 'Qu\'est-ce que le mois zéro ?',
    a: 'Le mois zéro (Mo) est le mois d\'établissement des prix, celui auquel correspondent les conditions économiques de votre offre. Il est fixé par le marché, le plus souvent au mois de la date limite de remise des offres. C\'est la valeur de l\'index de ce mois, I₀, qui sert de base à toutes les révisions.',
  },
  {
    q: 'Que faire si l\'index n\'est pas encore publié ?',
    a: 'Les index BT et TP paraissent au Journal officiel environ deux mois et demi après le mois concerné. En attendant, le marché prévoit généralement un paiement provisoire calculé avec le dernier index connu, puis une régularisation dès la publication de l\'index du mois. Le calculateur applique ce principe et signale les valeurs provisoires.',
  },
  {
    q: 'La révision de prix est-elle obligatoire ?',
    a: 'Le marché doit être conclu à prix révisable lorsque les parties sont exposées à des aléas majeurs liés à l\'évolution prévisible des conditions économiques pendant l\'exécution (article R2112-13). Elle est obligatoire pour les marchés de plus de trois mois qui reposent sur une part importante de matières premières dont le prix dépend des cours mondiaux (article R2112-14). Pour un marché de travaux à prix ferme, l\'actualisation doit être prévue (articles R2112-10 et R2112-11).',
  },
  {
    q: 'Quelle partie fixe minimale ?',
    a: 'Aucune : le Code de la commande publique permet à la formule d\'inclure un terme fixe sans l\'imposer. La valeur 0,125 (12,5 %) est un usage ancien, encore fréquent dans les CCAP. Une partie fixe élevée réduit l\'effet de la révision : avec 0,125, une hausse de 10 % de l\'index ne revalorise le prix que de 8,75 %. C\'est le CCAP de votre marché qui fait foi.',
  },
  {
    q: 'Comment réviser les situations de travaux ?',
    a: 'Chaque situation mensuelle est révisée avec l\'index du mois au cours duquel les travaux ont été exécutés, et non celui du mois de facturation. Activez l\'option « Réviser des situations de travaux mois par mois » du calculateur : il applique le bon index à chaque mois et totalise la révision.',
  },
]

const INDICES_PHARES = ['BT01', 'BT50', 'BT03', 'BT06', 'BT47', 'TP01', 'TP02', 'TP08']

export default async function RevisionDePrixPage() {
  const bt01 = getIndiceByCode('BT01')!
  const [serie, latest] = await Promise.all([getIndiceSerie(bt01), getAllIndicesLatest()])
  const dernier = lastObs(serie)
  const dernierMois = dernier?.p ?? addMonths(todayParis().slice(0, 7), -3)
  const defaults = { mois0: addMonths(dernierMois, -12), moisM: dernierMois, dernierMois }

  // Exemple chiffré calculé sur les dernières valeurs publiées
  const P0 = 250000
  const valeur = (c: string, m: string) => valeurIndice(c, serie?.obs, m)
  const ex = calculerRevision(P0, PARTIE_FIXE_DEFAUT, [{ code: 'BT01', poids: 1 - PARTIE_FIXE_DEFAUT }], defaults.mois0, defaults.moisM, valeur)
  const exI0 = ex.valeurs[0]?.i0
  const exIm = ex.valeurs[0]?.im
  const actuMo = addMonths(dernierMois, -8)
  const actuDebut = addMonths(dernierMois, 3)
  const actu = calculerActualisation(P0, 'BT01', actuMo, actuDebut, valeur)

  const phares = INDICES_PHARES.map((c) => latest.get(c)).filter((s) => !!s)

  return (
    <>
      <ToolJsonLd
        name={OUTIL.title}
        description={OUTIL.description}
        path={OUTIL.href}
        dateModified={serie?.lastUpdate ?? UPDATED}
        faq={FAQ}
        author={{ name: AUTEUR.nom, url: AUTEUR.aProposHref }}
      />

      <ToolShell
        breadcrumb={[
          { name: 'Accueil', href: '/' },
          { name: 'Outils gratuits', href: '/outils' },
          { name: 'Révision de prix', href: OUTIL.href },
        ]}
      >
        <RevisionCalculator
          initial={serie}
          defaults={defaults}
          intro={
            <ToolIntro
              title={<>Calcul de <Accent>révision de prix</Accent> d'un marché public</>}
              promise="Montant initial, index BT ou TP, mois zéro et mois d'exécution : l'outil récupère les valeurs INSEE et calcule le coefficient, le prix révisé ou actualisé et l'écart."
              checks={['Sans inscription', `Index à jour : ${dernier ? fmtMonth(dernier.p) : 'INSEE'}`, 'Formule multi-index']}
            />
          }
        />
      </ToolShell>

      <ContentSection id="guide" eyebrow="Le guide" title="Révision de prix : le calcul expliqué" muted>
        <GuidePart n={1} title="Comment ça marche">
          <p>
            <strong className="text-gray-800">Prix révisables.</strong> Le prix suit l'évolution d'un ou plusieurs index entre le mois
            zéro et le mois d'exécution des prestations, selon la formule du CCAP :
          </p>
          <Formula legend="a : partie fixe (souvent 0,125) · b = 1 − a : partie variable · I₀ : index du mois zéro · Iₘ : index du mois d'exécution">
            P = P₀ × (a + b × Iₘ / I₀)
          </Formula>
          <p>
            Beaucoup de marchés utilisent une formule paramétrique qui combine plusieurs index, chacun pondéré selon le poids du
            poste dans le coût de l'ouvrage, par exemple pour un lot menuiseries vitrées :
          </p>
          <Formula legend="La partie fixe et les coefficients totalisent 1.">
            P = P₀ × (0,15 + 0,50 × BT01ₘ / BT01₀ + 0,35 × BT45ₘ / BT45₀)
          </Formula>
          <p>
            <strong className="text-gray-800">Prix fermes.</strong> Le prix est actualisé une seule fois si l'exécution démarre plus de
            trois mois après le mois zéro, avec l'index du mois d − 3, d étant le mois de début d'exécution :
          </p>
          <Formula>P = P₀ × I(d − 3) / I₀</Formula>
        </GuidePart>

        {exI0?.valeur && exIm?.valeur && ex.coefficient && ex.montant !== null && (
          <GuidePart n={2} title="Exemple chiffré avec les derniers index publiés">
            <p>
              Une entreprise est titulaire d'un marché de réhabilitation de {fmtEur(P0, 0)} HT, à prix révisables sur l'index BT01
              avec une partie fixe de 0,125. Le mois zéro est {fmtMonth(defaults.mois0)} : BT01 valait alors{' '}
              <strong className="text-gray-800">{fmtNum(exI0.valeur, 1)}</strong>. Pour les travaux exécutés en{' '}
              {fmtMonth(defaults.moisM)}, BT01 vaut <strong className="text-gray-800">{fmtNum(exIm.valeur, 1)}</strong>
              {exIm.jo && <> (publié au JO le {fmtDate(exIm.jo)})</>}.
            </p>
            <DataTable
              caption="Calcul de l'exemple de révision"
              head={['Étape', 'Calcul', 'Résultat']}
              rows={[
                ['Coefficient', `0,125 + 0,875 × ${fmtNum(exIm.valeur, 1)} / ${fmtNum(exI0.valeur, 1)}`, fmtNum(ex.coefficient, 4, 4)],
                ['Montant révisé', `${fmtEur(P0, 0)} × ${fmtNum(ex.coefficient, 4, 4)}`, <strong key="m" className="text-blue-600">{fmtEur(ex.montant)}</strong>],
                ['Écart', '', `${fmtEur(ex.ecart ?? 0)} (${fmtPct(ex.ecartPct ?? 0, 2, true)})`],
              ]}
            />
            {actu.applicable && actu.coefficient && actu.montant !== null && (
              <p>
                À prix ferme, le même marché dont le prix a été établi en {fmtMonth(actuMo)} et dont les travaux démarrent en{' '}
                {fmtMonth(actuDebut)} serait actualisé avec BT01 de {fmtMonth(actu.moisReference)}
                {actu.id3.statut === 'non-publie' && <> (non publié à ce jour : la dernière valeur connue sert de base provisoire)</>}
                {' '}: coefficient {fmtNum(actu.coefficient, 4, 4)}, soit {fmtEur(actu.montant)} HT.
              </p>
            )}
            <p>Cet exemple est recalculé automatiquement à chaque publication d'index par l'INSEE.</p>
          </GuidePart>
        )}

        <GuidePart n={3} title="Les index BT et TP de l'INSEE">
          <p>
            L'INSEE publie chaque mois plus de 80 index du bâtiment (BT), des travaux publics (TP) et divers de la
            construction, en base 2010. Ils paraissent au Journal officiel environ deux mois et demi après le mois concerné. Les
            séries en base 2010 démarrent en octobre 2014 : pour un mois zéro antérieur, la valeur de l'ancienne base doit être
            convertie avec le coefficient de raccordement publié par l'INSEE, puis saisie manuellement dans le calculateur.
          </p>
          {phares.length > 0 && (
            <DataTable
              caption="Dernières valeurs des principaux index"
              head={['Index', 'Dernière valeur', 'Sur 12 mois']}
              rows={phares.map((s) => {
                const last = lastObs(s)!
                const v12 = variation(s, 12)
                return [
                  <Link key={s.code} href={indiceHref(s.code)} className="font-medium text-blue-600 hover:underline">{s.code} · {s.label}</Link>,
                  `${fmtNum(last.v, 1)} (${fmtMonth(last.p)})`,
                  v12 === null ? '—' : fmtPct(v12, 1, true),
                ]
              })}
            />
          )}
          <p>
            <Link href="/indices" className="font-medium text-blue-600 hover:underline">Consulter tous les index BT et TP →</Link>
          </p>
        </GuidePart>

        <GuidePart n={4} title="Cadre juridique">
          <p>
            Le Code de la commande publique distingue les prix fermes, actualisables, et les prix révisables. Le marché fixe la
            formule, la date du prix initial et la périodicité de la révision ; le calculateur applique la formule que vous lui
            indiquez.
          </p>
          <LegalRefs items={LEGAL} />
        </GuidePart>
      </ContentSection>

      <ContentSection id="faq" eyebrow="Questions fréquentes" title="Vos questions sur la révision de prix">
        <Faq items={FAQ} />
      </ContentSection>

      <ToolFooter
        current={OUTIL.slug}
        updated={
          <UpdatedAt
            date={UPDATED}
            note={serie?.lastUpdate ? `index INSEE synchronisés chaque jour, dernière publication le ${fmtDate(serie.lastUpdate)}` : undefined}
            sources={[
              { label: 'INSEE, index BT et TP', href: 'https://www.insee.fr/fr/statistiques/serie/001710986' },
              { label: 'Code de la commande publique (Légifrance)', href: `${LEGIFRANCE}/codes/texte_lc/LEGITEXT000037701019/` },
            ]}
          />
        }
      />
    </>
  )
}
