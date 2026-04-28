export default function Testimonials() {
  return (
    <div>
      <h2 className="text-3xl font-bold font-inter mb-10">Ils nous font confiance</h2>
      {/* Testimonials container */}
      <div className="space-y-10">
        {/* Item */}
        <div className="p-5 rounded-xl bg-teal-50 border border-teal-200 odd:rotate-1 even:-rotate-1 hover:rotate-0 transition duration-150 ease-in-out">
          <div className="flex items-center space-x-5">
            <div className="relative shrink-0">
              <div className="w-[102px] h-[102px] rounded-full bg-teal-200 flex items-center justify-center text-teal-700 font-bold text-2xl">PM</div>
              <svg className="absolute top-0 right-0 fill-indigo-400" width={26} height={17} xmlns="http://www.w3.org/2000/svg">
                <path d="M0 16.026h8.092l6.888-16h-4.592L0 16.026Zm11.02 0h8.092L26 .026h-4.65l-10.33 16Z" />
              </svg>
            </div>
            <figure>
              <blockquote className="text-lg font-bold m-0 pb-1">
                <p>Grâce à l'annuaire, nous détectons les appels d'offre de notre secteur en quelques secondes. Un gain de temps considérable pour nos équipes commerciales.</p>
              </blockquote>
              <figcaption className="text-sm font-medium">
                Pierre Metzger, Directeur commercial{' '}
                <a className="text-teal-500 hover:underline" href="#0">
                  BTP Solutions
                </a>
              </figcaption>
            </figure>
          </div>
        </div>
        {/* Item */}
        <div className="p-5 rounded-xl bg-sky-50 border border-sky-200 odd:rotate-1 even:-rotate-1 hover:rotate-0 transition duration-150 ease-in-out">
          <div className="flex items-center space-x-5">
            <div className="relative shrink-0">
              <div className="w-[102px] h-[102px] rounded-full bg-sky-200 flex items-center justify-center text-sky-700 font-bold text-2xl">AC</div>
              <svg className="absolute top-0 right-0 fill-indigo-400" width={26} height={17} xmlns="http://www.w3.org/2000/svg">
                <path d="M0 16.026h8.092l6.888-16h-4.592L0 16.026Zm11.02 0h8.092L26 .026h-4.65l-10.33 16Z" />
              </svg>
            </div>
            <figure>
              <blockquote className="text-lg font-bold m-0 pb-1">
                <p>L'agrégation des données BOAMP en un seul endroit, avec le filtrage par région et secteur, nous évite de consulter plusieurs sources. Indispensable.</p>
              </blockquote>
              <figcaption className="text-sm font-medium">
                Anne Courtois, Responsable marchés{' '}
                <a className="text-sky-500 hover:underline" href="#0">
                  Ingénierie Publique
                </a>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </div>
  )
}
