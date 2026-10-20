import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { lireJson } from '@/lib/alertes/http'
import { admin, emailValide } from '@/lib/alertes/store'
import { ANALYSES_GRATUITES, BUCKET, COOKIE_COMPTEUR, COOKIE_VISITEUR, etatQuota, ipHash } from '@/lib/analyse-rc/quota'

const TAILLE_MAX = 60 * 1024 * 1024
const DIRECT_MAX = 4 * 1024 * 1024
const EXTENSIONS = ['pdf', 'docx', 'zip']

// Étape 1 : vérifie le quota puis renvoie une URL signée pour déposer le fichier (stockage temporaire).
export async function POST(req: NextRequest) {
  const body = await lireJson(req)
  const nom = typeof body.nom === 'string' ? body.nom : ''
  const taille = Number(body.taille)
  const ext = nom.toLowerCase().split('.').pop() ?? ''
  if (!EXTENSIONS.includes(ext)) return NextResponse.json({ error: 'Formats acceptés : PDF, DOCX ou ZIP du DCE.' }, { status: 400 })
  if (!(taille > 0) || taille > TAILLE_MAX) return NextResponse.json({ error: 'Fichier trop volumineux (60 Mo maximum).' }, { status: 400 })

  const visiteur = req.cookies.get(COOKIE_VISITEUR)?.value ?? randomUUID()
  const quota = await etatQuota(visiteur, ipHash(req), Number(req.cookies.get(COOKIE_COMPTEUR)?.value ?? 0))
  if (quota.plafondAtteint) return NextResponse.json({ error: 'Trop d\'analyses aujourd\'hui, revenez demain.' }, { status: 429 })
  if (quota.gratuitesUtilisees >= ANALYSES_GRATUITES && !emailValide(body.email)) {
    return NextResponse.json({ status: 'email-requis', gratuites: ANALYSES_GRATUITES }, { status: 402 })
  }

  const safe = nom.normalize('NFD').replace(/[^\w.-]+/g, '_').slice(-80)
  const path = `${Date.now()}-${randomUUID()}-${safe}`
  let res: NextResponse
  try {
    const { data, error } = await admin().storage.from(BUCKET).createSignedUploadUrl(path)
    if (error || !data) throw error ?? new Error('URL signée indisponible')
    res = NextResponse.json({ mode: 'stockage', path: data.path, token: data.token })
  } catch (err) {
    // Bucket absent : envoi direct possible pour les petits fichiers
    console.error('analyse-rc/depot:', err instanceof Error ? err.message : err)
    res = taille <= DIRECT_MAX
      ? NextResponse.json({ mode: 'direct' })
      : NextResponse.json({ error: 'Dépôt de gros fichiers momentanément indisponible : déposez le RC seul (4 Mo maximum).' }, { status: 503 })
  }
  if (!req.cookies.get(COOKIE_VISITEUR)) {
    res.cookies.set(COOKIE_VISITEUR, visiteur, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 365 })
  }
  return res
}
