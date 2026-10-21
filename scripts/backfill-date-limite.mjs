// Rattrapage des dates limites manquantes dans `appels_offre`.
// Usage : node --env-file=.env.local scripts/backfill-date-limite.mjs [--essai] [--concurrence=8]
// Le BOAMP ne remplit pas datelimitereponse pour les procédures restreintes et négociées :
// la date est lue dans l'avis eForms (lib/boamp-date-limite.mjs), comme le fait désormais
// l'import quotidien. Seuls les avis de marché (nature APPEL_OFFRE) sont concernés.
// --essai : compte et affiche quelques exemples sans rien écrire.
import { dateLimiteDepuisDonnees } from '../lib/boamp-date-limite.mjs'

const arg = (nom, defaut) => process.argv.find((a) => a.startsWith(`--${nom}=`))?.split('=')[1] ?? defaut
const essai = process.argv.includes('--essai')
const concurrence = Number(arg('concurrence', 8))
const PAGE = 200

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (lancer avec --env-file=.env.local).')
  process.exit(1)
}
const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }

async function supabase(chemin, init = {}, essais = 3) {
  const res = await fetch(`${url}/rest/v1/${chemin}`, { ...init, headers: { ...headers, ...init.headers } })
  if (res.ok) return res
  const erreur = await res.text()
  // raw_data est volumineux : une page peut dépasser le délai de la base, on réessaie
  if (essais > 1 && erreur.includes('statement timeout')) {
    await new Promise((r) => setTimeout(r, 2000))
    return supabase(chemin, init, essais - 1)
  }
  throw new Error(`Supabase ${res.status} : ${erreur.slice(0, 300)}`)
}

// Pagination par id croissant : les lignes mises à jour sortent du filtre sans décaler les pages
let dernierId = 0
let lues = 0
const aMettreAJour = []
const natures = {}
for (;;) {
  const res = await supabase(
    `appels_offre?select=id,nature:raw_data->>nature,donnees:raw_data->>donnees&date_limite=is.null&id=gt.${dernierId}&order=id.asc&limit=${PAGE}`,
  )
  const lignes = await res.json()
  if (lignes.length === 0) break
  for (const l of lignes) {
    natures[l.nature ?? 'inconnue'] = (natures[l.nature ?? 'inconnue'] ?? 0) + 1
    if (l.nature !== 'APPEL_OFFRE') continue
    const date = dateLimiteDepuisDonnees(l.donnees)
    if (date) aMettreAJour.push({ id: l.id, date })
  }
  lues += lignes.length
  dernierId = lignes[lignes.length - 1].id
  process.stdout.write(`\r${lues} fiches sans date limite lues, ${aMettreAJour.length} dates retrouvées`)
}
console.log('\nPar type d\'avis :', natures)

if (essai) {
  console.log('Exemples :', aMettreAJour.slice(0, 5))
  console.log('Mode essai : rien n\'a été écrit.')
  process.exit(0)
}

let faites = 0
async function ouvrier() {
  while (aMettreAJour.length > 0) {
    const { id, date } = aMettreAJour.shift()
    await supabase(`appels_offre?id=eq.${id}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ date_limite: date }),
    })
    faites++
    if (faites % 100 === 0) process.stdout.write(`\r${faites} dates enregistrées`)
  }
}
await Promise.all(Array.from({ length: concurrence }, ouvrier))
console.log(`\r${faites} dates limites enregistrées.`)
