
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { pieceHref, PIECES_AVEC_PAGE } from '@/lib/outils/pieces'
import { FaqJsonLd } from '@/components/json-ld'
import { AuthorBlock, Badge, Breadcrumb, ContentSection, Faq, GuidePart, RelatedTools, UpdatedAt } from '@/components/outils/sections'
import { Stat } from '@/components/outils/form'

const UPDATED = '2026-10-20'

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return PIECES_AVEC_PAGE.map((p) => ({ slug: p.slug }))
}

/** « DC1 » → « le DC1 », « Attestation de vigilance » → « l'attestation de vigilance » */
function avecArticle(nom: string): string {
  if (/^(DC\d|DUME)/.test(nom)) return `le ${nom}`
  return `l'${nom.charAt(0).toLowerCase()}${nom.slice(1)}`
}

function trouver(slug: string) {
  return PIECES_AVEC_PAGE.find((p) => p.slug === slug)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const piece = trouver((await params).slug)
  if (!piece?.page) return {}
  return {
    title: { absolute: `${piece.titre} : à quoi sert-elle, comment l'obtenir | mon-ao.com` },
    description: piece.page.description,
    alternates: { canonical: pieceHref(piece.slug) },
  }
}

export default async function PiecePage({ params }: PageProps) {
  const piece = trouver((await params).slug)
  if (!piece?.page) notFound()
  const page = piece.page
  const autres = PIECES_AVEC_PAGE.filter((p) => p.slug !== piece.slug)

  return (
    <>
      <FaqJsonLd items={page.faq} />

      <section className="relative">
        <div className="absolute inset-x-0 top-0 h-[28rem] bg-linear-to-b from-blue-100 to-white pointer-events-none -z-10" aria-hidden="true" />
        <div className="max-w-screen-xl mx-auto px-6 sm:px-8">
          <div className="pt-28 md:pt-36 pb-6 max-w-4xl">
            <Breadcrumb
              items={[
                { name: 'Accueil', href: '/' },
                { name: 'Pièces de candidature', href: '/outils/pieces-candidature' },
                { name: piece.titre.split(' : ')[0], href: pieceHref(piece.slug) },
              ]}
            />
            <div className="mb-5"><Badge>{piece.etape === 'attributaire' ? 'Pièce de l\'attributaire' : 'Pièce de candidature'}</Badge></div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.08] mb-5">{piece.titre}</h1>
            <p className="text-lg text-gray-500 mb-8">{page.description}</p>
            <div className="grid sm:grid-cols-3 gap-3 mb-6">
              <Stat label="Quand la fournir" value={<span className="text-base">{piece.quand}</span>} />
              <Stat label="Validité" value={<span className="text-base">{piece.validite}</span>} />
              <Stat accent label="Où l'obtenir" value={<span className="text-base">{piece.ou.label}</span>} />
            </div>
            <div className="flex flex-wrap gap-3">
              {piece.ou.href && (
                <a href={piece.ou.href} target="_blank" rel="noopener noreferrer" className="btn text-white bg-blue-500 hover:bg-blue-600 shadow-xs">
                  {piece.slug.startsWith('dc') || piece.slug === 'dume' ? 'Télécharger le formulaire officiel ↗' : 'Obtenir la pièce ↗'}
                </a>
              )}
              <Link href="/outils/pieces-candidature" className="btn bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600">
                Ma checklist complète →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ContentSection eyebrow="Le guide" title={`${piece.titre.split(' : ')[0]} : l'essentiel`} muted>
        <GuidePart n={1} title="À quoi sert-elle ?">
          {page.aQuoiSert.map((t) => <p key={t}>{t}</p>)}
        </GuidePart>
        <GuidePart n={2} title={piece.etape === 'attributaire' ? 'Comment l\'obtenir' : 'Comment la remplir'}>
          <ol className="list-decimal pl-5 space-y-2">
            {page.commentFaire.map((t) => <li key={t}>{t}</li>)}
          </ol>
        </GuidePart>
        <GuidePart n={3} title="Erreurs fréquentes">
          <ul className="list-disc pl-5 space-y-2">
            {page.erreurs.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </GuidePart>
      </ContentSection>

      {page.faq.length > 0 && (
        <ContentSection eyebrow="Questions fréquentes" title={`Vos questions sur ${avecArticle(piece.titre.split(' : ')[0])}`}>
          <Faq items={page.faq} />
        </ContentSection>
      )}

      <section>
        <div className="max-w-3xl mx-auto px-6 sm:px-8 pb-4">
          <AuthorBlock />
          <UpdatedAt
            date={UPDATED}
            note="le règlement de la consultation prévaut toujours"
            sources={[{ label: 'DAJ, formulaires de la commande publique', href: 'https://www.economie.gouv.fr/daj/commande-publique/formulaires-commande-publique' }]}
          />
        </div>
      </section>

      <section>
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-12 md:py-16 space-y-14">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-5">Les autres pièces du dossier</h2>
            <div className="flex flex-wrap gap-2">
              {autres.map((p) => (
                <Link key={p.slug} href={pieceHref(p.slug)} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-xs transition hover:border-blue-400 hover:text-blue-600">
                  {p.titre.split(' : ')[0]}
                </Link>
              ))}
            </div>
          </div>
          <RelatedTools current="pieces-candidature" />
        </div>
      </section>
    </>
  )
}
