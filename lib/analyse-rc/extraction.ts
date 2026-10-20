// Préparation des documents d'un DCE : texte page par page pour les PDF qui en ont un,
// PDF transmis tel quel s'il est scanné, texte des DOCX, contenu des ZIP.
import { extractText, getDocumentProxy } from 'unpdf'
import { strFromU8, unzipSync } from 'fflate'
import type { DocumentAnalyse } from './schema'

export type DocPrepare = {
  nom: string
  type: string
  /** Texte par page (PDF) ou en une seule « page » (DOCX, avis) */
  pages: string[] | null
  pagine: boolean
  /** PDF scanné, envoyé à Claude comme document image */
  pdfBase64: string | null
  priorite: number
  note: string | null
}

const MAX_FICHIER = 60 * 1024 * 1024
const MAX_TOTAL_DECOMPRESSE = 250 * 1024 * 1024
/** Budget de texte transmis (≈ 150 000 tokens) */
export const BUDGET_CARACTERES = 600_000
/** Taille maximale des PDF scannés envoyés en image (limite de requête : 32 Mo) */
const BUDGET_PDF_IMAGE = 18 * 1024 * 1024

const TYPES: { type: string; re: RegExp; priorite: number }[] = [
  { type: 'RC', re: /(^|[^a-z])(rc|r\.c)([^a-z]|$)|reglement.?(de.?la.?)?consultation|règlement.?(de.?la.?)?consultation/i, priorite: 0 },
  { type: 'AE', re: /(^|[^a-z])(ae|attri1)([^a-z]|$)|acte.?d.?engagement/i, priorite: 1 },
  { type: 'CCAP', re: /ccap|clauses.?administratives/i, priorite: 1 },
  { type: 'DPGF', re: /dpgf|bpu|dqe|bordereau|decomposition|décomposition|detail.?quantitatif/i, priorite: 3 },
  { type: 'CCTP', re: /cctp|clauses.?techniques|descriptif/i, priorite: 4 },
  { type: 'Avis', re: /avis|aapc/i, priorite: 2 },
]

export function typeDocument(nom: string): { type: string; priorite: number } {
  const base = nom.split('/').pop() ?? nom
  const t = TYPES.find((x) => x.re.test(base))
  return t ? { type: t.type, priorite: t.priorite } : { type: 'Autre', priorite: 5 }
}

function decoderXml(s: string): string {
  return s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, '&')
}

function texteDocx(data: Uint8Array): string {
  const fichiers = unzipSync(data, { filter: (f) => f.name === 'word/document.xml' })
  const xml = fichiers['word/document.xml']
  if (!xml) return ''
  return decoderXml(
    strFromU8(xml)
      .replace(/<w:tab\/>/g, '\t')
      .replace(/<w:br[^>]*\/>/g, '\n')
      .replace(/<\/w:p>/g, '\n')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

async function preparerPdf(nom: string, data: Uint8Array): Promise<DocPrepare> {
  const { type, priorite } = typeDocument(nom)
  try {
    const pdf = await getDocumentProxy(new Uint8Array(data))
    const { totalPages, text } = await extractText(pdf, { mergePages: false })
    const caracteres = text.reduce((s, p) => s + p.trim().length, 0)
    // Moins de 150 caractères par page en moyenne : PDF scanné (pas de couche texte exploitable)
    if (caracteres / Math.max(1, totalPages) < 150) {
      return { nom, type, pages: null, pagine: true, pdfBase64: Buffer.from(data).toString('base64'), priorite, note: `${totalPages} pages, PDF scanné` }
    }
    return { nom, type, pages: text, pagine: true, pdfBase64: null, priorite, note: null }
  } catch {
    return { nom, type, pages: null, pagine: false, pdfBase64: null, priorite: 9, note: 'PDF illisible ou protégé' }
  }
}

/** Transforme un fichier déposé (PDF, DOCX ou ZIP de DCE) en documents exploitables. */
export async function preparerFichier(nom: string, data: Uint8Array): Promise<DocPrepare[]> {
  const ext = nom.toLowerCase().split('.').pop()
  if (ext === 'pdf') return [await preparerPdf(nom, data)]
  if (ext === 'docx') {
    const { type, priorite } = typeDocument(nom)
    return [{ nom, type, pages: [texteDocx(data)], pagine: false, pdfBase64: null, priorite, note: null }]
  }
  if (ext === 'zip') {
    let total = 0
    const entrees = unzipSync(data, {
      filter: (f) => {
        if (f.name.startsWith('__MACOSX') || f.name.endsWith('/') || f.originalSize > MAX_FICHIER) return false
        total += f.originalSize
        return total <= MAX_TOTAL_DECOMPRESSE
      },
    })
    const docs: DocPrepare[] = []
    for (const [chemin, contenu] of Object.entries(entrees)) {
      const e = chemin.toLowerCase().split('.').pop()
      if (e === 'pdf' || e === 'docx') docs.push(...(await preparerFichier(chemin, contenu)))
      else if (e === 'zip') docs.push(...(await preparerFichier(chemin, contenu)))
      else docs.push({ nom: chemin, ...typeDocument(chemin), pages: null, pagine: false, pdfBase64: null, priorite: 9, note: `format .${e} non analysé` })
    }
    if (total > MAX_TOTAL_DECOMPRESSE) docs.push({ nom: '(archive)', type: 'Autre', pages: null, pagine: false, pdfBase64: null, priorite: 9, note: 'archive trop volumineuse, fichiers restants ignorés' })
    return docs
  }
  return [{ nom, type: 'Autre', pages: null, pagine: false, pdfBase64: null, priorite: 9, note: `format .${ext} non pris en charge` }]
}

/**
 * Applique les budgets (texte et PDF image) par ordre de priorité : RC, AE et CCAP d'abord.
 * Les pages au-delà du budget ne sont pas transmises, et la fiche le signale.
 */
export function appliquerBudget(docs: DocPrepare[]): { retenus: DocPrepare[]; resume: DocumentAnalyse[] } {
  let texte = 0
  let images = 0
  const retenus: DocPrepare[] = []
  const resume: DocumentAnalyse[] = []
  for (const d of [...docs].sort((a, b) => a.priorite - b.priorite)) {
    if (d.pages) {
      const pages: string[] = []
      for (const p of d.pages) {
        if (texte + p.length > BUDGET_CARACTERES) break
        pages.push(p)
        texte += p.length
      }
      if (pages.length) retenus.push({ ...d, pages })
      const tronque = pages.length < d.pages.length
      resume.push({
        nom: d.nom,
        type: d.type,
        pages: d.pagine ? d.pages.length : null,
        mode: pages.length ? 'texte' : 'ignore',
        note: pages.length === 0 ? 'non analysé (volume maximal atteint)' : tronque ? `pages ${pages.length + 1} à ${d.pages.length} non analysées (volume maximal atteint)` : d.note,
      })
    } else if (d.pdfBase64) {
      const taille = d.pdfBase64.length
      if (images + taille <= BUDGET_PDF_IMAGE) {
        images += taille
        retenus.push(d)
        resume.push({ nom: d.nom, type: d.type, pages: null, mode: 'pdf-image', note: d.note })
      } else {
        resume.push({ nom: d.nom, type: d.type, pages: null, mode: 'ignore', note: 'PDF scanné trop volumineux, non analysé' })
      }
    } else {
      resume.push({ nom: d.nom, type: d.type, pages: null, mode: 'ignore', note: d.note })
    }
  }
  return { retenus, resume }
}

/** Texte lisible d'un avis BOAMP (données brutes eForms ou ancien format). */
export function texteAvis(raw: unknown, max = 80_000): string {
  const lignes: string[] = []
  const visiter = (v: unknown, cle: string) => {
    if (lignes.join('\n').length > max) return
    if (v === null || v === undefined) return
    if (typeof v === 'string') {
      const t = v.trim()
      if (t.startsWith('{') || t.startsWith('[')) {
        try {
          return visiter(JSON.parse(t), cle)
        } catch {}
      }
      if (t && !cle.startsWith('@')) lignes.push(`${cle.replace(/^(cbc|cac|efac|efbc|efext|ext):/, '')} : ${t}`)
      return
    }
    if (typeof v === 'number' || typeof v === 'boolean') {
      lignes.push(`${cle} : ${v}`)
      return
    }
    if (Array.isArray(v)) return v.forEach((x) => visiter(x, cle))
    if (typeof v === 'object') for (const [k, x] of Object.entries(v as Record<string, unknown>)) visiter(x, k === '#text' ? cle : k)
  }
  visiter(raw, 'avis')
  return lignes.join('\n').slice(0, max)
}
