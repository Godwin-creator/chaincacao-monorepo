import { Link } from 'react-router-dom'

export default function Unauthorized() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-cream gap-4">
      <span className="text-6xl font-sans font-bold text-error">403</span>
      <h1 className="text-2xl font-sans font-bold text-cacao-brown">Accès non autorisé</h1>
      <p className="text-chain-cyan font-body text-sm">Vous n'avez pas les droits nécessaires pour accéder à cette page.</p>
      <Link to="/" className="mt-4 px-6 py-2 bg-chain-cyan text-white font-body rounded-lg hover:bg-chain-cyan-light transition-colors">
        Retour à l'accueil
      </Link>
    </main>
  )
}
