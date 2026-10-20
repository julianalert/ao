'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ETAPE_LABELS, pieceHref, piecesPour, type ContexteCandidature, type EtapePiece } from '@/lib/outils/pieces'
import { FormStep, RadioCards, Toggle } from '@/components/outils/form'
import { CopyButton, PrintButton } from '@/components/outils/actions'
import RappelAttestation from '@/components/alertes/rappel-attestation'

const STORAGE_KEY = 'mon-ao:pieces-cochees'

function lireCoches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export default function PiecesChecklist({ intro, avecPage }: { intro: ReactNode; avecPage: string[] }) {
  const [ctx, setCtx] = useState<ContexteCandidature>({
    typeMarche: 'travaux',
    procedure: 'mapa',
    groupement: false,
    sousTraitance: false,
    etrangere: false,
    moinsUnAn: false,
  })
  const [coches, setCoches] = useState<string[]>([])
  const [exigees, setExigees] = useState<string[]>([])

  // Pré-remplissage depuis l'URL (ex. depuis l'analyseur de RC) puis depuis le navigateur
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const type = sp.get('type')
    const procedure = sp.get('procedure')
    setCtx((c) => ({
      ...c,
      ...(type === 'travaux' || type === 'fournitures' || type === 'services' ? { typeMarche: type } : {}),
      ...(procedure === 'mapa' || procedure === 'formalisee' ? { procedure } : {}),
      ...(sp.get('groupement') === '1' ? { groupement: true } : {}),
      ...(sp.get('sous-traitance') === '1' ? { sousTraitance: true } : {}),
    }))
    const depuisUrl = sp.get('pieces')?.split(',').filter(Boolean)
    setCoches(depuisUrl ?? lireCoches())
    setExigees(sp.get('exigees')?.split(',').filter(Boolean) ?? [])
  }, [])

  const toggle = (slug: string) => {
    const next = coches.includes(slug) ? coches.filter((s) => s !== slug) : [...coches, slug]
    setCoches(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {}
  }

  const pieces = useMemo(() => piecesPour(ctx), [ctx])
  const etapes = (['candidature', 'offre', 'attributaire'] as EtapePiece[]).map((e) => ({ etape: e, pieces: pieces.filter((p) => p.etape === e) }))
  const faites = pieces.filter((p) => coches.includes(p.slug)).length
  const set = <K extends keyof ContexteCandidature>(k: K) => (v: ContexteCandidature[K]) => setCtx({ ...ctx, [k]: v })

  const texte = () =>
    [
      'Checklist des pièces de candidature (mon-ao.com)',
      ...etapes.flatMap(({ etape, pieces }) => [
        '',
        ETAPE_LABELS[etape].toUpperCase(),
        ...pieces.map((p) => `[${coches.includes(p.slug) ? 'x' : ' '}] ${p.nom} · ${p.quand} · validité : ${p.validite} · ${p.ou.label}`),
      ]),
    ].join('\n')

  return (
    <>
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-5 lg:pt-4">{intro}</div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-xl shadow-blue-900/5 p-5 md:p-7">
            <FormStep n={1} title="Le marché" />
            <RadioCards
              name="type"
              value={ctx.typeMarche}
              onChange={set('typeMarche')}
              options={[
                { value: 'travaux', label: 'Travaux' },
                { value: 'fournitures', label: 'Fournitures' },
                { value: 'services', label: 'Services' },
              ]}
            />
            <div className="mt-3">
              <RadioCards
                name="procedure"
                value={ctx.procedure}
                onChange={set('procedure')}
                columns={2}
                options={[
                  { value: 'mapa', label: 'Procédure adaptée (MAPA)', hint: 'sous les seuils européens' },
                  { value: 'formalisee', label: 'Procédure formalisée', hint: 'appel d\'offres, négociation…' },
                ]}
              />
            </div>

            <div className="border-t border-gray-100 my-6" />
            <FormStep n={2} title="Votre réponse" />
            <div className="grid sm:grid-cols-2 gap-3">
              <Toggle checked={ctx.groupement} onChange={set('groupement')} label="En groupement d'entreprises" />
              <Toggle checked={ctx.sousTraitance} onChange={set('sousTraitance')} label="Avec des sous-traitants" />
              <Toggle checked={ctx.etrangere} onChange={set('etrangere')} label="Entreprise établie hors de France" />
              <Toggle checked={ctx.moinsUnAn} onChange={set('moinsUnAn')} label="Entreprise de moins d'un an" />
            </div>

            <div className="border-t border-gray-100 my-6" />
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-extrabold tracking-tight text-gray-900">{pieces.length} pièces à préparer</p>
                <p className="text-sm text-gray-500 mt-1">
                  {etapes.map(({ etape, pieces }) => `${pieces.length} ${ETAPE_LABELS[etape].toLowerCase()}`).join(' · ')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-blue-600">{faites} / {pieces.length} prêtes</p>
                <div className="mt-1 h-2 w-32 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all" style={{ width: `${pieces.length ? (faites / pieces.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
            <a href="#checklist" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">Voir et cocher la checklist ↓</a>
          </div>
        </div>
      </div>

      <div id="checklist" className="scroll-mt-24 mt-12 lg:mt-16">
        <div id="pieces-checklist" className="rounded-2xl border border-gray-200 bg-white p-5 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h2 className="text-lg font-bold text-gray-900">Votre checklist</h2>
            <div className="no-print flex flex-wrap gap-2">
              <CopyButton getText={texte} />
              <PrintButton targetId="pieces-checklist" title="Checklist des pièces de candidature" />
            </div>
          </div>

          <div className="space-y-8">
            {etapes.map(({ etape, pieces }) =>
              pieces.length === 0 ? null : (
                <div key={etape}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">{ETAPE_LABELS[etape]}</h3>
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                        <tr>
                          <th scope="col" className="px-4 py-3 font-semibold">Pièce</th>
                          <th scope="col" className="px-4 py-3 font-semibold">Quand</th>
                          <th scope="col" className="px-4 py-3 font-semibold">Validité</th>
                          <th scope="col" className="px-4 py-3 font-semibold">Où l'obtenir</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {pieces.map((p) => {
                          const coche = coches.includes(p.slug)
                          const note = p.note?.(ctx)
                          return (
                            <tr key={p.slug} className={coche ? 'bg-emerald-50/50' : ''}>
                              <td className="px-4 py-3 align-top min-w-64">
                                <label className="flex items-start gap-3 cursor-pointer">
                                  <input type="checkbox" className="form-checkbox mt-0.5" checked={coche} onChange={() => toggle(p.slug)} />
                                  <span>
                                    <span className={`font-semibold ${coche ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{p.nom}</span>
                                    {exigees.includes(p.slug) && (
                                      <span className="ml-2 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700 align-middle">exigée par le RC</span>
                                    )}
                                    {note && <span className="block text-xs text-gray-500 mt-1 leading-relaxed">{note}</span>}
                                    {avecPage.includes(p.slug) && (
                                      <Link href={pieceHref(p.slug)} className="no-print block text-xs font-medium text-blue-600 hover:underline mt-1">
                                        Comment la remplir →
                                      </Link>
                                    )}
                                  </span>
                                </label>
                              </td>
                              <td className="px-4 py-3 align-top text-gray-600">{p.quand}</td>
                              <td className="px-4 py-3 align-top text-gray-600">{p.validite}</td>
                              <td className="px-4 py-3 align-top whitespace-nowrap">
                                {p.ou.href ? (
                                  <a href={p.ou.href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{p.ou.label} ↗</a>
                                ) : (
                                  <span className="text-gray-600">{p.ou.label}</span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="mt-6">
          <RappelAttestation />
        </div>
      </div>
    </>
  )
}
