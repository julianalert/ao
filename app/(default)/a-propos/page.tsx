export const revalidate = 3600

import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { getAoStats } from '@/lib/getAppelsOffre'
import { getAllPosts } from '@/lib/blog/posts'
import { SITE_URL, analysisCtaHref, avecUtmVision } from '@/lib/blog/config'
import { INDICES } from '@/lib/indices-catalog'
import { OUTILS } from '@/lib/outils/catalog'
import { VISIONBTP_URL } from '@/lib/outils/author'
import { fmtDateLong, fmtNum } from '@/lib/format'
import { AboutPageJsonLd, type AboutFounder } from '@/components/json-ld'
import { Accent, Badge, Breadcrumb, ContentSection, Faq, type FaqItem } from '@/components/outils/sections'

const VALUE_PROP =
  "mon-ao.com est un annuaire gratuit des appels d'offres publics qui publie chaque jour les avis du BOAMP, classés par métier et par région, pour les TPE et PME du BTP qui répondent aux marchés publics."

export const metadata: Metadata = {
  title: { absolute: "À propos de mon-ao.com : l'annuaire gratuit des appels d'offres publics | mon-ao.com" },
  description:
    "Qui est derrière mon-ao.com, ce que fait l'annuaire, d'où viennent les appels d'offres, comment il fonctionne et ce qui le distingue des plateformes de veille payantes.",
  alternates: { canonical: '/a-propos' },
}

const utm = { medium: 'site', campaign: 'a-propos' }
const VISION_URL = avecUtmVision(VISIONBTP_URL, utm)
const CONTACT_URL = avecUtmVision(`${VISIONBTP_URL}/contact`, utm)
const EQUIPE_URL = avecUtmVision(`${VISIONBTP_URL}/equipe`, utm)
const ANALYSE_URL = analysisCtaHref('a-propos', 'a-propos')

const linkClass = 'font-medium text-blue-600 hover:underline'

// ─── Ce que fait mon-ao.com ───────────────────────────────────────────────────

const SERVICES: { title: string; href: string; cta: string; text: string }[] = [
  {
    title: "Annuaire des appels d'offres publics",
    href: '/travaux',
    cta: 'Voir les marchés de travaux',
    text:
      "Chaque matin, les nouveaux avis publiés au BOAMP sont importés et classés par type de marché (travaux, services, fournitures), par catégorie et par région. Chaque fiche reprend l'objet, l'acheteur, la procédure, la date limite et le lien vers l'avis officiel. Vous trouvez les marchés de votre métier et de votre zone en quelques clics.",
  },
  {
    title: 'Calculateur de révision de prix',
    href: '/outils/revision-de-prix',
    cta: 'Réviser un prix',
    text:
      "Montant initial, index BT ou TP, mois zéro et mois d'exécution : l'outil récupère les valeurs INSEE et calcule le coefficient, le prix révisé ou actualisé et l'écart. Il gère les formules à plusieurs index des CCAP.",
  },
  {
    title: "Calculateur d'intérêts moratoires",
    href: '/outils/interets-moratoires',
    cta: 'Calculer des intérêts',
    text:
      "Quand un acheteur public paie après le délai légal, l'outil calcule les intérêts dus et l'indemnité forfaitaire de 40 €. Il prépare aussi le courrier de réclamation, prêt à envoyer.",
  },
  {
    title: 'Simulateur de note prix',
    href: '/outils/note-prix',
    cta: 'Simuler une note',
    text:
      "Selon la méthode de notation de l'acheteur, il calcule votre note prix, votre note finale et votre classement. Il donne surtout le prix qui vous fait passer premier, et combien de points techniques compensent un écart de prix.",
  },
  {
    title: 'Analyseur de RC et DCE',
    href: '/outils/analyse-rc',
    cta: 'Analyser un RC',
    text:
      "Déposez le règlement de consultation : l'outil en tire les dates, les critères et leur pondération, les pièces à fournir et les points d'attention, avec la page source de chaque information. Trois analyses gratuites sans email.",
  },
  {
    title: 'Qui gagne quoi',
    href: '/qui-gagne-quoi',
    cta: 'Chercher un acheteur',
    text:
      "Les marchés publics attribués : qui a gagné, à quel montant et face à combien d'offres. Utile pour connaître ses concurrents et les habitudes d'un acheteur avant de répondre.",
  },
  {
    title: 'Seuils et pièces de candidature',
    href: '/seuils-marches-publics',
    cta: 'Voir les seuils',
    text:
      "Le tableau des seuils des marchés publics en vigueur, la procédure applicable selon le montant, et la checklist des pièces à fournir (DC1, DC2, DUME, attestations) avec leur durée de validité.",
  },
  {
    title: "Index BT et TP de l'INSEE",
    href: '/indices',
    cta: 'Consulter les index',
    text: `Dernière valeur, variation sur un an et historique depuis 2014 pour ${INDICES.length} index du bâtiment, des travaux publics et divers de la construction, mis à jour chaque mois. Chaque index a sa page et son graphique.`,
  },
  {
    title: 'Guides pratiques',
    href: '/blog',
    cta: 'Lire le blog',
    text:
      "Le blog répond à une question concrète par article : seuils 2026, dossier de réponse, mémoire technique, coût d'une réponse, veille. Chaque guide cite ses textes de référence et affiche sa date de mise à jour.",
  },
]

// ─── Ce qui distingue mon-ao.com ──────────────────────────────────────────────

const DIFFERENCES: { title: string; text: ReactNode }[] = [
  {
    title: 'Gratuit, sans inscription ni démo commerciale',
    text: (
      <>
        Annuaire, filtres, calculateurs et index sont accessibles sans créer de compte ni laisser votre e-mail ; seul l'analyseur
        de RC demande un e-mail au-delà de trois analyses gratuites. DoubleTrade ne publie pas
        ses tarifs et passe par une demande de démo ; Marchés Online réserve une partie de ses services à des formules payantes,
        dont un abonnement mensuel.
      </>
    ),
  },
  {
    title: 'Une page par métier et par région',
    text: (
      <>
        Le BOAMP reste la source officielle, mais il faut y construire sa recherche : mots-clés, descripteurs, départements. Sur
        mon-ao.com, chaque catégorie (<Link className={linkClass} href="/batiment">bâtiment</Link>,{' '}
        <Link className={linkClass} href="/gros-oeuvre">gros œuvre</Link>,{' '}
        <Link className={linkClass} href="/voirie-et-reseaux-divers">VRD</Link>…) et chaque région a sa page, mise à jour chaque
        jour.
      </>
    ),
  },
  {
    title: 'Une couverture annoncée honnêtement',
    text: (
      <>
        mon-ao.com reprend les avis du BOAMP : il a donc la même couverture que lui. Les MAPA publiés uniquement dans un journal
        d'annonces légales ou sur un profil d'acheteur n'y figurent pas, et nous préférons l'écrire plutôt que de promettre
        l'exhaustivité. Notre <Link className={linkClass} href="/blog/veille-appels-offres-gratuite-payante">comparatif des sources de veille</Link>{' '}
        explique comment compléter.
      </>
    ),
  },
  {
    title: 'Des outils pour exécuter le marché, pas seulement le trouver',
    text: (
      <>
        Les plateformes de veille s'arrêtent à l'annonce. mon-ao.com couvre aussi les calculs qui suivent, ceux que beaucoup
        d'entreprises font encore sur un tableur : révision de prix, intérêts moratoires, note prix. Les index INSEE sont à jour et
        les articles du Code de la commande publique sont cités.
      </>
    ),
  },
  {
    title: 'Construit par une équipe qui automatise les réponses',
    text: (
      <>
        mon-ao.com est conçu par des cofondateurs de vision, qui automatisent pour les entreprises du bâtiment la lecture des
        dossiers de consultation, la décision go / no-go et la préparation des réponses. Les outils et les guides du site viennent
        de ce travail de terrain, pas d'une veille généraliste.
      </>
    ),
  },
]

// ─── Qui utilise mon-ao.com ───────────────────────────────────────────────────

const USERS = [
  'Artisans et TPE du bâtiment de 1 à 10 personnes qui visent leurs premiers marchés publics.',
  "PME et entreprises générales du BTP de 10 à 150 salariés (gros œuvre, second œuvre, TCE) qui répondent régulièrement aux appels d'offres.",
  'Dirigeants, assistantes et conducteurs de travaux chargés de la veille et des dossiers de réponse.',
  'Entreprises titulaires de marchés publics qui révisent leurs prix ou réclament des intérêts moratoires.',
  'Économistes de la construction et bureaux d\'études qui suivent les index BT et TP.',
  'Entreprises de services et de fournitures qui parcourent les marchés de leur secteur.',
]

// ─── L'équipe ─────────────────────────────────────────────────────────────────

const TEAM: (AboutFounder & { role: string; bio: string; link?: { label: string; href: string } })[] = [
  {
    slug: 'julien',
    name: 'Julien',
    jobTitle: 'Cofondateur de vision, créateur de mon-ao.com',
    role: 'Cofondateur de vision · Produit et systèmes',
    image: '/blog/auteurs/julien.jpg',
    description: "Julien a construit mon-ao.com et ses outils, et rédige les guides du blog.",
    bio:
      "Julien a construit mon-ao.com : l'import quotidien des avis du BOAMP, le classement par métier et par région, et les outils de calcul. Il écrit aussi les guides du blog, à partir des textes officiels et des appels d'offres réellement publiés sur le site.",
    url: '/blog/auteur/julien',
    link: { label: 'Ses articles', href: '/blog/auteur/julien' },
  },
  {
    slug: 'clement',
    name: 'Clément',
    jobTitle: 'Cofondateur de vision',
    role: 'Cofondateur de vision · Marketing et croissance',
    image: `${VISIONBTP_URL}/team/clement.jpg`,
    description: "Clément oriente mon-ao.com vers les questions que se posent les entreprises du bâtiment sur les marchés publics.",
    bio:
      "Clément veille à ce que mon-ao.com réponde aux questions que se posent vraiment les entreprises du bâtiment : quels outils construire, quels guides écrire. Chez vision, il repère les tâches administratives qui ne devraient plus mobiliser personne.",
  },
]

// ─── Comment fonctionne mon-ao.com ────────────────────────────────────────────

const HOW: { title: string; text: ReactNode }[] = [
  {
    title: 'Mise à jour chaque matin',
    text: (
      <>
        Les nouveaux avis sont importés chaque jour depuis les données ouvertes du BOAMP, publiées par la DILA. Chaque fiche renvoie
        vers l'avis officiel sur boamp.fr, qui indique où télécharger le dossier et déposer l'offre.
      </>
    ),
  },
  {
    title: 'Aucun compte pour consulter',
    text: (
      <>
        Consultation, filtres et calculateurs fonctionnent sans inscription. Les montants saisis dans les calculateurs restent dans
        votre navigateur : ils ne sont ni envoyés ni conservés. Les documents déposés dans l'analyseur de RC sont supprimés dès la
        fin de l'analyse. Le détail est sur la page{' '}
        <Link className={linkClass} href="/confidentialite">Confidentialité et cookies</Link>.
      </>
    ),
  },
  {
    title: 'Index INSEE mis à jour chaque mois',
    text: (
      <>
        Les valeurs des index BT et TP sont reprises à chaque publication de l'INSEE, et le calculateur de révision de prix utilise
        toujours la dernière valeur disponible.
      </>
    ),
  },
  {
    title: 'Un contact direct avec les fondateurs',
    text: (
      <>
        Une question, une erreur dans un avis, un outil à suggérer : écrivez-nous via le{' '}
        <a className={linkClass} href={CONTACT_URL} target="_blank" rel="noopener">formulaire de contact de vision</a>. Pas de
        standard ni de support externalisé : Julien ou Clément vous répond sous un jour ouvré.
      </>
    ),
  },
  {
    title: 'Pour aller plus loin',
    text: (
      <>
        vision analyse gratuitement 3 appels d'offres en cours sur votre métier et votre zone, avec un avis go / no-go argumenté.
        Si vous voulez ensuite automatiser la lecture des dossiers et la préparation des réponses, la première automatisation est
        en production en 3 semaines en moyenne.
      </>
    ),
  },
]

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ: FaqItem[] = [
  {
    q: 'mon-ao.com est-il vraiment gratuit ?',
    a: "Oui. La consultation des appels d'offres, les filtres, les outils et les index sont gratuits et sans inscription. Le site est financé par vision, qui propose par ailleurs aux entreprises du bâtiment d'automatiser leurs réponses aux appels d'offres.",
  },
  {
    q: "D'où viennent les appels d'offres publiés sur mon-ao.com ?",
    a: "Du BOAMP, le Bulletin officiel des annonces des marchés publics, via les données ouvertes publiées par la DILA. Les nouveaux avis sont importés chaque matin, et chaque fiche renvoie vers l'avis officiel sur boamp.fr.",
  },
  {
    q: 'mon-ao.com recense-t-il tous les marchés publics ?',
    a: "Non. Il a la même couverture que le BOAMP : les MAPA publiés uniquement dans un journal d'annonces légales ou sur un profil d'acheteur, et les marchés passés sans publicité, n'y figurent pas. Notre comparatif des sources de veille explique comment compléter.",
  },
  {
    q: "Peut-on répondre à un appel d'offres depuis mon-ao.com ?",
    a: "Non. L'offre se dépose sur le profil d'acheteur indiqué dans l'avis officiel (PLACE, Maximilien, Mégalis ou la plateforme de l'acheteur), où se trouve aussi le dossier de consultation. mon-ao.com sert à trouver les marchés, et ses outils à préparer et défendre votre prix.",
  },
  {
    q: 'Quel est le lien entre mon-ao.com et vision ?',
    a: "mon-ao.com est édité par vision, l'agence d'automatisation IA dédiée aux entreprises du bâtiment, et construit par deux de ses cofondateurs, Julien et Clément. L'annuaire reste gratuit ; vision accompagne les entreprises qui veulent aller plus loin, de l'analyse des dossiers à la préparation des réponses.",
  },
  {
    q: 'mon-ao.com envoie-t-il des alertes par e-mail ?',
    a: "Pas pour l'instant. Les alertes du BOAMP sont gratuites et suffisent pour démarrer. Pour une veille qui lit aussi les dossiers et classe chaque appel d'offres go / no-go, c'est le rôle de l'application vision.",
  },
  {
    q: 'Comment signaler une erreur ou poser une question ?',
    a: "Écrivez-nous via le formulaire de contact de vision : Julien ou Clément vous répond sous un jour ouvré. Pour une erreur dans un avis, indiquez le lien de la fiche concernée.",
  },
]

// ─── Composants locaux ────────────────────────────────────────────────────────

function H3Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-8 first:mt-0">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{children}</p>
    </div>
  )
}

function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 px-5 py-3.5 sm:grid-cols-[11rem_1fr] sm:gap-6">
      <dt className="text-sm font-semibold text-gray-900">{term}</dt>
      <dd className="text-sm text-gray-600 leading-relaxed">{children}</dd>
    </div>
  )
}

export default async function AProposPage() {
  const stats = await getAoStats()
  const posts = getAllPosts()
  const today = new Date().toISOString()

  const chiffres = [
    stats.total > 0 && { value: fmtNum(stats.total, 0), label: "appels d'offres référencés" },
    stats.open > 0 && { value: fmtNum(stats.open, 0), label: 'appels d\'offres en cours' },
    { value: String(INDICES.length), label: 'index BT et TP suivis' },
    { value: '0 €', label: 'sans inscription' },
  ].filter((c): c is { value: string; label: string } => !!c)

  return (
    <>
      <AboutPageJsonLd
        description={VALUE_PROP}
        foundingDate="2026"
        founders={TEAM.map(({ slug, name, jobTitle, description, image, url }) => ({
          slug,
          name,
          jobTitle,
          description,
          image: image.startsWith('/') ? `${SITE_URL}${image}` : image,
          url: url && `${SITE_URL}${url}`,
        }))}
        parent={{
          name: 'vision',
          url: VISIONBTP_URL,
          description: "Agence d'automatisation IA dédiée aux entreprises du bâtiment.",
        }}
        faq={FAQ}
      />

      {/* Hero : proposition de valeur */}
      <section className="relative">
        <div className="absolute inset-x-0 top-0 h-[32rem] bg-linear-to-b from-blue-100 to-white pointer-events-none -z-10" aria-hidden="true" />
        <div className="max-w-screen-xl mx-auto px-6 sm:px-8">
          <div className="pt-28 md:pt-36 pb-6">
            <Breadcrumb items={[{ name: 'Accueil', href: '/' }, { name: 'À propos', href: '/a-propos' }]} />
            <div className="max-w-3xl mx-auto text-center">
              <div className="mb-5"><Badge>À propos</Badge></div>
              <h1 className="h1 font-inter tracking-tight text-gray-900 mb-6">
                À propos de <Accent>mon-ao.com</Accent>
              </h1>
              <p className="text-xl text-gray-700 leading-relaxed mb-4">{VALUE_PROP}</p>
              <p className="text-lg text-gray-500">
                Le site est conçu et maintenu par Julien et Clément, cofondateurs de{' '}
                <a className={linkClass} href={VISION_URL} target="_blank" rel="noopener">vision</a>, l'agence qui automatise la
                réponse aux appels d'offres des entreprises du bâtiment.
              </p>
            </div>
            <dl className="max-w-4xl mx-auto mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
              {chiffres.map((c) => (
                <div key={c.label} className="flex flex-col-reverse rounded-2xl border border-gray-200 bg-white px-4 py-4 text-center shadow-xs">
                  <dt className="text-xs text-gray-500 mt-1">{c.label}</dt>
                  <dd className="text-2xl md:text-3xl font-extrabold text-gray-900">{c.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <ContentSection id="ce-que-fait-mon-ao" title="Ce que fait mon-ao.com">
        <div className="grid gap-4 sm:grid-cols-2">
          {SERVICES.map((s) => (
            <div key={s.title} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{s.text}</p>
              <Link href={s.href} className="mt-auto text-sm font-medium text-blue-600 hover:underline">{s.cta} →</Link>
            </div>
          ))}
        </div>
      </ContentSection>

      <ContentSection id="difference" title="Ce qui distingue mon-ao.com" muted>
        {DIFFERENCES.map((d) => <H3Block key={d.title} title={d.title}>{d.text}</H3Block>)}
      </ContentSection>

      <ContentSection id="utilisateurs" title="Qui utilise mon-ao.com">
        <ul className="space-y-3">
          {USERS.map((u) => (
            <li key={u} className="flex gap-3 text-gray-600 leading-relaxed">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" aria-hidden="true" />
              {u}
            </li>
          ))}
        </ul>
      </ContentSection>

      <ContentSection id="equipe" title="L'équipe derrière mon-ao.com" muted>
        <div className="space-y-4 text-gray-600 leading-relaxed mb-8">
          <p>
            mon-ao.com est né chez vision, l'agence d'automatisation IA dédiée aux entreprises du bâtiment, fondée en 2025 dans le
            Var. Pour automatiser la réponse aux appels d'offres de ses clients, l'équipe avait besoin chaque matin d'une base propre
            et classée des avis du BOAMP. En 2026, elle a choisi de l'ouvrir gratuitement à toutes les entreprises : c'est
            mon-ao.com.
          </p>
          <p>
            Pas de rédaction externe ni de support sous-traité : ce sont les mêmes personnes qui construisent les outils, écrivent
            les guides et répondent à vos messages.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {TEAM.map((m) => (
            <div key={m.slug} id={m.slug} className="scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-4 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.image}
                  alt={`Photo de ${m.name}`}
                  width={64}
                  height={64}
                  loading="lazy"
                  className="h-16 w-16 shrink-0 rounded-full object-cover bg-blue-100"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{m.name}</h3>
                  <p className="text-sm font-medium text-blue-600">{m.role}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{m.bio}</p>
              {m.link && (
                <Link href={m.link.href} className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline">
                  {m.link.label} →
                </Link>
              )}
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-gray-500">
          Pour en savoir plus sur vision et son équipe :{' '}
          <a className={linkClass} href={EQUIPE_URL} target="_blank" rel="noopener">visionbtp.com/equipe</a>
        </p>
      </ContentSection>

      <ContentSection id="fonctionnement" title="Comment fonctionne mon-ao.com">
        {HOW.map((h) => <H3Block key={h.title} title={h.title}>{h.text}</H3Block>)}
        <a href={ANALYSE_URL} target="_blank" rel="noopener" className="btn mt-8 text-white bg-blue-500 hover:bg-blue-600">
          Faire analyser 3 AO gratuitement →
        </a>
      </ContentSection>

      <ContentSection id="informations-cles" title="mon-ao.com en bref" muted>
        <dl className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <Fact term="Nom">mon-ao.com</Fact>
          <Fact term="Type">Annuaire gratuit des appels d'offres publics et outils pour les marchés publics</Fact>
          <Fact term="Création">2026</Fact>
          <Fact term="Fondateurs">Julien et Clément, cofondateurs de vision</Fact>
          <Fact term="Éditeur">
            vision (<a className={linkClass} href={VISION_URL} target="_blank" rel="noopener">visionbtp.com</a>), agence
            d'automatisation IA dédiée aux entreprises du bâtiment
          </Fact>
          <Fact term="Siège">Var (83), France</Fact>
          <Fact term="Site web"><Link className={linkClass} href="/">mon-ao.com</Link></Fact>
          <Fact term="Offre principale">Annuaire des avis du BOAMP classés par type de marché, catégorie et région</Fact>
          <Fact term="Prix">Gratuit</Fact>
          <Fact term="Conditions">Sans inscription, sans engagement, sans carte bancaire</Fact>
          <Fact term="Services">
            Annuaire des appels d'offres
            {OUTILS.map((o) => (
              <span key={o.slug}>, <Link className={linkClass} href={o.href}>{o.title.toLowerCase()}</Link></span>
            ))}
            , <Link className={linkClass} href="/indices">index BT et TP</Link>, <Link className={linkClass} href="/blog">guides pratiques</Link>
          </Fact>
          <Fact term="Sources des données">BOAMP (données ouvertes de la DILA) pour les avis, INSEE pour les index</Fact>
          <Fact term="Mise à jour">Avis : chaque jour. Index BT et TP : chaque mois</Fact>
          <Fact term="Contact">
            <a className={linkClass} href={CONTACT_URL} target="_blank" rel="noopener">Formulaire de contact de vision</a>, réponse
            sous un jour ouvré
          </Fact>
          <Fact term="Public">TPE et PME du BTP, artisans, entreprises générales, conducteurs de travaux, économistes de la construction</Fact>
          {stats.total > 0 && (
            <Fact term="Appels d'offres référencés">
              {fmtNum(stats.total, 0)}, dont {fmtNum(stats.open, 0)} en cours (au {fmtDateLong(today)})
            </Fact>
          )}
          <Fact term="Index suivis">{INDICES.length} index BT, TP et divers de la construction, historique depuis 2014</Fact>
          <Fact term="Guides publiés">{posts.length} articles sur le blog</Fact>
          <Fact term="Alternatives">BOAMP, Marchés Online, DoubleTrade, profils d'acheteurs (PLACE, Maximilien, Mégalis)</Fact>
          <Fact term="Équipe">
            <a className={linkClass} href={EQUIPE_URL} target="_blank" rel="noopener">visionbtp.com/equipe</a>
          </Fact>
        </dl>
      </ContentSection>

      <ContentSection id="faq" title="Questions fréquentes">
        <Faq items={FAQ} questionsAsH3 />
      </ContentSection>

      <section>
        <div className="max-w-5xl mx-auto px-6 sm:px-8 pb-16 md:pb-20">
          <div className="rounded-3xl bg-blue-500 px-6 py-10 md:px-12 md:py-12 text-white text-center">
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">Trouvez votre prochain marché public</h2>
            <p className="text-blue-100 mb-6 max-w-xl mx-auto">
              Les avis du BOAMP de votre métier et de votre région, mis à jour ce matin.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/travaux" className="btn bg-white text-blue-600 hover:bg-blue-50">Marchés de travaux →</Link>
              <Link href="/outils" className="btn text-white border border-white/40 hover:bg-white/10">Outils gratuits</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
