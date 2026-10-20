// Charge data/seuils.json dans la table Supabase `seuils` (upsert sur id).
// Usage : node --env-file=.env.local scripts/seed-seuils.mjs
import { readFile } from 'node:fs/promises'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (lancer avec --env-file=.env.local).')
  process.exit(1)
}

const rows = JSON.parse(await readFile(new URL('../data/seuils.json', import.meta.url), 'utf8'))
const res = await fetch(`${url}/rest/v1/seuils?on_conflict=id`, {
  method: 'POST',
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates,return=minimal',
  },
  body: JSON.stringify(rows.map((r) => ({ ...r, updated_at: new Date().toISOString() }))),
})

if (!res.ok) {
  console.error(`Échec (${res.status}) :`, await res.text())
  process.exit(1)
}
console.log(`${rows.length} seuils chargés dans la table seuils.`)
