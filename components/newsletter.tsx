export default function Newsletter() {
  return (
    <div className="relative text-center px-4 py-6 group">
      <div
        className="absolute inset-0 rounded-xl bg-gray-50 border border-gray-200 -rotate-1 group-hover:rotate-0 transition duration-150 ease-in-out -z-10"
        aria-hidden="true"
      />
      <div className="font-nycd text-xl text-blue-500 mb-1">Ne ratez aucun appel d'offre</div>
      <div className="text-2xl font-bold mb-5">Recevez les nouveaux marchés publics chaque semaine.</div>
      <form className="inline-flex max-w-sm">
        <div className="flex flex-col sm:flex-row justify-center max-w-xs mx-auto sm:max-w-none">
          <input type="email" className="form-input py-1.5 w-full mb-2 sm:mb-0 sm:mr-2" placeholder="Votre e-mail" aria-label="Votre e-mail" />
          <button className="btn-sm text-white bg-blue-500 hover:bg-blue-600 shadow-xs whitespace-nowrap" type="submit">
            S'abonner
          </button>
        </div>
      </form>
    </div>
  )
}
