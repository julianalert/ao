// Schémas intégrés aux articles : en HTML (texte indexable, responsive), pas en image.

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
