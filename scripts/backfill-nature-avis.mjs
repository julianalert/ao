// Remplit la colonne `nature` des fiches existantes, après la migration
// 20261021_05_nature_avis.sql (les nouveaux imports sont remplis par un trigger).
// Usage : node --env-file=.env.local scripts/backfill-nature-avis.mjs [--page=250]
//
// Lecture par tranches d'id, puis une mise à jour groupée par type d'avis.
// Les fiches dont raw_data n'a pas de type reçoivent '' pour ne pas être relues.

const arg = (nom, defaut) => process.argv.find((a) => a.startsWith(`--${nom}=`))?.split('=')[1] ?? defaut
const PAGE = Number(arg('page', 250))

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (lancer avec --env-file=.env.local).')
  process.exit(1)
}
const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }

async function supabase(chemin, init = {}, essais = 4) {
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

// Tranches d'id (clé primaire) : un tri sur tout le filtre forcerait la base à lire tous les raw_data
const dernier = await (await supabase('appels_offre?select=id&order=id.desc&limit=1')).json()
const idMax = dernier[0]?.id ?? 0

let total = 0
const parNature = {}
for (let debut = 0; debut <= idMax; debut += PAGE) {
  const res = await supabase(
    `appels_offre?select=id,type:raw_data->>nature&nature=is.null&id=gt.${debut}&id=lte.${debut + PAGE}`,
  )
  const lignes = await res.json()
  if (lignes.length === 0) continue

  const groupes = new Map()
  for (const l of lignes) {
    const nature = l.type ?? ''
    if (!groupes.has(nature)) groupes.set(nature, [])
    groupes.get(nature).push(l.id)
  }
  await Promise.all(
    Array.from(groupes, ([nature, ids]) =>
      supabase(`appels_offre?id=in.(${ids.join(',')})`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ nature }),
      }).then(() => {
        parNature[nature || '(sans type)'] = (parNature[nature || '(sans type)'] ?? 0) + ids.length
      }),
    ),
  )

  total += lignes.length
  process.stdout.write(`\r${total} fiches remplies (id ${debut + PAGE} / ${idMax})`)
}
console.log(`\r${total} fiches remplies. Terminé.`)
console.log(parNature)
