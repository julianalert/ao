import type { Metadata } from 'next'
import Link from 'next/link'
import { Badge, Breadcrumb, ContentSection, DataTable } from '@/components/outils/sections'
import { GererCookiesButton } from '@/components/analytics'
import { CONSERVATION, EDITEUR, LEGAL_MAJ } from '@/lib/legal'
import { fmtDateLong } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Confidentialité et cookies',
  description: "Quelles données mon-ao.com collecte, pourquoi, combien de temps elles sont conservées, quels cookies sont déposés et comment exercer vos droits.",
  alternates: { canonical: '/confidentialite' },
  robots: { index: false, follow: true },
}

const linkClass = 'font-medium text-blue-600 hover:underline'

function Contact() {
  return EDITEUR.email ? (
    <a className={linkClass} href={`mailto:${EDITEUR.email}`}>{EDITEUR.email}</a>
  ) : (
    <a className={linkClass} href={EDITEUR.contact} target="_blank" rel="noopener">formulaire de contact de {EDITEUR.nomCommercial}</a>
  )
}

export default function ConfidentialitePage() {
  return (
    <>
      <section className="relative">
        <div className="absolute inset-x-0 top-0 h-80 bg-linear-to-b from-blue-100 to-white pointer-events-none -z-10" aria-hidden="true" />
        <div className="max-w-3xl mx-auto px-6 sm:px-8 pt-28 md:pt-36">
          <Breadcrumb items={[{ name: 'Accueil', href: '/' }, { name: 'Confidentialité et cookies', href: '/confidentialite' }]} />
          <div className="mb-5"><Badge>Vos données</Badge></div>
          <h1 className="h1 font-inter tracking-tight text-gray-900 mb-4">Confidentialité et cookies</h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-2">
            Consulter les appels d'offres et utiliser les calculateurs ne demande ni compte ni email. Cette page détaille les rares cas
            où des données sont collectées.
          </p>
          <p className="text-gray-500">Mise à jour le {fmtDateLong(LEGAL_MAJ)}.</p>
        </div>
      </section>

      <ContentSection id="responsable" title="Responsable du traitement">
        <p className="text-gray-600 leading-relaxed">
          Les données sont traitées par {EDITEUR.nomCommercial}, éditeur du site (voir les{' '}
          <Link className={linkClass} href="/mentions-legales">mentions légales</Link>). Pour toute question : <Contact />.
        </p>
      </ContentSection>

      <ContentSection id="donnees" title="Données collectées et finalités" muted>
        <DataTable
          caption="Données collectées par mon-ao.com"
          head={['Quand', 'Données', 'Pourquoi', 'Conservation']}
          rows={[
            [
              'Consultation du site et calculateurs',
              "Aucune donnée personnelle. Les montants saisis dans les calculateurs restent dans votre navigateur.",
              '—',
              '—',
            ],
            [
              'Analyseur de RC et DCE',
              "Les documents déposés, un identifiant de visiteur aléatoire, une empreinte chiffrée de l'adresse IP, l'email s'il est saisi.",
              "Produire la fiche d'analyse, appliquer le quota d'analyses gratuites et prévenir les abus.",
              `Documents supprimés dès la fin de l'analyse (au plus tard sous une heure). Journal des analyses : ${CONSERVATION.journalAnalyses}.`,
            ],
            [
              "Alertes, suivi d'un appel d'offres",
              "Email et critères de l'alerte (métier, zone, montant), appels d'offres suivis.",
              'Envoyer les emails que vous avez demandés.',
              CONSERVATION.emails.charAt(0).toUpperCase() + CONSERVATION.emails.slice(1) + '.',
            ],
            [
              "Mesure d'audience, si vous l'acceptez",
              'Pages vues, outils utilisés, clics, données techniques du navigateur (Google Analytics).',
              'Savoir quelles pages et quels outils sont utiles, pour améliorer le site.',
              '13 mois maximum pour les cookies.',
            ],
          ]}
        />
        <p className="text-gray-600 leading-relaxed">
          Les données ne sont ni vendues ni louées. Les documents déposés dans
          l'analyseur ne servent qu'à produire votre fiche.
        </p>
      </ContentSection>

      <ContentSection id="destinataires" title="Prestataires techniques">
        <p className="text-gray-600 leading-relaxed mb-2">
          Le site s'appuie sur des prestataires qui traitent des données pour son compte, uniquement pour fournir leur service :
        </p>
        <DataTable
          caption="Prestataires techniques"
          head={['Prestataire', 'Rôle']}
          rows={[
            ['Vercel', 'Hébergement du site'],
            ['Supabase', 'Base de données et stockage temporaire des documents déposés'],
            ['Anthropic', "Analyse des documents déposés dans l'analyseur de RC (modèle Claude)"],
            ['Resend', 'Envoi des emails'],
            ['Google', "Mesure d'audience (Google Analytics), seulement après votre accord"],
          ]}
        />
        <p className="text-gray-600 leading-relaxed">
          Certains de ces prestataires sont établis aux États-Unis. Les transferts sont encadrés par le cadre de protection des données
          UE–États-Unis (Data Privacy Framework) ou par les clauses contractuelles types de la Commission européenne.
        </p>
      </ContentSection>

      <ContentSection id="cookies" title="Cookies" muted>
        <DataTable
          caption="Cookies et stockage local"
          head={['Nom', 'Rôle', 'Durée', 'Consentement']}
          rows={[
            ['mon_ao_visiteur', "Identifiant aléatoire pour le quota de l'analyseur de RC", '1 an', 'Non requis (nécessaire au service)'],
            ['mon_ao_analyses', "Nombre d'analyses gratuites utilisées", '30 jours', 'Non requis (nécessaire au service)'],
            ['mon_ao_abonne', 'Accès à la gestion de vos alertes sans mot de passe', '1 an', 'Non requis (nécessaire au service)'],
            ['_ga, _ga_*', "Mesure d'audience Google Analytics", '13 mois', 'Requis'],
            ['Stockage local du navigateur', "Votre choix sur les cookies, l'email saisi dans l'analyseur, la checklist des pièces cochées", "Jusqu'à ce que vous l'effaciez", 'Non requis'],
          ]}
        />
        <p className="text-gray-600 leading-relaxed">
          Vous pouvez changer d'avis à tout moment :{' '}
          <GererCookiesButton className={linkClass} />. En cas de refus, les cookies de mesure d'audience sont supprimés.
        </p>
      </ContentSection>

      <ContentSection id="droits" title="Vos droits">
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Vous pouvez accéder à vos données, les faire rectifier ou supprimer, vous opposer à leur traitement, en demander la
            limitation ou la portabilité. Écrivez-nous : <Contact />. Nous répondons sous un mois.
          </p>
          <p>
            Chaque email d'alerte contient un lien de désinscription. Si vous estimez que vos droits ne sont pas respectés, vous pouvez
            adresser une réclamation à la{' '}
            <a className={linkClass} href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer">CNIL</a>.
          </p>
        </div>
      </ContentSection>
    </>
  )
}
