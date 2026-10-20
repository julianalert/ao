'use client'

import { useState } from 'react'

const btnClass =
  'btn-sm gap-2 bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600 shadow-xs'

export function CopyButton({ getText, label = 'Copier' }: { getText: () => string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    const text = getText()
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button type="button" onClick={copy} className={btnClass}>
      <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M11 0H3a1 1 0 0 0-1 1v11h2V2h7V0Zm3 4H7a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1Zm-1 10H8V6h5v8Z" />
      </svg>
      {copied ? 'Copié !' : label}
    </button>
  )
}

/**
 * Imprime un bloc de la page dans une iframe isolée, avec les styles du site :
 * l'utilisateur choisit « Enregistrer au format PDF » dans la boîte d'impression.
 */
export function PrintButton({ targetId, title, label = 'Télécharger PDF' }: { targetId: string; title: string; label?: string }) {
  async function print() {
    const el = document.getElementById(targetId)
    if (!el) return
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((n) => n.outerHTML)
      .join('')
    const today = new Intl.DateTimeFormat('fr-FR').format(new Date())
    const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${title}</title>${styles}
      <style>@page{margin:14mm}body{background:#fff}.no-print{display:none!important}</style></head>
      <body class="${document.body.className}">
        <div style="display:flex;justify-content:space-between;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;padding-bottom:8px;margin-bottom:20px">
          <span><strong style="color:#1f2937">mon-ao.com</strong> · ${title}</span><span>Édité le ${today}</span>
        </div>
        ${el.outerHTML}
        <p style="margin-top:24px;font-size:11px;color:#9ca3af">Calcul indicatif réalisé avec l'outil gratuit ${window.location.href.split('?')[0]}. Il ne remplace pas les stipulations de votre marché.</p>
      </body></html>`

    const iframe = document.createElement('iframe')
    iframe.setAttribute('aria-hidden', 'true')
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
    document.body.appendChild(iframe)
    const doc = iframe.contentDocument
    const win = iframe.contentWindow
    if (!doc || !win) return iframe.remove()
    doc.open()
    doc.write(html)
    doc.close()

    const links = Array.from(doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
    await Promise.all(
      links.map((l) => (l.sheet ? null : new Promise((r) => { l.addEventListener('load', r); l.addEventListener('error', r) }))),
    )
    await doc.fonts?.ready
    win.focus()
    win.print()
    setTimeout(() => iframe.remove(), 1000)
  }

  return (
    <button type="button" onClick={print} className={btnClass}>
      <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M9 0H7v8.6L4.7 6.3 3.3 7.7 8 12.4l4.7-4.7-1.4-1.4L9 8.6V0ZM1 14h14v2H1v-2Z" />
      </svg>
      {label}
    </button>
  )
}
