import Link from 'next/link'

export default function HeaderLogo() {
  return (
    <Link className="group inline-flex items-center gap-2" href="/" aria-label="mon-ao.com, accueil">
      <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path className="fill-blue-600" d="M13.853 18.14 1 10.643 31 1l-.019.058z" />
        <path className="fill-blue-300" d="M13.853 18.14 30.981 1.058 21.357 31l-7.5-12.857z" />
      </svg>
      <span className="hidden sm:inline md:hidden lg:inline text-lg font-extrabold tracking-tight text-gray-900">mon-ao.com</span>
    </Link>
  )
}
