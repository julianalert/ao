'use client'

import { useEffect, useState } from 'react'

// Barre de progression de lecture, calée sur l'élément #article-body
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const target = document.getElementById('article-body')
    if (!target) return

    const onScroll = () => {
      const rect = target.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const read = Math.min(Math.max(-rect.top / (total > 0 ? total : 1), 0), 1)
      setProgress(read)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div className="fixed inset-x-0 top-0 z-40 h-1 bg-transparent" aria-hidden="true">
      <div
        className="h-full origin-left bg-blue-500 transition-transform duration-75"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  )
}
