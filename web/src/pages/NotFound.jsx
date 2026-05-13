import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-cream gap-4">
      <span className="text-6xl font-sans font-bold text-chain-cyan">404</span>
      <h1 className="text-2xl font-sans font-bold text-cacao-brown">Page introuvable</h1>
      <p className="text-chain-cyan font-body text-sm">La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <Link to="/" className="mt-4 px-6 py-2 bg-chain-cyan text-white font-body rounded-lg hover:bg-chain-cyan-light transition-colors">
        Retour à l'accueil
      </Link>
    </main>
  )
}
