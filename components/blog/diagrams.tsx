// Schémas intégrés aux articles : en HTML (texte indexable, responsive), pas en image.

import type { ReactNode } from 'react'

const DOSSIER_COLUMNS = [
  {
    step: '1',
    title: 'Candidature',
    status: 'Vérifiée : recevable ou non',
    tone: { bar: 'bg-blue-500', chip: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-400' },
    items: [
      'DC1 ou DUME : lettre de candidature',
      'DC2 ou DUME : capacités',
      'Références des 5 dernières années',
      'Qualifications ou preuves équivalentes',
      'Pouvoir du signataire',
      'DC4 par sous-traitant',
    ],
  },
  {
    step: '2',
    title: 'Offre',
    status: 'Notée : prix + valeur technique',
    tone: { bar: 'bg-orange-500', chip: 'bg-orange-50 text-orange-700 border-orange-100', dot: 'bg-orange-400' },
    items: [
      "Acte d'engagement (si demandé au dépôt)",
      'Mémoire technique',
      'DPGF, ou BPU + DQE',
      'Planning (si demandé)',
      'Attestation de visite (si obligatoire)',
    ],
  },
  {
    step: '3',
    title: 'Attestations',
    status: 'Demandées au candidat retenu',
    tone: { bar: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-400' },
    items: [
      'Attestation de vigilance (URSSAF ou MSA)',
      'Attestation de régularité fiscale',
      'Extrait Kbis ou D1',
      'Assurances RC et décennale',
      'Liste des salariés étrangers',
    ],
  },
]

export function DossierStructure({ caption }: { caption?: string }) {
  return (
    <figure className="my-10">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-bold text-gray-900">Structure d'un dossier de réponse</p>
          <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">2 parties + attestations</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {DOSSIER_COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className={`h-1.5 ${col.tone.bar}`} aria-hidden="true" />
              <div className="flex grow flex-col p-4">
                <p className="mb-1 text-sm font-bold text-gray-900">
                  <span className="text-gray-400">{col.step}.</span> {col.title}
                </p>
                <p className={`mb-4 self-start rounded-md border px-2 py-0.5 text-xs font-medium ${col.tone.chip}`}>
                  {col.status}
                </p>
                <ul className="space-y-2">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm leading-snug text-gray-700">
                      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${col.tone.dot}`} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Moment où chaque partie est fournie */}
        <div className="mt-3 grid gap-3 text-xs font-medium md:grid-cols-3">
          <div className="rounded-lg border border-dashed border-gray-300 px-3 py-2 text-center text-gray-600 md:col-span-2">
            Déposées ensemble, avant la date limite
          </div>
          <div className="rounded-lg border border-dashed border-emerald-300 px-3 py-2 text-center text-emerald-700">
            Fournies seulement si vous êtes retenu
          </div>
        </div>
      </div>
      {caption && <figcaption className="mt-3 text-center text-sm leading-6 text-gray-500">{caption}</figcaption>}
    </figure>
  )
}

const DEROULE_LANES = [
  {
    label: 'Votre entreprise',
    hint: 'Le temps que vous maîtrisez',
    steps: [
      { title: "Publication de l'avis", detail: 'BOAMP, JOUE, profil acheteur' },
      { title: 'Lecture du RC', detail: 'Décision go / no-go' },
      { title: 'Visite de site', detail: 'Si elle est obligatoire' },
      { title: 'Candidature + offre', detail: 'DC1, DC2, mémoire, prix' },
      { title: 'Dépôt en ligne', detail: '35 j min. en AO ouvert, 30 j en ligne' },
    ],
  },
  {
    label: "L'acheteur",
    hint: 'Après la date limite',
    steps: [
      { title: 'Analyse des candidatures', detail: 'Recevable ou non' },
      { title: 'Notation des offres', detail: 'Selon les critères du RC' },
      { title: 'Attestations', detail: 'Demandées au candidat retenu', highlight: true },
      { title: 'Signature', detail: 'Puis notification du marché' },
      { title: 'Démarrage', detail: 'Ordre de service' },
    ],
  },
]

export function DeroulementAo({ caption }: { caption?: string }) {
  let n = 0
  return (
    <figure className="my-10">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-bold text-gray-900">Déroulé d'un appel d'offres</p>
          <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">De l'avis au démarrage</p>
        </div>

        <div className="space-y-5">
          {DEROULE_LANES.map((lane, laneIndex) => (
            <div key={lane.label}>
              <p className="mb-2 text-xs font-semibold text-gray-500">
                {lane.label} <span className="font-normal text-gray-400">· {lane.hint}</span>
              </p>
              <ol className="relative grid gap-2 sm:grid-cols-5">
                {lane.steps.map((step) => {
                  n += 1
                  const highlight = 'highlight' in step && step.highlight
                  return (
                    <li
                      key={step.title}
                      className={`relative flex items-start gap-3 rounded-xl border bg-white px-3 py-2.5 sm:block sm:p-3 ${
                        highlight ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-gray-200'
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:mb-2 ${
                          highlight
                            ? 'bg-emerald-500 text-white'
                            : laneIndex === 0
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {n}
                      </span>
                      <div>
                        <p className="text-sm font-semibold leading-snug text-gray-900">{step.title}</p>
                        <p className="mt-0.5 text-xs leading-snug text-gray-500">{step.detail}</p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          ))}
        </div>
      </div>
      {caption && <figcaption className="mt-3 text-center text-sm leading-6 text-gray-500">{caption}</figcaption>}
    </figure>
  )
}

// ─── Article « Go / no-go » ───────────────────────────────────────────────────

const ELIMINATOIRES = ['Métier', 'Conditions de candidature', 'Temps', 'Exécution']
const CRITERES_NOTES = ['Références', 'Distance', 'Pondération', 'Acheteur', 'Montant', 'Contrat']

function FlowArrow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-2 pl-6 text-xs font-medium text-gray-500" aria-hidden="true">
      <span className="text-base leading-none text-gray-300">↓</span>
      {label}
    </div>
  )
}

export function GoNoGoFlow({ caption }: { caption?: string }) {
  return (
    <figure className="my-10">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-bold text-gray-900">Le tri go / no-go</p>
          <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">4 éliminatoires · 6 critères notés · 3 décisions</p>
        </div>

        {/* Étape 1 */}
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-3 text-sm font-bold text-gray-900">
              Étape 1 · 4 critères éliminatoires <span className="font-normal text-gray-400">(5 min)</span>
            </p>
            <ol className="flex flex-wrap gap-1.5">
              {ELIMINATOIRES.map((c, i) => (
                <li key={c} className="rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                  {i + 1}. {c}
                </li>
              ))}
            </ol>
          </div>
          <div className="flex items-center gap-2 sm:flex-col sm:gap-1">
            <span className="text-xs text-gray-500">un seul « non »</span>
            <span className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white">NO-GO</span>
          </div>
        </div>

        <FlowArrow label="Tout est « oui »" />

        {/* Étape 2 */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="mb-3 text-sm font-bold text-gray-900">
            Étape 2 · 6 critères notés de 0 à 2 <span className="font-normal text-gray-400">(15 min)</span>
          </p>
          <ol className="flex flex-wrap gap-1.5">
            {CRITERES_NOTES.map((c, i) => (
              <li key={c} className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700">
                {i + 5}. {c}
              </li>
            ))}
          </ol>
        </div>

        <FlowArrow label="Total sur 12" />

        {/* Décisions */}
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs font-semibold text-emerald-700">9 à 12 points</p>
            <p className="text-lg font-extrabold text-emerald-700">GO</p>
            <p className="text-xs leading-snug text-emerald-800">Vous y allez.</p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
            <p className="text-xs font-semibold text-orange-700">6 à 8 points</p>
            <p className="text-lg font-extrabold text-orange-700">À VOIR</p>
            <p className="text-xs leading-snug text-orange-800">Seulement avec du temps libre ou un partenaire.</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-xs font-semibold text-red-700">0 à 5 points</p>
            <p className="text-lg font-extrabold text-red-700">NO-GO</p>
            <p className="text-xs leading-snug text-red-800">Vous passez.</p>
          </div>
        </div>
      </div>
      {caption && <figcaption className="mt-3 text-center text-sm leading-6 text-gray-500">{caption}</figcaption>}
    </figure>
  )
}

const MATRIX = [
  {
    key: 'partenaire',
    title: 'À voir : avec un partenaire',
    text: 'Le marché vaut le coup, mais un point faible vous pénalise : un groupement peut le combler.',
    tone: 'border-orange-200 bg-orange-50 text-orange-800',
    titleTone: 'text-orange-700',
  },
  {
    key: 'go',
    title: 'Go',
    text: "Vous pouvez gagner, et le marché vaut l'effort.",
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    titleTone: 'text-emerald-700',
    example: true,
  },
  {
    key: 'nogo',
    title: 'No-go',
    text: "Peu de chances, peu d'intérêt : vous passez.",
    tone: 'border-red-200 bg-red-50 text-red-800',
    titleTone: 'text-red-700',
  },
  {
    key: 'temps',
    title: 'À voir : si temps libre',
    text: 'Gagnable mais peu rentable : seulement pour remplir un creux de planning.',
    tone: 'border-orange-200 bg-orange-50 text-orange-800',
    titleTone: 'text-orange-700',
  },
]

export function DecisionMatrix({ caption }: { caption?: string }) {
  return (
    <figure className="my-10">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-bold text-gray-900">Matrice de décision</p>
          <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Chances de gagner × intérêt du marché</p>
        </div>

        <div className="grid grid-cols-[auto_1fr_1fr] gap-2">
          {/* Axe vertical */}
          <div className="row-span-2 flex items-center">
            <p className="text-[11px] font-semibold text-gray-500 [writing-mode:vertical-rl] rotate-180">
              Intérêt du marché (critères 9 et 10) ↑
            </p>
          </div>
          {MATRIX.map((q) => (
            <div key={q.key} className={`relative flex min-h-28 flex-col rounded-xl border p-3 sm:p-4 ${q.tone}`}>
              <p className={`mb-1 text-sm font-extrabold ${q.titleTone}`}>{q.title}</p>
              <p className="text-xs leading-snug">{q.text}</p>
              {q.example && (
                <p className="mt-3 inline-flex items-center gap-1.5 self-start rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 shadow-xs">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" aria-hidden="true" />
                  Exemple Région Grand Est : 6/8 et 3/4
                </p>
              )}
            </div>
          ))}
          {/* Axe horizontal */}
          <div />
          <p className="text-center text-[11px] text-gray-500">0 à 5 sur 8</p>
          <p className="text-center text-[11px] text-gray-500">6 à 8 sur 8</p>
          <div />
          <p className="col-span-2 text-center text-[11px] font-semibold text-gray-500">Chances de gagner (critères 5 à 8) →</p>
        </div>
        <p className="mt-3 text-[11px] text-gray-500">
          Ligne du haut : intérêt de 3 ou 4 sur 4. Ligne du bas : 0 à 2 sur 4.
        </p>
      </div>
      {caption && <figcaption className="mt-3 text-center text-sm leading-6 text-gray-500">{caption}</figcaption>}
    </figure>
  )
}

// ─── Article « Mémoire technique » ────────────────────────────────────────────

const SOUS_CRITERES = [
  { rc: "Méthodologie d'exécution", weight: 25, section: '4. Méthodologie' },
  { rc: 'Moyens humains et matériels affectés', weight: 15, section: '2. Moyens humains · 3. Matériel' },
  { rc: 'Planning et phasage', weight: 10, section: '5. Planning' },
  { rc: 'Sécurité et organisation en site occupé', weight: 5, section: '6. Sécurité' },
  { rc: 'Gestion des déchets et environnement', weight: 5, section: '7. Environnement' },
]

export function RcToSommaire({ caption }: { caption?: string }) {
  const total = SOUS_CRITERES.reduce((s, c) => s + c.weight, 0)
  const pages = 12
  return (
    <figure className="my-10">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-bold text-gray-900">Du RC au sommaire</p>
          <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Pondérations d'exemple</p>
        </div>
        <div className="mb-2 hidden grid-cols-[1fr_auto_1fr] gap-3 text-xs font-semibold text-gray-500 sm:grid">
          <p>Dans le RC : valeur technique {total} %</p>
          <span />
          <p>Dans votre mémoire (sur {pages} pages)</p>
        </div>
        <ol className="space-y-2">
          {SOUS_CRITERES.map((c) => {
            const share = Math.round((c.weight / total) * pages)
            return (
              <li key={c.rc} className="grid items-center gap-2 sm:grid-cols-[1fr_auto_1fr] sm:gap-3">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
                  <span className="text-sm font-medium text-gray-800">{c.rc}</span>
                  <span className="shrink-0 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">{c.weight} %</span>
                </div>
                <span className="hidden text-gray-300 sm:block" aria-hidden="true">→</span>
                <div className="rounded-xl border border-blue-100 bg-white px-3 py-2.5">
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-gray-900">{c.section}</span>
                    <span className="shrink-0 text-xs text-gray-500">≈ {share} p.</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100" aria-hidden="true">
                    <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${(c.weight / SOUS_CRITERES[0].weight) * 100}%` }} />
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
        <p className="mt-3 text-[11px] text-gray-500">
          La section 1 (compréhension du projet) et la page de garde s'ajoutent en tête. Le prix compte pour les 40 % restants.
        </p>
      </div>
      {caption && <figcaption className="mt-3 text-center text-sm leading-6 text-gray-500">{caption}</figcaption>}
    </figure>
  )
}

export function GenericVsSpecific({ caption }: { caption?: string }) {
  return (
    <figure className="my-10">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-bold text-gray-900">Générique ou spécifique</p>
          <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Même sujet, même longueur</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-red-200 bg-white p-4">
            <p className="mb-2 text-xs font-bold text-red-600">✕ Générique : presque rien à noter</p>
            <p className="text-sm leading-6 text-gray-700">
              Notre entreprise dispose d'une équipe expérimentée et d'un matériel adapté. Nous mettons tout en œuvre
              pour respecter les délais, garantir la sécurité des usagers et limiter les nuisances, conformément à nos
              valeurs de qualité et de satisfaction client.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-white p-4">
            <p className="mb-2 text-xs font-bold text-emerald-700">✓ Spécifique : chaque point se vérifie</p>
            <p className="text-sm leading-6 text-gray-700">
              <mark className="rounded bg-emerald-50 px-0.5 text-gray-900">4 compagnons</mark> encadrés par{' '}
              <mark className="rounded bg-emerald-50 px-0.5 text-gray-900">M. Roux, chef de chantier, 12 ans en site occupé</mark>.{' '}
              <mark className="rounded bg-emerald-50 px-0.5 text-gray-900">Mini-pelle 2,5 t des semaines 2 à 6</mark>. Aucune
              livraison <mark className="rounded bg-emerald-50 px-0.5 text-gray-900">de 8 h 15 à 8 h 45 et de 16 h 15 à 16 h 45</mark>,
              heures d'entrée et de sortie des élèves.
            </p>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-gray-500">Exemple fictif.</p>
      </div>
      {caption && <figcaption className="mt-3 text-center text-sm leading-6 text-gray-500">{caption}</figcaption>}
    </figure>
  )
}

// ─── Article « Veille appels d'offres » ───────────────────────────────────────

// Positions indicatives (en %) : x = couverture des sources, y = automatisation du tri
const VEILLE_OPTIONS = [
  { label: 'Alertes BOAMP seules', x: 16, y: 14, paid: false },
  { label: 'BOAMP + profils + JAL à la main', x: 58, y: 14, paid: false },
  { label: 'Agrégateur payant', x: 84, y: 26, paid: true },
  { label: "Outil d'analyse", x: 82, y: 80, paid: true },
  { label: 'Prestataire', x: 52, y: 90, paid: true },
]

export function VeilleMap({ caption }: { caption?: string }) {
  return (
    <figure className="my-10">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-bold text-gray-900">Les options de veille</p>
          <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Positions indicatives</p>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <p className="flex items-center text-[11px] font-semibold text-gray-500 [writing-mode:vertical-rl] rotate-180">
            Tri des AO : à la main → automatisé
          </p>
          <div className="relative h-72 rounded-xl border border-gray-200 bg-white sm:h-80">
            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-gray-200" aria-hidden="true" />
            <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-gray-200" aria-hidden="true" />
            <ul>
              {VEILLE_OPTIONS.map((o) => (
                <li
                  key={o.label}
                  className="absolute -translate-x-1/2 translate-y-1/2"
                  style={{ left: `${o.x}%`, bottom: `${o.y}%` }}
                >
                  <span
                    className={`block max-w-[9.5rem] rounded-lg border px-2 py-1 text-center text-[11px] leading-tight font-semibold shadow-xs sm:max-w-none sm:whitespace-nowrap sm:text-xs ${
                      o.paid ? 'border-blue-600 bg-blue-600 text-white' : 'border-blue-300 bg-white text-blue-700'
                    }`}
                  >
                    {o.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <span />
          <p className="text-center text-[11px] font-semibold text-gray-500">Couverture des sources : BOAMP seul → toutes les sources →</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-gray-600">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-blue-300 bg-white" aria-hidden="true" /> Gratuit</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-blue-600" aria-hidden="true" /> Payant</span>
        </div>
      </div>
      {caption && <figcaption className="mt-3 text-center text-sm leading-6 text-gray-500">{caption}</figcaption>}
    </figure>
  )
}

// ─── Gabarit commun ───────────────────────────────────────────────────────────

function Frame({ title, kicker, caption, children }: { title: string; kicker?: string; caption?: string; children: ReactNode }) {
  return (
    <figure className="my-10">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-bold text-gray-900">{title}</p>
          {kicker && <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">{kicker}</p>}
        </div>
        {children}
      </div>
      {caption && <figcaption className="mt-3 text-center text-sm leading-6 text-gray-500">{caption}</figcaption>}
    </figure>
  )
}

// ─── Article « Lire un RC » ───────────────────────────────────────────────────

const RC_PASSES = [
  { n: 1, q: 'Puis-je répondre ?', points: ['Date et heure limite', 'Visite de site', 'Conditions de candidature', 'Lots et groupements'], stop: true },
  { n: 2, q: 'Puis-je gagner ?', points: ["Critères et pondération", "Contenu de l'offre", 'Variantes, PSE, négociation'] },
  { n: 3, q: 'Comment déposer ?', points: ['Dépôt et questions'] },
]

export function RcThreePasses({ caption }: { caption?: string }) {
  let n = 0
  return (
    <Frame title="Méthode de lecture d'un RC" kicker="3 passes, 8 points" caption={caption}>
      <ol className="grid gap-3 md:grid-cols-3">
        {RC_PASSES.map((p) => (
          <li key={p.n} className="flex flex-col rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-1 text-xs font-bold text-blue-600">Passe {p.n} · 5 min</p>
            <p className="mb-3 font-bold text-gray-900">{p.q}</p>
            <ul className="space-y-1.5">
              {p.points.map((pt) => {
                n += 1
                return (
                  <li key={pt} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white">{n}</span>
                    {pt}
                  </li>
                )
              })}
            </ul>
            {p.stop && (
              <p className="mt-auto pt-3 text-xs font-semibold text-red-600">Un point bloque ? Arrêtez là.</p>
            )}
          </li>
        ))}
      </ol>
    </Frame>
  )
}

const RC_PLAN = [
  { art: 'Art. 1', title: 'Objet et dispositions générales', detail: 'Objet, lots, durée du marché', points: [4] },
  { art: 'Art. 2', title: 'Conditions de la consultation', detail: 'Procédure, variantes, PSE, validité des offres', points: [1, 7], key: true },
  { art: 'Art. 3', title: 'Dossier de consultation', detail: 'Pièces du DCE, modifications', points: [] },
  { art: 'Art. 4', title: 'Présentation des candidatures et des offres', detail: 'Pièces de la candidature, contenu de l\'offre, cadre de mémoire', points: [3, 6], key: true },
  { art: 'Art. 5', title: 'Jugement des candidatures et des offres', detail: 'Critères, pondération, sous-critères, méthode de notation', points: [5], key: true },
  { art: 'Art. 6', title: 'Conditions de remise des offres', detail: 'Plateforme, date et heure limite, signature, copie de sauvegarde', points: [1, 8], key: true },
  { art: 'Art. 7', title: 'Renseignements complémentaires', detail: 'Questions, visite de site', points: [2, 8] },
]

export function RcAnnotated({ caption }: { caption?: string }) {
  return (
    <Frame title="RC type annoté" kicker="Plan indicatif" caption={caption}>
      <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-xs sm:p-5">
        <p className="mb-1 text-center text-xs font-bold tracking-wider text-gray-500 uppercase">Règlement de la consultation</p>
        <div className="mx-auto mb-4 h-px w-24 bg-gray-200" aria-hidden="true" />
        <ol className="space-y-2">
          {RC_PLAN.map((a) => (
            <li
              key={a.art}
              className={`flex items-start gap-3 rounded-lg px-3 py-2 ${a.key ? 'bg-blue-50 ring-1 ring-blue-100' : ''}`}
            >
              <span className="w-12 shrink-0 text-xs font-bold text-gray-500">{a.art}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-gray-900">{a.title}</span>
                <span className="block text-xs text-gray-500">{a.detail}</span>
              </span>
              <span className="flex shrink-0 gap-1">
                {a.points.map((p) => (
                  <span key={p} className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white">{p}</span>
                ))}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-3 text-[11px] text-gray-500">Les numéros renvoient aux 8 points à vérifier. Les intitulés et la numérotation changent d'un acheteur à l'autre.</p>
    </Frame>
  )
}

// ─── Article « Externaliser » ─────────────────────────────────────────────────

type Who = 'vous' | 'externe' | 'partage' | 'outil'
const WHO_STYLE: Record<Who, string> = {
  vous: 'bg-white text-gray-800 border-gray-200',
  externe: 'bg-orange-50 text-orange-800 border-orange-200',
  partage: 'bg-amber-50 text-amber-800 border-amber-200',
  outil: 'bg-blue-50 text-blue-800 border-blue-200',
}
const OPTIONS = ['Interne', 'Consultant / cabinet', 'Rédacteur freelance', 'Logiciel IA']
const TASKS: { step: string; cells: [Who, string][]; locked?: boolean }[] = [
  { step: 'Veille et tri', cells: [['vous', 'Vous'], ['partage', 'Souvent le consultant'], ['vous', 'Vous'], ['outil', 'Le logiciel, validé par vous']] },
  { step: 'Lecture du dossier', cells: [['vous', 'Vous'], ['externe', 'Le consultant'], ['vous', 'Vous'], ['outil', 'Résumé par le logiciel']] },
  { step: 'Dossier administratif', cells: [['vous', 'Vous'], ['externe', 'Le consultant'], ['vous', 'Vous'], ['outil', 'Pré-rempli']] },
  { step: 'Mémoire technique', cells: [['vous', 'Vous'], ['partage', 'Rédigé avec vous'], ['partage', 'Rédigé sur votre brief'], ['outil', 'Trame préparée, complétée par vous']] },
  { step: 'Prix', cells: [['vous', 'Vous'], ['vous', 'Vous'], ['vous', 'Vous'], ['vous', 'Vous']], locked: true },
  { step: 'Relecture et signature', cells: [['vous', 'Vous'], ['vous', 'Vous'], ['vous', 'Vous'], ['vous', 'Vous']], locked: true },
]

export function OptionsMatrix({ caption }: { caption?: string }) {
  return (
    <Frame title="Qui fait quoi dans chaque option" kicker="Cas le plus courant, à ajuster selon le contrat" caption={caption}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-separate border-spacing-1 text-left text-xs">
          <thead>
            <tr>
              <th className="px-2 py-1 font-semibold text-gray-500">Étape</th>
              {OPTIONS.map((o) => <th key={o} className="px-2 py-1 font-semibold text-gray-700">{o}</th>)}
            </tr>
          </thead>
          <tbody>
            {TASKS.map((t) => (
              <tr key={t.step}>
                <th className={`rounded-lg px-2 py-2 font-semibold ${t.locked ? 'bg-gray-800 text-white' : 'text-gray-800'}`}>{t.step}</th>
                {t.cells.map(([who, label], i) => (
                  <td key={i} className={`rounded-lg border px-2 py-2 leading-snug ${t.locked ? 'border-gray-300 bg-gray-100 font-semibold text-gray-900' : WHO_STYLE[who]}`}>
                    {label}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-gray-600">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-gray-300 bg-white" /> Vous</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-orange-200 bg-orange-50" /> Prestataire</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-amber-200 bg-amber-50" /> Partagé</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-blue-200 bg-blue-50" /> Logiciel</span>
      </div>
    </Frame>
  )
}

export function OptionChooser({ caption }: { caption?: string }) {
  return (
    <Frame title="Choisir son option" kicker="Repères indicatifs" caption={caption}>
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
        <p className="text-sm font-bold text-gray-900">Combien d'AO retenus par mois, après le tri ?</p>
      </div>
      <div className="my-2 grid grid-cols-2 gap-2 text-center text-xs font-semibold text-gray-500" aria-hidden="true">
        <span>↓ 1 ou 2</span>
        <span>↓ 3 ou plus</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="rounded-xl border border-gray-200 bg-white p-3 text-center">
            <p className="text-sm font-semibold text-gray-900">Quelqu'un en interne est à l'aise avec les dossiers ?</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-[11px] font-semibold text-emerald-700">Oui</p>
              <p className="text-sm font-bold text-gray-900">Interne</p>
              <p className="text-xs text-gray-600">avec une bibliothèque de contenus</p>
            </div>
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
              <p className="text-[11px] font-semibold text-orange-700">Non</p>
              <p className="text-sm font-bold text-gray-900">Freelance ou consultant</p>
              <p className="text-xs text-gray-600">freelance si vous savez chiffrer</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-2">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm font-bold text-gray-900">Logiciel IA + équipe interne</p>
            <p className="text-xs text-gray-600">Le logiciel fait la veille, le tri et l'administratif ; l'équipe fait le contenu et le prix.</p>
          </div>
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-3">
            <p className="text-sm font-bold text-gray-900">+ consultant en renfort</p>
            <p className="text-xs text-gray-600">Pour un marché stratégique ou un nouveau type d'acheteur.</p>
          </div>
        </div>
      </div>
    </Frame>
  )
}

// ─── Article « Critère environnemental » ──────────────────────────────────────

const ENV_LEVERS = [
  { name: 'Déchets', detail: 'Tri sur site, filières nommées, suivi des tonnages', impact: 2, proof: 3 },
  { name: 'Matériaux', detail: 'Bas carbone, recyclés, réemploi, fiches FDES', impact: 3, proof: 2 },
  { name: 'Transports et engins', detail: 'Livraisons regroupées, engins récents ou électriques', impact: 2, proof: 2 },
  { name: 'Nuisances', detail: 'Bruit, poussière, eau, horaires, riverains', impact: 1, proof: 3 },
  { name: 'Énergie et eau du chantier', detail: 'Base vie, éclairage, consommation d\'eau', impact: 1, proof: 2 },
]

function Meter({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex items-center gap-2 text-[11px] text-gray-500">
      <span className="w-24 shrink-0">{label}</span>
      <span className="flex gap-1" aria-label={`${value} sur 3`}>
        {[1, 2, 3].map((i) => (
          <span key={i} className={`h-2 w-6 rounded-full ${i <= value ? 'bg-emerald-500' : 'bg-gray-200'}`} />
        ))}
      </span>
    </span>
  )
}

export function EnvLevers({ caption }: { caption?: string }) {
  return (
    <Frame title="Les leviers environnementaux d'une offre de travaux" kicker="Repères indicatifs" caption={caption}>
      <ul className="grid gap-2 sm:grid-cols-2">
        {ENV_LEVERS.map((l) => (
          <li key={l.name} className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-sm font-bold text-gray-900">{l.name}</p>
            <p className="mb-2 text-xs text-gray-600">{l.detail}</p>
            <Meter value={l.impact} label="Poids sur l'impact" />
            <Meter value={l.proof} label="Facilité à prouver" />
          </li>
        ))}
      </ul>
    </Frame>
  )
}

const ENV_LEVELS = [
  { level: '1 · Intention', note: 'Presque rien à noter', text: '« Nous trions nos déchets dans le respect de l\'environnement. »', tone: 'border-red-200 bg-red-50', title: 'text-red-700' },
  { level: '2 · Moyens', note: 'Mieux, mais invérifiable', text: '« Tri sur site en 4 bennes : inertes, bois, métaux, déchets non dangereux en mélange. »', tone: 'border-orange-200 bg-orange-50', title: 'text-orange-700' },
  { level: '3 · Preuve', note: 'Ce que l\'analyste note', text: '« 4 bennes en zone nord (plan, annexe 3) ; inertes repris par la plateforme de recyclage la plus proche ; bilan des tonnages par flux remis à chaque situation mensuelle. »', tone: 'border-emerald-200 bg-emerald-50', title: 'text-emerald-700' },
]

export function EnvLevels({ caption }: { caption?: string }) {
  return (
    <Frame title="Trois niveaux de réponse" kicker="Sur un même sujet : la gestion des déchets" caption={caption}>
      <ol className="grid gap-2 md:grid-cols-3">
        {ENV_LEVELS.map((l) => (
          <li key={l.level} className={`rounded-xl border p-3 ${l.tone}`}>
            <p className={`text-sm font-extrabold ${l.title}`}>{l.level}</p>
            <p className="mb-2 text-[11px] font-semibold text-gray-500">{l.note}</p>
            <p className="text-sm leading-6 text-gray-800">{l.text}</p>
          </li>
        ))}
      </ol>
    </Frame>
  )
}

// ─── Article « AO perdu » ─────────────────────────────────────────────────────

const REJET_STEPS = [
  { title: 'Lettre de rejet', detail: 'Notifiée sans délai. En procédure formalisée : motifs, attributaire, date à partir de laquelle l\'acheteur peut signer.' },
  { title: 'Votre demande', detail: 'Dès réception, par la plateforme : motifs, offre retenue, notes par critère.' },
  { title: 'Réponse de l\'acheteur', detail: 'Sous 15 jours après réception de votre demande.' },
  { title: 'Signature du marché', detail: 'En procédure formalisée, pas avant 11 jours (16 si la lettre n\'est pas électronique).' },
  { title: 'Avis d\'attribution', detail: 'Publié : il ouvre le délai de recours de 2 mois.' },
]

export function RejectionTimeline({ caption }: { caption?: string }) {
  return (
    <Frame title="Chronologie après un rejet" kicker="Schéma indicatif" caption={caption}>
      <ol className="grid gap-2 sm:grid-cols-5">
        {REJET_STEPS.map((s, i) => (
          <li key={s.title} className={`relative rounded-xl border bg-white p-3 ${i < 3 ? 'border-blue-200' : 'border-gray-200'}`}>
            <span className={`mb-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i < 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{i + 1}</span>
            <p className="text-sm font-semibold leading-snug text-gray-900">{s.title}</p>
            <p className="mt-0.5 text-xs leading-snug text-gray-500">{s.detail}</p>
          </li>
        ))}
      </ol>
      <div className="mt-3 grid gap-2 text-[11px] font-medium sm:grid-cols-5">
        <p className="rounded-lg border border-dashed border-blue-300 px-2 py-1.5 text-center text-blue-700 sm:col-span-3">
          Fenêtre idéale pour obtenir vos informations (et seul moment possible pour un référé précontractuel)
        </p>
        <p className="rounded-lg border border-dashed border-gray-300 px-2 py-1.5 text-center text-gray-600 sm:col-span-2">
          Après signature : recours limités
        </p>
      </div>
    </Frame>
  )
}

const NOTES_CASES = [
  { title: 'Bon prix, mémoire faible', action: 'Reprenez le mémoire : sous-critères traités en détail, engagements chiffrés, chantier cité partout.', tone: 'border-orange-200 bg-orange-50' },
  { title: 'Bon mémoire, prix élevé', action: 'Revoyez le chiffrage, ou visez des marchés où la technique pèse plus lourd.', tone: 'border-orange-200 bg-orange-50' },
  { title: 'Prix et mémoire faibles', action: 'Le problème est le tri : ce marché ne vous correspondait pas. Durcissez votre grille go / no-go.', tone: 'border-red-200 bg-red-50' },
  { title: 'Perdu de peu', action: 'Cherchez le sous-critère qui a fait la différence, souvent le plus petit ou l\'environnement.', tone: 'border-emerald-200 bg-emerald-50' },
]

export function NotesToAction({ caption }: { caption?: string }) {
  return (
    <Frame title="De la notation au plan d'action" kicker="Quatre cas types" caption={caption}>
      <ul className="grid gap-2 sm:grid-cols-2">
        {NOTES_CASES.map((c) => (
          <li key={c.title} className={`rounded-xl border p-3 ${c.tone}`}>
            <p className="mb-1 text-sm font-bold text-gray-900">{c.title}</p>
            <p className="text-xs leading-5 text-gray-700">{c.action}</p>
          </li>
        ))}
      </ul>
    </Frame>
  )
}

// ─── Article « Groupement » ───────────────────────────────────────────────────

export function GroupementForms({ caption }: { caption?: string }) {
  const rows = [
    ['Engagement de chaque membre', 'Sa part des prestations', 'La totalité du marché'],
    ['Si un membre fait défaut', 'Le mandataire en répond envers l\'acheteur, s\'il est désigné solidaire', 'Les autres membres doivent assurer sa part'],
    ['Le plus courant entre', 'Artisans de métiers différents', 'Entreprises qui se connaissent bien'],
    ['Pour l\'acheteur', 'Une part claire par entreprise', 'Un seul niveau de garantie pour tout le marché'],
  ]
  return (
    <Frame title="Groupement conjoint ou solidaire" kicker="Art. R2142-20 et R2142-24 du CCP" caption={caption}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] border-separate border-spacing-1 text-left text-xs">
          <thead>
            <tr>
              <th />
              <th className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white">Conjoint</th>
              <th className="rounded-lg bg-gray-800 px-3 py-2 text-sm font-bold text-white">Solidaire</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, a, b]) => (
              <tr key={label}>
                <th className="px-2 py-2 font-semibold text-gray-600">{label}</th>
                <td className="rounded-lg border border-blue-100 bg-white px-3 py-2 leading-snug text-gray-800">{a}</td>
                <td className="rounded-lg border border-gray-200 bg-white px-3 py-2 leading-snug text-gray-800">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-gray-500">Dans les deux cas, un mandataire représente le groupement et coordonne les membres.</p>
    </Frame>
  )
}

const GROUPEMENT_STEPS = [
  { title: 'Repérer le manque', detail: 'Métier, référence ou chiffre d\'affaires qui vous manque pour cet AO' },
  { title: 'Choisir les partenaires', detail: 'Métiers complémentaires, taille comparable, confiance' },
  { title: 'Répartir prestations et prix', detail: 'Qui fait quoi, pour quel montant, interfaces' },
  { title: 'Choisir forme et mandataire', detail: 'Conjoint ou solidaire, pouvoirs du mandataire' },
  { title: 'Signer la convention', detail: 'Et les habilitations du mandataire, avant le dépôt' },
  { title: 'Déposer', detail: 'DC1 commun, DC2 ou DUME de chaque membre, offre commune' },
]

export function GroupementSteps({ caption }: { caption?: string }) {
  return (
    <Frame title="Monter un groupement" kicker="6 étapes" caption={caption}>
      <ol className="grid gap-2 sm:grid-cols-3">
        {GROUPEMENT_STEPS.map((s, i) => (
          <li key={s.title} className={`flex items-start gap-3 rounded-xl border bg-white p-3 ${i >= 1 && i <= 3 ? 'border-orange-200 ring-2 ring-orange-50' : 'border-gray-200'}`}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">{i + 1}</span>
            <span>
              <span className="block text-sm font-semibold text-gray-900">{s.title}</span>
              <span className="block text-xs leading-snug text-gray-500">{s.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </Frame>
  )
}

// ─── Petits éléments communs (articles 13 à 20) ───────────────────────────────

function Card({ title, children, tone = 'default', badge }: { title: string; children?: ReactNode; tone?: 'default' | 'focus' | 'good' | 'bad' | 'muted'; badge?: string }) {
  const tones = {
    default: 'border-gray-200 bg-white',
    focus: 'border-orange-300 bg-orange-50 ring-2 ring-orange-100',
    good: 'border-emerald-200 bg-emerald-50',
    bad: 'border-red-200 bg-red-50',
    muted: 'border-dashed border-gray-300 bg-white',
  }
  return (
    <div className={`rounded-xl border p-3 ${tones[tone]}`}>
      {badge && <p className="mb-1 text-[11px] font-bold tracking-wide text-gray-500 uppercase">{badge}</p>}
      <p className="text-sm font-bold leading-snug text-gray-900">{title}</p>
      {children && <div className="mt-1 text-xs leading-5 text-gray-600">{children}</div>}
    </div>
  )
}

function Dots({ value, max = 3 }: { value: number; max?: number }) {
  return (
    <span className="inline-flex gap-1" aria-label={`${value} sur ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < value ? 'bg-blue-600' : 'bg-gray-200'}`} />
      ))}
    </span>
  )
}

// ─── Article « Attestations » ─────────────────────────────────────────────────

export function AttestationsByStage({ caption }: { caption?: string }) {
  return (
    <Frame title="Pièces administratives par étape" kicker="Cas général, à vérifier dans chaque RC" caption={caption}>
      <div className="grid gap-2 md:grid-cols-3">
        <Card title="1 · Au dépôt" badge="Candidature">
          Déclaration sur l'honneur (DC1 ou DUME), DC2 ou DUME, références, qualifications demandées par le RC. Pas d'attestation officielle en général.
        </Card>
        <Card title="2 · Une fois retenu" badge="Délai court fixé par l'acheteur" tone="focus">
          Attestation de vigilance, attestation de régularité fiscale, Kbis ou extrait RNE, assurances, liste des salariés étrangers le cas échéant.
        </Card>
        <Card title="3 · Pendant l'exécution" badge="Marchés de 5 000 € HT et plus">
          Attestation de vigilance tous les 6 mois jusqu'à la fin du marché, avec la liste des salariés étrangers ; assurances de l'année en cours.
        </Card>
      </div>
    </Frame>
  )
}

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
const RENEWALS: { piece: string; months: number[]; note: string }[] = [
  { piece: 'Attestation de vigilance', months: [0, 6], note: 'tous les 6 mois' },
  { piece: 'Liste des salariés étrangers', months: [0, 6], note: 'avec la vigilance' },
  { piece: 'Assurances RC et décennale', months: [0], note: 'chaque année' },
  { piece: 'Attestation fiscale, Kbis ou RNE', months: [], note: 'le jour où vous êtes retenu' },
]

export function RenewalCalendar({ caption }: { caption?: string }) {
  return (
    <Frame title="Calendrier type des renouvellements" kicker="Exemple sur une année" caption={caption}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-separate border-spacing-x-1 border-spacing-y-1.5 text-xs">
          <thead>
            <tr>
              <th className="w-44 text-left font-semibold text-gray-500">Pièce</th>
              {MONTHS.map((m, i) => <th key={i} className="font-semibold text-gray-400">{m}</th>)}
              <th className="text-left font-semibold text-gray-500">Rythme</th>
            </tr>
          </thead>
          <tbody>
            {RENEWALS.map((r) => (
              <tr key={r.piece}>
                <th className="pr-2 text-left font-semibold text-gray-800">{r.piece}</th>
                {MONTHS.map((_, i) => (
                  <td key={i} className={`h-6 rounded ${r.months.includes(i) ? 'bg-orange-500' : r.months.length === 0 ? 'bg-gray-100' : 'bg-white ring-1 ring-gray-200'}`}>
                    {r.months.includes(i) && <span className="sr-only">à renouveler</span>}
                  </td>
                ))}
                <td className="pl-2 whitespace-nowrap text-gray-600">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-gray-500">Case orange : pièce à demander ce mois-là. Les dates se décalent selon la date d'émission de vos attestations.</p>
    </Frame>
  )
}

// ─── Article « Logiciel » ─────────────────────────────────────────────────────

export function SoftwareCriteriaChain({ caption }: { caption?: string }) {
  const stages = [
    { title: 'Trouver', items: [{ n: 1, t: 'Couverture des sources' }] },
    { title: 'Décider', items: [{ n: 2, t: 'Qualité du tri', key: true }] },
    { title: 'Préparer', items: [{ n: 3, t: 'Dossier administratif' }, { n: 4, t: 'Aide au mémoire', key: true }, { n: 5, t: 'Spécificité BTP' }] },
  ]
  return (
    <Frame title="Les 7 critères sur la chaîne de réponse" caption={caption}>
      <div className="grid gap-2 md:grid-cols-[1fr_auto_1fr_auto_1.6fr] md:items-stretch">
        {stages.map((s, i) => (
          <div key={s.title} className="contents">
            <div className="rounded-xl border border-gray-200 bg-white p-3">
              <p className="mb-2 text-xs font-bold tracking-wide text-blue-600 uppercase">{s.title}</p>
              <ul className="space-y-1.5">
                {s.items.map((it) => (
                  <li key={it.n} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${'key' in it && it.key ? 'bg-orange-50 font-semibold text-gray-900 ring-1 ring-orange-200' : 'text-gray-700'}`}>
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">{it.n}</span>
                    {it.t}
                  </li>
                ))}
              </ul>
            </div>
            {i < stages.length - 1 && <span className="hidden items-center text-gray-300 md:flex" aria-hidden="true">→</span>}
          </div>
        ))}
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white px-3 py-2 text-sm text-gray-700">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-500 text-[11px] font-bold text-white">6</span>
          Vos données, tout au long de la chaîne
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white px-3 py-2 text-sm text-gray-700">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-500 text-[11px] font-bold text-white">7</span>
          Prise en main et coût réel
        </div>
      </div>
    </Frame>
  )
}

const FAMILIES = ['Agrégateur de veille', "Plateforme d'analyse standard", 'Application sur mesure']
const FAMILY_SCORES: [string, number[]][] = [
  ['1. Couverture des sources', [3, 2, 2]],
  ['2. Qualité du tri', [1, 2, 3]],
  ['3. Dossier administratif', [1, 2, 3]],
  ['4. Aide au mémoire', [1, 2, 3]],
  ['5. Spécificité BTP', [1, 2, 3]],
  ['6. Vos données', [2, 2, 2]],
  ['7. Rapidité de mise en place', [3, 2, 1]],
]

export function ToolFamilies({ caption }: { caption?: string }) {
  return (
    <Frame title="Profil type des trois familles d'outils" kicker="Positions indicatives, à vérifier outil par outil" caption={caption}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-xs">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 pr-2 font-semibold text-gray-500">Critère</th>
              {FAMILIES.map((f) => <th key={f} className="px-2 py-2 font-semibold text-gray-800">{f}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {FAMILY_SCORES.map(([label, scores]) => (
              <tr key={label}>
                <th className="py-2 pr-2 font-medium text-gray-700">{label}</th>
                {scores.map((s, i) => <td key={i} className="px-2 py-2"><Dots value={s} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-gray-500">3 points : point fort typique de la famille. Un outil précis peut faire mieux ou moins bien : testez-le sur vos AO.</p>
    </Frame>
  )
}

// ─── Article « MAPA » ─────────────────────────────────────────────────────────

export function MapaFlow({ caption }: { caption?: string }) {
  return (
    <Frame title="Déroulé type d'un MAPA de travaux" kicker="Art. R2123-5 et R2181-2 du CCP" caption={caption}>
      <ol className="grid gap-2 sm:grid-cols-3">
        <li><Card title="1 · Avis publié" badge="BOAMP ou JAL">Dossier gratuit sur le profil d'acheteur ; délai fixé par l'acheteur.</Card></li>
        <li><Card title="2 · Lecture du RC" badge="Le point clé">Pièces, critères, et surtout : négociation prévue ou non ?</Card></li>
        <li><Card title="3 · Offre initiale" badge="Peut être la seule" tone="focus">Elle doit pouvoir gagner seule.</Card></li>
      </ol>
      <div className="my-2 grid gap-2 text-center text-[11px] font-semibold text-gray-500 sm:grid-cols-2" aria-hidden="true">
        <span>↓ négociation prévue</span>
        <span>↓ pas de négociation, ou attribution sur les offres initiales</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Card title="4a · Négociation, puis offre finale" tone="muted">Avec tous les candidats, ou les mieux classés si le RC l'annonce.</Card>
        <Card title="4b · Attribution directe" tone="muted">Sur la base des offres initiales.</Card>
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <Card title="5 · Attribution et signature">Pas de délai minimal obligatoire avant la signature en MAPA.</Card>
        <Card title="6 · Si vous êtes écarté">Demandez les motifs : réponse sous 15 jours après votre demande.</Card>
      </div>
    </Frame>
  )
}

export function MapaLayers({ caption }: { caption?: string }) {
  return (
    <Frame title="Les trois couches du dossier d'un MAPA de travaux" caption={caption}>
      <div className="space-y-2">
        <Card title="Socle : identique pour tous les MAPA" badge="À préparer une fois">
          DC1, DC2 ou DUME générique, fiches références, qualifications ou preuves équivalentes, pouvoir du signataire.
        </Card>
        <Card title="Couche du milieu : propre à chaque MAPA" badge="Ce qui est noté" tone="focus">
          Note méthodologique sur ce chantier, cadre de prix (DPGF ou BPU et DQE), planning, attestation de visite.
        </Card>
        <Card title="Dernière couche : à l'attribution" badge="À tenir à jour">
          Attestation de vigilance, attestation fiscale, Kbis ou extrait RNE, assurances, liste des salariés étrangers.
        </Card>
      </div>
    </Frame>
  )
}

// ─── Article « Peu de références » ────────────────────────────────────────────

const PROOFS = [
  { title: 'Chantiers privés', text: 'Particuliers, copropriétés, entreprises : décrits en fiche, avec une attestation du client.' },
  { title: 'Chantiers en sous-traitance', text: 'Ce que vous avez réalisé pour un titulaire de marché public, attesté par lui.' },
  { title: "Expérience de l'équipe", text: 'CV du dirigeant et des encadrants, titres professionnels, habilitations.' },
  { title: 'Moyens humains et matériels', text: 'Effectifs, encadrement, engins et outillage disponibles pour le chantier.' },
  { title: "Capacités d'un partenaire", text: 'Avec la preuve que vous en disposerez, en pratique son engagement écrit.' },
  { title: 'Groupement', text: 'Les capacités des membres s\'additionnent : références, chiffre d\'affaires, qualifications.' },
]

export function CapacityProofs({ caption }: { caption?: string }) {
  return (
    <Frame title="Six façons de prouver votre capacité" kicker="Art. R2142-3, R2142-14 et R2143-12 du CCP" caption={caption}>
      <ol className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {PROOFS.map((p, i) => (
          <li key={p.title} className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{i + 1}</span>
            <span>
              <span className="block text-sm font-bold text-gray-900">{p.title}</span>
              <span className="block text-xs leading-5 text-gray-600">{p.text}</span>
            </span>
          </li>
        ))}
      </ol>
    </Frame>
  )
}

const ROADMAP = [
  { period: 'Mois 1 à 3', title: 'Le dossier permanent', text: 'Fiches références privées, attestations de bonne exécution, DUME générique.' },
  { period: 'Mois 3 à 6', title: 'Sous-traiter ou cotraiter', text: 'Intervenir sur des marchés publics aux côtés d\'un titulaire, et demander une attestation.' },
  { period: 'Mois 6 à 9', title: 'Premiers petits MAPA', text: 'Des marchés de votre taille, près de chez vous : chaque marché gagné devient une référence publique.', focus: true },
  { period: 'Mois 9 à 12', title: 'Monter en taille', text: 'Des lots plus gros, seul ou en groupement, avec vos premières références publiques.' },
]

export function ReferencesRoadmap({ caption }: { caption?: string }) {
  return (
    <Frame title="Construire ses références publiques" kicker="Feuille de route indicative sur 12 mois" caption={caption}>
      <ol className="grid gap-2 md:grid-cols-4">
        {ROADMAP.map((s) => (
          <li key={s.period}>
            <Card title={s.title} badge={s.period} tone={s.focus ? 'focus' : 'default'}>{s.text}</Card>
          </li>
        ))}
      </ol>
    </Frame>
  )
}

// ─── Article « DPGF, BPU, DQE » ───────────────────────────────────────────────

export function PriceDocs({ caption }: { caption?: string }) {
  const rows = [
    ['Ce qui vous engage', 'Le prix global', 'Chaque prix unitaire', 'Rien : c\'est une simulation'],
    ['Comment vous êtes payé', 'Le forfait, quelles que soient les quantités', 'Selon les quantités réellement exécutées', '—'],
    ['À quoi il sert', 'Comparer les offres poste par poste, payer les acomptes', 'Fixer vos prix', 'Comparer et noter les offres'],
    ['Marché type', 'Travaux définis, prix forfaitaire', 'Accords-cadres à bons de commande, entretien', 'Accompagne le BPU'],
  ]
  return (
    <Frame title="DPGF, BPU, DQE" kicker="Ce qui vous engage et ce qui vous paie" caption={caption}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-separate border-spacing-1 text-left text-xs">
          <thead>
            <tr>
              <th />
              <th className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white">DPGF</th>
              <th className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-bold text-white">BPU</th>
              <th className="rounded-lg bg-orange-100 px-3 py-2 text-sm font-bold text-orange-800">DQE</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, ...cells]) => (
              <tr key={label}>
                <th className="px-2 py-2 font-semibold text-gray-600">{label}</th>
                {cells.map((c, i) => <td key={i} className="rounded-lg border border-gray-200 bg-white px-3 py-2 leading-snug text-gray-800">{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Frame>
  )
}

// ─── Article « IA et appels d'offres » ────────────────────────────────────────

const AI_QUADRANTS = [
  { key: 'tl', title: "L'IA aide, vous tranchez", tone: 'border-orange-200 bg-orange-50', titleTone: 'text-orange-700', tasks: ['Décision go / no-go', 'Prix', 'Engagements du mémoire', 'Contenu propre au chantier'] },
  { key: 'tr', title: "L'IA prépare, vous relisez", tone: 'border-blue-200 bg-blue-50', titleTone: 'text-blue-700', tasks: ['Lire le dossier de consultation', 'Extraire critères et pondération', 'Trame du mémoire', 'Comparer à votre profil'] },
  { key: 'bl', title: 'Peu à gagner', tone: 'border-gray-200 bg-white', titleTone: 'text-gray-600', tasks: ['Visite de site', 'Échanges avec l\'acheteur'] },
  { key: 'br', title: "L'IA fait, contrôle léger", tone: 'border-emerald-200 bg-emerald-50', titleTone: 'text-emerald-700', tasks: ['Veille quotidienne', 'Pré-remplir DC1, DC2, DUME', 'Repérer une pièce manquante'] },
]

export function AiTaskMap({ caption }: { caption?: string }) {
  return (
    <Frame title="Répartition des tâches entre l'IA et votre équipe" kicker="Positions indicatives" caption={caption}>
      <div className="grid grid-cols-[auto_1fr_1fr] gap-2">
        <div className="row-span-2 flex items-center">
          <p className="text-[11px] font-semibold text-gray-500 [writing-mode:vertical-rl] rotate-180">Risque si une erreur passe ↑</p>
        </div>
        {AI_QUADRANTS.map((q) => (
          <div key={q.key} className={`rounded-xl border p-3 ${q.tone}`}>
            <p className={`mb-2 text-sm font-extrabold ${q.titleTone}`}>{q.title}</p>
            <ul className="flex flex-wrap gap-1">
              {q.tasks.map((t) => <li key={t} className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-gray-700 shadow-xs">{t}</li>)}
            </ul>
          </div>
        ))}
        <div />
        <p className="col-span-2 text-center text-[11px] font-semibold text-gray-500">Temps gagné grâce à l'IA →</p>
      </div>
    </Frame>
  )
}

const AI_STEPS: { step: string; ai: string; team: string; human?: boolean }[] = [
  { step: 'Veille', ai: 'Repère chaque jour les AO de votre métier et de votre zone', team: 'Ajuste les réglages' },
  { step: 'Lecture du dossier', ai: 'Résume le RC et le CCTP, avec la référence de chaque information', team: 'Contrôle les chiffres clés' },
  { step: 'Décision go / no-go', ai: 'Propose une note argumentée', team: 'Décide', human: true },
  { step: 'Dossier administratif', ai: 'Pré-remplit DC1, DC2 ou DUME, vérifie les attestations', team: 'Signe' },
  { step: 'Trame du mémoire', ai: 'Construit le sommaire sur les sous-critères, propose vos blocs', team: 'Choisit les blocs' },
  { step: 'Contenu propre au chantier', ai: 'Signale les sections encore génériques', team: 'Écrit : site, phasage, moyens', human: true },
  { step: 'Prix', ai: 'Reprend le cadre de prix et vérifie les totaux', team: 'Chiffre et fixe le prix', human: true },
  { step: 'Relecture et dépôt', ai: 'Vérifie pièces et cohérence', team: 'Relit, signe, dépose' },
]

export function AiWorkflowSteps({ caption }: { caption?: string }) {
  return (
    <Frame title="Partage du travail dans l'application Vision" kicker="De la veille au dépôt" caption={caption}>
      <ol className="space-y-1.5">
        {AI_STEPS.map((s, i) => (
          <li key={s.step} className={`grid items-start gap-2 rounded-xl border p-2.5 text-xs sm:grid-cols-[11rem_1fr_1fr] ${s.human ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white'}`}>
            <p className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${s.human ? 'bg-orange-500' : 'bg-blue-600'}`}>{i + 1}</span>
              {s.step}
            </p>
            <p className="text-gray-600"><span className="font-semibold text-blue-700">IA : </span>{s.ai}</p>
            <p className="text-gray-600"><span className="font-semibold text-gray-900">Vous : </span>{s.team}</p>
          </li>
        ))}
      </ol>
    </Frame>
  )
}

// ─── Article « Offre anormalement basse » ─────────────────────────────────────

export function OabProcedure({ caption }: { caption?: string }) {
  return (
    <Frame title="Procédure de l'offre anormalement basse" kicker="Art. L2152-6, R2152-3 et R2152-4 du CCP" caption={caption}>
      <ol className="grid gap-2 sm:grid-cols-4">
        <li><Card title="1 · Détection" badge="Acheteur">Écart avec les autres offres ou l'estimation, prix unitaires anormaux, main-d'œuvre insuffisante.</Card></li>
        <li><Card title="2 · Demande de justification" badge="Obligatoire">Écrite, avec un délai. Pas de rejet sans cette étape.</Card></li>
        <li><Card title="3 · Votre réponse" badge="Vous" tone="focus">Chiffres et pièces : décomposition, heures, devis, conditions favorables.</Card></li>
        <li><Card title="4 · Examen" badge="Acheteur">Les justifications rendent-elles compte du prix ?</Card></li>
      </ol>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <Card title="Offre maintenue" tone="good">Elle est classée normalement selon les critères.</Card>
        <Card title="Offre rejetée" tone="bad">Si les justifications sont insuffisantes, ou si le prix bas s'explique par le non-respect d'obligations sociales, environnementales ou du droit du travail.</Card>
      </div>
    </Frame>
  )
}

export function OabJustifications({ caption }: { caption?: string }) {
  const good = [
    ['Procédé de construction', 'Préfabrication, procédé qui réduit les heures sur site'],
    ['Solution technique', 'Variante de mise en œuvre décrite au mémoire'],
    ['Conditions favorables', 'Matériel en propre amorti, dépôt proche, chantier voisin, stock acquis'],
    ['Originalité de l\'offre', 'Organisation ou phasage qui réduit la durée'],
    ['Prix d\'achat', 'Devis fournisseurs, remises négociées, joints en annexe'],
  ]
  const bad = ['« Nous sommes très compétitifs »', '« Nous maîtrisons nos coûts »', '« Prix d\'appel pour entrer chez ce client »', '« Nos prix sont toujours bas »', 'Une réponse sans chiffres ni pièces']
  return (
    <Frame title="Justifications recevables et insuffisantes" kicker="D'après l'art. R2152-3 du CCP et la pratique" caption={caption}>
      <div className="grid gap-2 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-200 bg-white p-3">
          <p className="mb-2 text-xs font-bold text-emerald-700">✓ Recevables, si elles sont chiffrées</p>
          <ul className="space-y-1.5">
            {good.map(([t, d]) => (
              <li key={t} className="text-sm text-gray-800"><span className="font-semibold">{t}</span> <span className="text-xs text-gray-500">· {d}</span></li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-red-200 bg-white p-3">
          <p className="mb-2 text-xs font-bold text-red-600">✕ Insuffisantes</p>
          <ul className="space-y-1.5">
            {bad.map((t) => <li key={t} className="text-sm text-gray-800">{t}</li>)}
          </ul>
        </div>
      </div>
    </Frame>
  )
}

// ─── Article « Sous-traitance » ───────────────────────────────────────────────

export function SubcontractingFlows({ caption }: { caption?: string }) {
  return (
    <Frame title="Contrats et paiements en sous-traitance" kicker="Art. L2193-10 à L2193-14 du CCP, loi du 31 décembre 1975" caption={caption}>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <Card title="Acheteur public" badge="Maître d'ouvrage">Signe le marché avec le titulaire, accepte le sous-traitant (DC4).</Card>
        <p className="text-center text-[11px] font-semibold text-gray-500">
          <span className="block text-blue-700">Marché public ↔</span>
          <span className="block">paie le titulaire</span>
        </p>
        <Card title="Titulaire" badge="Entreprise principale">Responsable de tous les travaux envers l'acheteur.</Card>
      </div>
      <div className="my-2 grid gap-2 sm:grid-cols-[1fr_auto_1fr]">
        <p className="rounded-lg border border-dashed border-emerald-300 bg-emerald-50 px-3 py-2 text-center text-xs font-semibold text-emerald-800">
          ↓ Paiement direct, dès 600 € TTC, après acceptation et agrément
        </p>
        <span />
        <p className="rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 text-center text-xs font-semibold text-gray-600">
          ↓ Contrat de sous-traitance
        </p>
      </div>
      <div className="mx-auto max-w-md">
        <Card title="Sous-traitant de premier rang" badge="Vous" tone="focus">Aucun contrat avec l'acheteur, mais payé directement par lui.</Card>
      </div>
    </Frame>
  )
}

export function DirectPaymentCircuit({ caption }: { caption?: string }) {
  return (
    <Frame title="Circuit du paiement direct" kicker="Art. R2193-11 à R2193-14 et R2192-23 du CCP" caption={caption}>
      <ol className="grid gap-2 sm:grid-cols-4">
        <li><Card title="1 · Votre demande" badge="Vous" tone="focus">Au titulaire, par un moyen qui date la réception, et copie à l'acheteur avec cette preuve.</Card></li>
        <li><Card title="2 · Le titulaire : 15 jours" badge="Titulaire">Il donne son accord ou notifie un refus. Silence = accord.</Card></li>
        <li><Card title="3 · L'acheteur paie" badge="Acheteur">Délai compté à partir de l'accord du titulaire, ou de la fin des 15 jours.</Card></li>
        <li><Card title="4 · En cas de retard" badge="Vous">Intérêts moratoires et indemnité forfaitaire de recouvrement.</Card></li>
      </ol>
    </Frame>
  )
}

// ─── Article « Marché public de travaux » ─────────────────────────────────────

export function WorksActors({ caption }: { caption?: string }) {
  return (
    <Frame title="Les acteurs d'un marché public de travaux" kicker="Cas d'une opération de bâtiment" caption={caption}>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-2">
          <p className="text-[11px] font-bold tracking-wide text-gray-500 uppercase">Côté acheteur</p>
          <Card title="Maître d'ouvrage" badge="L'acheteur public">Décide du projet, signe le marché, prononce la réception.</Card>
          <Card title="Assistant à maîtrise d'ouvrage" tone="muted">Facultatif : aide l'acheteur à définir son besoin et à suivre l'opération.</Card>
          <Card title="Comptable public" tone="muted">Paie les situations, après validation par la maîtrise d'œuvre et l'acheteur.</Card>
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-bold tracking-wide text-gray-500 uppercase">Conception et contrôle</p>
          <Card title="Maître d'œuvre" badge="Architecte, bureau d'études">Conçoit le projet, rédige souvent le CCTP, dirige le chantier, émet les ordres de service, propose la réception.</Card>
          <Card title="Contrôleur technique" tone="muted">Vérifie la solidité et la sécurité des ouvrages.</Card>
          <Card title="Coordonnateur SPS et OPC" tone="muted">Coordonnent la sécurité entre entreprises et pilotent le planning.</Card>
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-bold tracking-wide text-gray-500 uppercase">Exécution</p>
          <Card title="Entreprise titulaire" badge="Vous" tone="focus">Exécute les travaux de son lot, seule ou en groupement, et en répond devant l'acheteur.</Card>
          <Card title="Cotraitants" tone="muted">Membres d'un groupement : chacun signe le marché avec le mandataire.</Card>
          <Card title="Sous-traitants" tone="muted">Acceptés par l'acheteur (DC4), payés directement dès 600 € TTC.</Card>
        </div>
      </div>
      <div className="mt-3 grid gap-2 text-[11px] font-medium sm:grid-cols-2">
        <p className="rounded-lg border border-dashed border-blue-300 bg-white px-3 py-2 text-blue-800">
          <span className="font-bold">Contrats :</span> l'acheteur signe un marché avec chaque entreprise (ou groupement) et un contrat avec chaque intervenant de la colonne du milieu.
        </p>
        <p className="rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 text-gray-600">
          <span className="font-bold">Au quotidien :</span> l'entreprise n'a pas de contrat avec le maître d'œuvre, mais c'est lui qui dirige le chantier et vérifie ses situations.
        </p>
      </div>
    </Frame>
  )
}

// ─── Article « Gros œuvre » ───────────────────────────────────────────────────

const GANTT_MONTHS = 12
const GANTT_ROWS: { label: string; from: number; to: number; critical?: boolean }[] = [
  { label: 'Installation, terrassements', from: 1, to: 1 },
  { label: 'Gros œuvre : fondations, élévations, planchers', from: 1, to: 5, critical: true },
  { label: 'Charpente, couverture, étanchéité', from: 5, to: 6 },
  { label: 'Menuiseries extérieures', from: 6, to: 7 },
  { label: 'Électricité, plomberie, CVC', from: 6, to: 10 },
  { label: 'Cloisons, plâtrerie', from: 7, to: 9 },
  { label: 'Revêtements, peinture', from: 9, to: 11 },
  { label: 'Essais, OPR, réception', from: 12, to: 12 },
]
const GANTT_MILESTONES = [
  { month: 2, label: 'Dalle basse coulée' },
  { month: 4, label: 'Élévations terminées' },
  { month: 6, label: 'Hors d\'eau' },
  { month: 7, label: 'Hors d\'air' },
]

export function BuildingSchedule({ caption }: { caption?: string }) {
  return (
    <Frame title="Planning indicatif d'une opération de bâtiment" kicker="Exemple, durées à adapter" caption={caption}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-separate border-spacing-x-0.5 border-spacing-y-1 text-xs">
          <thead>
            <tr>
              <th className="w-48 text-left font-semibold text-gray-500">Lot</th>
              {Array.from({ length: GANTT_MONTHS }, (_, i) => (
                <th key={i} className="font-semibold text-gray-400">M{i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GANTT_ROWS.map((r) => (
              <tr key={r.label}>
                <th className={`pr-2 text-left font-semibold leading-tight ${r.critical ? 'text-orange-700' : 'text-gray-800'}`}>{r.label}</th>
                {Array.from({ length: GANTT_MONTHS }, (_, i) => {
                  const on = i + 1 >= r.from && i + 1 <= r.to
                  return (
                    <td key={i} className={`h-6 ${on ? (r.critical ? 'bg-orange-500' : 'bg-blue-500') : 'bg-white ring-1 ring-gray-100'} ${on && i + 1 === r.from ? 'rounded-l' : ''} ${on && i + 1 === r.to ? 'rounded-r' : ''}`}>
                      {on && <span className="sr-only">mois {i + 1}</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
            <tr>
              <th className="pr-2 pt-1 text-left text-[11px] font-semibold text-gray-500">Jalons libérés par le gros œuvre</th>
              {Array.from({ length: GANTT_MONTHS }, (_, i) => {
                const m = GANTT_MILESTONES.find((x) => x.month === i + 1)
                return (
                  <td key={i} className="pt-1 text-center align-top">
                    {m && <span className="mx-auto block h-2.5 w-2.5 rotate-45 bg-gray-800" title={m.label} aria-hidden="true" />}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-600">
        {GANTT_MILESTONES.map((m) => (
          <li key={m.label} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rotate-45 bg-gray-800" aria-hidden="true" /> M{m.month} : {m.label}
          </li>
        ))}
        <li className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-orange-500" aria-hidden="true" /> Chemin critique : tout retard décale les lots suivants</li>
      </ul>
    </Frame>
  )
}

// ─── Article « Loi de simplification 2026 » ───────────────────────────────────

const SVE_STEPS: { date: string; title: string; text: string; status: 'done' | 'next' | 'later' }[] = [
  { date: '26 mai 2026', title: 'Loi n° 2026-403', text: 'Promulguée le 26 mai, publiée au Journal officiel le 27 mai.', status: 'done' },
  { date: '28 mai 2026', title: 'Variantes autorisées par défaut', text: 'En procédure formalisée aussi, sauf mention contraire (art. L2151-2 du CCP).', status: 'done' },
  { date: '1er juillet 2026', title: 'Achats innovants', text: 'Sans publicité ni mise en concurrence sous 140 000 € HT, travaux compris.', status: 'done' },
  { date: '1er janvier 2027', title: 'Dispense des travaux à 140 000 € HT', text: 'Pour les consultations engagées ou les avis envoyés à partir de cette date.', status: 'next' },
  { date: 'Au plus tard fin 2030', title: 'Plateforme de l\'État', text: 'Obligatoire pour les acheteurs publics autres que les collectivités, date fixée par décret.', status: 'later' },
]

export function SimplificationTimeline({ caption }: { caption?: string }) {
  const tones = {
    done: { dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'En vigueur' },
    next: { dot: 'bg-orange-500', chip: 'bg-orange-50 text-orange-700 border-orange-200', label: 'À venir' },
    later: { dot: 'bg-gray-400', chip: 'bg-gray-50 text-gray-600 border-gray-200', label: 'Échelonné' },
  }
  return (
    <Frame title="Entrée en vigueur des mesures commande publique" kicker="Loi du 26 mai 2026, titre III" caption={caption}>
      <ol className="grid gap-2 sm:grid-cols-5">
        {SVE_STEPS.map((s) => {
          const t = tones[s.status]
          return (
            <li key={s.date} className={`rounded-xl border bg-white p-3 ${s.status === 'next' ? 'border-orange-300 ring-2 ring-orange-100' : 'border-gray-200'}`}>
              <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-gray-900">
                <span className={`h-2 w-2 shrink-0 rounded-full ${t.dot}`} aria-hidden="true" /> {s.date}
              </p>
              <p className="text-sm font-semibold leading-snug text-gray-900">{s.title}</p>
              <p className="mt-0.5 text-xs leading-snug text-gray-500">{s.text}</p>
              <p className={`mt-2 inline-block rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${t.chip}`}>{t.label}</p>
            </li>
          )
        })}
      </ol>
    </Frame>
  )
}

// ─── Article « Réception des travaux » ────────────────────────────────────────

export function ReceptionProcedure({ caption }: { caption?: string }) {
  return (
    <Frame title="La procédure de réception" kicker="CCAG Travaux 2021, article 41" caption={caption}>
      <ol className="grid gap-2 sm:grid-cols-4">
        <li><Card title="1 · Avis d'achèvement" badge="Vous">Par écrit, au maître d'ouvrage et au maître d'œuvre. Gardez la preuve de réception.</Card></li>
        <li><Card title="2 · Opérations préalables" badge="Maître d'œuvre · 20 jours" tone="focus">Visite en votre présence, procès-verbal signé sur place.</Card></li>
        <li><Card title="3 · Proposition" badge="Maître d'œuvre · 5 jours">Réception ou non, date d'achèvement proposée, réserves éventuelles.</Card></li>
        <li><Card title="4 · Décision" badge="Maître d'ouvrage · 30 jours">Notifiée dans les 30 jours suivant le procès-verbal des opérations préalables.</Card></li>
      </ol>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <Card title="Décision notifiée" tone="good">La réception prend effet à la date d'achèvement retenue, pas à la date de la décision.</Card>
        <Card title="Pas de décision dans les 30 jours" tone="muted">Les propositions du maître d'œuvre s'imposent au maître d'ouvrage et à l'entreprise.</Card>
      </div>
    </Frame>
  )
}

const RECEPTION_DEADLINES = [
  { when: 'Date d\'achèvement retenue', what: 'Fin des pénalités de retard, transfert de la garde de l\'ouvrage, début des garanties.', focus: true },
  { when: 'Notification + 30 jours', what: 'Vous envoyez votre projet de décompte final.' },
  { when: '+ 1 an', what: 'Fin de la garantie de parfait achèvement, sauf autre durée au CCAP.' },
  { when: '+ 1 an et 30 jours', what: 'Remboursement de la retenue de garantie, si les réserves sont levées.' },
  { when: '+ 2 ans', what: 'Fin de la garantie biennale de bon fonctionnement des équipements.' },
  { when: '+ 10 ans', what: 'Fin de la garantie décennale.' },
]

export function ReceptionDeadlines({ caption }: { caption?: string }) {
  return (
    <Frame title="Ce qui court à partir de la réception" kicker="Marché au CCAG Travaux 2021" caption={caption}>
      <ol className="relative grid gap-2 sm:grid-cols-6">
        {RECEPTION_DEADLINES.map((d, i) => (
          <li key={d.when} className={`rounded-xl border bg-white p-3 ${d.focus ? 'border-orange-300 ring-2 ring-orange-100' : 'border-gray-200'}`}>
            <span className={`mb-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${d.focus ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{i + 1}</span>
            <p className="text-sm font-bold leading-snug text-gray-900">{d.when}</p>
            <p className="mt-0.5 text-xs leading-snug text-gray-500">{d.what}</p>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[11px] text-gray-500">Durées par défaut du CCAG Travaux et du Code de la commande publique : le CCAP de votre marché peut prévoir autre chose.</p>
    </Frame>
  )
}

// ─── Article « BOAMP » ────────────────────────────────────────────────────────

const AVIS_FIELDS: { label: string; value: string; point?: number }[] = [
  { label: 'Acheteur', value: 'Commune de [exemple], services techniques' },
  { label: 'Objet', value: 'Rénovation énergétique du groupe scolaire' },
  { label: 'Procédure', value: 'Procédure adaptée ouverte' },
  { label: 'Lots', value: '1 Gros œuvre · 2 Couverture · 3 Menuiseries extérieures · 4 Électricité · 5 Plomberie, CVC', point: 1 },
  { label: 'Conditions de participation', value: 'Chiffre d\'affaires, références de moins de 5 ans, qualification ou preuve équivalente, assurance décennale', point: 2 },
  { label: 'Visite', value: 'Obligatoire, sur rendez-vous avant le 4 novembre', point: 3 },
  { label: 'Critères d\'attribution', value: 'Indiqués dans les documents de la consultation' },
  { label: 'Date limite de réception des offres', value: '14 novembre 2026 à 12 h 00', point: 4 },
  { label: 'Documents et dépôt', value: 'Adresse du profil d\'acheteur où télécharger le dossier et déposer l\'offre', point: 5 },
]

export function BoampNotice({ caption }: { caption?: string }) {
  return (
    <Frame title="Les rubriques d'un avis à lire en premier" kicker="Exemple fictif" caption={caption}>
      <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-xs sm:p-5">
        <p className="mb-1 text-center text-xs font-bold tracking-wider text-gray-500 uppercase">Avis de marché · Travaux</p>
        <div className="mx-auto mb-4 h-px w-24 bg-gray-200" aria-hidden="true" />
        <dl className="space-y-1.5">
          {AVIS_FIELDS.map((f) => (
            <div key={f.label} className={`grid gap-1 rounded-lg px-3 py-2 sm:grid-cols-[12rem_1fr_auto] sm:gap-3 ${f.point ? 'bg-blue-50 ring-1 ring-blue-100' : ''}`}>
              <dt className="text-xs font-bold text-gray-500">{f.label}</dt>
              <dd className="text-sm text-gray-800">{f.value}</dd>
              {f.point ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white">{f.point}</span>
              ) : <span className="hidden sm:block" />}
            </div>
          ))}
        </dl>
      </div>
      <p className="mt-3 text-[11px] text-gray-500">Les numéros renvoient aux 5 points à vérifier. L'ordre et l'intitulé des rubriques varient selon le formulaire utilisé par l'acheteur.</p>
    </Frame>
  )
}

// ─── Article « Communes » ─────────────────────────────────────────────────────

export function CommuneDecision({ caption }: { caption?: string }) {
  return (
    <Frame title="Qui prépare, qui décide, qui signe" kicker="Marchés de travaux d'une commune" caption={caption}>
      <div className="grid gap-2 md:grid-cols-4">
        <Card title="Services techniques" badge="Préparent" tone="focus">Définissent le besoin, demandent les devis, préparent le dossier, suivent le chantier. Dans un village : le secrétaire de mairie et l'adjoint aux travaux.</Card>
        <Card title="Conseil municipal" badge="Autorise">Vote le budget et délègue au maire les décisions sur les marchés, dans les limites qu'il fixe.</Card>
        <Card title="Maire ou adjoint délégué" badge="Décide et signe">Attribue et signe les marchés sur délégation (art. L2122-22, 4° du CGCT).</Card>
        <Card title="Comptable public" badge="Paie">Règle vos factures après validation par la mairie, dans un délai de 30 jours.</Card>
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <Card title="Commission d'appel d'offres" tone="muted">Élus : choisit le titulaire des seuls marchés qui atteignent les seuils européens.</Card>
        <Card title="Intercommunalité" tone="muted">Achète à la place de la commune pour les compétences qui lui ont été transférées (voirie communautaire, eau, équipements…).</Card>
      </div>
    </Frame>
  )
}

const COMMUNE_MONTHS = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.']
const COMMUNE_ROWS: { label: string; months: number[]; color: string }[] = [
  { label: 'Préparation et vote du budget', months: [0, 1, 2, 3], color: 'bg-blue-600' },
  { label: 'Consultations pour les travaux d\'été', months: [3, 4, 5], color: 'bg-orange-500' },
  { label: 'Travaux dans les écoles', months: [6, 7], color: 'bg-emerald-500' },
  { label: 'Consultations d\'automne, accords-cadres', months: [8, 9, 10], color: 'bg-orange-500' },
  { label: 'Bon moment pour se faire connaître', months: [0, 1, 8], color: 'bg-gray-700' },
]

export function CommuneCalendar({ caption }: { caption?: string }) {
  return (
    <Frame title="Calendrier typique des achats de travaux d'une commune" kicker="Indicatif" caption={caption}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[38rem] border-separate border-spacing-x-0.5 border-spacing-y-1.5 text-xs">
          <thead>
            <tr>
              <th className="w-52 text-left font-semibold text-gray-500">Étape</th>
              {COMMUNE_MONTHS.map((m) => <th key={m} className="font-semibold text-gray-400">{m}</th>)}
            </tr>
          </thead>
          <tbody>
            {COMMUNE_ROWS.map((r) => (
              <tr key={r.label}>
                <th className="pr-2 text-left font-semibold leading-tight text-gray-800">{r.label}</th>
                {COMMUNE_MONTHS.map((m, i) => (
                  <td key={m} className={`h-6 rounded ${r.months.includes(i) ? r.color : 'bg-white ring-1 ring-gray-100'}`}>
                    {r.months.includes(i) && <span className="sr-only">{m}</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-gray-500">Budget voté au plus tard le 15 avril (30 avril l'année du renouvellement des conseils municipaux). Les subventions et les élections peuvent décaler ce rythme.</p>
    </Frame>
  )
}

// ─── Article « Électriciens » ─────────────────────────────────────────────────

const ELEC_INTERFACES = [
  { lot: 'Gros œuvre', when: 'Pendant le gros œuvre', text: 'Réservations, fourreaux et boîtiers noyés dans les dalles et les voiles.' },
  { lot: 'Cloisons, plâtrerie', when: 'Avant la fermeture des cloisons', text: 'Incorporations, puis rebouchages : qui les fait ?' },
  { lot: 'Chauffage, ventilation, plomberie', when: 'Second œuvre', text: 'Alimentation des centrales de traitement d\'air, de la chaufferie, de l\'eau chaude.' },
  { lot: 'Menuiseries, serrurerie', when: 'Second œuvre', text: 'Portes motorisées, contrôle d\'accès, ventouses, volets roulants.' },
  { lot: 'Sécurité incendie, courants faibles', when: 'Selon le périmètre du lot', text: 'Détection, alarme, réseau informatique, interphonie, vidéoprotection.' },
  { lot: 'VRD, réseaux extérieurs', when: 'Fin de chantier', text: 'Raccordement au réseau, tranchées, éclairage extérieur, bornes de recharge.' },
]

export function ElectricInterfaces({ caption }: { caption?: string }) {
  return (
    <Frame title="Les interfaces du lot électricité" kicker="Opération de bâtiment type" caption={caption}>
      <div className="mx-auto mb-3 max-w-md">
        <Card title="Lot électricité : courants forts et courants faibles" badge="Vous" tone="focus">
          Présent à presque toutes les phases du chantier, de la première dalle aux essais de réception.
        </Card>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {ELEC_INTERFACES.map((x) => (
          <li key={x.lot}><Card title={x.lot} badge={x.when}>{x.text}</Card></li>
        ))}
      </ul>
    </Frame>
  )
}

// ─── Article « Pénalités de retard » ──────────────────────────────────────────

const DELAY_ORIGINS: { origin: string; action: string; result: string; good: boolean }[] = [
  { origin: 'Votre entreprise', action: 'Effectif, approvisionnement, sous-traitant défaillant : rattrapez et prévenez le maître d\'œuvre.', result: 'Pénalités dues, dans la limite du seuil et du plafond', good: false },
  { origin: 'L\'acheteur ou le maître d\'œuvre', action: 'Ordre de service tardif, plans en retard, ajournement : demandez par écrit une prolongation, preuves à l\'appui.', result: 'Délai prolongé : pas de pénalité sur ces jours', good: true },
  { origin: 'Les intempéries', action: 'Au-delà du nombre de jours prévu au CCAP : relevés météo et demande de prolongation.', result: 'Délai prolongé', good: true },
  { origin: 'Une autre entreprise', action: 'Votre lot attend le sien : signalez-le au maître d\'œuvre dès le constat, faites-le inscrire au compte rendu.', result: 'Retard non imputable', good: true },
  { origin: 'Des travaux en plus', action: 'Commandés par ordre de service : exécutez, mais émettez des réserves écrites et demandez un délai.', result: 'Délai et prix à ajuster', good: true },
]

export function DelayOrigins({ caption }: { caption?: string }) {
  return (
    <Frame title="Éviter ou limiter les pénalités" kicker="Selon l'origine du retard" caption={caption}>
      <ul className="space-y-2">
        {DELAY_ORIGINS.map((d) => (
          <li key={d.origin} className="grid gap-2 rounded-xl border border-gray-200 bg-white p-3 sm:grid-cols-[11rem_1fr_13rem] sm:items-center">
            <p className="text-sm font-bold text-gray-900">{d.origin}</p>
            <p className="text-xs leading-5 text-gray-600">{d.action}</p>
            <p className={`rounded-lg px-2 py-1.5 text-xs font-semibold ${d.good ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
              {d.good ? '✓' : '✕'} {d.result}
            </p>
          </li>
        ))}
      </ul>
    </Frame>
  )
}
