'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { SemesterRate } from '@/lib/ecb'
import { calculerMoratoires, EXEMPLE_MORATOIRES as EXEMPLE, INDEMNITE_FORFAITAIRE, TYPES_ACHETEUR, type MoratoiresResult, type TypeAcheteur } from '@/lib/outils/moratoires'
import { fmtDate, fmtDateLong, fmtEur, fmtPct, isIsoDate, parseNumber, todayParis } from '@/lib/format'
import { Alert, Field, FormStep, inputClass, RadioCards, Stat, Toggle } from '@/components/outils/form'
import { CopyButton, PrintButton } from '@/components/outils/actions'

type Courrier = { entreprise: string; acheteur: string; marche: string; facture: string; signataire: string }

function buildCourrier(
  c: Courrier,
  r: MoratoiresResult,
  d: { montant: number; delai: number; dateReception: string; datePaiement: string; impaye: boolean },
): string {
  const or = (v: string, placeholder: string) => v.trim() || `[${placeholder}]`
  const taux = r.semestre ? fmtPct(r.semestre.taux) : '[taux]'
  const calcul = r.periodes
    .map((p) => `${fmtEur(p.base)} × ${taux} × ${p.jours} / 365 = ${fmtEur(p.interets)}`)
    .join('\n')
  const paiement = d.impaye
    ? `À ce jour, le ${fmtDateLong(d.datePaiement)}, ce règlement n'est pas intervenu, soit un retard de ${r.joursRetard} jours. Les intérêts continuent de courir jusqu'à la date de mise en paiement du principal.`
    : `Le règlement n'est intervenu que le ${fmtDateLong(d.datePaiement)}, soit un retard de ${r.joursRetard} jours.`

  return `${or(c.entreprise, 'Votre entreprise')}

À l'attention de : ${or(c.acheteur, "Nom de l'acheteur public")}
Service ordonnateur, copie au comptable public assignataire

Objet : demande de paiement des intérêts moratoires et de l'indemnité forfaitaire pour frais de recouvrement
Marché : ${or(c.marche, 'référence du marché')} · Demande de paiement : ${or(c.facture, 'n° de facture ou de situation')}

Madame, Monsieur,

Vous avez reçu le ${fmtDateLong(d.dateReception)} notre demande de paiement d'un montant de ${fmtEur(d.montant)} TTC au titre du marché cité en objet.

Le délai de paiement de ${d.delai} jours prévu par le Code de la commande publique (articles R2192-10 et R2192-11) expirait le ${fmtDateLong(r.dateLimite)}. ${paiement}

Conformément à l'article L2192-13 du Code de la commande publique, ce retard fait courir de plein droit, et sans autre formalité, des intérêts moratoires ainsi qu'une indemnité forfaitaire pour frais de recouvrement.

Les intérêts moratoires sont calculés au taux de ${taux}, soit le taux de la Banque centrale européenne en vigueur au premier jour du semestre au cours duquel ils ont commencé à courir (${r.semestre ? fmtPct(r.semestre.ecb) : '[taux BCE]'}), majoré de huit points (article R2192-31) :
${calcul}

L'indemnité forfaitaire pour frais de recouvrement s'élève à ${fmtEur(INDEMNITE_FORFAITAIRE, 0)} (article D2192-35).

Nous vous remercions de bien vouloir procéder au règlement de la somme de ${fmtEur(r.total)}${d.impaye ? ', en sus du principal restant dû' : ''}, dans le délai de 45 jours prévu à l'article R2192-36.

Nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.

${or(c.signataire, 'Nom, fonction')}
${or(c.entreprise, 'Votre entreprise')}`
}

export default function MoratoiresCalculator({ rates, intro }: { rates: SemesterRate[]; intro: ReactNode }) {
  const [type, setType] = useState<TypeAcheteur>('pouvoir-adjudicateur')
  const [montant, setMontant] = useState(String(EXEMPLE.montant))
  const [dateReception, setDateReception] = useState(EXEMPLE.dateReception)
  const [impaye, setImpaye] = useState(false)
  const [datePaiement, setDatePaiement] = useState(EXEMPLE.datePaiement)
  const [partielOn, setPartielOn] = useState(false)
  const [partielMontant, setPartielMontant] = useState('')
  const [partielDate, setPartielDate] = useState('')
  const [courrier, setCourrier] = useState<Courrier>({ entreprise: '', acheteur: '', marche: '', facture: '', signataire: '' })
  const [today, setToday] = useState<string | null>(null)

  useEffect(() => setToday(todayParis()), [])

  const delai = TYPES_ACHETEUR.find((t) => t.value === type)!.delai
  const montantNum = parseNumber(montant)
  const fin = impaye ? today : datePaiement

  const result = useMemo(() => {
    if (!(montantNum > 0) || !isIsoDate(dateReception) || !fin || !isIsoDate(fin)) return null
    const pm = parseNumber(partielMontant)
    const partiel = partielOn && pm > 0 && isIsoDate(partielDate) ? { montant: pm, date: partielDate } : null
    return calculerMoratoires({ delai, montant: montantNum, dateReception, datePaiement: fin, partiel }, rates)
  }, [montantNum, dateReception, fin, delai, partielOn, partielMontant, partielDate, rates])

  const lettre = result?.enRetard
    ? buildCourrier(courrier, result, { montant: montantNum, delai, dateReception, datePaiement: fin!, impaye })
    : ''

  const resumeTexte = () =>
    result
      ? [
          `Intérêts moratoires (mon-ao.com)`,
          `Demande de paiement reçue le ${fmtDate(dateReception)} : ${fmtEur(montantNum)} TTC`,
          `Délai de paiement : ${delai} jours, date limite le ${fmtDate(result.dateLimite)}`,
          `${impaye ? "Non payé à ce jour" : `Payé le ${fmtDate(fin)}`} : ${result.joursRetard} jours de retard`,
          result.semestre ? `Taux : ${fmtPct(result.semestre.taux)} (${result.semestre.label}, BCE ${fmtPct(result.semestre.ecb)} + 8 points)` : '',
          `Intérêts moratoires : ${fmtEur(result.interets)}`,
          `Indemnité forfaitaire : ${fmtEur(result.indemnite)}`,
          `Total réclamable : ${fmtEur(result.total)}`,
        ]
          .filter(Boolean)
          .join('\n')
      : ''

  const setC = (k: keyof Courrier) => (e: React.ChangeEvent<HTMLInputElement>) => setCourrier({ ...courrier, [k]: e.target.value })

  return (
    <>
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-5 lg:pt-4">{intro}</div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-xl shadow-blue-900/5 p-5 md:p-7">
            <FormStep n={1} title="L'acheteur public" />
            <RadioCards
              name="acheteur"
              value={type}
              onChange={setType}
              options={TYPES_ACHETEUR.map((t) => ({ value: t.value, label: t.label, hint: `${t.delai} jours · ${t.hint}` }))}
            />

            <div className="border-t border-gray-100 my-6" />
            <FormStep n={2} title="La demande de paiement" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Montant TTC" hint="retenue de garantie déduite" htmlFor="im-montant">
                <div className="relative">
                  <input id="im-montant" inputMode="decimal" className={`${inputClass} pr-8`} value={montant} onChange={(e) => setMontant(e.target.value)} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
                </div>
              </Field>
              <Field label="Reçue par l'acheteur le" htmlFor="im-reception">
                <input id="im-reception" type="date" className={inputClass} value={dateReception} onChange={(e) => setDateReception(e.target.value)} />
              </Field>
              <Field label="Payée le" htmlFor="im-paiement">
                <input
                  id="im-paiement"
                  type="date"
                  className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-400`}
                  value={impaye ? today ?? '' : datePaiement}
                  disabled={impaye}
                  onChange={(e) => setDatePaiement(e.target.value)}
                />
              </Field>
              <div className="sm:pt-8">
                <Toggle checked={impaye} onChange={setImpaye} label="Pas encore payée (calcul à aujourd'hui)" />
              </div>
            </div>

            <div className="mt-4">
              <Toggle checked={partielOn} onChange={setPartielOn} label="Un paiement partiel a été reçu" />
              {partielOn && (
                <div className="grid sm:grid-cols-2 gap-4 mt-3">
                  <Field label="Montant payé TTC" htmlFor="im-partiel-montant">
                    <input id="im-partiel-montant" inputMode="decimal" className={inputClass} value={partielMontant} onChange={(e) => setPartielMontant(e.target.value)} placeholder="20 000" />
                  </Field>
                  <Field label="Payé le" htmlFor="im-partiel-date">
                    <input id="im-partiel-date" type="date" className={inputClass} value={partielDate} onChange={(e) => setPartielDate(e.target.value)} />
                  </Field>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 my-6" />
            {result ? (
              result.enRetard ? (
                <div className="grid sm:grid-cols-3 gap-3">
                  <Stat label="Retard" value={`${result.joursRetard} jours`} sub={`limite le ${fmtDate(result.dateLimite)}`} />
                  <Stat label="Taux applicable" value={result.semestre ? fmtPct(result.semestre.taux) : '—'} sub={result.semestre?.label} />
                  <Stat accent label="Total réclamable" value={fmtEur(result.total)} sub={`dont ${fmtEur(INDEMNITE_FORFAITAIRE, 0)} d'indemnité`} />
                </div>
              ) : (
                <Alert>
                  Pas de retard : la date limite de paiement était le <strong>{fmtDate(result.dateLimite)}</strong>. Aucun intérêt moratoire n'est dû.
                </Alert>
              )
            ) : (
              <p className="text-sm text-gray-400">Renseignez le montant et les dates pour obtenir le calcul.</p>
            )}
            {result?.enRetard && (
              <a href="#detail" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
                Voir le détail et le courrier de réclamation ↓
              </a>
            )}
          </div>
        </div>
      </div>

      {result?.enRetard && (
        <div id="detail" className="scroll-mt-24 mt-12 lg:mt-16 grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <div id="moratoires-resultat" className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Détail du calcul</h2>
              <dl className="divide-y divide-gray-100 text-sm">
                {[
                  ['Demande reçue le', fmtDate(dateReception)],
                  ['Montant TTC', fmtEur(montantNum)],
                  ['Délai de paiement', `${delai} jours`],
                  ['Date limite de paiement', fmtDate(result.dateLimite)],
                  [impaye ? 'Non payé au' : 'Payé le', fmtDate(fin)],
                  ['Jours de retard', `${result.joursRetard} jours`],
                  [
                    'Taux applicable',
                    result.semestre ? `${fmtPct(result.semestre.taux)} (BCE ${fmtPct(result.semestre.ecb)} + 8 pts)` : 'non disponible',
                  ],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2.5">
                    <dt className="text-gray-500">{k}</dt>
                    <dd className="font-medium text-gray-900 text-right">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 p-4 font-mono text-xs text-gray-700 space-y-1">
                {result.periodes.map((p) => (
                  <div key={p.du}>
                    {fmtEur(p.base)} × {result.semestre ? fmtPct(result.semestre.taux) : '?'} × {p.jours} j / 365 ={' '}
                    <strong>{fmtEur(p.interets)}</strong>
                    {result.periodes.length > 1 && (
                      <span className="block text-gray-400">du {fmtDate(p.du)} au {fmtDate(p.au)}</span>
                    )}
                  </div>
                ))}
              </div>

              <dl className="mt-4 text-sm">
                <div className="flex justify-between py-1.5"><dt className="text-gray-500">Intérêts moratoires</dt><dd className="font-medium">{fmtEur(result.interets)}</dd></div>
                <div className="flex justify-between py-1.5"><dt className="text-gray-500">Indemnité forfaitaire</dt><dd className="font-medium">{fmtEur(result.indemnite)}</dd></div>
                <div className="flex justify-between py-2 mt-1 border-t border-gray-200 text-base"><dt className="font-bold text-gray-900">Total réclamable</dt><dd className="font-extrabold text-blue-600">{fmtEur(result.total)}</dd></div>
              </dl>

              {result.tauxProvisoire && (
                <div className="mt-4">
                  <Alert tone="warning">
                    Le taux du semestre de départ n'est pas encore connu : le calcul utilise le dernier taux publié ({result.semestre?.label}).
                  </Alert>
                </div>
              )}
              {!result.semestre && (
                <div className="mt-4"><Alert tone="warning">Aucun taux BCE disponible pour cette période.</Alert></div>
              )}

              <div className="no-print mt-5 flex flex-wrap gap-2">
                <CopyButton getText={resumeTexte} />
                <PrintButton targetId="moratoires-resultat" title="Calcul des intérêts moratoires" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-lg font-bold text-gray-900">Courrier de réclamation</h2>
                <div className="flex flex-wrap gap-2">
                  <CopyButton getText={() => lettre} label="Copier le courrier" />
                  <PrintButton targetId="moratoires-courrier" title="Courrier de réclamation des intérêts moratoires" />
                </div>
              </div>

              <details className="group mb-4 rounded-xl border border-gray-200 bg-gray-50">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-gray-700 [&::-webkit-details-marker]:hidden">
                  <span className="text-blue-600 mr-1 inline-block transition group-open:rotate-90">›</span> Personnaliser le courrier <span className="text-gray-400 font-normal">(facultatif)</span>
                </summary>
                <div className="grid sm:grid-cols-2 gap-3 px-4 pb-4">
                  <Field label="Votre entreprise" htmlFor="c-ent"><input id="c-ent" className={inputClass} value={courrier.entreprise} onChange={setC('entreprise')} placeholder="SARL Martin Bâtiment" /></Field>
                  <Field label="Acheteur public" htmlFor="c-ach"><input id="c-ach" className={inputClass} value={courrier.acheteur} onChange={setC('acheteur')} placeholder="Commune de …" /></Field>
                  <Field label="Référence du marché" htmlFor="c-mar"><input id="c-mar" className={inputClass} value={courrier.marche} onChange={setC('marche')} placeholder="2026-014 lot 3" /></Field>
                  <Field label="N° de facture ou situation" htmlFor="c-fac"><input id="c-fac" className={inputClass} value={courrier.facture} onChange={setC('facture')} placeholder="Situation n° 4" /></Field>
                  <Field label="Signataire" htmlFor="c-sig" className="sm:col-span-2"><input id="c-sig" className={inputClass} value={courrier.signataire} onChange={setC('signataire')} placeholder="Paul Martin, gérant" /></Field>
                </div>
              </details>

              <div id="moratoires-courrier" className="rounded-xl border border-gray-200 bg-white px-6 py-7 text-sm leading-relaxed text-gray-800 whitespace-pre-line">
                {lettre}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
