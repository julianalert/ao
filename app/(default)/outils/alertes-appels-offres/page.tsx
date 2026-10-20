export const revalidate = 3600

import type { Metadata } from 'next'
import Link from 'next/link'
import { getTopCategories } from '@/lib/getAppelsOffre'
import { getSupabase } from '@/lib/supabase'
import { CORPS_ETAT } from '@/lib/alertes/corps-etat'
import { CRITERES_VIDES, MAX_ALERTES_PAR_ABONNE } from '@/lib/alertes/criteres'
import { chercherAos } from '@/lib/alertes/matching'
import { getOutil } from '@/lib/outils/catalog'
import { AUTEUR } from '@/lib/outils/author'
import { ToolJsonLd } from '@/components/json-ld'
import { Accent, ContentSection, Faq, GuidePart, ToolFooter, ToolIntro, ToolShell, UpdatedAt, type FaqItem } from '@/components/outils/sections'
import AlerteForm from './alerte-form'

const OUTIL = getOutil('alertes-appels-offres')
const UPDATED = '2026-10-20'

export const metadata: Metadata = {
  title: { absolute: 'Alerte appels d\'offres gratuite : les AO de votre métier chaque matin par email | mon-ao.com' },
  description:
    'Créez une alerte gratuite et recevez chaque matin les nouveaux appels d\'offres de votre métier et de votre zone : corps d\'état BTP, codes CPV, départements, montant, mots-clés.',
  alternates: { canonical: OUTIL.href },
}

const FAQ: FaqItem[] = [
  {
    q: 'L\'alerte est-elle vraiment gratuite ?',
    a: 'Oui, sans abonnement ni compte : une adresse email suffit. Vous confirmez votre adresse une fois, puis vous recevez les AO correspondant à vos critères. Chaque email contient un lien de désinscription en un clic et un lien pour modifier vos alertes.',
  },
  {
    q: 'Quelles sources sont couvertes ?',
    a: 'Les avis publiés au BOAMP, le bulletin officiel des annonces des marchés publics, qui reprend les avis des procédures formalisées et les MAPA publiés au BOAMP. Les marchés passés sans publicité et les avis publiés uniquement dans la presse locale ou sur un profil d\'acheteur n\'y figurent pas : pour ceux-là, la connaissance des acheteurs de votre zone reste indispensable.',
  },
  {
    q: 'Combien d\'alertes puis-je créer ?',
    a: `Jusqu'à ${MAX_ALERTES_PAR_ABONNE} alertes par adresse email, par exemple une par métier ou par zone. Elles sont regroupées dans un seul email par jour, pour ne pas encombrer votre boîte.`,
  },
  {
    q: 'Comment trouver mon code CPV ?',
    a: 'Inutile de le connaître : tapez votre métier en langage courant (plomberie, désamiantage, voirie…) et l\'outil propose les catégories correspondantes. Si vous connaissez un code CPV, saisissez ses premiers chiffres : 4533 couvre par exemple tous les travaux de plomberie, chauffage et ventilation de la division 45.',
  },
  {
    q: 'Puis-je être prévenu avant la date limite d\'un AO ?',
    a: 'Oui : sur la fiche d\'un appel d\'offres, cliquez sur « Suivre cet AO ». Vous recevez un rappel 7 jours puis 2 jours avant la date limite de réponse.',
  },
]

export default async function AlertesPage() {
  const cats = await getTopCategories(400)
  const categories = cats.map((c) => ({ slug: c.categorie, label: c.categorie_label, count: c.count }))

  // Exemple réel : plomberie, chauffage, ventilation dans le Rhône sur 30 jours
  const cvc = CORPS_ETAT.find((g) => g.slug === 'cvc-plomberie')!
  const sb = getSupabase()
  const exemple = sb
    ? await chercherAos(sb, { ...CRITERES_VIDES, categories: cvc.categories, departements: ['69'] }, new Date(Date.now() - 30 * 86400000).toISOString(), 3)
    : null

  return (
    <>
      <ToolJsonLd
        name={OUTIL.title}
        description={OUTIL.description}
        path={OUTIL.href}
        dateModified={UPDATED}
        faq={FAQ}
        author={{ name: AUTEUR.nom, url: AUTEUR.aProposHref }}
      />

      <ToolShell
        breadcrumb={[
          { name: 'Accueil', href: '/' },
          { name: 'Outils gratuits', href: '/outils' },
          { name: 'Alertes appels d\'offres', href: OUTIL.href },
        ]}
      >
        <AlerteForm
          categories={categories}
          intro={
            <ToolIntro
              title={<>Les appels d'offres de votre métier, <Accent>chaque matin</Accent> par email</>}
              promise="Choisissez votre corps d'état et votre zone : vous recevez chaque matin les nouveaux AO qui vous concernent, avec la date limite, le montant et un lien pour analyser le règlement de consultation."
              checks={['Gratuit, sans compte', 'Corps d\'état BTP et codes CPV', 'Désinscription en un clic']}
            />
          }
        />
      </ToolShell>

      <ContentSection id="guide" eyebrow="Le guide" title="Une veille appels d'offres qui tient en 5 minutes par jour" muted>
        <GuidePart n={1} title="Comment ça marche">
          <p>
            Chaque matin, mon-ao.com importe les nouveaux avis publiés au BOAMP. Juste après, chaque alerte est comparée aux avis du
            jour : métier (catégories ou codes CPV), zone, fourchette de montant, mots-clés et procédure. Si au moins un avis
            correspond, vous recevez un seul email récapitulatif.
          </p>
          <p>
            Chaque AO de l'email renvoie vers sa fiche sur mon-ao.com et vers l'analyseur de règlement de consultation. Depuis
            n'importe quelle fiche, « Suivre cet AO » programme un rappel 7 jours et 2 jours avant la date limite.
          </p>
        </GuidePart>

        {exemple && (
          <GuidePart n={2} title="Exemple : un plombier chauffagiste dans le Rhône">
            <p>
              Une alerte « Plomberie, chauffage, ventilation » limitée au Rhône aurait remonté{' '}
              <strong className="text-gray-800">{exemple.total} appels d'offres</strong> sur les 30 derniers jours
              {exemple.items.length > 0 && <>, dont :</>}
            </p>
            {exemple.items.length > 0 && (
              <ul className="list-disc pl-5 space-y-1">
                {exemple.items.map((ao) => (
                  <li key={ao.id}><Link href={ao.href} className="text-blue-600 hover:underline">{ao.titre}</Link></li>
                ))}
              </ul>
            )}
            <p>Ces chiffres sont recalculés chaque heure sur les avis réellement publiés.</p>
          </GuidePart>
        )}

        <GuidePart n={exemple ? 3 : 2} title="Bien régler son alerte">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-gray-800">Partez large sur le métier, serrez sur la zone</strong> : un avis mal classé vaut mieux qu'un avis manqué, mais un chantier à 300 km rarement.</li>
            <li><strong className="text-gray-800">Excluez les faux positifs</strong> récurrents avec les mots exclus, par exemple « fourniture » si vous ne posez que.</li>
            <li><strong className="text-gray-800">Laissez le montant vide au début</strong> : trois avis sur quatre n'indiquent pas de montant estimé, ils restent inclus de toute façon.</li>
            <li><strong className="text-gray-800">Une alerte par métier</strong> si vous en couvrez plusieurs : le récapitulatif reste lisible.</li>
          </ul>
        </GuidePart>

        <GuidePart n={exemple ? 4 : 3} title="Sources et données personnelles">
          <p>
            Les avis proviennent des données ouvertes du BOAMP, diffusées par la DILA sous licence ouverte. Votre adresse email sert
            à l'envoi de vos alertes et rappels ; elle n'est ni vendue ni cédée. mon-ao.com est propulsé par VisionBTP, qui peut
            vous écrire ponctuellement au sujet de ses services pour les entreprises du bâtiment. Vous pouvez supprimer vos alertes et
            vous désinscrire à tout moment, en un clic, depuis chaque email.
          </p>
          <p>
            <Link href="/alertes/gerer" className="font-medium text-blue-600 hover:underline">Gérer mes alertes existantes →</Link>
          </p>
        </GuidePart>
      </ContentSection>

      <ContentSection id="faq" eyebrow="Questions fréquentes" title="Vos questions sur les alertes">
        <Faq items={FAQ} />
      </ContentSection>

      <ToolFooter
        current={OUTIL.slug}
        updated={
          <UpdatedAt
            date={UPDATED}
            note="avis importés chaque matin"
            sources={[{ label: 'BOAMP, données ouvertes (DILA)', href: 'https://www.boamp.fr' }]}
          />
        }
      />
    </>
  )
}
