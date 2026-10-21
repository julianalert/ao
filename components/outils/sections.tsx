import { Fragment, type ReactNode } from 'react'
import Link from 'next/link'
import { BreadcrumbJsonLd } from '@/components/json-ld'
import AoItem from '@/app/(default)/ao-item'
import { getAppelsOffreByCategorie } from '@/lib/getAppelsOffre'
import { OUTILS } from '@/lib/outils/catalog'
import { AUTEUR } from '@/lib/outils/author'
import { fmtDate } from '@/lib/format'
import AlerteSignup from '@/components/alertes/alerte-signup'

export type Crumb = { name: string; href: string }

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <>
      <BreadcrumbJsonLd items={items} />
      <nav aria-label="Fil d'Ariane" className="mb-6 flex items-center flex-wrap gap-1.5 text-sm">
        {items.map((item, i) =>
          i < items.length - 1 ? (
            <Fragment key={item.href}>
              <Link className="text-blue-500 hover:underline" href={item.href}>{item.name}</Link>
              <span className="text-gray-300" aria-hidden="true">/</span>
            </Fragment>
          ) : (
            <span key={item.href} className="text-gray-500" aria-current="page">{item.name}</span>
          ),
        )}
      </nav>
    </>
  )
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
      {children}
    </span>
  )
}

/** Haut de page commun : fond dégradé + fil d'Ariane. */
export function ToolShell({ breadcrumb, children }: { breadcrumb: Crumb[]; children: ReactNode }) {
  return (
    <section className="relative">
      <div className="absolute inset-x-0 top-0 h-[36rem] bg-linear-to-b from-blue-100 to-white pointer-events-none -z-10" aria-hidden="true" />
      <div className="max-w-screen-xl mx-auto px-6 sm:px-8">
        <div className="pt-28 md:pt-36 pb-12">
          <Breadcrumb items={breadcrumb} />
          {children}
        </div>
      </div>
    </section>
  )
}

/** Colonne de gauche du hero : badge, H1, promesse, réassurances. */
export function ToolIntro({ title, promise, checks }: { title: ReactNode; promise: ReactNode; checks: string[] }) {
  return (
    <div>
      <div className="mb-5"><Badge>Outil gratuit · Marchés publics</Badge></div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.08] mb-5">{title}</h1>
      <p className="text-lg text-gray-500 leading-relaxed mb-6">{promise}</p>
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {checks.map((c) => (
          <li key={c} className="inline-flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" aria-hidden="true">
              <rect width="16" height="16" rx="4" className="fill-blue-100" />
              <path d="m4.5 8.2 2.2 2.2 4.8-4.8" fill="none" strokeWidth="1.8" className="stroke-blue-600" />
            </svg>
            {c}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Accent({ children }: { children: ReactNode }) {
  return <span className="text-blue-500">{children}</span>
}

/** Section de contenu centrée avec sur-titre et H2. */
export function ContentSection({
  id,
  eyebrow,
  title,
  intro,
  children,
  muted = false,
}: {
  id?: string
  eyebrow?: string
  title: ReactNode
  intro?: ReactNode
  children: ReactNode
  muted?: boolean
}) {
  return (
    <section id={id} className={`scroll-mt-24 ${muted ? 'bg-gray-50 border-y border-gray-100' : ''}`}>
      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-12 md:py-16">
        {eyebrow && <div className="mb-4"><Badge>{eyebrow}</Badge></div>}
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">{title}</h2>
        {intro && <p className="text-lg text-gray-500 mb-8">{intro}</p>}
        {children}
      </div>
    </section>
  )
}

/** Sous-partie numérotée du guide. */
export function GuidePart({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div className="mt-10 first:mt-0">
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
        {n}. {title}
      </h3>
      <div className="space-y-4 text-gray-600 leading-relaxed">{children}</div>
    </div>
  )
}

export function Formula({ children, legend }: { children: ReactNode; legend?: ReactNode }) {
  return (
    <figure className="my-6 rounded-2xl border border-blue-100 bg-blue-50/60 px-5 py-5 text-center">
      <div className="font-mono text-base md:text-lg text-gray-900 overflow-x-auto whitespace-nowrap">{children}</div>
      {legend && <figcaption className="mt-3 text-sm text-gray-500">{legend}</figcaption>}
    </figure>
  )
}

export function DataTable({ head, rows, caption }: { head: ReactNode[]; rows: ReactNode[][]; caption?: string }) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
          <tr>{head.map((h, i) => <th key={i} scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j} className="px-4 py-3 text-gray-700 align-top">{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export type LegalRef = { ref: string; objet: string; href: string }

export function LegalRefs({ items }: { items: LegalRef[] }) {
  return (
    <ul className="my-6 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
      {items.map((r) => (
        <li key={r.ref} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-4 py-3">
          <a
            href={r.href}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 sm:w-44 text-sm font-semibold text-blue-600 hover:underline"
          >
            {r.ref} ↗
          </a>
          <span className="text-sm text-gray-600">{r.objet}</span>
        </li>
      ))}
    </ul>
  )
}

export type FaqItem = { q: string; a: string }

export function Faq({ items, questionsAsH3 = false }: { items: FaqItem[]; questionsAsH3?: boolean }) {
  return (
    <div className="divide-y divide-gray-200 border-y border-gray-200">
      {items.map((item) => (
        <details key={item.q} className="group py-1">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
            {questionsAsH3 ? <h3>{item.q}</h3> : item.q}
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition group-open:rotate-45" aria-hidden="true">
              +
            </span>
          </summary>
          <p className="pb-5 pr-10 text-gray-600 leading-relaxed">{item.a}</p>
        </details>
      ))}
    </div>
  )
}

export function AuthorBlock() {
  return (
    <div className="flex flex-col sm:flex-row gap-5 rounded-2xl border border-gray-200 bg-white p-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={AUTEUR.photo}
        alt={AUTEUR.nom}
        width={72}
        height={72}
        loading="lazy"
        className="h-18 w-18 shrink-0 rounded-full object-cover bg-blue-100"
      />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Rédigé et conçu par</p>
        <p className="text-lg font-bold text-gray-900">{AUTEUR.nom}</p>
        <p className="text-sm font-medium text-blue-600 mb-3">{AUTEUR.role}</p>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">{AUTEUR.bio}</p>
        <Link href={AUTEUR.aProposHref} className="text-sm font-medium text-blue-600 hover:underline">
          En savoir plus sur l'auteur →
        </Link>
      </div>
    </div>
  )
}

export type Source = { label: string; href: string }

export function UpdatedAt({ date, sources, note }: { date: string; sources: Source[]; note?: ReactNode }) {
  return (
    <div className="mt-6 flex flex-col gap-1 text-sm text-gray-500">
      <p>
        <span className="font-medium text-gray-700">Mis à jour le {fmtDate(date)}</span>
        {note && <> · {note}</>}
      </p>
      <p>
        Sources :{' '}
        {sources.map((s, i) => (
          <Fragment key={s.href}>
            {i > 0 && ', '}
            <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{s.label}</a>
          </Fragment>
        ))}
      </p>
    </div>
  )
}

export function RelatedTools({ current }: { current?: string }) {
  const outils = OUTILS.filter((o) => o.slug !== current)
  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Autres outils gratuits</h2>
        <Link href="/outils" className="text-sm font-medium text-blue-600 hover:underline whitespace-nowrap">Tous les outils →</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {outils.map((o) => <ToolCard key={o.slug} outil={o} />)}
        <Link
          href="/indices"
          className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-md"
        >
          <span className="text-2xl mb-3" aria-hidden="true">🧱</span>
          <span className="font-bold text-gray-900 group-hover:text-blue-600 mb-1">Index BT et TP de l'INSEE</span>
          <span className="text-sm text-gray-500 mb-4">Dernières valeurs, historique et graphique de chaque index du bâtiment et des travaux publics.</span>
          <span className="mt-auto text-sm font-medium text-blue-600">Consulter les index →</span>
        </Link>
      </div>
    </div>
  )
}

export function ToolCard({ outil }: { outil: (typeof OUTILS)[number] }) {
  return (
    <Link
      href={outil.href}
      className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-md"
    >
      <span className="text-2xl mb-3" aria-hidden="true">{outil.emoji}</span>
      <span className="font-bold text-gray-900 group-hover:text-blue-600 mb-1">{outil.title}</span>
      <span className="text-sm text-gray-500 mb-4">{outil.description}</span>
      <span className="mt-auto text-sm font-medium text-blue-600">{outil.cta} →</span>
    </Link>
  )
}

/** Maillage vers les appels d'offres de travaux encore ouverts. */
export async function RelatedAos({ title = 'Appels d\'offres travaux en cours' }: { title?: string }) {
  const { data } = await getAppelsOffreByCategorie('travaux', { page: 1 })
  const now = Date.now()
  const enCours = data.filter((ao) => !ao.date_limite || new Date(ao.date_limite).getTime() > now).slice(0, 4)
  if (!enCours.length) return null
  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">{title}</h2>
        <Link href="/travaux" className="text-sm font-medium text-blue-600 hover:underline whitespace-nowrap">Tous les marchés de travaux →</Link>
      </div>
      <div className="flex flex-col gap-3">
        {enCours.map((ao) => <AoItem key={ao.id} {...ao} />)}
      </div>
    </div>
  )
}

/** Bas de page outil : auteur, fraîcheur, maillage interne. */
export function ToolFooter({ current, updated }: { current: string; updated: ReactNode }) {
  return (
    <>
      <section>
        <div className="max-w-3xl mx-auto px-6 sm:px-8 pb-4">
          <AuthorBlock />
          {updated}
        </div>
      </section>
      <section>
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-12 md:py-16 space-y-14">
          {current !== 'alertes-appels-offres' && <AlerteSignup source={`outil/${current}`} criteres={{ types: ['travaux'] }} contexte="de votre métier" />}
          <RelatedAos />
          <RelatedTools current={current} />
        </div>
      </section>
    </>
  )
}
