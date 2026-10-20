'use client'

import { useEffect, useState } from 'react'
import type { TocItem } from '@/lib/blog/posts'

// Sommaire « Sur cette page » : rendu côté serveur (liens d'ancre indexables),
// la section en cours de lecture est surlignée côté client.
export default function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => !!el)
    if (headings.length === 0) return

    const onScroll = () => {
      const offset = 140
      let current: string | null = null
      for (const h of headings) {
        if (h.getBoundingClientRect().top - offset <= 0) current = h.id
        else break
      }
      setActive(current)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [items])

  return (
    <nav aria-label="Sommaire de l'article">
      <p className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">Sur cette page</p>
      <ol className="space-y-0.5 border-l border-gray-200">
        {items.map((item) => {
          const isActive = item.id === active
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`-ml-px block border-l-2 py-1.5 pl-4 text-sm leading-snug transition ${
                  isActive
                    ? 'border-blue-500 font-medium text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                {item.text}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
