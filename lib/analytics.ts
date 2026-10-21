// Événements GA4. gtag n'est chargé qu'après acceptation des cookies de mesure
// (components/analytics.tsx) : sans consentement, l'appel ne fait rien.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

export function track(event: string, params: Record<string, string | number | undefined> = {}): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', event, params)
}
