import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import Link from 'next/link'
import { getAppelOffreById } from '@/lib/getAppelsOffre'
import { aoHref, formatDate, PROCEDURE_LABELS } from '@/app/(default)/ao-item'
import { avecUtmVision, downloadFormat } from '@/lib/blog/config'
import {
  DossierStructure, DeroulementAo, GoNoGoFlow, DecisionMatrix, RcToSommaire, GenericVsSpecific, VeilleMap,
  RcThreePasses, RcAnnotated, OptionsMatrix, OptionChooser, EnvLevers, EnvLevels, RejectionTimeline, NotesToAction,
  GroupementForms, GroupementSteps,
  AttestationsByStage, RenewalCalendar, SoftwareCriteriaChain, ToolFamilies, MapaFlow, MapaLayers, CapacityProofs,
  ReferencesRoadmap, PriceDocs, AiTaskMap, AiWorkflowSteps, OabProcedure, OabJustifications, SubcontractingFlows,
  DirectPaymentCircuit,
} from './diagrams'
import { CostTree, CostByWinRate, TravauxScale, DispenseHistory, NotationSimulation, PointValue, LotMoneySplit } from './charts'
import CostCalculator from './cost-calculator'

// ─── Typographie des articles ─────────────────────────────────────────────────

function A({ href = '', children, ...props }: ComponentPropsWithoutRef<'a'>) {
  const className =
    'font-medium text-blue-600 underline decoration-blue-200 underline-offset-2 hover:decoration-blue-500 transition'
  if (href.startsWith('/') || href.startsWith('#')) {
    return <Link href={href} className={className} {...props}>{children}</Link>
  }
  const vision = avecUtmVision(href, { medium: 'blog', campaign: 'lien-article' })
  return (
    // Liens vers vision : referrer conservé et UTM ajoutés pour attribuer les visites
    <a href={vision} className={className} target="_blank" rel={vision === href ? 'noopener noreferrer' : 'noopener'} {...props}>
      {children}
    </a>
  )
}

function Ul({ className = '', ...props }: ComponentPropsWithoutRef<'ul'>) {
  if (className.includes('contains-task-list')) {
    return <ul className="mb-6 space-y-2" {...props} />
  }
  return <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-blue-400" {...props} />
}

function Li({ className = '', ...props }: ComponentPropsWithoutRef<'li'>) {
  if (className.includes('task-list-item')) {
    return (
      <li className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white px-3.5 py-2.5 text-[15px] leading-6 text-gray-700 shadow-xs" {...props} />
    )
  }
  return <li className="pl-1 leading-7" {...props} />
}

// Cases des checklists GFM : cochables (mais sans état serveur)
function Input({ type, checked, ...props }: ComponentPropsWithoutRef<'input'>) {
  if (type === 'checkbox') {
    return (
      <input
        type="checkbox"
        defaultChecked={checked}
        className="form-checkbox mt-0.5 h-4.5 w-4.5 shrink-0 cursor-pointer rounded"
        aria-label="Cocher"
      />
    )
  }
  return <input type={type} {...props} />
}

function Table(props: ComponentPropsWithoutRef<'table'>) {
  return (
    <div className="my-8 overflow-x-auto rounded-xl border border-gray-200 [&_td:first-child]:min-w-32">
      <table className="w-full text-left text-sm" {...props} />
    </div>
  )
}

export const mdxComponents = {
  h2: (props: ComponentPropsWithoutRef<'h2'>) => (
    <h2 className="mt-14 mb-5 scroll-mt-28 text-2xl font-extrabold text-gray-900 md:text-[1.75rem] md:leading-tight" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<'h3'>) => (
    <h3 className="mt-10 mb-3 scroll-mt-28 text-xl font-bold text-gray-900" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<'p'>) => <p className="mb-5 leading-8" {...props} />,
  a: A,
  ul: Ul,
  ol: (props: ComponentPropsWithoutRef<'ol'>) => (
    <ol className="mb-6 list-decimal space-y-3 pl-6 marker:font-bold marker:text-blue-500" {...props} />
  ),
  li: Li,
  input: Input,
  strong: (props: ComponentPropsWithoutRef<'strong'>) => <strong className="font-semibold text-gray-900" {...props} />,
  code: (props: ComponentPropsWithoutRef<'code'>) => (
    <code className="rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-[0.85em] text-gray-800" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote className="my-6 border-l-4 border-blue-200 pl-5 text-gray-600 italic" {...props} />
  ),
  hr: () => <hr className="my-12 border-gray-200" />,
  table: Table,
  thead: (props: ComponentPropsWithoutRef<'thead'>) => <thead className="bg-gray-50" {...props} />,
  th: (props: ComponentPropsWithoutRef<'th'>) => (
    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase" {...props} />
  ),
  td: (props: ComponentPropsWithoutRef<'td'>) => (
    <td className="border-t border-gray-100 px-4 py-3 align-top leading-6 text-gray-700" {...props} />
  ),
  Callout,
  Figure,
  AoCard,
  DownloadCard,
  DossierStructure,
  DeroulementAo,
  GoNoGoFlow,
  DecisionMatrix,
  CostTree,
  CostByWinRate,
  CostCalculator,
  RcToSommaire,
  GenericVsSpecific,
  VeilleMap,
  TravauxScale,
  DispenseHistory,
  NotationSimulation,
  PointValue,
  RcThreePasses,
  RcAnnotated,
  OptionsMatrix,
  OptionChooser,
  EnvLevers,
  EnvLevels,
  RejectionTimeline,
  NotesToAction,
  GroupementForms,
  GroupementSteps,
  Formula,
  Letter,
  AttestationsByStage,
  RenewalCalendar,
  SoftwareCriteriaChain,
  ToolFamilies,
  MapaFlow,
  MapaLayers,
  CapacityProofs,
  ReferencesRoadmap,
  PriceDocs,
  LotMoneySplit,
  AiTaskMap,
  AiWorkflowSteps,
  OabProcedure,
  OabJustifications,
  SubcontractingFlows,
  DirectPaymentCircuit,
}

// ─── Composants utilisables dans les articles ─────────────────────────────────

const CALLOUT_TONES = {
  brief: { box: 'bg-blue-50 border-blue-100', title: 'text-blue-600' },
  tip: { box: 'bg-emerald-50 border-emerald-100', title: 'text-emerald-700' },
  warning: { box: 'bg-orange-50 border-orange-100', title: 'text-orange-700' },
}

export function Callout({
  title,
  tone = 'brief',
  children,
}: {
  title?: string
  tone?: keyof typeof CALLOUT_TONES
  children: ReactNode
}) {
  const t = CALLOUT_TONES[tone] ?? CALLOUT_TONES.brief
  return (
    <aside className={`my-8 rounded-2xl border px-6 py-5 [&>p:last-child]:mb-0 [&>ul:last-child]:mb-0 ${t.box}`}>
      {title && <p className={`mb-2 text-xs font-bold tracking-wider uppercase ${t.title}`}>{title}</p>}
      {children}
    </aside>
  )
}

export function Figure({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <figure className="my-10">
      {children}
      {caption && <figcaption className="mt-3 text-center text-sm leading-6 text-gray-500">{caption}</figcaption>}
    </figure>
  )
}

// Fiche d'un vrai AO publié sur mon-ao.com (données en direct)
export async function AoCard({ id }: { id: string }) {
  const ao = await getAppelOffreById(parseInt(id, 10))
  if (!ao || !ao.slug) return null

  const meta = [
    ao.acheteur,
    ao.region_label,
    ao.procedure ? PROCEDURE_LABELS[ao.procedure] : null,
  ].filter(Boolean)

  return (
    <Link
      href={aoHref(ao)}
      className="group my-8 block rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition hover:-translate-y-px hover:border-blue-300 hover:shadow-md"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
          Appel d'offres réel
        </span>
        <span className="text-xs text-gray-400">Publié le {formatDate(ao.date_publication, false)}</span>
      </div>
      <p className="mb-2 font-bold leading-snug text-gray-900 group-hover:text-blue-600 transition">{ao.titre}</p>
      <p className="mb-3 text-sm text-gray-500">{meta.join(' · ')}</p>
      <span className="text-sm font-medium text-blue-600">
        Voir la fiche de l'appel d'offres{' '}
        <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
      </span>
    </Link>
  )
}

export function DownloadCard({ href, title, description }: { href: string; title: string; description?: string }) {
  return (
    <a
      href={href}
      download
      className="group my-8 flex items-center gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5 transition hover:border-blue-300"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-xs" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block font-bold text-gray-900 group-hover:text-blue-600 transition">{title}</span>
        {description && <span className="block text-sm text-gray-500">{description}</span>}
      </span>
      <span className="ml-auto hidden shrink-0 text-sm font-medium text-blue-600 sm:block">Télécharger ({downloadFormat(href)})</span>
    </a>
  )
}

// Formule mise en forme : « gauche = numérateur ÷ dénominateur » ou « gauche = expression »
export function Formula({ left, num, den, right }: { left: string; num?: string; den?: string; right?: string }) {
  return (
    <div className="my-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-center text-sm font-semibold text-gray-900">
      <span>{left}</span>
      <span className="text-blue-500">=</span>
      {num && den ? (
        <span className="inline-flex flex-col items-center">
          <span className="px-2 pb-1">{num}</span>
          <span className="w-full border-t-2 border-gray-800" aria-hidden="true" />
          <span className="sr-only">divisé par</span>
          <span className="px-2 pt-1">{den}</span>
        </span>
      ) : (
        <span>{right}</span>
      )}
    </div>
  )
}

// Modèle de courrier : rendu comme une feuille, texte sélectionnable
export function Letter({ children }: { children: ReactNode }) {
  return (
    <div className="my-8 rounded-2xl border border-gray-200 bg-white p-5 font-[Georgia,serif] text-[15px] leading-7 text-gray-800 shadow-sm sm:p-8 [&_li]:leading-7 [&_ol]:mb-4 [&_p]:mb-4 [&_p:last-child]:mb-0">
      {children}
    </div>
  )
}
