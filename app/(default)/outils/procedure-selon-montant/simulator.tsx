'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import {
  determinerProcedure, NIVEAU_LABELS, TYPES_ACHETEUR, TYPES_MARCHE,
  type Niveau, type Seuil, type TypeAcheteur, type TypeMarche,
} from '@/lib/outils/procedure'
import { fmtDate, fmtEur, isIsoDate, parseNumber } from '@/lib/format'
import { Alert, Field, FormStep, inputClass, RadioCards, Toggle } from '@/components/outils/form'
import { CopyButton, PrintButton } from '@/components/outils/actions'

type AoTranche = { id: number; href: string; titre: string; acheteur: string | null; region: string | null; montant: number | null; dateLimite: string | null }

const NIVEAU_STYLES: Record<Niveau, string> = {
  dispense: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  mapa: 'bg-blue-50 text-blue-700 border-blue-200',
  formalisee: 'bg-violet-50 text-violet-700 border-violet-200',
}

export default function ProcedureSimulator({ seuils, today, intro }: { seuils: Seuil[]; today: string; intro: ReactNode }) {
  const [typeMarche, setTypeMarche] = useState<TypeMarche>('travaux')
  const [acheteur, setAcheteur] = useState<TypeAcheteur>('collectivite')
  const [montant, setMontant] = useState('350000')
  const [date, setDate] = useState(today)
  const [alloti, setAlloti] = useState(false)
  const [montantLot, setMontantLot] = useState('')
  const [pac, setPac] = useState(false)
  const [aos, setAos] = useState<{ count: number; items: AoTranche[] } | null>(null)

  const montantNum = parseNumber(montant)
  const lotNum = parseNumber(montantLot)
  const pacDisponible = typeMarche === 'travaux' && seuils.some((s) => s.code === 'dispense-pac' && s.valid_from <= date && (!s.valid_to || date <= s.valid_to))

  const res = useMemo(
    () =>
      montantNum >= 0 && isIsoDate(date)
        ? determinerProcedure(
            { typeMarche, acheteur, montant: montantNum, date, alloti, montantLot: lotNum > 0 ? lotNum : null, pac: pac && pacDisponible },
            seuils,
          )
        : null,
    [typeMarche, acheteur, montantNum, date, alloti, lotNum, pac, pacDisponible, seuils],
  )

  const trancheKey = res ? `${typeMarche}|${res.tranche.min}|${res.tranche.max}` : ''
  useEffect(() => {
    if (!res) return
    const params = new URLSearchParams({ type: typeMarche, min: String(res.tranche.min) })
    if (res.tranche.max !== null) params.set('max', String(res.tranche.max))
    let annule = false
    fetch(`/api/ao/tranche?${params}`)
      .then((r) => r.json())
      .then((d) => !annule && setAos(d))
      .catch(() => !annule && setAos(null))
    return () => { annule = true }
  }, [trancheKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const lotSuperieur = alloti && lotNum > 0 && montantNum > 0 && lotNum > montantNum

  const resumeTexte = () =>
    res
      ? [
          'Procédure selon le montant (mon-ao.com)',
          `${TYPES_MARCHE.find((t) => t.value === typeMarche)?.label}, ${TYPES_ACHETEUR.find((t) => t.value === acheteur)?.label}, ${fmtEur(montantNum, 0)} HT, consultation lancée le ${fmtDate(date)}`,
          `Procédure : ${NIVEAU_LABELS[res.niveau]}`,
          `Publicité : ${res.publicite.titre} (${res.publicite.reference})`,
          res.delaiMapa ? `Délai : ${res.delaiMapa}` : '',
          ...(res.delais ?? []).map((d) => `${d.procedure} : ${d.delai} (${d.reference})`),
          res.lot ? `Lot de ${fmtEur(lotNum, 0)} : ${res.lot.titre}` : '',
          `Seuils appliqués : dispense ${fmtEur(res.dispense!.montant, 0)} HT, procédure formalisée ${fmtEur(res.formalise!.montant, 0)} HT`,
        ]
          .filter(Boolean)
          .join('\n')
      : ''

  return (
    <>
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-5 lg:pt-4">{intro}</div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-xl shadow-blue-900/5 p-5 md:p-7">
            <FormStep n={1} title="Le marché" />
            <RadioCards name="type" value={typeMarche} onChange={setTypeMarche} options={TYPES_MARCHE} />
            <div className="mt-3">
              <RadioCards name="acheteur" value={acheteur} onChange={setAcheteur} options={TYPES_ACHETEUR} />
            </div>

            <div className="border-t border-gray-100 my-6" />
            <FormStep n={2} title="Le montant" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Montant estimé HT" hint="toute la durée, reconductions comprises" htmlFor="pr-montant">
                <div className="relative">
                  <input id="pr-montant" inputMode="decimal" className={`${inputClass} pr-8`} value={montant} onChange={(e) => setMontant(e.target.value)} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
                </div>
              </Field>
              <Field label="Lancement de la consultation" htmlFor="pr-date">
                <input id="pr-date" type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
              </Field>
            </div>
            <div className="mt-4 space-y-3">
              <Toggle checked={alloti} onChange={setAlloti} label="Le marché est alloti : je réponds à un lot" />
              {alloti && (
                <Field label="Montant de votre lot HT" hint="le montant ci-dessus est celui de tous les lots" htmlFor="pr-lot" className="sm:w-1/2">
                  <div className="relative">
                    <input id="pr-lot" inputMode="decimal" className={`${inputClass} pr-8`} value={montantLot} placeholder="80 000" onChange={(e) => setMontantLot(e.target.value)} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
                  </div>
                </Field>
              )}
              {pacDisponible && (
                <Toggle checked={pac} onChange={setPac} label="Installation de pompes à chaleur ou raccordement à un réseau de chaleur" />
              )}
            </div>

            <div className="border-t border-gray-100 my-6" />
            {res ? (
              <div>
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${NIVEAU_STYLES[res.niveau]}`}>
                  Résultat
                </span>
                <p className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900">{NIVEAU_LABELS[res.niveau]}</p>
                <p className="mt-1 text-sm text-gray-600">
                  Publicité : <strong className="text-gray-900">{res.publicite.titre}</strong>
                  {res.niveau === 'formalisee' && ' · délai minimum : 30 à 35 jours en appel d\'offres ouvert'}
                </p>
                {res.lot && <p className="mt-1 text-sm text-gray-600">Votre lot : <strong className="text-gray-900">{res.lot.titre.toLowerCase()}</strong></p>}
                <a href="#detail" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">Voir la publicité, les délais et les seuils appliqués ↓</a>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Renseignez un montant pour obtenir la procédure.</p>
            )}
          </div>
        </div>
      </div>

      {res && (
        <div id="detail" className="scroll-mt-24 mt-12 lg:mt-16 grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <div id="procedure-resultat" className="rounded-2xl border border-gray-200 bg-white p-5 md:p-7 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-gray-900">{NIVEAU_LABELS[res.niveau]}</h2>
                <div className="no-print flex flex-wrap gap-2">
                  <CopyButton getText={resumeTexte} />
                  <PrintButton targetId="procedure-resultat" title="Procédure selon le montant" />
                </div>
              </div>

              {lotSuperieur && <Alert tone="warning">Le montant du lot dépasse le montant total : vérifiez vos saisies.</Alert>}
              {res.pacApplique && <Alert>Seuil temporaire appliqué : {res.dispense?.libelle.toLowerCase()} ({res.dispense?.reference}).</Alert>}

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">Procédures possibles</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  {res.procedures.map((p) => <li key={p}>{p}</li>)}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">Publicité obligatoire</h3>
                <p className="font-semibold text-gray-900">{res.publicite.titre} <span className="font-normal text-gray-400 text-sm">· {res.publicite.reference}</span></p>
                <p className="text-sm text-gray-600 mt-1">{res.publicite.detail}</p>
                {res.dceObligatoire && (
                  <p className="text-sm text-gray-600 mt-2">
                    Dès {fmtEur(res.dceEnLigne!.montant, 0)} HT, quand un avis est publié, les documents de la consultation sont mis en ligne gratuitement sur le profil d'acheteur ({res.dceEnLigne!.reference}).
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">Délais minimum de réception</h3>
                {res.niveau === 'dispense' && <p className="text-sm text-gray-600">Aucun délai réglementaire : l'acheteur fixe la date de remise des devis.</p>}
                {res.delaiMapa && <p className="text-sm text-gray-600">{res.delaiMapa}</p>}
                {res.delais && (
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-gray-100">
                        {res.delais.map((d) => (
                          <tr key={d.procedure}>
                            <th scope="row" className="px-4 py-3 text-left font-semibold text-gray-900 align-top whitespace-nowrap">{d.procedure}</th>
                            <td className="px-4 py-3 text-gray-600">{d.delai} <span className="text-gray-400">· {d.reference}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {res.lot && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">Votre lot</h3>
                  <p className="font-semibold text-gray-900">{res.lot.titre}</p>
                  <p className="text-sm text-gray-600 mt-1">{res.lot.detail}</p>
                </div>
              )}

              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm text-gray-600 space-y-2">
                <p><strong className="text-gray-800">Valeur estimée :</strong> le montant total HT du besoin, sur toute la durée du marché, reconductions, options et tous lots compris.</p>
                <p><strong className="text-gray-800">Saucissonnage interdit :</strong> découper un besoin pour passer sous un seuil est illégal, l'acheteur doit additionner les achats d'une même opération ou de prestations homogènes.</p>
                {res.marcheEcrit && <p><strong className="text-gray-800">Marché écrit :</strong> au-delà de {fmtEur(res.ecrit!.montant, 0)} HT, le marché est conclu par écrit ({res.ecrit!.reference}).</p>}
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">Seuils appliqués</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {[res.dispense!, res.formalise!, ...(res.niveau === 'mapa' && res.publiciteMapa ? [res.publiciteMapa] : [])].map((s) => (
                    <li key={s.id}>
                      <strong className="text-gray-900">{fmtEur(s.montant, 0)} HT</strong> · {s.libelle.toLowerCase()}, en vigueur depuis le {fmtDate(s.valid_from)}
                      {s.valid_to && ` jusqu'au ${fmtDate(s.valid_to)}`} ({s.reference})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">AO en cours dans cette tranche</h2>
              <p className="text-sm text-gray-500 mb-4">
                {TYPES_MARCHE.find((t) => t.value === typeMarche)?.label}, montant estimé{' '}
                {res.tranche.max === null ? `au-dessus de ${fmtEur(res.tranche.min, 0)}` : `entre ${fmtEur(res.tranche.min, 0)} et ${fmtEur(res.tranche.max, 0)}`} HT
              </p>
              {aos === null ? (
                <p className="text-sm text-gray-400">Chargement…</p>
              ) : aos.items.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun AO ouvert avec un montant estimé dans cette tranche pour le moment.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {aos.items.map((ao) => (
                    <li key={ao.id} className="py-3">
                      <Link href={ao.href} className="block group">
                        <span className="block text-sm font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2">{ao.titre}</span>
                        <span className="block text-xs text-gray-500 mt-0.5">
                          {[ao.acheteur, ao.region, ao.montant ? fmtEur(ao.montant, 0) : null, ao.dateLimite ? `limite ${fmtDate(ao.dateLimite)}` : null].filter(Boolean).join(' · ')}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link href={`/${typeMarche}`} className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline">
                Tous les marchés de {typeMarche} →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
