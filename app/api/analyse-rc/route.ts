import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getAppelOffreById } from '@/lib/getAppelsOffre'
import { admin, emailValide, obtenirAbonne } from '@/lib/alertes/store'
import { aoHref } from '@/app/(default)/ao-item'
import { appliquerBudget, preparerFichier, texteAvis, type DocPrepare } from '@/lib/analyse-rc/extraction'
import { AnalyseErreur, analyserAvecClaude, type ProfilEntreprise } from '@/lib/analyse-rc/claude'
import { verifierFiche } from '@/lib/analyse-rc/verification'
import { ANALYSES_GRATUITES, BUCKET, COOKIE_COMPTEUR, COOKIE_VISITEUR, etatQuota, ipHash, journaliserAnalyse } from '@/lib/analyse-rc/quota'
import type { ResultatAnalyse } from '@/lib/analyse-rc/schema'

export const maxDuration = 300

const TELECHARGEMENT_MAX = 60 * 1024 * 1024

type Entree = { email: string | null; profil: ProfilEntreprise | null; path: string | null; nom: string | null; aoId: number | null; fichier: File | null }

async function lireEntree(req: NextRequest): Promise<Entree> {
  const txt = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 120) : undefined)
  const profilDe = (o: Record<string, unknown>): ProfilEntreprise => ({ corpsEtat: txt(o.corpsEtat), effectif: txt(o.effectif), chiffreAffaires: txt(o.chiffreAffaires), zone: txt(o.zone) })
  if (req.headers.get('content-type')?.includes('multipart/form-data')) {
    const form = await req.formData()
    const f = form.get('fichier')
    return {
      email: txt(form.get('email')) ?? null,
      profil: profilDe(JSON.parse(String(form.get('profil') ?? '{}'))),
      path: null,
      nom: f instanceof File ? f.name : null,
      aoId: null,
      fichier: f instanceof File ? f : null,
    }
  }
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
  return {
    email: txt(body.email) ?? null,
    profil: profilDe((body.profil as Record<string, unknown>) ?? {}),
    path: typeof body.path === 'string' && /^[\w.-]+$/.test(body.path) ? body.path : null,
    nom: txt(body.nom) ?? null,
    aoId: Number.isInteger(Number(body.aoId)) && Number(body.aoId) > 0 ? Number(body.aoId) : null,
    fichier: null,
  }
}

/** Le DCE d'un AO publié n'est téléchargeable que si l'avis pointe directement vers un PDF ou un ZIP. */
async function documentsDepuisAo(aoId: number): Promise<{ docs: DocPrepare[]; ao: ResultatAnalyse['ao']; avisSeul: boolean }> {
  const ao = await getAppelOffreById(aoId)
  if (!ao) throw new AnalyseErreur('Appel d\'offres introuvable.', 404)
  const infos = { id: ao.id, titre: ao.titre, href: aoHref(ao) }
  const url = ao.url_document
  if (url && url.startsWith('https://') && /\.(pdf|zip)(\?|$)/i.test(url)) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(20000) })
      const taille = Number(r.headers.get('content-length') ?? 0)
      if (r.ok && taille <= TELECHARGEMENT_MAX) {
        const nom = decodeURIComponent(new URL(url).pathname.split('/').pop() ?? 'dce.pdf')
        return { docs: await preparerFichier(nom, new Uint8Array(await r.arrayBuffer())), ao: infos, avisSeul: false }
      }
    } catch {}
  }
  const texte = texteAvis(ao.raw_data)
  if (!texte) throw new AnalyseErreur('L\'avis de cet AO ne contient pas de texte exploitable : déposez le RC.', 422)
  return { docs: [{ nom: 'Avis BOAMP', type: 'Avis', pages: [texte], pagine: false, pdfBase64: null, priorite: 0, note: null }], ao: infos, avisSeul: true }
}

// Étape 2 : récupère le fichier (stockage temporaire, envoi direct ou AO publié), l'analyse, vérifie les sources.
export async function POST(req: NextRequest) {
  const debut = Date.now()
  const entree = await lireEntree(req)
  const visiteur = req.cookies.get(COOKIE_VISITEUR)?.value ?? randomUUID()
  const ip = ipHash(req)
  const compteur = Number(req.cookies.get(COOKIE_COMPTEUR)?.value ?? 0)
  const email = entree.email && emailValide(entree.email) ? entree.email.toLowerCase() : null

  const quota = await etatQuota(visiteur, ip, compteur)
  if (quota.plafondAtteint) return NextResponse.json({ error: 'Trop d\'analyses aujourd\'hui, revenez demain.' }, { status: 429 })
  if (quota.gratuitesUtilisees >= ANALYSES_GRATUITES && !email) {
    return NextResponse.json({ status: 'email-requis', gratuites: ANALYSES_GRATUITES }, { status: 402 })
  }

  let abonneId: string | null = null
  if (email) {
    try {
      abonneId = (await obtenirAbonne(email, 'analyse-rc')).id
    } catch {}
  }

  let docs: DocPrepare[] = []
  let ao: ResultatAnalyse['ao'] = null
  let avisSeul = false
  try {
    if (entree.aoId) {
      ;({ docs, ao, avisSeul } = await documentsDepuisAo(entree.aoId))
    } else if (entree.path) {
      const sb = admin()
      const { data, error } = await sb.storage.from(BUCKET).download(entree.path)
      // Suppression immédiate du fichier, quel que soit le résultat de l'analyse
      await sb.storage.from(BUCKET).remove([entree.path])
      if (error || !data) throw new AnalyseErreur('Fichier introuvable : déposez-le à nouveau.', 404)
      const nom = entree.nom ?? entree.path.replace(/^\d+-[0-9a-f-]{36}-/, '')
      docs = await preparerFichier(nom, new Uint8Array(await data.arrayBuffer()))
    } else if (entree.fichier) {
      if (entree.fichier.size > 4.5 * 1024 * 1024) throw new AnalyseErreur('Fichier trop volumineux pour un envoi direct.', 413)
      docs = await preparerFichier(entree.fichier.name, new Uint8Array(await entree.fichier.arrayBuffer()))
    } else {
      throw new AnalyseErreur('Aucun document reçu.', 400)
    }

    const { retenus, resume } = appliquerBudget(docs)
    const { fiche, tokens } = await analyserAvecClaude(retenus, entree.profil)
    const bilan = verifierFiche(fiche, retenus)

    await journaliserAnalyse({
      visiteur_id: visiteur, ip_hash: ip, email, abonne_id: abonneId, ao_id: ao?.id ?? null,
      nb_documents: retenus.length, tokens_entree: tokens.entree, tokens_sortie: tokens.sortie, statut: 'ok', duree_ms: Date.now() - debut,
    })

    const resultat: ResultatAnalyse = { fiche, documents: resume, ...bilan, ao, avisSeul }
    const res = NextResponse.json(resultat)
    const cookie = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 }
    if (!email) res.cookies.set(COOKIE_COMPTEUR, String(compteur + 1), cookie)
    if (!req.cookies.get(COOKIE_VISITEUR)) res.cookies.set(COOKIE_VISITEUR, visiteur, { ...cookie, maxAge: 60 * 60 * 24 * 365 })
    return res
  } catch (err) {
    await journaliserAnalyse({
      visiteur_id: visiteur, ip_hash: ip, email, abonne_id: abonneId, ao_id: ao?.id ?? entree.aoId,
      nb_documents: docs.length, tokens_entree: null, tokens_sortie: null, statut: 'erreur', duree_ms: Date.now() - debut,
    })
    if (err instanceof AnalyseErreur) return NextResponse.json({ error: err.message }, { status: err.status })
    console.error('POST /api/analyse-rc:', err)
    return NextResponse.json({ error: 'L\'analyse a échoué, réessayez.' }, { status: 500 })
  }
}
