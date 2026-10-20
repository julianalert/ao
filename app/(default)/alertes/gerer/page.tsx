import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { decrireCriteres } from '@/lib/alertes/criteres'
import { abonneParToken, alertesDe, COOKIE_ABONNE, DUREES_ATTESTATION, favorisDe, rappelsDe, StoreIndisponible } from '@/lib/alertes/store'
import { aoHref } from '@/app/(default)/ao-item'
import { getTopCategories } from '@/lib/getAppelsOffre'
import { Badge, Breadcrumb } from '@/components/outils/sections'
import { Alert } from '@/components/outils/form'
import Gestion, { DemandeLien } from './gestion'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { absolute: 'Gérer mes alertes | mon-ao.com' },
  robots: { index: false, follow: false },
}

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function GererPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const token = sp.t ?? (await cookies()).get(COOKIE_ABONNE)?.value ?? null

  let contenu: React.ReactNode
  try {
    const abonne = await abonneParToken(token)
    if (!abonne || abonne.unsubscribed_at) {
      contenu = (
        <>
          {sp.erreur === 'lien' && <div className="mb-4"><Alert tone="warning">Ce lien n'est plus valide. Demandez un nouveau lien ci-dessous.</Alert></div>}
          {sp.erreur === 'service' && <div className="mb-4"><Alert tone="warning">Le service est momentanément indisponible, réessayez dans quelques minutes.</Alert></div>}
          <DemandeLien />
        </>
      )
    } else {
      const [alertes, favoris, rappels, cats] = await Promise.all([alertesDe(abonne.id), favorisDe(abonne.id), rappelsDe(abonne.id), getTopCategories(400)])
      const labels = Object.fromEntries(cats.map((c) => [c.categorie, c.categorie_label]))
      contenu = (
        <>
          {sp.bienvenue && <div className="mb-6"><Alert>Adresse confirmée : vos alertes sont actives. Le premier email arrive demain matin s'il y a de nouveaux AO.</Alert></div>}
          <Gestion
            token={abonne.token}
            email={abonne.email}
            alertes={alertes.map((a) => ({ id: a.id, nom: a.nom, resume: decrireCriteres(a.criteres, labels), frequence: a.frequence, actif: a.actif }))}
            favoris={favoris
              .filter((f) => f.appels_offre)
              .map((f) => ({ id: f.ao_id, titre: f.appels_offre!.titre, href: aoHref(f.appels_offre!), dateLimite: f.appels_offre!.date_limite }))}
            rappels={rappels.map((r) => ({ id: r.id, piece: DUREES_ATTESTATION[r.piece]?.label ?? r.piece, expireLe: r.expire_le, envoye: !!r.rappel_envoye_at }))}
          />
        </>
      )
    }
  } catch (err) {
    console.error('/alertes/gerer:', err)
    contenu = (
      <Alert tone="warning">
        {err instanceof StoreIndisponible ? 'La gestion des alertes est en cours d\'activation.' : 'Une erreur est survenue.'} Réessayez dans quelques minutes.
      </Alert>
    )
  }

  return (
    <section className="relative">
      <div className="absolute inset-x-0 top-0 h-[24rem] bg-linear-to-b from-blue-100 to-white pointer-events-none -z-10" aria-hidden="true" />
      <div className="max-w-3xl mx-auto px-6 sm:px-8 pt-28 md:pt-36 pb-16">
        <Breadcrumb items={[{ name: 'Accueil', href: '/' }, { name: 'Alertes appels d\'offres', href: '/outils/alertes-appels-offres' }, { name: 'Gérer mes alertes', href: '/alertes/gerer' }]} />
        <div className="mb-4"><Badge>Espace alertes</Badge></div>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-8">Gérer mes alertes</h1>
        {contenu}
        <p className="mt-10 text-sm text-gray-500">
          <Link href="/outils/alertes-appels-offres" className="font-medium text-blue-600 hover:underline">Créer une nouvelle alerte →</Link>
        </p>
      </div>
    </section>
  )
}
