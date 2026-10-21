'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { track } from '@/lib/analytics'

// Google Analytics n'est chargé qu'après acceptation explicite (recommandations CNIL) :
// tant que le visiteur n'a pas choisi, ou s'il refuse, aucun cookie de mesure n'est déposé.

const GA_ID = 'G-E93XWNNZ16'
const CLE_CHOIX = 'mon-ao:consentement'
const EVENEMENT_GERER = 'mon-ao:gerer-cookies'
const TELECHARGEMENT = /\.(docx?|xlsx?|pdf)$/i

type Choix = 'accepte' | 'refuse' | null

function lireChoix(): Choix {
  try {
    const v = localStorage.getItem(CLE_CHOIX)
    return v === 'accepte' || v === 'refuse' ? v : null
  } catch {
    return null
  }
}

function supprimerCookiesGa() {
  const domaines = [location.hostname, `.${location.hostname.replace(/^www\./, '')}`]
  for (const cookie of document.cookie.split(';')) {
    const nom = cookie.split('=')[0].trim()
    if (!nom.startsWith('_ga')) continue
    document.cookie = `${nom}=; Max-Age=0; path=/`
    for (const d of domaines) document.cookie = `${nom}=; Max-Age=0; path=/; domain=${d}`
  }
}

/** Rouvre le bandeau de consentement (lien « Gérer les cookies » du footer). */
export function GererCookiesButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(EVENEMENT_GERER))}>
      Gérer les cookies
    </button>
  )
}

export default function Analytics() {
  const [choix, setChoix] = useState<Choix>(null)
  // Le choix est lu dans le navigateur : rien ne s'affiche avant, pour ne pas faire clignoter le bandeau
  const [pret, setPret] = useState(false)
  const [ouvert, setOuvert] = useState(false)

  useEffect(() => {
    const c = lireChoix()
    // Après un refus, on efface aussi les cookies que GA aurait réécrits avant le rechargement
    if (c === 'refuse') supprimerCookiesGa()
    setChoix(c)
    setOuvert(c === null)
    setPret(true)
    const gerer = () => setOuvert(true)
    window.addEventListener(EVENEMENT_GERER, gerer)
    return () => window.removeEventListener(EVENEMENT_GERER, gerer)
  }, [])

  // Clics vers vision et téléchargements des modèles, sur tout le site
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as Element | null)?.closest?.('a')
      if (!a?.href) return
      let url: URL
      try {
        url = new URL(a.href, location.href)
      } catch {
        return
      }
      if (url.hostname.endsWith('visionbtp.com')) {
        track('clic_vision', {
          lien: url.origin + url.pathname,
          campagne: url.searchParams.get('utm_campaign') ?? undefined,
          page: location.pathname,
        })
      } else if (url.origin === location.origin && TELECHARGEMENT.test(url.pathname)) {
        track('telechargement_modele', { fichier: url.pathname, page: location.pathname })
      }
    }
    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [])

  function choisir(c: 'accepte' | 'refuse') {
    try {
      localStorage.setItem(CLE_CHOIX, c)
    } catch {}
    const avant = choix
    setChoix(c)
    setOuvert(false)
    if (c === 'refuse' && avant === 'accepte') {
      // Retrait du consentement : on coupe GA, on efface ses cookies et on recharge sans le script
      Object.assign(window, { [`ga-disable-${GA_ID}`]: true })
      supprimerCookiesGa()
      location.reload()
    }
  }

  return (
    <>
      {choix === 'accepte' && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}

      {pret && ouvert && (
        <div className="no-print fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6 pointer-events-none">
          <div
            role="dialog"
            aria-labelledby="consentement-titre"
            className="pointer-events-auto mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-5 shadow-xl shadow-blue-900/10 sm:flex sm:items-center sm:gap-6"
          >
            <div className="text-sm text-gray-600 leading-relaxed">
              <p id="consentement-titre" className="font-semibold text-gray-900 mb-1">Mesure d'audience</p>
              <p>
                Avec votre accord, nous utilisons Google Analytics pour savoir quelles pages et quels outils vous sont utiles.
                Refuser ne change rien à l'usage du site.{' '}
                <Link href="/confidentialite#cookies" className="font-medium text-blue-600 hover:underline">En savoir plus</Link>
              </p>
            </div>
            <div className="mt-4 flex shrink-0 gap-2 sm:mt-0">
              <button type="button" onClick={() => choisir('refuse')} className="btn-sm flex-1 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50">
                Refuser
              </button>
              <button type="button" onClick={() => choisir('accepte')} className="btn-sm flex-1 text-white bg-blue-500 hover:bg-blue-600">
                Accepter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
