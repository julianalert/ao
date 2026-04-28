export const revalidate = 3600
export const dynamicParams = true

import React, { Suspense } from 'react'
import {
  getAppelOffreById,
  getAppelsOffreByRegion,
  getSimilarAppelsOffre,
  getRegionsByCategorie,
  TYPE_MARCHE_SLUGS,
  type AoFilters,
} from '@/lib/getAppelsOffre'
import { parseRawData } from '@/lib/parseRawData'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import SidebarWrapper from '@/components/sidebar-wrapper'
import AoItem, { formatDate, TYPE_LABELS, PROCEDURE_LABELS } from '../../ao-item'
import Pagination from '@/components/pagination'
import { BreadcrumbJsonLd } from '@/components/json-ld'

interface PageProps {
  params: Promise<{ categorie: string; segment: string }>
  searchParams: Promise<Record<string, string>>
}

function isAoSegment(segment: string): boolean {
  return /^\d+-.+/.test(segment)
}

function extractIdFromSegment(segment: string): number {
  return parseInt(segment.split('-')[0], 10)
}

function formatMontant(montant: number | string | null): string {
  if (!montant) return '—'
  const n = typeof montant === 'string' ? parseFloat(montant) : montant
  if (isNaN(n)) return String(montant)
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorie, segment } = await params

  if (isAoSegment(segment)) {
    const ao = await getAppelOffreById(extractIdFromSegment(segment))
    if (!ao) return { title: "Appel d'offre introuvable" }
    return {
      title: `${ao.titre} — ${ao.reference}`,
      description: `Marché public : ${ao.objet ?? ao.titre}. Acheteur : ${ao.acheteur ?? 'Non précisé'}. Date limite : ${formatDate(ao.date_limite, false)}.`,
      alternates: { canonical: `/${categorie}/${segment}` },
      openGraph: {
        type: 'article',
        ...(ao.date_publication ? { publishedTime: ao.date_publication } : {}),
        ...(ao.date_limite ? { expirationTime: ao.date_limite } : {}),
      },
    }
  }

  const categorieLabel = TYPE_MARCHE_SLUGS.has(categorie)
    ? ({ travaux: 'Travaux', services: 'Services', fournitures: 'Fournitures' } as Record<string, string>)[categorie]
    : categorie.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const regionLabel = segment.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  return {
    title: `Appels d'offre ${categorieLabel} en ${regionLabel}`,
    description: `Marchés publics ${categorieLabel} en ${regionLabel}. Mis à jour quotidiennement depuis le BOAMP.`,
    alternates: { canonical: `/${categorie}/${segment}` },
  }
}

// ─── AO Detail ────────────────────────────────────────────────────────────────

function safeVal(v: React.ReactNode): React.ReactNode {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'object' && !Array.isArray(v) && !('props' in (v as object))) {
    return String(JSON.stringify(v))
  }
  return v
}

function InfoTable({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
  const visible = rows.filter((r) => r.value !== null && r.value !== undefined && r.value !== '')
  if (visible.length === 0) return null
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <tbody>
          {visible.map((row, i) => (
            <tr key={i} className={i < visible.length - 1 ? 'border-b border-gray-200' : ''}>
              <td className="px-4 py-3 text-gray-500 w-52 align-top whitespace-nowrap">{row.label}</td>
              <td className="px-4 py-3 text-gray-800">{safeVal(row.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">{children}</h2>
}

async function AoDetailPage({ categorie, segment }: { categorie: string; segment: string }) {
  const id = extractIdFromSegment(segment)
  const ao = await getAppelOffreById(id)
  if (!ao) notFound()

  const similaires = await getSimilarAppelsOffre(
    ao.categorie ?? categorie,
    ao.type_marche,
    ao.id,
  )

  const parsed = parseRawData(ao.raw_data)

  const categorieLabel = ao.categorie_label
    ?? (TYPE_MARCHE_SLUGS.has(categorie)
      ? ({ travaux: 'Travaux', services: 'Services', fournitures: 'Fournitures' } as Record<string, string>)[categorie]
      : categorie)

  const acheteur = parsed.acheteur
  const montant = ao.montant_estime
    ? formatMontant(ao.montant_estime)
    : parsed.montantEstime
      ? formatMontant(parsed.montantEstime)
      : null

  const daysRemaining = ao.date_limite
    ? Math.ceil((new Date(ao.date_limite).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  const lieuExecution = parsed.lieuExecution ?? (ao.departement ? `Département ${ao.departement}` : null)

  // All criteria extracted once for the top-level section
  const allCriteria = parsed.lots.some((l) => l.criteria.length > 0)
    ? parsed.lots.flatMap((l) => l.criteria)
    : []

  const breadcrumbItems = [
    { name: 'Accueil', href: '/' },
    { name: categorieLabel, href: `/${categorie}` },
    ...(ao.region && ao.region_label
      ? [{ name: ao.region_label, href: `/${categorie}/${ao.region}` }]
      : []),
    { name: ao.titre, href: `/${categorie}/${segment}` },
  ]

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
    <section>
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-8">
        <div className="pt-28 pb-8 md:pt-36 md:pb-16">
          <div className="md:flex" data-sticky-container>

            {/* ── Sidebar ── */}
            <aside className="mb-8 md:mb-0 md:w-1/3 md:ml-10 lg:ml-14 md:shrink-0 md:order-1 md:self-start md:sticky md:top-8">
                <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-5">

                  {/* Acheteur */}
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl mx-auto mb-3">
                      {ao.type_marche === 'travaux' ? '🏗' : ao.type_marche === 'fournitures' ? '📦' : '🛠'}
                    </div>
                    <h2 className="text-sm font-bold text-gray-800 leading-snug">
                      {acheteur?.nom ?? ao.acheteur ?? 'Organisme public'}
                    </h2>
                    {acheteur?.ville && (
                      <p className="text-xs text-gray-500 mt-1">{[acheteur.codePostal, acheteur.ville].filter(Boolean).join(' ')}</p>
                    )}
                  </div>

                  {/* Contact acheteur */}
                  {acheteur && (acheteur.telephone || acheteur.email || acheteur.website) && (
                    <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                      {acheteur.telephone && (
                        <a href={`tel:${acheteur.telephone}`} className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition">
                          <span className="w-4 text-center shrink-0 text-gray-400">📞</span>
                          <span>{acheteur.telephone}</span>
                        </a>
                      )}
                      {acheteur.email && (
                        <a href={`mailto:${acheteur.email}`} className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition">
                          <span className="w-4 text-center shrink-0 text-gray-400">✉️</span>
                          <span className="truncate text-sm">{acheteur.email}</span>
                        </a>
                      )}
                      {acheteur.website && acheteur.website !== 'http://0' && (
                        <a href={acheteur.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline">
                          <span className="w-4 text-center shrink-0">🌐</span>
                          <span className="truncate text-xs">{acheteur.website.replace(/^https?:\/\//, '')}</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Infos clés */}
                  <ul className="space-y-3 text-sm border-t border-gray-100 pt-4">
                    <li className="flex items-start gap-2.5">
                      <span className="text-gray-400 shrink-0 mt-0.5">📅</span>
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">Publication</div>
                        <div className="text-gray-800 font-medium">{formatDate(ao.date_publication, false)}</div>
                      </div>
                    </li>
                    {ao.date_limite && (
                      <li className="flex items-start gap-2.5">
                        <span className="text-gray-400 shrink-0 mt-0.5">⏰</span>
                        <div className="flex-1">
                          <div className="text-xs text-gray-400 mb-0.5">Date limite de réponse</div>
                          <div className="text-red-600 font-semibold">{formatDate(ao.date_limite, false)}</div>
                          {daysRemaining !== null && (
                            <div className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                              daysRemaining < 0 ? 'bg-gray-100 text-gray-500' :
                              daysRemaining < 7 ? 'bg-red-100 text-red-700' :
                              daysRemaining < 30 ? 'bg-orange-100 text-orange-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {daysRemaining < 0 ? 'Clôturé' : `${daysRemaining}j restants`}
                            </div>
                          )}
                        </div>
                      </li>
                    )}
                    {ao.region_label && ao.region && (
                      <li className="flex items-start gap-2.5">
                        <span className="text-gray-400 shrink-0 mt-0.5">🗺</span>
                        <div>
                          <div className="text-xs text-gray-400 mb-0.5">Région</div>
                          <Link href={`/${categorie}/${ao.region}`} className="text-gray-800 font-medium hover:text-blue-500 transition">
                            {ao.region_label}
                          </Link>
                        </div>
                      </li>
                    )}
                    {lieuExecution && (
                      <li className="flex items-start gap-2.5">
                        <span className="text-gray-400 shrink-0 mt-0.5">📍</span>
                        <div>
                          <div className="text-xs text-gray-400 mb-0.5">Lieu d'exécution</div>
                          <div className="text-gray-800 font-medium">{lieuExecution}</div>
                        </div>
                      </li>
                    )}
                    {ao.type_marche && (
                      <li className="flex items-start gap-2.5">
                        <span className="text-gray-400 shrink-0 mt-0.5">📋</span>
                        <div>
                          <div className="text-xs text-gray-400 mb-0.5">Type de marché</div>
                          <div className="text-gray-800 font-medium">{TYPE_LABELS[ao.type_marche] ?? ao.type_marche}</div>
                        </div>
                      </li>
                    )}
                    {ao.procedure && (
                      <li className="flex items-start gap-2.5">
                        <span className="text-gray-400 shrink-0 mt-0.5">⚖️</span>
                        <div>
                          <div className="text-xs text-gray-400 mb-0.5">Procédure</div>
                          <div className="text-gray-800 font-medium">{PROCEDURE_LABELS[ao.procedure] ?? ao.procedure}</div>
                        </div>
                      </li>
                    )}
                    {montant && (
                      <li className="flex items-start gap-2.5">
                        <span className="text-gray-400 shrink-0 mt-0.5">💶</span>
                        <div>
                          <div className="text-xs text-gray-400 mb-0.5">Valeur estimée HT</div>
                          <div className="text-gray-800 font-semibold text-base">{montant}</div>
                        </div>
                      </li>
                    )}
                    {parsed.duree && (
                      <li className="flex items-start gap-2.5">
                        <span className="text-gray-400 shrink-0 mt-0.5">🗓</span>
                        <div>
                          <div className="text-xs text-gray-400 mb-0.5">Durée</div>
                          <div className="text-gray-800 font-medium">{parsed.duree}</div>
                        </div>
                      </li>
                    )}
                    {ao.cpv_code && (
                      <li className="flex items-start gap-2.5">
                        <span className="text-gray-400 shrink-0 mt-0.5">🏷</span>
                        <div>
                          <div className="text-xs text-gray-400 mb-0.5">Code CPV</div>
                          <div className="text-gray-700 font-mono text-xs">{ao.cpv_code}</div>
                        </div>
                      </li>
                    )}
                    <li className="flex items-start gap-2.5">
                      <span className="text-gray-400 shrink-0 mt-0.5">📂</span>
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">Allotissement</div>
                        <div className="text-gray-800 font-medium">
                          {parsed.lots.length > 1
                            ? `${parsed.lots.length} lots`
                            : parsed.lots.length === 1
                              ? '1 lot'
                              : 'Marché unique (non alloti)'}
                        </div>
                      </div>
                    </li>
                  </ul>

                  {/* Bouton DCE */}
                  <div className="border-t border-gray-100 pt-4 space-y-2">
                    {ao.url_document && (
                      <a
                        className="btn w-full text-white bg-blue-500 hover:bg-blue-600 shadow-xs text-sm group"
                        href={ao.url_document}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Accéder au dossier{' '}
                        <span className="tracking-normal text-blue-200 group-hover:translate-x-0.5 transition-transform duration-150 ml-1">→</span>
                      </a>
                    )}
                    <a
                      className="btn w-full text-gray-600 bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-sm group"
                      href={`https://www.boamp.fr/pages/avis/?q=idweb:${ao.reference}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Voir sur BOAMP.fr
                    </a>
                  </div>
                </div>
            </aside>

            {/* ── Contenu principal ── */}
            <div className="md:grow min-w-0">
              {/* Fil d'Ariane */}
              <div className="mb-5 flex items-center flex-wrap gap-1.5 text-sm">
                <Link className="text-blue-500 hover:underline" href="/">Accueil</Link>
                <span className="text-gray-300">/</span>
                <Link className="text-blue-500 hover:underline" href={`/${categorie}`}>{categorieLabel}</Link>
                {ao.region && ao.region_label && (
                  <>
                    <span className="text-gray-300">/</span>
                    <Link className="text-blue-500 hover:underline" href={`/${categorie}/${ao.region}`}>{ao.region_label}</Link>
                  </>
                )}
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md font-mono">
                  Réf. {ao.reference}
                </span>
                {parsed.allDescripteurs.map((d) => (
                  <span key={d} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                    {d}
                  </span>
                ))}
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold font-inter mb-6 leading-tight">{ao.titre}</h1>

              {/* ── Synthèse rapide ── */}
              <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {montant && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                    <div className="text-xs text-blue-500 font-medium mb-1">Valeur estimée</div>
                    <div className="text-sm font-bold text-blue-900">{montant}</div>
                  </div>
                )}
                {(lieuExecution || ao.region_label) && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-500 font-medium mb-1">Lieu</div>
                    <div className="text-sm font-bold text-gray-800 leading-snug">{lieuExecution ?? ao.region_label}</div>
                  </div>
                )}
                {parsed.duree && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-500 font-medium mb-1">Durée</div>
                    <div className="text-sm font-bold text-gray-800">{parsed.duree}</div>
                  </div>
                )}
                {ao.type_marche && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-500 font-medium mb-1">Nature</div>
                    <div className="text-sm font-bold text-gray-800">{TYPE_LABELS[ao.type_marche] ?? ao.type_marche}</div>
                  </div>
                )}
                {daysRemaining !== null && (
                  <div className={`border rounded-xl p-3 text-center ${
                    daysRemaining < 0 ? 'bg-gray-50 border-gray-200' :
                    daysRemaining < 7 ? 'bg-red-50 border-red-200' :
                    daysRemaining < 30 ? 'bg-orange-50 border-orange-200' :
                    'bg-green-50 border-green-200'
                  }`}>
                    <div className={`text-xs font-medium mb-1 ${
                      daysRemaining < 0 ? 'text-gray-500' :
                      daysRemaining < 7 ? 'text-red-500' :
                      daysRemaining < 30 ? 'text-orange-500' :
                      'text-green-600'
                    }`}>Délai</div>
                    <div className={`text-sm font-bold ${
                      daysRemaining < 0 ? 'text-gray-700' :
                      daysRemaining < 7 ? 'text-red-700' :
                      daysRemaining < 30 ? 'text-orange-700' :
                      'text-green-700'
                    }`}>
                      {daysRemaining < 0 ? 'Clôturé' : `${daysRemaining}j restants`}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-8 mb-10">

                {/* ── Section 1 : Acheteur (toujours visible) ── */}
                <section>
                  <SectionTitle>Section 1 — Acheteur</SectionTitle>
                  <InfoTable rows={[
                    { label: 'Nom officiel', value: acheteur?.nom ?? ao.acheteur },
                    { label: 'SIRET', value: acheteur?.siret ?? ao.acheteur_siret },
                    { label: 'Forme juridique', value: acheteur?.formeJuridique },
                    { label: 'Activité', value: acheteur?.activite },
                    { label: 'Contact', value: acheteur?.contactNom },
                    { label: 'Adresse', value: acheteur?.adresse },
                    { label: 'Code postal', value: acheteur?.codePostal },
                    { label: 'Ville', value: acheteur?.ville },
                    { label: 'Département', value: ao.departement },
                    { label: 'Région', value: ao.region_label && ao.region
                      ? <Link href={`/${categorie}/${ao.region}`} className="text-blue-500 hover:underline">{ao.region_label}</Link>
                      : ao.region_label
                    },
                    { label: 'Téléphone', value: acheteur?.telephone
                      ? <a href={`tel:${acheteur.telephone}`} className="text-blue-500 hover:underline">{acheteur.telephone}</a>
                      : null
                    },
                    { label: 'Email', value: acheteur?.email
                      ? <a href={`mailto:${acheteur.email}`} className="text-blue-500 hover:underline">{acheteur.email}</a>
                      : null
                    },
                    { label: 'Site web / DCE', value: acheteur?.website && acheteur.website !== 'http://0'
                      ? <a href={acheteur.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">{acheteur.website}</a>
                      : null
                    },
                  ]} />
                </section>

                {/* ── Section 2 : Procédure ── */}
                <section>
                  <SectionTitle>Section 2 — Procédure</SectionTitle>

                  {/* Description complète */}
                  {(parsed.description || ao.objet) && (
                    <div className="mb-4 p-5 bg-blue-50 border border-blue-100 rounded-xl">
                      <p className="text-sm font-semibold text-blue-800 mb-2">Description</p>
                      <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                        {parsed.description ?? ao.objet}
                      </p>
                    </div>
                  )}

                  <InfoTable rows={[
                    { label: 'Identifiant procédure', value: parsed.procedureId },
                    { label: 'Identifiant interne', value: parsed.procedureInterne ?? parsed.referenceMarche },
                    { label: 'Type de procédure', value: ao.procedure ? (PROCEDURE_LABELS[ao.procedure] ?? ao.procedure) : null },
                    { label: 'Procédure accélérée', value: parsed.acceleree === true ? 'Oui' : parsed.acceleree === false ? 'Non' : null },
                    { label: 'Nature du marché', value: ao.type_marche ? (TYPE_LABELS[ao.type_marche] ?? ao.type_marche) : null },
                    { label: 'Code CPV principal', value: ao.cpv_code },
                    { label: 'Valeur estimée HT', value: montant ? `${montant} ${parsed.devise ?? 'EUR'}` : null },
                    { label: 'Lieu d\'exécution', value: lieuExecution },
                    { label: 'Durée du marché', value: parsed.duree },
                    { label: 'Validité des offres', value: parsed.validiteOffres },
                    { label: 'Base juridique', value: parsed.baseJuridique },
                    { label: 'Allotissement', value: parsed.lots.length > 1 ? `Divisé en ${parsed.lots.length} lots` : parsed.lots.length === 1 ? '1 lot' : 'Non divisé en lots' },
                  ]} />

                  {/* Caractéristiques techniques (MAPA format) */}
                  {parsed.caracteristiques && (
                    <div className="mt-4 p-5 bg-gray-50 border border-gray-200 rounded-xl">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Caractéristiques techniques</p>
                      <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{parsed.caracteristiques}</p>
                    </div>
                  )}

                  {/* Prestations / Quantités */}
                  {parsed.quantites && (
                    <div className="mt-4 p-5 bg-gray-50 border border-gray-200 rounded-xl">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Prestations demandées</p>
                      <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{parsed.quantites}</p>
                    </div>
                  )}
                </section>

                {/* ── Calendrier ── */}
                <section>
                  <SectionTitle>Calendrier</SectionTitle>
                  <InfoTable rows={[
                    { label: 'Date de publication', value: formatDate(ao.date_publication, false) },
                    {
                      label: 'Date limite de réponse',
                      value: ao.date_limite
                        ? <span className="text-red-600 font-semibold">
                            {formatDate(ao.date_limite, false)}
                            {daysRemaining !== null && daysRemaining >= 0 && (
                              <span className="ml-2 text-xs font-normal text-gray-500">
                                ({daysRemaining} jour{daysRemaining > 1 ? 's' : ''} restant{daysRemaining > 1 ? 's' : ''})
                              </span>
                            )}
                          </span>
                        : null
                    },
                    { label: 'Ouverture des offres', value: parsed.dateOuvertureOffres ? formatDate(parsed.dateOuvertureOffres, false) : null },
                    { label: 'Durée du marché', value: parsed.duree },
                    { label: 'Validité des offres', value: parsed.validiteOffres },
                  ]} />
                </section>

                {/* ── Critères d'attribution (top-level, toujours visible) ── */}
                <section>
                  <SectionTitle>Critères d'attribution</SectionTitle>
                  {allCriteria.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Pondération</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {allCriteria.map((c, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-4 py-2.5">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                  c.type === 'price' ? 'bg-green-100 text-green-700' :
                                  c.type === 'quality' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {c.typeLabel}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-gray-700">{c.description}</td>
                              <td className="px-4 py-2.5 text-right">
                                {c.weight && <span className="font-bold text-gray-900">{c.weight}%</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : parsed.criteres ? (
                    <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="space-y-1">
                        {parsed.criteres.split('\n').filter(Boolean).map((line, i) => {
                          const parts = line.split(':')
                          const label = parts[0]?.trim()
                          const weight = parts[1]?.trim()
                          return (
                            <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                              <span className="text-gray-700">{label}</span>
                              {weight && <span className="font-bold text-gray-900 ml-4">{weight}</span>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600">
                      Les critères d'attribution sont disponibles dans le dossier de consultation (DCE).{' '}
                      {ao.url_document && (
                        <a href={ao.url_document} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          Accéder au DCE →
                        </a>
                      )}
                    </div>
                  )}
                </section>

                {/* ── Section 5 : Lots ── */}
                {parsed.lots.length > 0 && (
                  <section>
                    <SectionTitle>
                      Section 5 — Lots
                      <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {parsed.lots.length} lot{parsed.lots.length > 1 ? 's' : ''}
                      </span>
                    </SectionTitle>

                    <div className="space-y-4">
                      {parsed.lots.map((lot) => (
                        <details key={lot.id} className="group bg-white border border-gray-200 rounded-xl overflow-hidden">
                          <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition list-none">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-xs font-mono text-gray-400 shrink-0">{lot.id}</span>
                              <span className="font-semibold text-gray-800 text-sm leading-snug">{lot.titre}</span>
                            </div>
                            <span className="text-gray-400 text-xs shrink-0 ml-3 group-open:rotate-90 transition-transform">▶</span>
                          </summary>

                          <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                            {/* Description */}
                            {lot.description && lot.description !== lot.titre && (
                              <p className="text-sm text-gray-600 leading-relaxed">{lot.description}</p>
                            )}

                            {/* Infos lot */}
                    <InfoTable rows={[
                      { label: 'Code CPV', value: lot.cpv },
                      { label: 'Lieu d\'exécution', value: lot.lieuExecution },
                      { label: 'Renouvellements max', value: lot.renewalCount },
                      { label: 'Conditions renouvellement', value: lot.renewalDescription },
                      { label: 'Accord-cadre', value: lot.framework },
                      { label: 'Durée', value: lot.dureeEnMois ? `${lot.dureeEnMois} mois` : null },
                    ]} />

                            {/* Critères d'attribution par lot */}
                            {lot.criteria.length > 0 && (
                              <div>
                                <p className="text-sm font-semibold text-gray-700 mb-2">Critères d'attribution</p>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Pondération</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {lot.criteria.map((c, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                          <td className="px-4 py-2.5">
                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                              c.type === 'price' ? 'bg-green-100 text-green-700' :
                                              c.type === 'quality' ? 'bg-blue-100 text-blue-700' :
                                              'bg-gray-100 text-gray-600'
                                            }`}>
                                              {c.typeLabel}
                                            </span>
                                          </td>
                                          <td className="px-4 py-2.5 text-gray-700">{c.description}</td>
                                          <td className="px-4 py-2.5 text-right">
                                            {c.weight && (
                                              <span className="font-bold text-gray-900">{c.weight}%</span>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        </details>
                      ))}
                    </div>
                  </section>
                )}

                {/* ── Conditions de participation (toujours visible) ── */}
                <section>
                  <SectionTitle>Conditions de participation</SectionTitle>
                  {parsed.justifications ? (
                    <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">{parsed.justifications}</p>
                    </div>
                  ) : (
                    <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-sm font-semibold text-amber-800 mb-3">Prérequis standards pour tout marché public</p>
                      <ul className="space-y-1.5 text-sm text-gray-700 list-disc list-inside">
                        <li>Ne pas être en situation d'exclusion légale (art. L2141 du Code de la commande publique)</li>
                        <li>Être à jour de vos cotisations fiscales et sociales</li>
                        <li>Disposer des capacités techniques et financières adaptées à ce marché</li>
                      </ul>
                      <p className="mt-3 text-xs text-gray-500">
                        Consultez le règlement de la consultation dans le DCE pour les conditions spécifiques à cet appel d'offres.{' '}
                        {ao.url_document && (
                          <a href={ao.url_document} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            Accéder au DCE →
                          </a>
                        )}
                      </p>
                    </div>
                  )}
                </section>

                {/* ── Comment postuler ── */}
                <section>
                  <SectionTitle>Comment postuler</SectionTitle>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">

                    <div className="flex gap-4 p-5">
                      <div className="w-7 h-7 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm mb-1">Télécharger le dossier de consultation (DCE)</p>
                        <p className="text-sm text-gray-500 mb-2">Le DCE contient tous les documents nécessaires : règlement de la consultation (RC), CCAP, CCTP, BPU/DQE…</p>
                        {ao.url_document ? (
                          <a href={ao.url_document} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-500 hover:underline">
                            Accéder au DCE →
                          </a>
                        ) : (
                          <a href={`https://www.boamp.fr/pages/avis/?q=idweb:${ao.reference}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-500 hover:underline">
                            Voir l'avis sur BOAMP.fr →
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-4 p-5">
                      <div className="w-7 h-7 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm mb-1">Analyser les documents et vérifier votre éligibilité</p>
                        <p className="text-sm text-gray-500">Vérifiez les critères d'attribution, les conditions de participation et assurez-vous que votre offre répond au besoin exprimé dans le CCTP.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-5">
                      <div className="w-7 h-7 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm mb-1">Préparer votre candidature</p>
                        <p className="text-sm text-gray-500">Rassemblez les pièces habituelles : DC1 (lettre de candidature), DC2 (déclaration du candidat), références similaires, attestations fiscales et sociales, mémoire technique.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-5">
                      <div className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                        daysRemaining !== null && daysRemaining >= 0 && daysRemaining < 7 ? 'bg-red-500' :
                        daysRemaining !== null && daysRemaining >= 0 && daysRemaining < 30 ? 'bg-orange-500' :
                        'bg-blue-500'
                      }`}>4</div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm mb-1">
                          Déposer votre offre avant le{' '}
                          <span className={ao.date_limite ? 'text-red-600' : 'text-gray-700'}>
                            {formatDate(ao.date_limite, false)}
                          </span>
                          {daysRemaining !== null && daysRemaining >= 0 && (
                            <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                              daysRemaining < 7 ? 'bg-red-100 text-red-700' :
                              daysRemaining < 30 ? 'bg-orange-100 text-orange-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {daysRemaining}j restants
                            </span>
                          )}
                          {daysRemaining !== null && daysRemaining < 0 && (
                            <span className="ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">Clôturé</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">Déposez votre offre sur la plateforme indiquée dans le règlement de la consultation. En cas de question, contactez directement l'acheteur.</p>
                        {(acheteur?.email || acheteur?.telephone) && (
                          <div className="mt-2 flex flex-wrap gap-3">
                            {acheteur?.email && (
                              <a href={`mailto:${acheteur.email}`} className="inline-flex items-center gap-1.5 text-sm text-blue-500 hover:underline">
                                ✉️ {acheteur.email}
                              </a>
                            )}
                            {acheteur?.telephone && (
                              <a href={`tel:${acheteur.telephone}`} className="inline-flex items-center gap-1.5 text-sm text-blue-500 hover:underline">
                                📞 {acheteur.telephone}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </section>

                {/* ── Informations complémentaires ── */}
                {parsed.infoComplementaire && (
                  <section>
                    <SectionTitle>Informations complémentaires</SectionTitle>
                    <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
                      <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{parsed.infoComplementaire}</p>
                    </div>
                  </section>
                )}

              </div>

              {/* Marchés similaires */}
              {similaires.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-2xl font-bold font-inter mb-6">Marchés similaires</h2>
                  <div className="flex flex-col gap-3">
                    {similaires.map((s) => <AoItem key={s.id} {...s} />)}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </div>
    </section>
    </>
  )
}

// ─── Region Page ──────────────────────────────────────────────────────────────

async function RegionPage({
  categorie,
  region,
  sp,
}: {
  categorie: string
  region: string
  sp: Record<string, string>
}) {
  const filters: AoFilters = {
    procedure: sp.procedure || undefined,
    date_limite: sp.date_limite || undefined,
    page: sp.page ? parseInt(sp.page) : 1,
  }

  const [result, allRegions] = await Promise.all([
    getAppelsOffreByRegion(categorie, region, filters),
    getRegionsByCategorie(categorie),
  ])

  const { data: appelsOffre, count, totalPages, page } = result

  const categorieLabel = TYPE_MARCHE_SLUGS.has(categorie)
    ? ({ travaux: 'Travaux', services: 'Services', fournitures: 'Fournitures' } as Record<string, string>)[categorie]
    : (appelsOffre[0]?.categorie_label ?? categorie)
  const regionLabel = appelsOffre[0]?.region_label
    ?? region.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  const breadcrumbItems = [
    { name: 'Accueil', href: '/' },
    { name: categorieLabel ?? categorie, href: `/${categorie}` },
    { name: regionLabel, href: `/${categorie}/${region}` },
  ]

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {/* Hero région */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-blue-100 to-white pointer-events-none -z-10" aria-hidden="true" />
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-8">
          <div className="pt-28 pb-8 md:pt-36 md:pb-12">
            <div className="mb-3 flex items-center gap-1.5 text-sm flex-wrap">
              <Link className="text-blue-500 hover:underline" href="/">Accueil</Link>
              <span className="text-gray-300">/</span>
              <Link className="text-blue-500 hover:underline" href={`/${categorie}`}>{categorieLabel}</Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-500">{regionLabel}</span>
            </div>
            <h1 className="h1 font-inter mb-4">
              Appels d'offre {categorieLabel} en {regionLabel}
            </h1>
            <p className="text-lg text-gray-500 mb-6">
              {count > 0
                ? `${count.toLocaleString('fr-FR')} marchés publics, mis à jour quotidiennement.`
                : 'Aucun marché public dans cette région pour le moment.'}
            </p>

            {/* Autres régions */}
            {allRegions.length > 1 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-500 mr-1">Autres régions :</span>
                {allRegions.filter((r) => r.region !== region).slice(0, 8).map((r) => (
                  <Link
                    key={r.region}
                    href={`/${categorie}/${r.region}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 transition shadow-xs"
                  >
                    {r.region_label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Liste */}
      <section>
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-8">
          <div className="py-8 md:py-16">
            <div className="md:flex" data-sticky-container>
              <Suspense fallback={<div className="mb-8 md:mb-0 md:w-1/3 md:mr-8 lg:mr-10 md:shrink-0" />}>
                <SidebarWrapper />
              </Suspense>
              <div className="md:grow">
                <div className="pb-8 md:pb-16">
                  {count > 0 && (
                    <div className="flex justify-end mb-4">
                      <span className="text-sm text-gray-400">{count.toLocaleString('fr-FR')} appels d'offre</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-3">
                    {appelsOffre.length === 0 ? (
                      <div className="py-16 text-center text-gray-400">
                        <p className="text-lg mb-2">Aucun appel d'offre dans cette région.</p>
                        <Link className="text-blue-500 hover:underline" href={`/${categorie}`}>
                          Voir tous les marchés {categorieLabel}
                        </Link>
                      </div>
                    ) : (
                      appelsOffre.map((ao) => <AoItem key={ao.id} {...ao} />)
                    )}
                  </div>
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    basePath={`/${categorie}/${region}`}
                    searchParams={Object.fromEntries(Object.entries(sp).filter(([k]) => k !== 'page'))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

// ─── Router ───────────────────────────────────────────────────────────────────

export default async function SegmentPage({ params, searchParams }: PageProps) {
  const { categorie, segment } = await params
  const sp = await searchParams

  if (isAoSegment(segment)) {
    return <AoDetailPage categorie={categorie} segment={segment} />
  }
  return <RegionPage categorie={categorie} region={segment} sp={sp} />
}
