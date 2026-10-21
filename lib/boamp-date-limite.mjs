// Date limite d'un avis de marché BOAMP quand le champ `datelimitereponse` est vide.
// Partagé par l'import quotidien (lib/boampNormalize.ts) et le rattrapage
// (scripts/backfill-date-limite.mjs).
//
// Cas typique : procédures restreintes et négociées au format eForms. Le BOAMP ne remplit
// pas datelimitereponse, mais l'avis contient la date de remise des candidatures
// (ParticipationRequestReceptionPeriod) ou, à défaut, celle des offres
// (TenderSubmissionDeadlinePeriod). On retient la plus proche des deux, lot par lot.

const PERIODES = ['cac:ParticipationRequestReceptionPeriod', 'cac:TenderSubmissionDeadlinePeriod']

function texte(v) {
  return v && typeof v === 'object' ? v['#text'] : v
}

/** Toutes les valeurs de la clé `cle`, à n'importe quelle profondeur. */
function collecter(noeud, cle, out) {
  if (Array.isArray(noeud)) {
    for (const n of noeud) collecter(n, cle, out)
  } else if (noeud && typeof noeud === 'object') {
    for (const [k, v] of Object.entries(noeud)) {
      if (k === cle) out.push(...(Array.isArray(v) ? v : [v]))
      else collecter(v, cle, out)
    }
  }
  return out
}

/** { cbc:EndDate: "2026-11-23+01:00", cbc:EndTime: "12:00:00+01:00" } → ISO UTC */
function versIso(periode) {
  const date = texte(periode?.['cbc:EndDate'])
  const d = typeof date === 'string' ? date.match(/^(\d{4}-\d{2}-\d{2})(Z|[+-]\d{2}:\d{2})?$/) : null
  if (!d) return null
  const heure = texte(periode['cbc:EndTime'])
  const h = typeof heure === 'string' ? heure.match(/^(\d{2}:\d{2}(?::\d{2})?)(Z|[+-]\d{2}:\d{2})?$/) : null
  // Sans heure, l'avis reste ouvert jusqu'au soir ; sans fuseau, heure de Paris (hiver)
  const iso = `${d[1]}T${h ? h[1] : '23:59:59'}${h?.[2] ?? d[2] ?? '+01:00'}`
  const t = new Date(iso)
  return isNaN(t.getTime()) ? null : t.toISOString()
}

/** Date limite (ISO) tirée du champ `donnees` d'un avis eForms, ou null. */
export function dateLimiteDepuisDonnees(donnees) {
  if (!donnees) return null
  let d
  try {
    d = typeof donnees === 'string' ? JSON.parse(donnees) : donnees
  } catch {
    return null
  }
  if (!d?.EFORMS) return null
  for (const cle of PERIODES) {
    const dates = collecter(d.EFORMS, cle, []).map(versIso).filter(Boolean).sort()
    if (dates.length > 0) return dates[0]
  }
  return null
}
