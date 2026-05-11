import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const navLinkClass = ({ isActive }) =>
  `block px-4 py-2 rounded-lg text-sm font-body transition-colors ${
    isActive
      ? 'bg-chain-cyan text-white'
      : 'text-chain-cyan-light hover:bg-white/10'
  }`

export default function ProcessorLayout() {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen flex bg-cream">
      <aside className="w-64 bg-chain-bg flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-chain-cyan font-sans font-bold text-lg">ChainCacao</h2>
          <p className="text-chain-cyan-light text-xs mt-1">Espace Transformateur</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavLink to="/processor" end className={navLinkClass}>Tableau de bord</NavLink>
          <NavLink to="/processor/quality-entry" className={navLinkClass}>Saisie qualité</NavLink>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={signOut}
            className="w-full px-4 py-2 text-sm font-body text-error hover:bg-error/10 rounded-lg transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
