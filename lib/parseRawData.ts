/**
 * BOAMP raw_data parser — handles both MAPA and EFORMS JSON formats.
 *
 * MAPA format:  donnees = { "MAPA": { organisme, initial, ... } }
 * EFORMS format: donnees = { "EFORMS": { "ContractNotice"|"ContractAwardNotice": { cac:*, cbc:*, ... } } }
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type BoampCriterion = {
  type: string       // "quality" | "price" | "cost"
  typeLabel: string  // "Qualité" | "Prix" | "Coût"
  description: string
  weight: string | null  // "50" (percentage)
}

export type BoampLot = {
  id: string
  titre: string
  description: string | null
  cpv: string | null
  cpvLabel: string | null
  lieuExecution: string | null
  renewalCount: string | null
  renewalDescription: string | null
  criteria: BoampCriterion[]
  framework: string | null
  dureeEnMois: string | null
}

export type BoampAcheteur = {
  nom: string
  formeJuridique: string | null
  activite: string | null
  siret: string | null
  contactNom: string | null
  adresse: string | null
  codePostal: string | null
  ville: string | null
  telephone: string | null
  email: string | null
  website: string | null
}

export type ParsedBoampData = {
  // Main procedure
  description: string | null
  procedureId: string | null
  procedureInterne: string | null
  baseJuridique: string | null
  acceleree: boolean | null
  // Value
  montantEstime: string | null
  devise: string | null
  // Dates
  dateOuvertureOffres: string | null
  duree: string | null
  validiteOffres: string | null
  // Acheteur principal
  acheteur: BoampAcheteur | null
  // Lots
  lots: BoampLot[]
  // MAPA format sections
  caracteristiques: string | null
  quantites: string | null
  lieuExecution: string | null
  justifications: string | null
  criteres: string | null
  referenceMarche: string | null
  infoComplementaire: string | null
  // Descripteurs
  allDescripteurs: string[]
}

// ─── Generic helpers ─────────────────────────────────────────────────────────

function safeParseJson(str: unknown): Record<string, unknown> | null {
  if (!str || typeof str !== 'string') return null
  try { return JSON.parse(str) } catch { return null }
}

/** Extract #text from UBL objects like { "@languageID": "FRA", "#text": "foo" } */
function txt(obj: unknown): string | null {
  if (typeof obj === 'string') return obj.trim() || null
  if (obj && typeof obj === 'object') {
    const t = (obj as Record<string, unknown>)['#text']
    if (typeof t === 'string') return t.trim() || null
  }
  return null
}

/** Navigate a nested object by path and return the string value */
function dig(obj: unknown, ...path: string[]): string | null {
  let cur: unknown = obj
  for (const key of path) {
    if (cur == null || typeof cur !== 'object') return null
    cur = (cur as Record<string, unknown>)[key]
  }
  return txt(cur) ?? (typeof cur === 'string' ? cur.trim() || null : null)
}

function asArray<T>(v: T | T[] | null | undefined): T[] {
  if (!v) return []
  return Array.isArray(v) ? v : [v]
}

// ─── EFORMS parser ────────────────────────────────────────────────────────────

const CRITERION_TYPE_LABELS: Record<string, string> = {
  quality: 'Qualité',
  price: 'Prix',
  cost: 'Coût',
}

function parseEFormsCriterion(c: Record<string, unknown>): BoampCriterion {
  const typeCode = dig(c, 'cbc:AwardingCriterionTypeCode') ?? 'quality'
  const desc = dig(c, 'cbc:Description') ?? '—'

  // Weight is buried in UBLExtensions > EformsExtension > AwardCriterionParameter > ParameterNumeric
  let weight: string | null = null
  try {
    const param = (
      (c['ext:UBLExtensions'] as Record<string, unknown>)?.['ext:UBLExtension'] as Record<string, unknown>
    )?.['ext:ExtensionContent']
    const efext = (param as Record<string, unknown>)?.['efext:EformsExtension']
    const paramObj = (efext as Record<string, unknown>)?.['efac:AwardCriterionParameter'] as Record<string, unknown>
    const numeric = paramObj?.['efbc:ParameterNumeric']
    if (typeof numeric === 'string' || typeof numeric === 'number') weight = String(numeric)
  } catch { /* ignore */ }

  return {
    type: typeCode,
    typeLabel: CRITERION_TYPE_LABELS[typeCode] ?? typeCode,
    description: desc,
    weight,
  }
}

function parseEFormsLot(lot: Record<string, unknown>): BoampLot {
  const id = dig(lot, 'cbc:ID') ?? ''
  const proj = (lot['cac:ProcurementProject'] ?? {}) as Record<string, unknown>

  const titre = dig(proj, 'cbc:Name') ?? id
  const description = dig(proj, 'cbc:Description')
  const cpv = dig(proj, 'cac:MainCommodityClassification', 'cbc:ItemClassificationCode')
  const cpvLabel: string | null = null

  // Renewal
  const ext = (proj['cac:ContractExtension'] ?? {}) as Record<string, unknown>
  const renewalCount = txt(ext['cbc:MaximumNumberNumeric']) ?? null
  const renewalDescription = dig(ext, 'cac:Renewal', 'cac:Period', 'cbc:Description')

  // Duration
  let dureeEnMois: string | null = null
  const period = dig(lot, 'cac:ProcurementProject', 'cac:ContractExtension', 'cac:Renewal', 'cac:Period', 'cbc:DurationMeasure')
  if (period) dureeEnMois = period

  // Framework agreement
  const terms = (lot['cac:TenderingTerms'] ?? {}) as Record<string, unknown>
  const frameworkObj = (terms['cac:FrameworkAgreement'] ?? {}) as Record<string, unknown>
  const framework = dig(frameworkObj, 'cbc:Justification') ?? dig(frameworkObj, 'cbc:Description') ?? null

  // Criteria
  const awardingTerms = ((terms['cac:AwardingTerms'] ?? {}) as Record<string, unknown>)['cac:AwardingCriterion']
  const criteriaParent = (awardingTerms ?? {}) as Record<string, unknown>
  const subCriteria = asArray(criteriaParent['cac:SubordinateAwardingCriterion'] as Record<string, unknown>[])
  const criteria = subCriteria.map(parseEFormsCriterion)

  return { id, titre, description, cpv, cpvLabel, lieuExecution: null, renewalCount, renewalDescription, criteria, framework, dureeEnMois }
}

function parseEFormsOrganizations(root: Record<string, unknown>): BoampAcheteur | null {
  try {
    const ublex = (root['ext:UBLExtensions'] as Record<string, unknown>)?.['ext:UBLExtension']
    const content = (ublex as Record<string, unknown>)?.['ext:ExtensionContent']
    const efext = (content as Record<string, unknown>)?.['efext:EformsExtension']
    const orgContainer = (efext as Record<string, unknown>)?.['efac:Organizations']
    const orgsRaw = (orgContainer as Record<string, unknown>)?.['efac:Organization']
    const orgs = asArray(orgsRaw as Record<string, unknown>[])

    // The main buyer is NOT the TED eSender (usually first org = eSender, second = buyer)
    // We identify by email domain or just take the one with a non-publication email
    const buyers = orgs.filter((o) => {
      const company = (o['efac:Company'] ?? {}) as Record<string, unknown>
      const contact = (company['cac:Contact'] ?? {}) as Record<string, unknown>
      const email = txt(contact['cbc:ElectronicMail']) ?? ''
      return !email.includes('publications-joue') && !email.includes('ted-')
    })

    const org = buyers[0] ?? orgs[1] ?? orgs[0]
    if (!org) return null

    const company = (org['efac:Company'] ?? {}) as Record<string, unknown>
    const nom = dig(company, 'cac:PartyName', 'cbc:Name') ?? ''
    const addr = (company['cac:PostalAddress'] ?? {}) as Record<string, unknown>
    const contact = (company['cac:Contact'] ?? {}) as Record<string, unknown>

    return {
      nom,
      formeJuridique: null,
      activite: null,
      siret: null,
      contactNom: txt(contact['cbc:Name']),
      adresse: txt(addr['cbc:StreetName']),
      codePostal: txt(addr['cbc:PostalZone']),
      ville: txt(addr['cbc:CityName']),
      telephone: txt(contact['cbc:Telephone']),
      email: txt(contact['cbc:ElectronicMail']),
      website: txt((company as Record<string, unknown>)['cbc:WebsiteURI']) ?? null,
    }
  } catch {
    return null
  }
}

function extractFromEForms(eforms: Record<string, unknown>): Partial<ParsedBoampData> {
  const rootKey = Object.keys(eforms)[0]
  const root = (eforms[rootKey] ?? {}) as Record<string, unknown>

  const result: Partial<ParsedBoampData> = {}

  // Description from ProcurementProject
  const proj = (root['cac:ProcurementProject'] ?? {}) as Record<string, unknown>
  result.description = dig(proj, 'cbc:Description')

  // Estimated value
  const val = dig(proj, 'cac:RequestedTenderTotal', 'cbc:EstimatedOverallContractAmount')
  if (val) {
    result.montantEstime = val
    const currency = dig(proj, 'cac:RequestedTenderTotal', 'cbc:EstimatedOverallContractAmount', '@currencyID')
    result.devise = currency ?? 'EUR'
  }

  // Procedure ID (BT-22)
  const process = (root['cac:TenderingProcess'] ?? {}) as Record<string, unknown>
  result.procedureId = dig(root, 'cbc:ContractFolderID')
  result.procedureInterne = dig(proj, 'cbc:ID')
  result.baseJuridique = dig(root, 'cbc:RegulatoryDomain')
  const accel = dig(process, 'cac:ProcessJustification', 'cbc:ProcessReasonCode')
  result.acceleree = accel ? accel !== 'no' : false

  // Organizations (acheteur)
  result.acheteur = parseEFormsOrganizations(root)

  // Lots
  const lotsRaw = root['cac:ProcurementProjectLot']
  const lots = asArray(lotsRaw as Record<string, unknown>[])
  result.lots = lots.map(parseEFormsLot)

  return result
}

// ─── MAPA / FNSimple / Old format parser ──────────────────────────────────────

/** Extract CPV from MAPA codeCPV object: {objetPrincipal: {classPrincipale: "45262700"}} */
function extractMapaCpv(cpvObj: unknown): string | null {
  if (!cpvObj || typeof cpvObj !== 'object') return null
  const o = cpvObj as Record<string, unknown>
  const principal = o.objetPrincipal as Record<string, unknown> | undefined
  if (principal) {
    if (principal.classPrincipale) return String(principal.classPrincipale)
    // Some formats use the code as key: {objetPrincipal: {"45262700": ""}}
    const keys = Object.keys(principal).filter((k) => /^\d{5,8}/.test(k))
    if (keys[0]) return keys[0]
  }
  return null
}

function parseMapa_Lot(l: Record<string, unknown>, i: number): BoampLot {
  const rawDesc = (l.description as string) ?? `Lot ${i + 1}`
  // Description often starts with "N : title. description text"
  const dotIdx = rawDesc.indexOf('.')
  const titre = dotIdx > 0 && dotIdx < 60 ? rawDesc.slice(0, dotIdx).trim() : rawDesc.slice(0, 80).trim()
  const description = rawDesc || null

  const cpv = extractMapaCpv(l.codeCPV)
  const lieuExecution = (l.lieuExecutionLivraison as string) ?? (l.lieuExecution as string) ?? null

  return {
    id: `LOT-${String(i + 1).padStart(4, '0')}`,
    titre,
    description,
    cpv,
    cpvLabel: null,
    lieuExecution,
    renewalCount: null,
    renewalDescription: null,
    criteria: [],
    framework: null,
    dureeEnMois: null,
  }
}

function extractOrganisme(organisme: Record<string, unknown>): BoampAcheteur {
  // nom: FNS uses `nomOfficiel`, MAPA uses `acheteurPublic`
  const nom = (organisme.nomOfficiel as string)
    ?? (organisme.denomination as string)
    ?? (organisme.nomOfficial as string)
    ?? (organisme.acheteurPublic as string)
    ?? ''

  const adr = organisme.adr as Record<string, unknown> | undefined
  const coord = organisme.coord as Record<string, unknown> | undefined

  // Address: may be plain string, or nested {voie: {nomvoie: "..."}, ...}
  const voieObj = adr?.voie as Record<string, unknown> | undefined
  const adresse = adr
    ? ((adr.adresse as string) ?? (voieObj ? String(Object.values(voieObj)[0] ?? '').trim() || null : null))
    : null

  // contactNom: FNS uses `correspondant`, MAPA uses `correspondantPRM.{pren, nom}`
  const prm = organisme.correspondantPRM as Record<string, unknown> | undefined
  const contactNomPRM = prm
    ? [prm.pren, prm.nom].filter(Boolean).join(' ').trim() || null
    : null

  return {
    nom,
    formeJuridique: null,
    activite: null,
    siret: (organisme.codeIdentificationNational as string) ?? null,
    contactNom: (organisme.correspondant as string) ?? contactNomPRM ?? null,
    adresse,
    codePostal: (adr?.cp as string) ?? (organisme.cp as string) ?? null,
    ville: (adr?.ville as string) ?? (organisme.ville as string) ?? null,
    telephone: (coord?.tel as string) ?? null,
    email: (coord?.mel as string) ?? null,
    website: (coord?.url as string) ?? (organisme.urlProfilAcheteur as string) ?? null,
  }
}

/** MAPA format: initial keys are description, caracteristiques, duree, justifications, criteres, etc. */
function extractFromMapa_Classic(initial: Record<string, unknown>): Partial<ParsedBoampData> {
  const result: Partial<ParsedBoampData> = {}

  // Description (objet du marché)
  const descObj = (initial.description ?? {}) as Record<string, unknown>
  result.description = (descObj.objet as string) ?? null

  // Caractéristiques et quantités
  const carac = (initial.caracteristiques ?? {}) as Record<string, unknown>
  result.caracteristiques = (carac.principales as string) ?? null
  result.quantites = (carac.quantites as string) ?? null

  // Durée
  const dureeObj = (initial.duree ?? {}) as Record<string, unknown>
  if (dureeObj.nbMois) result.duree = `${dureeObj.nbMois} mois`

  // Justifications / conditions de participation
  const justObj = (initial.justifications ?? {}) as Record<string, unknown>
  const justComment = (justObj.justificationComment as string) ?? null
  if (justComment && justComment !== 'Renvoi au règlement de la consultation') {
    result.justifications = justComment
  }

  // Critères d'attribution
  const criteresObj = (initial.criteres ?? {}) as Record<string, unknown>
  const critKeys = Object.keys(criteresObj)
  if (critKeys.length > 0) {
    // `criterePondere` is an array of {critere, criterePCT}
    if (criteresObj.criterePondere) {
      const ponderes = Array.isArray(criteresObj.criterePondere)
        ? (criteresObj.criterePondere as Record<string, unknown>[])
        : [criteresObj.criterePondere as Record<string, unknown>]
      result.criteres = ponderes
        .map((c) => `${c.critere as string}: ${c.criterePCT as string}%`)
        .join('\n')
    } else {
      const val = criteresObj[critKeys[0]]
      result.criteres = typeof val === 'string' && val.trim()
        ? val
        : critKeys[0].replace('critere', '').replace(/([A-Z])/g, ' $1').trim() || null
    }
  }

  // Délais
  const delais = (initial.delais ?? {}) as Record<string, unknown>
  if (delais.receptionOffres) result.dateOuvertureOffres = delais.receptionOffres as string
  const validite = (delais.validite ?? {}) as Record<string, unknown>
  if (validite.nbMois) result.validiteOffres = `${validite.nbMois} mois`

  // Renseignements complémentaires
  const rens = (initial.renseignements ?? {}) as Record<string, unknown>
  result.referenceMarche = (rens.idMarche as string) ?? null
  result.infoComplementaire = (rens.rensgComplt as string) ?? null

  // Lieu d'exécution — may be a string or a nested address object {voie, cp, ville}
  const lieuRaw = descObj.lieuExecution
  if (typeof lieuRaw === 'string') {
    result.lieuExecution = lieuRaw || null
  } else if (lieuRaw && typeof lieuRaw === 'object') {
    const l = lieuRaw as Record<string, unknown>
    const voie = l.voie as Record<string, unknown> | string | undefined
    const voieStr = typeof voie === 'string' ? voie : (voie ? String(Object.values(voie)[0] ?? '') : '')
    result.lieuExecution = [voieStr, l.cp, l.ville].filter(Boolean).join(', ') || null
  }

  // Nature marché type (the key is the type)
  // already handled in normalizeBoampRecord via type_marche field

  // Procedure
  const proc = (initial.procedure ?? {}) as Record<string, unknown>
  const procKeys = Object.keys(proc)
  if (procKeys.length > 0 && !result.criteres) {
    result.criteres = (proc.criteresAttrib as string) ?? null
  }

  // Contact from adressesComplt
  const addrCompl = (initial.adressesComplt ?? {}) as Record<string, unknown>
  const admOuTech = (addrCompl.admOuTech ?? {}) as Record<string, unknown>
  const adm = (admOuTech.adm ?? {}) as Record<string, unknown>
  if (adm.PersonneMorale || adm.coord) {
    const coordAdm = (adm.coord ?? {}) as Record<string, unknown>
    if (!result.infoComplementaire) result.infoComplementaire = ''
    const contactLine = [adm.PersonneMorale, coordAdm.tel, coordAdm.mel]
      .filter(Boolean).join(' — ')
    if (contactLine) {
      result.infoComplementaire = (result.infoComplementaire
        ? result.infoComplementaire + '\n\nContact supplémentaire :\n'
        : 'Contact supplémentaire :\n') + contactLine
    }
  }

  // infosSup
  const infosSup = (initial.infosSup as string) ?? null
  if (infosSup && !result.infoComplementaire) result.infoComplementaire = infosSup

  // Lots
  const lotsContainer = (initial.lots ?? {}) as Record<string, unknown>
  const lotRaw = lotsContainer.lot
  if (lotRaw) {
    const lotsArr = Array.isArray(lotRaw) ? lotRaw : [lotRaw]
    result.lots = (lotsArr as Record<string, unknown>[]).map(parseMapa_Lot)
  }

  return result
}

/** FNSimple format: initial keys are communication, procedure, natureMarche, lots, informComplementaire */
function extractFromFNSimple(initial: Record<string, unknown>): {
  result: Partial<ParsedBoampData>
  commContactInfo: { tel: string | null; email: string | null; nom: string | null; website: string | null }
} {
  const result: Partial<ParsedBoampData> = {}

  // Communication
  const comm = (initial.communication ?? {}) as Record<string, unknown>
  result.procedureInterne = (comm.identifiantInterne as string) ?? null

  // Procedure
  const procedure = (initial.procedure ?? {}) as Record<string, unknown>
  const criteresRaw = (procedure.criteresAttrib as string) ?? null
  if (criteresRaw) result.criteres = criteresRaw

  if (procedure.dateReceptionOffres) {
    result.dateOuvertureOffres = procedure.dateReceptionOffres as string
  }

  // natureMarche
  const nm = (initial.natureMarche ?? {}) as Record<string, unknown>
  result.description = (nm.description as string) ?? (nm.intitule as string) ?? null
  result.lieuExecution = (nm.lieuExecution as string) ?? null
  const dureeMois = nm.dureeMois as string | number | undefined
  if (dureeMois) result.duree = `${dureeMois} mois`

  const ve = nm.valeurEstimee as Record<string, unknown> | undefined
  if (ve) {
    const fourchette = ve.fourchette as Record<string, unknown> | undefined
    result.montantEstime = (ve.valeur as string)
      ?? (fourchette?.valeurHaute as string)
      ?? (fourchette?.valeurBasse as string)
      ?? null
    result.devise = (ve['@devise'] as string) ?? 'EUR'
  }

  // Lots
  const lotsContainer = (initial.lots ?? {}) as Record<string, unknown>
  const lotRaw = lotsContainer.lot
  if (lotRaw) {
    const lotsArr = Array.isArray(lotRaw) ? lotRaw : [lotRaw]
    result.lots = (lotsArr as Record<string, unknown>[]).map(parseMapa_Lot)
  }

  // Info complémentaire (visite)
  const infoComp = (initial.informComplementaire ?? {}) as Record<string, unknown>
  const infoOui = (infoComp.oui ?? {}) as Record<string, unknown>
  const visiteDetail = infoOui.visiteDetail as string | undefined
  if (visiteDetail) result.infoComplementaire = `Visite obligatoire :\n${visiteDetail}`

  // Store contact info to apply to acheteur later
  // Note: field is adresseMailContact in FNS, emailContact is a fallback for other variants
  const commContactInfo = {
    tel: (comm.telContact as string) ?? null,
    email: (comm.adresseMailContact as string) ?? (comm.emailContact as string) ?? null,
    nom: (comm.nomContact as string) ?? null,
    website: (comm.urlProfilAch as string) ?? null,
  }

  return { result, commContactInfo }
}

function extractFromMapa(inner: Record<string, unknown>): Partial<ParsedBoampData> {
  const result: Partial<ParsedBoampData> = {}

  // ── Organisme ──
  const organisme = (inner.organisme ?? {}) as Record<string, unknown>
  result.acheteur = extractOrganisme(organisme)

  const initial = (inner.initial ?? {}) as Record<string, unknown>

  // Detect format: MAPA classic has `description` as a direct key with {objet:...}
  // FNSimple has `communication` and `natureMarche` with richer content
  const isMapaClassic = 'description' in initial && typeof initial.description === 'object'
    && initial.description !== null && 'objet' in (initial.description as object)

  if (isMapaClassic) {
    Object.assign(result, extractFromMapa_Classic(initial))
  } else {
    const { result: fnResult, commContactInfo } = extractFromFNSimple(initial)
    Object.assign(result, fnResult)
    if (commContactInfo && result.acheteur) {
      if (commContactInfo.tel && !result.acheteur.telephone) result.acheteur.telephone = commContactInfo.tel
      if (commContactInfo.email && !result.acheteur.email) result.acheteur.email = commContactInfo.email
      if (commContactInfo.nom && !result.acheteur.contactNom) result.acheteur.contactNom = commContactInfo.nom
      if (commContactInfo.website && !result.acheteur.website) result.acheteur.website = commContactInfo.website
    }
  }

  return result
}

// ─── Main entry ───────────────────────────────────────────────────────────────

export function parseRawData(raw: Record<string, unknown> | null): ParsedBoampData {
  const empty: ParsedBoampData = {
    description: null,
    procedureId: null,
    procedureInterne: null,
    baseJuridique: null,
    acceleree: null,
    montantEstime: null,
    devise: null,
    dateOuvertureOffres: null,
    duree: null,
    validiteOffres: null,
    acheteur: null,
    lots: [],
    caracteristiques: null,
    quantites: null,
    lieuExecution: null,
    justifications: null,
    criteres: null,
    referenceMarche: null,
    infoComplementaire: null,
    allDescripteurs: [],
  }

  if (!raw) return empty

  // descripteur_libelle array (always present at top level)
  const descripteurs = raw.descripteur_libelle
  if (Array.isArray(descripteurs)) {
    empty.allDescripteurs = descripteurs.filter(Boolean).map(String)
  }

  // Parse gestion JSON string (indexation / extra dates)
  const gestion = safeParseJson(raw.gestion as string)
  if (gestion) {
    const indexation = (gestion.INDEXATION ?? gestion.indexation) as Record<string, unknown> | undefined
    const dateOuv = dig(indexation ?? null, 'DATE_OUVERTURE_OFFRES')
    if (dateOuv) empty.dateOuvertureOffres = dateOuv
  }

  // Parse donnees JSON string — the main richness
  const donnees = safeParseJson(raw.donnees as string)
  if (donnees) {
    if ('EFORMS' in donnees) {
      const extracted = extractFromEForms(donnees['EFORMS'] as Record<string, unknown>)
      Object.assign(empty, extracted)
    } else {
      // MAPA / old format: donnees keys are procedure names (MAPA, AO, JOUE_AO, etc.)
      const innerKey = Object.keys(donnees)[0]
      const inner = donnees[innerKey] as Record<string, unknown> | null
      if (inner) {
        const extracted = extractFromMapa(inner)
        Object.assign(empty, extracted)
      }
    }
  }

  // Fallback acheteur name from raw nomacheteur top-level field
  if (!empty.acheteur && raw.nomacheteur) {
    empty.acheteur = {
      nom: raw.nomacheteur as string,
      formeJuridique: null,
      activite: null,
      siret: null,
      contactNom: null,
      adresse: null,
      codePostal: null,
      ville: null,
      telephone: null,
      email: null,
      website: null,
    }
  }

  return empty
}
