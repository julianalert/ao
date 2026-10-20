import Link from 'next/link'
import { getAllPosts } from '@/lib/blog/posts'

// Encart « Bien répondre à cet appel d'offres » sur les fiches AO :
// pointe vers les articles marqués `aoGuide: true` dans leur frontmatter.
export default function AoGuides() {
  const guides = getAllPosts().filter((p) => p.aoGuide).slice(0, 3)
  if (guides.length === 0) return null

  return (
    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-5">
      <p className="mb-3 text-sm font-bold text-gray-900">Bien répondre à cet appel d'offres</p>
      <ul className="space-y-3">
        {guides.map((post) => (
          <li key={post.slug}>
            <Link href={post.href} className="group block">
              <span className="block text-sm font-medium leading-snug text-blue-700 group-hover:underline">
                {post.title}
              </span>
              <span className="mt-0.5 block text-xs text-gray-500">{post.readingTime} min de lecture</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
