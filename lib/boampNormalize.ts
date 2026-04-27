// Mapping des codes département INSEE vers région (slug + label)
const DEPT_TO_REGION: Record<string, { region: string; region_label: string }> = {
  '01': { region: 'auvergne-rhone-alpes', region_label: 'Auvergne-Rhône-Alpes' },
  '03': { region: 'auvergne-rhone-alpes', region_label: 'Auvergne-Rhône-Alpes' },
  '07': { region: 'auvergne-rhone-alpes', region_label: 'Auvergne-Rhône-Alpes' },
  '15': { region: 'auvergne-rhone-alpes', region_label: 'Auvergne-Rhône-Alpes' },
  '26': { region: 'auvergne-rhone-alpes', region_label: 'Auvergne-Rhône-Alpes' },
  '38': { region: 'auvergne-rhone-alpes', region_label: 'Auvergne-Rhône-Alpes' },
  '42': { region: 'auvergne-rhone-alpes', region_label: 'Auvergne-Rhône-Alpes' },
  '43': { region: 'auvergne-rhone-alpes', region_label: 'Auvergne-Rhône-Alpes' },
  '63': { region: 'auvergne-rhone-alpes', region_label: 'Auvergne-Rhône-Alpes' },
  '69': { region: 'auvergne-rhone-alpes', region_label: 'Auvergne-Rhône-Alpes' },
  '73': { region: 'auvergne-rhone-alpes', region_label: 'Auvergne-Rhône-Alpes' },
  '74': { region: 'auvergne-rhone-alpes', region_label: 'Auvergne-Rhône-Alpes' },
  '21': { region: 'bourgogne-franche-comte', region_label: 'Bourgogne-Franche-Comté' },
  '25': { region: 'bourgogne-franche-comte', region_label: 'Bourgogne-Franche-Comté' },
  '39': { region: 'bourgogne-franche-comte', region_label: 'Bourgogne-Franche-Comté' },
  '58': { region: 'bourgogne-franche-comte', region_label: 'Bourgogne-Franche-Comté' },
  '70': { region: 'bourgogne-franche-comte', region_label: 'Bourgogne-Franche-Comté' },
  '71': { region: 'bourgogne-franche-comte', region_label: 'Bourgogne-Franche-Comté' },
  '89': { region: 'bourgogne-franche-comte', region_label: 'Bourgogne-Franche-Comté' },
  '90': { region: 'bourgogne-franche-comte', region_label: 'Bourgogne-Franche-Comté' },
  '22': { region: 'bretagne', region_label: 'Bretagne' },
  '29': { region: 'bretagne', region_label: 'Bretagne' },
  '35': { region: 'bretagne', region_label: 'Bretagne' },
  '56': { region: 'bretagne', region_label: 'Bretagne' },
  '18': { region: 'centre-val-de-loire', region_label: 'Centre-Val de Loire' },
  '28': { region: 'centre-val-de-loire', region_label: 'Centre-Val de Loire' },
  '36': { region: 'centre-val-de-loire', region_label: 'Centre-Val de Loire' },
  '37': { region: 'centre-val-de-loire', region_label: 'Centre-Val de Loire' },
  '41': { region: 'centre-val-de-loire', region_label: 'Centre-Val de Loire' },
  '45': { region: 'centre-val-de-loire', region_label: 'Centre-Val de Loire' },
  '2A': { region: 'corse', region_label: 'Corse' },
  '2B': { region: 'corse', region_label: 'Corse' },
  '08': { region: 'grand-est', region_label: 'Grand Est' },
  '10': { region: 'grand-est', region_label: 'Grand Est' },
  '51': { region: 'grand-est', region_label: 'Grand Est' },
  '52': { region: 'grand-est', region_label: 'Grand Est' },
  '54': { region: 'grand-est', region_label: 'Grand Est' },
  '55': { region: 'grand-est', region_label: 'Grand Est' },
  '57': { region: 'grand-est', region_label: 'Grand Est' },
  '67': { region: 'grand-est', region_label: 'Grand Est' },
  '68': { region: 'grand-est', region_label: 'Grand Est' },
  '88': { region: 'grand-est', region_label: 'Grand Est' },
  '971': { region: 'guadeloupe', region_label: 'Guadeloupe' },
  '972': { region: 'martinique', region_label: 'Martinique' },
  '973': { region: 'guyane', region_label: 'Guyane' },
  '974': { region: 'la-reunion', region_label: 'La Réunion' },
  '976': { region: 'mayotte', region_label: 'Mayotte' },
  '59': { region: 'hauts-de-france', region_label: 'Hauts-de-France' },
  '60': { region: 'hauts-de-france', region_label: 'Hauts-de-France' },
  '62': { region: 'hauts-de-france', region_label: 'Hauts-de-France' },
  '02': { region: 'hauts-de-france', region_label: 'Hauts-de-France' },
  '80': { region: 'hauts-de-france', region_label: 'Hauts-de-France' },
  '75': { region: 'ile-de-france', region_label: 'Île-de-France' },
  '77': { region: 'ile-de-france', region_label: 'Île-de-France' },
  '78': { region: 'ile-de-france', region_label: 'Île-de-France' },
  '91': { region: 'ile-de-france', region_label: 'Île-de-France' },
  '92': { region: 'ile-de-france', region_label: 'Île-de-France' },
  '93': { region: 'ile-de-france', region_label: 'Île-de-France' },
  '94': { region: 'ile-de-france', region_label: 'Île-de-France' },
  '95': { region: 'ile-de-france', region_label: 'Île-de-France' },
  '14': { region: 'normandie', region_label: 'Normandie' },
  '27': { region: 'normandie', region_label: 'Normandie' },
  '50': { region: 'normandie', region_label: 'Normandie' },
  '61': { region: 'normandie', region_label: 'Normandie' },
  '76': { region: 'normandie', region_label: 'Normandie' },
  '16': { region: 'nouvelle-aquitaine', region_label: 'Nouvelle-Aquitaine' },
  '17': { region: 'nouvelle-aquitaine', region_label: 'Nouvelle-Aquitaine' },
  '19': { region: 'nouvelle-aquitaine', region_label: 'Nouvelle-Aquitaine' },
  '23': { region: 'nouvelle-aquitaine', region_label: 'Nouvelle-Aquitaine' },
  '24': { region: 'nouvelle-aquitaine', region_label: 'Nouvelle-Aquitaine' },
  '33': { region: 'nouvelle-aquitaine', region_label: 'Nouvelle-Aquitaine' },
  '40': { region: 'nouvelle-aquitaine', region_label: 'Nouvelle-Aquitaine' },
  '47': { region: 'nouvelle-aquitaine', region_label: 'Nouvelle-Aquitaine' },
  '64': { region: 'nouvelle-aquitaine', region_label: 'Nouvelle-Aquitaine' },
  '79': { region: 'nouvelle-aquitaine', region_label: 'Nouvelle-Aquitaine' },
  '86': { region: 'nouvelle-aquitaine', region_label: 'Nouvelle-Aquitaine' },
  '87': { region: 'nouvelle-aquitaine', region_label: 'Nouvelle-Aquitaine' },
  '09': { region: 'occitanie', region_label: 'Occitanie' },
  '11': { region: 'occitanie', region_label: 'Occitanie' },
  '12': { region: 'occitanie', region_label: 'Occitanie' },
  '30': { region: 'occitanie', region_label: 'Occitanie' },
  '31': { region: 'occitanie', region_label: 'Occitanie' },
  '32': { region: 'occitanie', region_label: 'Occitanie' },
  '34': { region: 'occitanie', region_label: 'Occitanie' },
  '46': { region: 'occitanie', region_label: 'Occitanie' },
  '48': { region: 'occitanie', region_label: 'Occitanie' },
  '65': { region: 'occitanie', region_label: 'Occitanie' },
  '66': { region: 'occitanie', region_label: 'Occitanie' },
  '81': { region: 'occitanie', region_label: 'Occitanie' },
  '82': { region: 'occitanie', region_label: 'Occitanie' },
  '44': { region: 'pays-de-la-loire', region_label: 'Pays de la Loire' },
  '49': { region: 'pays-de-la-loire', region_label: 'Pays de la Loire' },
  '53': { region: 'pays-de-la-loire', region_label: 'Pays de la Loire' },
  '72': { region: 'pays-de-la-loire', region_label: 'Pays de la Loire' },
  '85': { region: 'pays-de-la-loire', region_label: 'Pays de la Loire' },
  '04': { region: 'provence-alpes-cote-d-azur', region_label: "Provence-Alpes-Côte d'Azur" },
  '05': { region: 'provence-alpes-cote-d-azur', region_label: "Provence-Alpes-Côte d'Azur" },
  '06': { region: 'provence-alpes-cote-d-azur', region_label: "Provence-Alpes-Côte d'Azur" },
  '13': { region: 'provence-alpes-cote-d-azur', region_label: "Provence-Alpes-Côte d'Azur" },
  '83': { region: 'provence-alpes-cote-d-azur', region_label: "Provence-Alpes-Côte d'Azur" },
  '84': { region: 'provence-alpes-cote-d-azur', region_label: "Provence-Alpes-Côte d'Azur" },
}

export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizeCategorie(
  descripteur_libelle: string[] | null,
  famille_libelle: string | null,
): { categorie: string; categorie_label: string } {
  const raw = (descripteur_libelle?.[0] || famille_libelle || '').trim()
  if (!raw) return { categorie: 'autre', categorie_label: 'Autre' }
  const label = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
  return { categorie: toSlug(raw), categorie_label: label }
}

function normalizeTypeMarche(type_marche: string[] | null): AppelOffre['type_marche'] {
  const raw = (type_marche?.[0] ?? '').toUpperCase()
  if (raw.includes('TRAVAUX')) return 'travaux'
  if (raw.includes('FOURNITURE')) return 'fournitures'
  if (raw.includes('SERVICE')) return 'services'
  return null
}

function normalizeProcedure(
  type_procedure: string | null,
  famille: string | null,
): AppelOffre['procedure'] {
  const p = (type_procedure ?? famille ?? '').toUpperCase()
  if (p.includes('OUVERT') || p.includes('OPEN')) return 'ouvert'
  if (p.includes('RESTREINT') || p.includes('RESTRICTED')) return 'restreint'
  if (p.includes('NEGOCI') || p.includes('NÉGOCI')) return 'negociee'
  if (p.includes('ADAPTE') || p.includes('MAPA')) return 'mapa'
  return null
}

function extractFromDonnees(donnees: string | null | undefined): { montant: number | null; cpv: string | null } {
  if (!donnees) return { montant: null, cpv: null }
  try {
    const d = JSON.parse(donnees)
    // eForms format
    if (d?.EFORMS) {
      const rootKey = Object.keys(d.EFORMS)[0]
      const root = d.EFORMS[rootKey]
      const proj = root?.['cac:ProcurementProject']
      const totalRaw = proj?.['cac:RequestedTenderTotal']?.['cbc:EstimatedOverallContractAmount']
      const val = typeof totalRaw === 'object' ? totalRaw?.['#text'] : totalRaw
      const cpvRaw = proj?.['cac:MainCommodityClassification']?.['cbc:ItemClassificationCode']
      const cpv = typeof cpvRaw === 'object' ? cpvRaw?.['#text'] : cpvRaw
      return {
        montant: val ? parseFloat(String(val)) || null : null,
        cpv: cpv ? String(cpv) : null,
      }
    }
    // MAPA / FNSimple format
    const innerKey = Object.keys(d)[0]
    const inner = d[innerKey]
    const nm = inner?.initial?.natureMarche
    const ve = nm?.valeurEstimee
    // valeur is either direct (ve.valeur) or in fourchette (ve.fourchette.valeurHaute)
    const montantRaw = ve?.valeur ?? ve?.fourchette?.valeurHaute ?? ve?.fourchette?.valeurBasse
    const montant = montantRaw ? parseFloat(String(montantRaw)) || null : null
    // CPV from classPrincipale
    const cpvObj = nm?.codeCPV?.objetPrincipal
    let cpv: string | null = null
    if (cpvObj) {
      cpv = (cpvObj.classPrincipale as string)
        ?? (Object.keys(cpvObj).find((k) => /^\d{5,8}/.test(k)) ?? null)
    }
    return { montant, cpv }
  } catch { /* ignore */ }
  return { montant: null, cpv: null }
}

export function normalizeBoampRecord(record: BoampRecord): Omit<AppelOffre, 'id' | 'created_at'> {
  // Use first department code for region mapping
  const dept = (record.code_departement?.[0] ?? '').trim()
  const regionInfo = DEPT_TO_REGION[dept] ?? null

  const { categorie, categorie_label } = normalizeCategorie(
    record.descripteur_libelle,
    record.famille_libelle,
  )

  const titre = (record.objet ?? '').trim().slice(0, 200) || 'Sans titre'
  const { montant: montant_estime, cpv: cpv_from_donnees } = extractFromDonnees(record.donnees)

  return {
    reference: record.idweb,
    titre,
    slug: toSlug(titre.slice(0, 80)),
    objet: record.objet || null,
    acheteur: record.nomacheteur || null,
    acheteur_siret: null,
    categorie,
    categorie_label,
    cpv_code: cpv_from_donnees ?? record.descripteur_code?.[0] ?? null,
    region: regionInfo?.region ?? null,
    region_label: regionInfo?.region_label ?? null,
    departement: dept || null,
    type_marche: normalizeTypeMarche(record.type_marche),
    procedure: normalizeProcedure(record.type_procedure, record.famille),
    montant_estime,
    date_publication: record.dateparution ? new Date(record.dateparution).toISOString() : null,
    date_limite: record.datelimitereponse ? new Date(record.datelimitereponse).toISOString() : null,
    url_document: record.url_avis || null,
    raw_data: record as unknown as Record<string, unknown>,
  }
}
