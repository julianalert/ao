import Link from 'next/link'
import HeaderLogo from '@/components/ui/header-logo'

const NAV = [
  { label: 'Travaux', href: '/travaux' },
  { label: 'Services', href: '/services' },
  { label: 'Fournitures', href: '/fournitures' },
]

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
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    className="text-sm font-medium text-gray-600 hover:text-indigo-500 px-3 py-2 rounded-lg transition"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <ul className="flex grow justify-end items-center">
              <li>
                <Link
                  className="btn-sm text-white bg-indigo-500 hover:bg-indigo-600 shadow-xs"
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
