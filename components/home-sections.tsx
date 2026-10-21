import Link from 'next/link'
import { OUTILS } from '@/lib/outils/catalog'
import { getAllPosts } from '@/lib/blog/posts'
import { analysisCtaHref } from '@/lib/blog/config'
import { ToolCard } from '@/components/outils/sections'
import { PostCard } from '@/components/blog/ui'

const ETAPES: { titre: string; texte: string; href: string; cta: string }[] = [
  {
    titre: 'Trouvez',
    texte:
      "Chaque matin, les nouveaux avis du BOAMP sont classés par métier et par région. Chaque fiche donne l'acheteur, le montant estimé, les critères et les lots.",
    href: '/travaux',
    cta: "Voir les appels d'offres de travaux",
  },
  {
    titre: 'Analysez',
    texte:
      "Déposez le règlement de consultation : dates, critères et pondérations, pièces à fournir et points d'attention, avec la page source de chaque information.",
    href: '/outils/analyse-rc',
    cta: 'Analyser un RC',
  },
  {
    titre: 'Décidez et chiffrez',
    texte:
      "Grille go / no-go, simulateur de note prix, checklist des pièces : vous savez vite s'il faut répondre, à quel prix, et avec quel dossier.",
    href: '/blog/go-no-go-appel-offres-grille',
    cta: 'Lire la grille go / no-go',
  },
]

function SectionTitre({ titre, lien }: { titre: string; lien?: { href: string; label: string } }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">{titre}</h2>
      {lien && (
        <Link href={lien.href} className="shrink-0 text-sm font-medium text-blue-600 hover:underline">
          {lien.label} →
        </Link>
      )}
    </div>
  )
}

/** Sections de l'accueil sous la liste des appels d'offres. */
export default function HomeSections() {
  // Les alertes ne sont pas encore en service : on ne les met pas en avant ici
  const outils = OUTILS.filter((o) => o.slug !== 'alertes-appels-offres').slice(0, 6)
  const guides = getAllPosts().slice(0, 3)

  return (
    <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 pb-16 md:pb-20 space-y-16 md:space-y-20">
      <section>
        <SectionTitre titre="Du bon appel d'offres au dossier complet" />
        <ol className="grid gap-4 md:grid-cols-3">
          {ETAPES.map((e, i) => (
            <li key={e.titre} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6">
              <span className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">{i + 1}</span>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{e.titre}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{e.texte}</p>
              <Link href={e.href} className="mt-auto text-sm font-medium text-blue-600 hover:underline">{e.cta} →</Link>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <SectionTitre titre="Outils gratuits pour répondre aux marchés publics" lien={{ href: '/outils', label: 'Tous les outils' }} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {outils.map((o) => <ToolCard key={o.slug} outil={o} />)}
        </div>
      </section>

      {guides.length > 0 && (
        <section>
          <SectionTitre titre="Guides pratiques" lien={{ href: '/blog', label: 'Tous les guides' }} />
          <div className="grid gap-6 md:grid-cols-3">
            {guides.map((p) => <PostCard key={p.slug} post={p} headingLevel="h3" />)}
          </div>
        </section>
      )}

      <section className="rounded-3xl bg-gray-900 px-6 py-10 md:px-12 md:py-12 text-white lg:flex lg:items-center lg:justify-between lg:gap-10">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">Construit par une équipe qui automatise les réponses</h2>
          <p className="text-gray-300 leading-relaxed">
            mon-ao.com est conçu par Julien et Clément, cofondateurs de vision, l'agence qui automatise pour les entreprises du
            bâtiment la lecture des dossiers de consultation et la préparation des réponses. Le site reste gratuit ; vision analyse
            aussi gratuitement 3 appels d'offres de votre métier, avec un avis go / no-go argumenté.
          </p>
        </div>
        <div className="mt-6 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:mt-0">
          <a
            href={analysisCtaHref('accueil', 'site')}
            target="_blank"
            rel="noopener"
            className="btn bg-white text-gray-900 hover:bg-blue-50"
          >
            Faire analyser 3 AO gratuitement →
          </a>
          <Link href="/a-propos" className="text-center text-sm font-medium text-gray-300 hover:text-white">
            Qui sommes-nous ?
          </Link>
        </div>
      </section>
    </div>
  )
}
