'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'
import { track } from '@/lib/analytics'
import { avecUtmVision } from '@/lib/blog/config'
import { CORPS_ETAT } from '@/lib/alertes/corps-etat'
import { DEPARTEMENTS } from '@/lib/alertes/geo'
import type { Fiche, ResultatAnalyse, SourceVerifiee } from '@/lib/analyse-rc/schema'
import { Field, inputClass, selectClass } from '@/components/outils/form'
import { CopyButton, PrintButton } from '@/components/outils/actions'

type Etat = 'attente' | 'depot' | 'analyse' | 'termine' | 'erreur'
type Champ = { valeur: string; source: SourceVerifiee } | null

const EMAIL_KEY = 'mon-ao:email-analyse'
const ETAPES = ['Lecture des documents', 'Repérage des dates, lots et critères', 'Extraction des pièces exigées', 'Recherche des points d\'attention', 'Vérification de chaque source']

const nomCourt = (doc: string) => {
  const base = doc.split('/').pop() ?? doc
  const sansExt = base.replace(/\.(pdf|docx)$/i, '')
  return sansExt.length > 32 ? `${sansExt.slice(0, 30)}…` : sansExt
}

function SourceChip({ s }: { s: SourceVerifiee }) {
  const [ouvert, setOuvert] = useState(false)
  const aVerifier = s.verifie === null
  return (
    <span className="inline">
      <button
        type="button"
        onClick={() => setOuvert(!ouvert)}
        title={`« ${s.extrait} »`}
        className={`ml-1.5 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 align-middle text-[11px] font-medium transition ${
          aVerifier ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-blue-300 hover:text-blue-600'
        }`}
      >
        {nomCourt(s.document)}{s.page ? ` · p. ${s.page}` : ''}{aVerifier ? ' · à vérifier' : ''}
      </button>
      {ouvert && (
        <span className="mt-1.5 block rounded-lg border-l-2 border-blue-300 bg-blue-50/50 px-3 py-2 text-xs italic text-gray-600">
          « {s.extrait} »{s.section && <span className="not-italic text-gray-400"> · {s.section}</span>}
        </span>
      )}
    </span>
  )
}

function Ligne({ label, champ }: { label: string; champ: Champ }) {
  return (
    <div className="py-2.5 sm:grid sm:grid-cols-[11rem_1fr] sm:gap-4">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900">
        {champ ? <>{champ.valeur}<SourceChip s={champ.source} /></> : <span className="text-gray-400">Non précisé dans les documents</span>}
      </dd>
    </div>
  )
}

function Bloc({ titre, children, id }: { titre: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 break-inside-avoid">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{titre}</h3>
      {children}
    </section>
  )
}

const REGLES_PIECES: [RegExp, string][] = [
  [/\bdc1\b|lettre de candidature/i, 'dc1'],
  [/\bdc2\b|d[ée]claration du candidat/i, 'dc2'],
  [/\bdume\b/i, 'dume'],
  [/\bdc4\b|sous-trait/i, 'dc4'],
  [/kbis|registre du commerce|\bd1\b/i, 'kbis'],
  [/vigilance|urssaf/i, 'attestation-vigilance'],
  [/fiscal/i, 'attestation-regularite-fiscale'],
  [/assurance|d[ée]cennale|responsabilit[ée] civile/i, 'attestation-assurance'],
  [/m[ée]moire/i, 'memoire-technique'],
  [/acte d.engagement|attri1/i, 'acte-engagement'],
  [/dpgf|bpu|dqe|d[ée]composition|bordereau/i, 'decomposition-prix'],
  [/r[ée]f[ée]rence|attestation de bonne ex[ée]cution/i, 'references'],
  [/qualification|qualibat|qualifelec|opqibi|certificat/i, 'qualifications'],
]

function lienChecklist(f: Fiche): string {
  const textes = [...f.pieces.candidature, ...f.pieces.offre].map((p) => p.libelle)
  const slugs = Array.from(new Set(textes.flatMap((t) => REGLES_PIECES.filter(([re]) => re.test(t)).map(([, s]) => s))))
  const p = new URLSearchParams()
  if (f.type_marche !== 'inconnu') p.set('type', f.type_marche)
  if (f.procedure_type !== 'inconnue') p.set('procedure', f.procedure_type)
  if (slugs.length) p.set('exigees', slugs.join(','))
  if (slugs.includes('dc4')) p.set('sous-traitance', '1')
  return `/outils/pieces-candidature?${p}`
}

function lienNotePrix(f: Fiche): string | null {
  const c = f.criteres
  if (!['proportionnelle', 'lineaire', 'minmax', 'coefficient'].includes(c.methode_code) && c.poids_prix === null) return null
  const p = new URLSearchParams()
  if (['proportionnelle', 'lineaire', 'minmax', 'coefficient'].includes(c.methode_code)) p.set('methode', c.methode_code)
  if (c.poids_prix !== null && c.poids_prix > 0 && c.poids_prix <= 100) p.set('poids', String(c.poids_prix))
  if (c.note_max === 10 || c.note_max === 20 || c.note_max === 100) p.set('nmax', String(c.note_max))
  return `/outils/note-prix?${p}`
}

function resumeTexte(r: ResultatAnalyse): string {
  const f = r.fiche
  const v = (c: Champ) => (c ? `${c.valeur} (${nomCourt(c.source.document)}${c.source.page ? ` p. ${c.source.page}` : ''})` : 'non précisé')
  return [
    'Fiche de synthèse du DCE (mon-ao.com)',
    `Acheteur : ${v(f.identite.acheteur as Champ)}`,
    `Objet : ${v(f.identite.objet as Champ)}`,
    `Procédure : ${v(f.identite.procedure as Champ)}`,
    `Date limite de remise : ${v(f.calendrier.date_limite_remise as Champ)}`,
    `Visite : ${v(f.calendrier.date_visite as Champ)}`,
    '',
    'Critères :',
    ...f.criteres.liste.map((c) => `- ${c.critere}${c.ponderation ? ` : ${c.ponderation}` : ''}`),
    '',
    'Pièces de candidature :',
    ...f.pieces.candidature.map((p) => `- [ ] ${p.libelle}`),
    'Pièces de l\'offre :',
    ...f.pieces.offre.map((p) => `- [ ] ${p.libelle}`),
    '',
    'Points d\'attention :',
    ...f.points_attention.map((p) => `- ${p.titre} : ${p.detail}`),
  ].join('\n')
}

export default function Analyseur({ intro }: { intro: ReactNode }) {
  const [etat, setEtat] = useState<Etat>('attente')
  const [fichier, setFichier] = useState<File | null>(null)
  const [aoId, setAoId] = useState<number | null>(null)
  const [email, setEmail] = useState('')
  const [emailRequis, setEmailRequis] = useState(false)
  const [profil, setProfil] = useState({ corpsEtat: '', effectif: '', chiffreAffaires: '', zone: '' })
  const [erreur, setErreur] = useState<string | null>(null)
  const [resultat, setResultat] = useState<ResultatAnalyse | null>(null)
  const [secondes, setSecondes] = useState(0)
  const [survol, setSurvol] = useState(false)
  const resultatRef = useRef<HTMLDivElement>(null)
  // Email déjà connu au chargement : seul un nouvel email compte comme un lead
  const emailConnu = useRef<string | null>(null)

  useEffect(() => {
    const ao = Number(new URLSearchParams(window.location.search).get('ao'))
    if (Number.isInteger(ao) && ao > 0) setAoId(ao)
    try {
      emailConnu.current = localStorage.getItem(EMAIL_KEY)
      setEmail(emailConnu.current ?? '')
    } catch {}
  }, [])

  useEffect(() => {
    if (etat !== 'depot' && etat !== 'analyse') return
    setSecondes(0)
    const t = setInterval(() => setSecondes((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [etat])

  async function lancer(source: { fichier: File } | { aoId: number }) {
    setErreur(null)
    setResultat(null)
    const mail = email.trim() || undefined
    const origine = 'fichier' in source ? 'fichier' : 'ao'
    track('analyse_rc_lancee', { origine })
    try {
      let res: Response
      if ('fichier' in source) {
        setEtat('depot')
        const f = source.fichier
        const dep = await fetch('/api/analyse-rc/depot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nom: f.name, taille: f.size, email: mail }) })
        const d = await dep.json()
        if (dep.status === 402) return demanderEmail()
        if (!dep.ok) throw new Error(d.error ?? 'Dépôt impossible.')
        if (d.mode === 'stockage') {
          const sb = getSupabase()
          if (!sb) throw new Error('Dépôt impossible.')
          const { error } = await sb.storage.from('dce-temp').uploadToSignedUrl(d.path, d.token, f, { contentType: f.type || 'application/octet-stream' })
          if (error) throw new Error('Le fichier n\'a pas pu être déposé, réessayez.')
          setEtat('analyse')
          res = await fetch('/api/analyse-rc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: d.path, nom: f.name, email: mail, profil }) })
        } else {
          setEtat('analyse')
          const form = new FormData()
          form.set('fichier', f)
          if (mail) form.set('email', mail)
          form.set('profil', JSON.stringify(profil))
          res = await fetch('/api/analyse-rc', { method: 'POST', body: form })
        }
      } else {
        setEtat('analyse')
        res = await fetch('/api/analyse-rc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aoId: source.aoId, email: mail, profil }) })
      }
      const json = await res.json()
      if (res.status === 402) return demanderEmail()
      if (!res.ok) throw new Error(json.error ?? 'L\'analyse a échoué.')
      track('analyse_rc_terminee', { origine })
      if (mail && mail !== emailConnu.current) {
        track('generate_lead', { methode: 'analyse_rc' })
        emailConnu.current = mail
      }
      if (mail) {
        try {
          localStorage.setItem(EMAIL_KEY, mail)
        } catch {}
      }
      setResultat(json)
      setEtat('termine')
      setTimeout(() => resultatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (e) {
      track('analyse_rc_erreur', { origine })
      setErreur(e instanceof Error ? e.message : 'L\'analyse a échoué.')
      setEtat('erreur')
    }
  }

  function demanderEmail() {
    track('analyse_rc_email_demande')
    setEmailRequis(true)
    setEtat('attente')
  }

  const enCours = etat === 'depot' || etat === 'analyse'
  const f = resultat?.fiche
  const lienNote = f ? lienNotePrix(f) : null

  return (
    <>
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-5 lg:pt-4">{intro}</div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-xl shadow-blue-900/5 p-5 md:p-7">
            {aoId && (
              <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm text-gray-700">Appel d'offres n° {aoId} sélectionné depuis mon-ao.com.</p>
                <button type="button" disabled={enCours} onClick={() => lancer({ aoId })} className="btn-sm mt-2 text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-60">
                  Analyser cet appel d'offres
                </button>
                <p className="text-xs text-gray-500 mt-2">Si le DCE n'est pas téléchargeable automatiquement, l'analyse porte sur l'avis publié. Pour une fiche complète, déposez le RC ci-dessous.</p>
              </div>
            )}

            <label
              onDragOver={(e) => { e.preventDefault(); setSurvol(true) }}
              onDragLeave={() => setSurvol(false)}
              onDrop={(e) => {
                e.preventDefault()
                setSurvol(false)
                const file = e.dataTransfer.files[0]
                if (file) setFichier(file)
              }}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
                survol ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-3xl mb-2" aria-hidden="true">📄</span>
              <span className="font-semibold text-gray-900">{fichier ? fichier.name : 'Déposez le règlement de consultation ou le DCE'}</span>
              <span className="text-sm text-gray-500 mt-1">
                {fichier ? `${(fichier.size / 1024 / 1024).toFixed(1)} Mo · cliquez pour changer` : 'PDF, DOCX ou ZIP du DCE complet, 60 Mo maximum'}
              </span>
              <input type="file" accept=".pdf,.docx,.zip" className="sr-only" onChange={(e) => setFichier(e.target.files?.[0] ?? null)} />
            </label>

            <details className="mt-4 group rounded-xl border border-gray-200">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-gray-700 [&::-webkit-details-marker]:hidden">
                <span className="text-blue-600 mr-1 inline-block transition group-open:rotate-90">›</span> Votre entreprise <span className="font-normal text-gray-400">(facultatif, pour des alertes personnalisées)</span>
              </summary>
              <div className="grid sm:grid-cols-2 gap-3 px-4 pb-4">
                <Field label="Corps d'état" htmlFor="ar-ce">
                  <select id="ar-ce" className={selectClass} value={profil.corpsEtat} onChange={(e) => setProfil({ ...profil, corpsEtat: e.target.value })}>
                    <option value="">—</option>
                    {CORPS_ETAT.map((c) => <option key={c.slug} value={c.label}>{c.label}</option>)}
                  </select>
                </Field>
                <Field label="Zone d'intervention" htmlFor="ar-zone">
                  <select id="ar-zone" className={selectClass} value={profil.zone} onChange={(e) => setProfil({ ...profil, zone: e.target.value })}>
                    <option value="">—</option>
                    {Object.entries(DEPARTEMENTS).map(([code, nom]) => <option key={code} value={`${nom} (${code})`}>{code} · {nom}</option>)}
                  </select>
                </Field>
                <Field label="Effectif" htmlFor="ar-eff"><input id="ar-eff" inputMode="numeric" className={inputClass} value={profil.effectif} placeholder="12" onChange={(e) => setProfil({ ...profil, effectif: e.target.value })} /></Field>
                <Field label="Chiffre d'affaires annuel" hint="€" htmlFor="ar-ca"><input id="ar-ca" inputMode="numeric" className={inputClass} value={profil.chiffreAffaires} placeholder="1 800 000" onChange={(e) => setProfil({ ...profil, chiffreAffaires: e.target.value })} /></Field>
              </div>
            </details>

            {emailRequis && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-gray-900">Vous avez utilisé vos 3 analyses gratuites sans compte.</p>
                <p className="text-sm text-gray-600 mt-1 mb-3">Indiquez votre email pour continuer gratuitement.</p>
                <input type="email" required autoComplete="email" aria-label="Votre email" className={inputClass} value={email} placeholder="vous@entreprise.fr" onChange={(e) => setEmail(e.target.value)} />
              </div>
            )}

            <button
              type="button"
              disabled={!fichier || enCours || (emailRequis && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))}
              onClick={() => fichier && lancer({ fichier })}
              className="btn mt-5 w-full text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
            >
              {enCours ? 'Analyse en cours…' : 'Analyser le document'}
            </button>
            <p className="mt-3 text-xs text-gray-500">
              🔒 Vos fichiers sont supprimés dès la fin de l'analyse. Seule la fiche s'affiche, dans votre navigateur.
            </p>

            {enCours && (
              <div className="mt-6 rounded-xl bg-gray-50 border border-gray-100 p-4" role="status">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-900">{etat === 'depot' ? 'Dépôt du fichier…' : ETAPES[Math.min(ETAPES.length - 1, Math.floor(secondes / 9))]}</span>
                  <span className="text-gray-400 tabular-nums">{secondes} s</span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${Math.min(95, 5 + secondes * 1.5)}%` }} />
                </div>
                <p className="mt-2 text-xs text-gray-500">Comptez 30 secondes à 2 minutes selon la taille du dossier.</p>
              </div>
            )}
            {erreur && <p className="mt-4 text-sm text-red-600" role="alert">{erreur}</p>}
          </div>
        </div>
      </div>

      {resultat && f && (
        <div ref={resultatRef} id="fiche" className="scroll-mt-24 mt-12 lg:mt-16">
          <div id="fiche-analyse" className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{f.identite.objet?.valeur ?? resultat.ao?.titre ?? 'Fiche de synthèse'}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {resultat.verifiees} informations sourcées et vérifiées
                    {resultat.nonVerifiables > 0 && `, ${resultat.nonVerifiables} à vérifier (document scanné)`}
                    {resultat.ecartees > 0 && `, ${resultat.ecartees} écartée${resultat.ecartees > 1 ? 's' : ''} faute de source retrouvée`}
                  </p>
                </div>
                <div className="no-print flex flex-wrap gap-2">
                  <CopyButton getText={() => resumeTexte(resultat)} />
                  <PrintButton targetId="fiche-analyse" title="Fiche de synthèse du DCE" />
                </div>
              </div>
              {resultat.avisSeul && (
                <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Analyse de l'avis publié uniquement : le DCE n'était pas téléchargeable automatiquement. Déposez le RC pour une fiche complète.
                </p>
              )}
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer text-gray-500">Documents analysés ({resultat.documents.filter((d) => d.mode !== 'ignore').length}/{resultat.documents.length})</summary>
                <ul className="mt-2 space-y-1 text-gray-600">
                  {resultat.documents.map((d) => (
                    <li key={d.nom}>
                      <span className={d.mode === 'ignore' ? 'text-gray-400 line-through' : ''}>{d.nom}</span>
                      <span className="text-gray-400"> · {d.type}{d.pages ? `, ${d.pages} p.` : ''}{d.note ? ` · ${d.note}` : ''}</span>
                    </li>
                  ))}
                </ul>
              </details>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Bloc titre="Identité">
                <dl className="divide-y divide-gray-100">
                  <Ligne label="Acheteur" champ={f.identite.acheteur as Champ} />
                  <Ligne label="Référence" champ={f.identite.reference as Champ} />
                  <Ligne label="Procédure" champ={f.identite.procedure as Champ} />
                  <Ligne label="Montant estimé" champ={f.identite.montant_estime as Champ} />
                </dl>
              </Bloc>
              <Bloc titre="Calendrier">
                <dl className="divide-y divide-gray-100">
                  <Ligne label="Date limite de remise" champ={f.calendrier.date_limite_remise as Champ} />
                  <Ligne label="Visite" champ={f.calendrier.date_visite as Champ} />
                  <Ligne label="Démarrage" champ={f.calendrier.date_demarrage as Champ} />
                  <Ligne label="Durée" champ={f.calendrier.duree as Champ} />
                  <Ligne label="Validité des offres" champ={f.calendrier.validite_offres as Champ} />
                </dl>
              </Bloc>
            </div>

            <Bloc titre="Points d'attention">
              {f.points_attention.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun point inhabituel relevé dans les documents analysés.</p>
              ) : (
                <ul className="space-y-3">
                  {f.points_attention.map((p, i) => (
                    <li key={i} className="flex gap-3">
                      <span className={`mt-0.5 h-5 shrink-0 rounded-full px-2 text-[11px] font-semibold uppercase leading-5 ${p.gravite === 'haute' ? 'bg-red-50 text-red-700' : p.gravite === 'moyenne' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                        {p.gravite}
                      </span>
                      <span className="text-sm text-gray-700">
                        <strong className="text-gray-900">{p.titre}</strong> : {p.detail}
                        <SourceChip s={p.source as SourceVerifiee} />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Bloc>

            <div className="grid gap-4 lg:grid-cols-2">
              <Bloc titre="Critères d'attribution">
                {f.criteres.liste.length === 0 ? (
                  <p className="text-sm text-gray-400">Critères non précisés dans les documents analysés.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {f.criteres.liste.map((c, i) => (
                      <li key={i} className="py-2.5 text-sm">
                        <span className="flex justify-between gap-3">
                          <span className="text-gray-900">{c.critere}<SourceChip s={c.source as SourceVerifiee} /></span>
                          {c.ponderation && <strong className="shrink-0 text-blue-600">{c.ponderation}</strong>}
                        </span>
                        {c.sous_criteres.length > 0 && <span className="mt-1 block text-xs text-gray-500">{c.sous_criteres.join(' · ')}</span>}
                      </li>
                    ))}
                  </ul>
                )}
                <dl className="mt-2 border-t border-gray-100">
                  <Ligne label="Notation du prix" champ={f.criteres.methode_notation_prix as Champ} />
                </dl>
                {lienNote && (
                  <Link href={lienNote} className="no-print btn-sm mt-3 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50">
                    🏆 Simuler ma note prix avec cette méthode →
                  </Link>
                )}
              </Bloc>
              <Bloc titre="Lots">
                <dl className="divide-y divide-gray-100">
                  <Ligne label="Allotissement" champ={f.lots.allotissement as Champ} />
                  <Ligne label="Plusieurs lots" champ={f.lots.plusieurs_lots as Champ} />
                </dl>
                {f.lots.liste.length > 0 && (
                  <ul className="mt-2 divide-y divide-gray-100 border-t border-gray-100">
                    {f.lots.liste.map((l, i) => (
                      <li key={i} className="flex justify-between gap-3 py-2 text-sm">
                        <span className="text-gray-900"><strong>Lot {l.numero}</strong> · {l.intitule}<SourceChip s={l.source as SourceVerifiee} /></span>
                        {l.montant && <span className="shrink-0 text-gray-500">{l.montant}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </Bloc>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Bloc titre="Pièces exigées">
                {(['candidature', 'offre'] as const).map((k) => (
                  <div key={k} className="mb-3 last:mb-0">
                    <p className="text-sm font-semibold text-gray-700 mb-1">{k === 'candidature' ? 'Candidature' : 'Offre'}</p>
                    {f.pieces[k].length === 0 ? (
                      <p className="text-sm text-gray-400">Non précisé dans les documents analysés.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {f.pieces[k].map((p, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <input type="checkbox" className="form-checkbox mt-0.5" aria-label={p.libelle} />
                            <span>{p.libelle}<SourceChip s={p.source as SourceVerifiee} /></span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                <Link href={lienChecklist(f)} className="no-print btn-sm mt-3 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50">
                  🗂️ Ma checklist avec validités et liens →
                </Link>
              </Bloc>
              <Bloc titre="Conditions">
                <dl className="divide-y divide-gray-100">
                  <Ligne label="Visite obligatoire" champ={f.conditions.visite_obligatoire as Champ} />
                  <Ligne label="Variantes" champ={f.conditions.variantes as Champ} />
                  <Ligne label="PSE" champ={f.conditions.pse as Champ} />
                  <Ligne label="Groupement" champ={f.conditions.groupement as Champ} />
                  <Ligne label="Sous-traitance" champ={f.conditions.sous_traitance as Champ} />
                  <Ligne label="Avance" champ={f.conditions.avance as Champ} />
                  <Ligne label="Retenue de garantie" champ={f.conditions.retenue_garantie as Champ} />
                  <Ligne label="Pénalités" champ={f.conditions.penalites as Champ} />
                </dl>
              </Bloc>
            </div>
          </div>

          <div className="no-print mt-6 rounded-2xl bg-gray-900 p-6 md:p-8 text-white md:flex md:items-center md:justify-between md:gap-8">
            <div>
              <p className="text-xl font-bold">On automatise ça pour vous</p>
              <p className="text-gray-300 mt-1">vision analyse chaque DCE dès sa publication, prépare la checklist et la trame de réponse, dans vos outils.</p>
            </div>
            <a href={avecUtmVision('https://www.visionbtp.com', { medium: 'outil', campaign: 'analyse-rc', content: 'resultat' })} target="_blank" rel="noopener" className="btn mt-4 md:mt-0 shrink-0 bg-white text-gray-900 hover:bg-blue-50">Découvrir vision →</a>
          </div>
        </div>
      )}
    </>
  )
}
