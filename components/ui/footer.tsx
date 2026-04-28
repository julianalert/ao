import Link from 'next/link'

export default function Footer() {
  return (
    <footer>
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-8">
        <div className="py-8 md:py-12">
          {/* Top area */}
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between mb-4 md:mb-6">
            <div className="shrink-0 mr-4">
              {/* Logo */}
              <Link className="inline-flex group mb-8 md:mb-0" href="/" aria-label="Annuaire Marchés Publics">
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#6366f1" d="M13.853 18.14 1 10.643 31 1l-.019.058z" />
                  <path fill="#a5b4fc" d="M13.853 18.14 30.981 1.058 21.357 31l-7.5-12.857z" />
                </svg>
              </Link>
            </div>
            {/* Social links */}
            <div className="flex items-center space-x-4 mb-4 md:order-2 md:ml-4 md:mb-0">
              <div className="text-xl font-nycd text-indigo-500">Suivez-nous</div>
              <ul className="inline-flex space-x-3">
                <li>
                  <a
                    className="flex justify-center items-center text-indigo-500 bg-indigo-100 hover:text-white hover:bg-indigo-500 rounded-full transition duration-150 ease-in-out"
                    href="#0"
                    aria-label="Twitter / X"
                  >
                    <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                      <path d="m13.063 9 3.495 4.475L20.601 9h2.454l-5.359 5.931L24 23h-4.938l-3.866-4.893L10.771 23H8.316l5.735-6.342L8 9h5.063Zm-.74 1.347h-1.457l8.875 11.232h1.36l-8.778-11.232Z" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a
                    className="flex justify-center items-center text-indigo-500 bg-indigo-100 hover:text-white hover:bg-indigo-500 rounded-full transition duration-150 ease-in-out"
                    href="#0"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23.3 8H8.7c-.4 0-.7.3-.7.7v14.7c0 .3.3.6.7.6h14.7c.4 0 .7-.3.7-.7V8.7c-.1-.4-.4-.7-.8-.7zM12.7 21.6h-2.3V14h2.4v7.6h-.1zM11.6 13c-.8 0-1.4-.7-1.4-1.4 0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4-.1.7-.7 1.4-1.4 1.4zm10 8.6h-2.4v-3.7c0-.9 0-2-1.2-2s-1.4 1-1.4 2v3.8h-2.4V14h2.3v1c.3-.6 1.1-1.2 2.2-1.2 2.4 0 2.8 1.6 2.8 3.6v4.2h.1z" />
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom area */}
          <div className="text-center md:flex md:items-center md:justify-between">
            {/* Left links */}
            <div className="text-sm font-medium md:order-1 mb-2 md:mb-0">
              <ul className="inline-flex flex-wrap text-sm font-medium">
                <li className="after:content-['·'] last:after:hidden after:text-gray-400 after:px-2">
                  <a className="text-gray-500 hover:text-gray-500 hover:underline" href="#0">
                    Mentions légales
                  </a>
                </li>
                <li className="after:content-['·'] last:after:hidden after:text-gray-400 after:px-2">
                  <a className="text-gray-500 hover:text-gray-500 hover:underline" href="#0">
                    Politique de confidentialité
                  </a>
                </li>
                <li className="after:content-['·'] last:after:hidden after:text-gray-400 after:px-2">
                  <Link className="text-gray-500 hover:text-gray-500 hover:underline" href="/travaux">
                    Marchés travaux
                  </Link>
                </li>
                <li className="after:content-['·'] last:after:hidden after:text-gray-400 after:px-2">
                  <Link className="text-gray-500 hover:text-gray-500 hover:underline" href="/services">
                    Marchés services
                  </Link>
                </li>
                <li className="after:content-['·'] last:after:hidden after:text-gray-400 after:px-2">
                  <Link className="text-gray-500 hover:text-gray-500 hover:underline" href="/fournitures">
                    Marchés fournitures
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Annuaire Marchés Publics — Données issues du{' '}
              <a className="hover:underline" href="https://www.boamp.fr" target="_blank" rel="noopener noreferrer">BOAMP</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
