import fs from 'fs'
import path from 'path'
import { cache } from 'react'
import matter from 'gray-matter'
import { AUTHORS, CATEGORIES, POSTS_PER_PAGE, categoryHref, type Author } from './config'

const POSTS_DIR = path.join(process.cwd(), 'content', 'blog')
const WORDS_PER_MINUTE = 220

export type FaqItem = { q: string; a: string }
export type Source = { label: string; url: string }
export type TocItem = { id: string; text: string }

export type PostFrontmatter = {
  title: string            // H1
  seoTitle?: string        // <title> (≤ 60 caractères)
  description: string      // meta description + chapeau
  excerpt?: string         // texte des cartes (sinon description)
  publishedAt: string      // YYYY-MM-DD
  updatedAt?: string       // YYYY-MM-DD
  author: string           // clé de AUTHORS
  category: string         // clé de CATEGORIES
  cover: string
  coverAlt: string
  keywords?: string[]
  aoCategory?: string      // catégorie mon-ao pour le bloc « Appels d'offres en cours »
  aoGuide?: boolean        // mis en avant sur les fiches AO travaux
  download?: { label: string; href: string; description?: string }
  faq?: FaqItem[]
  sources?: Source[]
  order?: number           // départage les articles publiés le même jour (plus grand = plus récent)
  draft?: boolean
}

export type PostMeta = PostFrontmatter & {
  slug: string
  href: string
  updatedAt: string
  authorData: Author
  categoryLabel: string
  categoryHref: string
  readingTime: number
  wordCount: number
}

// ─── Lecture des fichiers ─────────────────────────────────────────────────────

function readPostFile(slug: string): { meta: PostMeta; body: string } | null {
  const file = path.join(POSTS_DIR, `${slug}.mdx`)
  if (!fs.existsSync(file)) return null

  const { data, content } = matter(fs.readFileSync(file, 'utf8'))
  const fm = data as PostFrontmatter

  const author = AUTHORS[fm.author]
  if (!author) throw new Error(`Article ${slug} : auteur inconnu « ${fm.author} »`)
  const category = CATEGORIES[fm.category]
  if (!category) throw new Error(`Article ${slug} : pilier inconnu « ${fm.category} »`)

  const wordCount = countWords(content) + countWords((fm.faq ?? []).map((f) => `${f.q} ${f.a}`).join(' '))

  return {
    body: content,
    meta: {
      ...fm,
      slug,
      href: `/blog/${slug}`,
      updatedAt: fm.updatedAt ?? fm.publishedAt,
      authorData: author,
      categoryLabel: category.label,
      categoryHref: categoryHref(fm.category),
      wordCount,
      readingTime: Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE)),
    },
  }
}

function countWords(text: string): number {
  return text
    .replace(/<[^>]+>/g, ' ')           // composants MDX
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // liens markdown
    .split(/\s+/)
    .filter((w) => /[a-z0-9À-ÿœ]/i.test(w)).length
}

function isPublished(meta: PostMeta): boolean {
  return !meta.draft
}

export const getAllPosts = cache((): PostMeta[] => {
  if (!fs.existsSync(POSTS_DIR)) return []
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => readPostFile(f.replace(/\.mdx$/, ''))?.meta)
    .filter((m): m is PostMeta => !!m && isPublished(m))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || (b.order ?? 0) - (a.order ?? 0))
})

export const getPost = cache((slug: string) => {
  const post = readPostFile(slug)
  if (!post || !isPublished(post.meta)) return null
  return post
})

export function getBlogPageCount(): number {
  return Math.max(1, Math.ceil(getAllPosts().length / POSTS_PER_PAGE))
}

export function getPostsPage(page: number): PostMeta[] {
  return getAllPosts().slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)
}

export function getPostsByAuthor(authorSlug: string): PostMeta[] {
  return getAllPosts().filter((p) => p.author === authorSlug)
}

export function getPostsByCategory(categoryKey: string): PostMeta[] {
  return getAllPosts().filter((p) => p.category === categoryKey)
}

// Articles du même pilier d'abord, puis les plus récents
export function getRelatedPosts(post: PostMeta, limit = 3): PostMeta[] {
  const others = getAllPosts().filter((p) => p.slug !== post.slug)
  const same = others.filter((p) => p.category === post.category)
  const rest = others.filter((p) => p.category !== post.category)
  return [...same, ...rest].slice(0, limit)
}

// ─── Ancres des titres ────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

type MdNode = {
  type: string
  depth?: number
  value?: string
  children?: MdNode[]
  data?: { hProperties?: Record<string, unknown> } & Record<string, unknown>
}

function nodeText(node: MdNode): string {
  if (typeof node.value === 'string') return node.value
  return (node.children ?? []).map(nodeText).join('')
}

/**
 * Plugin remark : ajoute un id ASCII stable à chaque h2/h3 et collecte les h2
 * dans `toc` pour le sommaire « Sur cette page ».
 */
export function remarkHeadingIds(toc: TocItem[], reserved: string[] = []) {
  return () => (tree: MdNode) => {
    const used = new Set<string>(reserved)
    const walk = (node: MdNode) => {
      if (node.type === 'heading' && (node.depth === 2 || node.depth === 3)) {
        const text = nodeText(node).trim()
        let id = slugify(text) || 'section'
        let n = 2
        while (used.has(id)) id = `${slugify(text)}-${n++}`
        used.add(id)
        node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id } }
        if (node.depth === 2) toc.push({ id, text })
      }
      node.children?.forEach(walk)
    }
    walk(tree)
  }
}
