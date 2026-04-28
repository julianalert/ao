import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #e0e7ff 0%, #f8faff 60%, #ffffff 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Logo mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
          <svg width="48" height="48" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path fill="#6366f1" d="M13.853 18.14 1 10.643 31 1l-.019.058z" />
            <path fill="#a5b4fc" d="M13.853 18.14 30.981 1.058 21.357 31l-7.5-12.857z" />
          </svg>
          <span style={{ fontSize: 22, fontWeight: 600, color: '#6366f1' }}>
            Annuaire Marchés Publics
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: '#1e1b4b',
            lineHeight: 1.15,
            maxWidth: 840,
            marginBottom: 28,
          }}
        >
          Trouvez les marchés publics qui vous correspondent
        </div>

        {/* Sub-headline */}
        <div
          style={{
            fontSize: 24,
            color: '#6b7280',
            maxWidth: 700,
            lineHeight: 1.5,
            marginBottom: 48,
          }}
        >
          Appels d'offre mis à jour quotidiennement depuis le BOAMP — filtrables par catégorie, région et type.
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {['Travaux', 'Services', 'Fournitures'].map((label) => (
            <div
              key={label}
              style={{
                background: '#ede9fe',
                color: '#4338ca',
                borderRadius: 8,
                padding: '8px 18px',
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
