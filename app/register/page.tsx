import { registerUser } from "@/app/actions/auth"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-zinc-900 tracking-tight font-sans">
          Créer un compte
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600">
          Vous avez déjà un accès ?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Connectez-vous ici
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-zinc-200">
          <form className="space-y-6" action={registerUser}>
            <div>
              <label className="block text-sm font-medium text-zinc-700">Nom Complet</label>
              <div className="mt-1">
                <input
                  name="name"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150"
                  placeholder="Jean Dupont"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">Adresse Email</label>
              <div className="mt-1">
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150"
                  placeholder="jean.dupont@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">Type de Compte</label>
              <div className="mt-1">
                <select
                  name="role"
                  defaultValue="PATIENT"
                  className="block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                >
                  <option value="PATIENT">Espace Patient</option>
                  <option value="DOCTOR">Prestataire Médical</option>
                </select>
                <p className="mt-2 text-xs text-zinc-500">
                    *Dans un environnement de production, les accès médecins feraient l'objet d'une validation KMS.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">Mot de passe sécurisé</label>
              <div className="mt-1">
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="appearance-none block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
              >
                Créer l'Espace Sécurisé
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
