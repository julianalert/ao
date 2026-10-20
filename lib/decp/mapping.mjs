// Données essentielles de la commande publique (DECP), jeu consolidé « format tabulaire » sur data.gouv.fr.
// Module partagé par l'application (lib/decp) et le script d'import (scripts/import-decp.mjs).
import { createHash } from 'node:crypto'

export const TABULAR_URL = 'https://tabular-api.data.gouv.fr/api/resources/22847056-61df-452d-837d-8b8ceadbfc52/data/'

export const COLONNES = [
  'uid', 'acheteur_id', 'acheteur_nom', 'acheteur_categorie', 'acheteur_commune_nom', 'acheteur_departement_code',
  'titulaire_id', 'titulaire_nom', 'titulaire_categorie', 'objet', 'montant', 'montant_anomalie', 'dateNotification',
  'datePublicationDonnees', 'offresRecues', 'procedure', 'nature', 'type', 'codeCPV', 'dureeMois',
].join(',')

const ENTITES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”',
  laquo: '«', raquo: '»', deg: '°', euro: '€', eacute: 'é', egrave: 'è', ecirc: 'ê', euml: 'ë', agrave: 'à',
  acirc: 'â', ccedil: 'ç', icirc: 'î', iuml: 'ï', ocirc: 'ô', ugrave: 'ù', ucirc: 'û', uuml: 'ü', oelig: 'œ',
  Eacute: 'É', Egrave: 'È', Agrave: 'À', Ccedil: 'Ç',
}

/** Décode les entités HTML et répare les apostrophes perdues (« L¿ETABLISSEMENT »). */
export function nettoyerTexte(s) {
  if (typeof s !== 'string') return null
  const t = s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&([a-z]+);/gi, (m, e) => ENTITES[e] ?? ENTITES[e.toLowerCase()] ?? m)
    .replace(/(\p{L})¿(\p{L})/gu, "$1'$2")
    .replace(/\s*¿\s*/g, ' – ')
    .replace(/\s+/g, ' ')
    .trim()
  return t || null
}

function nombre(v) {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN
  return Number.isFinite(n) ? n : null
}

function texteCourt(v, max) {
  const t = nettoyerTexte(v)
  return t && t.length > max ? `${t.slice(0, max - 1)}…` : t
}

const TYPES = { travaux: 'travaux', services: 'services', fournitures: 'fournitures' }

/** Ligne de l'API tabulaire → ligne de la table `marches_attribues`. */
export function mapperLigne(r) {
  if (!r.uid || !r.acheteur_id) return null
  let montant = nombre(r.montant)
  if (montant !== null && (montant <= 1 || montant >= 1e9 || /aberrant/i.test(String(r.montant_anomalie ?? '')))) montant = null
  let offres = nombre(r.offresRecues)
  if (offres !== null && (offres < 0 || offres > 500)) offres = null
  const titulaireId = typeof r.titulaire_id === 'string' ? r.titulaire_id.replace(/\s/g, '') : null
  const id = createHash('sha1').update(`${r.uid}|${titulaireId ?? r.titulaire_nom ?? ''}`).digest('hex').slice(0, 24)
  const dep = typeof r.acheteur_departement_code === 'string' ? r.acheteur_departement_code.trim().toUpperCase() : null
  return {
    id,
    uid: String(r.uid).slice(0, 200),
    acheteur_id: String(r.acheteur_id).replace(/\s/g, '').slice(0, 20),
    acheteur_nom: texteCourt(r.acheteur_nom, 200),
    acheteur_categorie: texteCourt(r.acheteur_categorie, 80),
    acheteur_commune: texteCourt(r.acheteur_commune_nom, 100),
    acheteur_departement: dep && /^\d$/.test(dep) ? `0${dep}` : dep,
    titulaire_id: titulaireId ? titulaireId.slice(0, 30) : null,
    titulaire_nom: texteCourt(r.titulaire_nom, 200),
    titulaire_categorie: texteCourt(r.titulaire_categorie, 40),
    objet: texteCourt(r.objet, 400),
    montant,
    date_notification: typeof r.dateNotification === 'string' ? r.dateNotification.slice(0, 10) : null,
    date_publication: typeof r.datePublicationDonnees === 'string' ? r.datePublicationDonnees.slice(0, 10) : null,
    offres_recues: offres,
    procedure: texteCourt(r.procedure, 80),
    nature: texteCourt(r.nature, 60),
    type: TYPES[String(r.type ?? '').toLowerCase()] ?? null,
    cpv: typeof r.codeCPV === 'string' ? r.codeCPV.slice(0, 8) : null,
    duree_mois: (() => { const d = nombre(r.dureeMois); return d !== null && d > 0 && d < 600 ? Math.round(d) : null })(),
  }
}

/** Une page de l'API tabulaire (200 lignes max), avec deux nouvelles tentatives. */
export async function pageTabulaire(params, page, pageSize = 200, init = {}) {
  const qs = new URLSearchParams({ ...params, page: String(page), page_size: String(pageSize), columns: COLONNES })
  let derniere
  for (let essai = 0; essai < 3; essai++) {
    try {
      const res = await fetch(`${TABULAR_URL}?${qs}`, { ...init, headers: { 'User-Agent': 'mon-ao.com (veille marches publics)' } })
      const json = await res.json()
      if (json.errors) throw new Error(JSON.stringify(json.errors).slice(0, 300))
      return { rows: json.data ?? [], total: json.meta?.total ?? 0 }
    } catch (err) {
      derniere = err
      await new Promise((r) => setTimeout(r, 1500 * (essai + 1)))
    }
  }
  throw derniere
}
