import Link from 'next/link'
import HeaderLogo from '@/components/ui/header-logo'
import { OUTILS } from '@/lib/outils/catalog'
import { CATEGORIES, categoryHref } from '@/lib/blog/config'

type MenuItem = { href: string; emoji: string; title: string; description: string }
type MenuLink = { href: string; label: string }

const MENUS: Record<string, { items: MenuItem[]; links: MenuLink[] }> = {
  outils: {
    items: OUTILS.map((o) => ({ href: o.href, emoji: o.emoji, title: o.title, description: o.description })),
    links: [{ href: '/indices', label: 'Index BT et TP' }],
  },
  blog: {
    items: Object.keys(CATEGORIES).map((key) => ({
      href: categoryHref(key),
      emoji: CATEGORIES[key].emoji,
      title: CATEGORIES[key].label,
      description: CATEGORIES[key].description,
    })),
    links: [],
  },
}

const NAV: { label: string; href: string; menu?: keyof typeof MENUS; allLabel?: string }[] = [
  { label: 'Travaux', href: '/travaux' },
  { label: 'Services', href: '/services' },
  { label: 'Fournitures', href: '/fournitures' },
  { label: 'Outils gratuits', href: '/outils', menu: 'outils', allLabel: 'Tous les outils' },
  { label: 'Blog', href: '/blog', menu: 'blog', allLabel: 'Tous les articles' },
]

const navLinkClass = 'text-sm font-medium text-gray-600 hover:text-blue-500 px-3 py-2 rounded-lg transition'

// Menu déroulant CSS (survol + focus clavier), sans JavaScript
function DropdownMenu({ label, href, items, links, allLabel }: {
  label: string
  href: string
  items: MenuItem[]
  links: MenuLink[]
  allLabel: string
}) {
  return (
    <li className="relative group">
      <Link className={`${navLinkClass} inline-flex items-center gap-1`} href={href} aria-haspopup="true">
        {label}
        <svg className="w-3 h-3 fill-current transition group-hover:rotate-180 group-focus-within:rotate-180" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M10.28 4.305 6 8.585l-4.28-4.28.707-.707L6 7.17l3.573-3.572z" />
        </svg>
      </Link>
      <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 transition duration-150 absolute left-0 top-full pt-2 z-40">
        <div className={`${items.length > 4 ? 'w-[44rem]' : 'w-[24rem]'} rounded-2xl border border-gray-200 bg-white p-2 shadow-xl shadow-blue-900/10`}>
          <ul className={items.length > 4 ? 'grid grid-cols-2' : undefined}>
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="group/item flex gap-3 rounded-xl p-3 transition hover:bg-blue-50">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-lg group-hover/item:bg-white" aria-hidden="true">
                    {item.emoji}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-gray-900 group-hover/item:text-blue-600">{item.title}</span>
                    <span className="block text-xs text-gray-500 leading-snug mt-0.5">{item.description}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-1 flex justify-between border-t border-gray-100 pt-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-blue-600">
                {l.label}
              </Link>
            ))}
            <Link href={href} className="ml-auto rounded-xl px-3 py-2.5 text-right text-sm font-semibold text-blue-600 transition hover:bg-blue-50">
              {allLabel} →
            </Link>
          </div>
        </div>
      </div>
    </li>
  )
}

export default function Header() {
  return (
    <header className="absolute w-full z-30">
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Branding */}
          <div className="shrink-0 mr-4">
            <HeaderLogo />
          </div>

          {/* Desktop nav */}
          <nav className="flex grow">
            <ul className="hidden md:flex grow items-center gap-1">
              {NAV.map((item) =>
                item.menu ? (
                  <DropdownMenu
                    key={item.href}
                    label={item.label}
                    href={item.href}
                    items={MENUS[item.menu].items}
                    links={MENUS[item.menu].links}
                    allLabel={item.allLabel ?? 'Tout voir'}
                  />
                ) : (
                  <li key={item.href}>
                    <Link className={navLinkClass} href={item.href}>
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>

            <ul className="flex grow justify-end items-center gap-1">
              <li className="md:hidden">
                <Link className={navLinkClass} href="/outils">
                  Outils
                </Link>
              </li>
              <li className="md:hidden">
                <Link
                  className="text-sm font-medium text-gray-600 hover:text-blue-500 px-3 py-2 rounded-lg transition"
                  href="/blog"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  className="btn-sm text-white bg-blue-500 hover:bg-blue-600 shadow-xs"
                  href="/"
                >
                  Tous les marchés
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}
