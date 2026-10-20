// Import des marchés attribués (DECP) dans la table `marches_attribues`.
// Usage : node --env-file=.env.local scripts/import-decp.mjs [--depuis=2023-10-20] [--concurrence=6]
// Par défaut : marchés notifiés depuis 3 ans, versions actuelles uniquement (≈ 1 million de lignes).
import { mapperLigne, pageTabulaire } from '../lib/decp/mapping.mjs'

const arg = (nom, defaut) => process.argv.find((a) => a.startsWith(`--${nom}=`))?.split('=')[1] ?? defaut
const troisAns = new Date(Date.now() - 3 * 365 * 86400000).toISOString().slice(0, 10)
const depuis = arg('depuis', troisAns)
const concurrence = Number(arg('concurrence', 6))

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (lancer avec --env-file=.env.local).')
  process.exit(1)
}
const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }

async function upsert(lignes) {
  if (!lignes.length) return
  // Doublons possibles dans un même lot : on garde la dernière occurrence de chaque id
  const uniques = Array.from(new Map(lignes.map((l) => [l.id, l])).values())
  const res = await fetch(`${url}/rest/v1/marches_attribues?on_conflict=id`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(uniques.map((l) => ({ ...l, updated_at: new Date().toISOString() }))),
  })
  if (!res.ok) throw new Error(`Supabase ${res.status} : ${(await res.text()).slice(0, 300)}`)
}

const params = { donneesActuelles__exact: 'true', dateNotification__greater: depuis, dateNotification__sort: 'asc' }
const { total } = await pageTabulaire(params, 1, 1)
const pages = Math.ceil(total / 200)
console.log(`${total} lignes à importer depuis le ${depuis} (${pages} pages, ${concurrence} en parallèle)`)

let suivante = 1
let faites = 0
let lignes = 0
const debut = Date.now()
async function ouvrier() {
  while (suivante <= pages) {
    const page = suivante++
    const { rows } = await pageTabulaire(params, page, 200)
    const mappees = rows.map(mapperLigne).filter(Boolean)
    await upsert(mappees)
    faites++
    lignes += mappees.length
    if (faites % 25 === 0 || faites === pages) {
      const min = (Date.now() - debut) / 60000
      console.log(`${faites}/${pages} pages, ${lignes} lignes, ${min.toFixed(1)} min`)
    }
  }
}
await Promise.all(Array.from({ length: concurrence }, ouvrier))

const r = await fetch(`${url}/rest/v1/rpc/refresh_acheteurs_index`, { method: 'POST', headers, body: '{}' })
console.log(r.ok ? 'Index des acheteurs rafraîchi.' : `Rafraîchissement de l'index : ${r.status} ${await r.text()}`)
console.log(`Terminé : ${lignes} lignes en ${((Date.now() - debut) / 60000).toFixed(1)} min.`)
