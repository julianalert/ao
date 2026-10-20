import Link from 'next/link'
import Image from 'next/image'
import type { Author } from '@/lib/blog/config'
import { COVER_HEIGHT, COVER_WIDTH, TRAVAUX_CATEGORY_LINKS, analysisCtaHref, downloadFormat } from '@/lib/blog/config'
import type { PostMeta } from '@/lib/blog/posts'
import { getOpenAppelsOffre, TYPE_MARCHE_SLUGS } from '@/lib/getAppelsOffre'
import { aoHref, formatDate } from '@/app/(default)/ao-item'

export function formatPostDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`),
  )
}

const pillClass = 'inline-flex rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-semibold tracking-wide text-blue-600 uppercase'

// Avec href, la pastille renvoie vers la page silo du pilier (relative z-10 : reste
// cliquable au-dessus du lien étiré des cartes d'articles)
export function CategoryPill({ label, href }: { label: string; href?: string }) {
  if (!href) return <span className={pillClass}>{label}</span>
  return (
    <Link href={href} className={`${pillClass} relative z-10 transition hover:border-blue-300 hover:bg-blue-100`}>
      {label}
    </Link>
  )
}

// ─── Auteur ───────────────────────────────────────────────────────────────────

export function AuthorAvatar({ author, size = 40 }: { author: Author; size?: number }) {
  return (
    <Image
      src={author.image}
      alt={`Photo de ${author.name}`}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full object-cover ring-2 ring-white"
    />
  )
}

export function AuthorByline({ post }: { post: PostMeta }) {
  const author = post.authorData
  const updated = post.updatedAt !== post.publishedAt
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <Link href={`/blog/auteur/${author.slug}`} rel="author" className="group flex items-center gap-3">
        <AuthorAvatar author={author} />
        <span>
          <span className="block text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition">
            {author.name}
          </span>
          <span className="block text-xs text-gray-500">{author.role}</span>
        </span>
      </Link>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
        <span>
          Publié le <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
        </span>
        {updated && (
          <span>
            Mis à jour le <time dateTime={post.updatedAt}>{formatPostDate(post.updatedAt)}</time>
          </span>
        )}
        <span>{post.readingTime} min de lecture</span>
      </div>
    </div>
  )
}

export function AuthorBox({ author }: { author: Author }) {
  return (
    <aside className="mt-14 rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:flex sm:gap-5">
      <AuthorAvatar author={author} size={72} />
      <div className="mt-4 sm:mt-0">
        <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">À propos de l'auteur</p>
        <p className="mt-1 font-bold text-gray-900">
          <Link href={`/blog/auteur/${author.slug}`} className="hover:text-blue-600 transition">
            {author.name}
          </Link>
          <span className="font-normal text-gray-500"> · {author.role}</span>
        </p>
        <p className="mt-2 text-sm leading-6 text-gray-600">{author.shortBio}</p>
        <Link href={`/blog/auteur/${author.slug}`} className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline">
          Tous ses articles →
        </Link>
      </div>
    </aside>
  )
}

// ─── Cartes d'articles ────────────────────────────────────────────────────────

export function PostCard({ post, priority = false, headingLevel = 'h2' }: { post: PostMeta; priority?: boolean; headingLevel?: 'h2' | 'h3' }) {
  const Heading = headingLevel
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-200 hover:-translate-y-px hover:border-blue-200 hover:shadow-md">
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <Image
          src={post.cover}
          alt={post.coverAlt}
          width={COVER_WIDTH}
          height={COVER_HEIGHT}
          priority={priority}
          sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex grow flex-col p-5">
        <div className="mb-3">
          <CategoryPill label={post.categoryLabel} href={post.categoryHref} />
        </div>
        <Heading className="mb-2 text-lg font-bold leading-snug text-gray-900 group-hover:text-blue-600 transition">
          <Link href={post.href} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </Heading>
        <p className="mb-5 text-sm leading-6 text-gray-500">{post.excerpt ?? post.description}</p>
        <div className="mt-auto flex items-center gap-3 border-t border-gray-100 pt-4">
          <AuthorAvatar author={post.authorData} size={32} />
          <div className="min-w-0 text-xs">
            <p className="font-semibold text-gray-800">{post.authorData.name}</p>
            <p className="text-gray-500">
              <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time> · {post.readingTime} min de lecture
            </p>
          </div>
          <span className="ml-auto text-sm font-medium text-blue-600" aria-hidden="true">
            <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
          </span>
        </div>
      </div>
    </article>
  )
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

export function AnalysisCtaCard({ campaign }: { campaign: string }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
      <p className="mb-1 text-xs font-semibold tracking-wider text-blue-600 uppercase">Offert</p>
      <p className="mb-2 font-bold leading-snug text-gray-900">3 appels d'offres analysés pour vous</p>
      <p className="mb-4 text-sm leading-6 text-gray-600">
        Votre métier et votre zone : on vous renvoie un avis go / no-go argumenté sur 3 AO en cours.
      </p>
      <a
        href={analysisCtaHref(campaign)}
        className="btn-sm w-full bg-blue-500 text-white shadow-xs hover:bg-blue-600 group"
        target="_blank"
        rel="noopener"
      >
        Demander mon analyse
        <span className="ml-1 text-blue-200 transition-transform group-hover:translate-x-0.5">→</span>
      </a>
    </div>
  )
}

export function ArticleCta({ post }: { post: PostMeta }) {
  return (
    <section aria-labelledby="passez-a-l-action" className="mt-14">
      <h2 id="passez-a-l-action" className="mb-5 scroll-mt-28 text-2xl font-extrabold text-gray-900 md:text-[1.75rem] md:leading-tight">
        Passez à l'action
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {!post.download && (
          <Link
            href="/travaux"
            className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md"
          >
            <span className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">Chaque matin</span>
            <span className="mb-2 font-bold text-gray-900 group-hover:text-blue-600 transition">Les nouveaux appels d'offres de travaux</span>
            <span className="mb-5 text-sm leading-6 text-gray-500">
              Publiés au BOAMP et classés par métier et par région sur mon-ao.com, gratuitement.
            </span>
            <span className="mt-auto text-sm font-medium text-blue-600">
              Voir les AO de travaux <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </Link>
        )}
        {post.download && (
          <a
            href={post.download.href}
            download
            className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md"
          >
            <span className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">À télécharger</span>
            <span className="mb-2 font-bold text-gray-900 group-hover:text-blue-600 transition">{post.download.label}</span>
            {post.download.description && <span className="mb-5 text-sm leading-6 text-gray-500">{post.download.description}</span>}
            <span className="mt-auto text-sm font-medium text-blue-600">
              Télécharger ({downloadFormat(post.download.href)}) <span className="inline-block transition-transform group-hover:translate-x-0.5">↓</span>
            </span>
          </a>
        )}
        <a
          href={analysisCtaHref(post.slug)}
          target="_blank"
          rel="noopener"
          className="group relative flex flex-col overflow-hidden rounded-2xl bg-blue-600 p-6 text-white transition hover:bg-blue-700"
        >
          <span className="mb-1 font-nycd text-xl text-blue-200">Gagnez du temps dès ce mois-ci</span>
          <span className="mb-2 font-bold">On analyse gratuitement 3 appels d'offres en cours pour vous</span>
          <span className="mb-5 text-sm leading-6 text-blue-100">
            Envoyez votre métier et votre zone : vous recevez un avis go / no-go argumenté pour chacun.
          </span>
          <span className="mt-auto text-sm font-semibold">
            Demander mon analyse <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
          </span>
        </a>
      </div>
    </section>
  )
}

// ─── Appels d'offres en cours (données mon-ao, en direct) ─────────────────────

export async function OpenAos({ categorie, label }: { categorie: string; label?: string }) {
  const { data, count } = await getOpenAppelsOffre(categorie, 5)
  if (data.length === 0) return null
  // « de travaux » pour un type de marché, « Bâtiment » pour une catégorie CPV
  const categorieLabel = label ?? (TYPE_MARCHE_SLUGS.has(categorie) ? `de ${categorie}` : data[0]?.categorie_label ?? categorie)

  return (
    <section aria-labelledby="appels-d-offres-en-cours" className="mt-14">
      <h2 id="appels-d-offres-en-cours" className="mb-2 scroll-mt-28 text-2xl font-extrabold text-gray-900 md:text-[1.75rem] md:leading-tight">
        Appels d'offres en cours
      </h2>
      <p className="mb-5 text-gray-600">
        <strong className="font-semibold text-gray-900">{count.toLocaleString('fr-FR')} appels d'offres {categorieLabel}</strong>{' '}
        sont ouverts en ce moment sur mon-ao.com. Les 5 derniers publiés :
      </p>
      <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {data.map((ao) => (
          <li key={ao.id}>
            <Link href={aoHref(ao)} className="group flex items-start gap-4 px-5 py-4 transition hover:bg-blue-50/50">
              <div className="min-w-0 flex-1">
                <p className="mb-1 truncate text-xs font-medium text-gray-400">
                  {ao.acheteur ?? 'Organisme public'}
                  {ao.region_label && <span> · {ao.region_label}</span>}
                </p>
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-800 group-hover:text-blue-600 transition">
                  {ao.titre}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-gray-400">Date limite</p>
                <p className="text-xs font-semibold text-gray-700">{formatDate(ao.date_limite)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-sm text-gray-500">Par métier :</span>
        {TRAVAUX_CATEGORY_LINKS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="inline-flex rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 shadow-xs transition hover:border-blue-400 hover:text-blue-600"
          >
            {c.label}
          </Link>
        ))}
      </div>
    </section>
  )
}
