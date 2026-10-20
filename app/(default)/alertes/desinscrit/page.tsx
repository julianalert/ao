import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: { absolute: 'Désinscription confirmée | mon-ao.com' },
  robots: { index: false, follow: false },
}

export default function DesinscritPage() {
  return (
    <section className="max-w-2xl mx-auto px-6 sm:px-8 pt-32 md:pt-40 pb-20 text-center">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">Vous êtes désinscrit</h1>
      <p className="text-gray-600 mb-8">Vous ne recevrez plus d'email de mon-ao.com. Vous pouvez recréer une alerte à tout moment.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/outils/alertes-appels-offres" className="btn text-white bg-blue-500 hover:bg-blue-600">Créer une nouvelle alerte</Link>
        <Link href="/" className="btn bg-white border border-gray-200 text-gray-700 hover:border-blue-300">Voir les appels d'offres</Link>
      </div>
    </section>
  )
}
