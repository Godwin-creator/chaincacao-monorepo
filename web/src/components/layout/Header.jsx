import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { label: 'Accueil',           to: '/',             end: true },
  { label: 'Comment ça marche', to: '/how-it-works', end: false },
  { label: 'Vérifier un lot',   to: '/verify',       end: false },
  { label: 'À propos',          to: '/about',        end: false },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const desktopLinkClass = ({ isActive }) =>
    `text-sm font-body transition-colors ${
      isActive ? 'text-chain-cyan font-semibold' : 'text-text-dark hover:text-chain-cyan'
    }`

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between gap-8">

        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src="/logo-chaincacao-sans-fond.png"
            alt="ChainCacao"
            className="h-8 w-auto"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          <span className="font-sans font-bold text-lg text-cacao-brown">ChainCacao</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
          {NAV_LINKS.map(({ label, to, end }) => (
            <NavLink key={to} to={to} end={end} className={desktopLinkClass}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-body font-medium border border-chain-cyan text-chain-cyan rounded-lg hover:bg-chain-cyan/5 transition-colors"
          >
            Se connecter
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 text-sm font-body font-semibold bg-chain-cyan text-white rounded-lg hover:bg-chain-cyan-light transition-colors"
          >
            Commencer
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 -mr-2 text-text-dark"
          aria-label="Ouvrir le menu"
        >
          <Menu size={24} />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-white flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100 shrink-0">
              <span className="font-sans font-bold text-lg text-cacao-brown">ChainCacao</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-text-dark"
                aria-label="Fermer le menu"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="flex flex-col p-6 gap-1">
              {NAV_LINKS.map(({ label, to, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3.5 rounded-xl text-base font-body transition-colors ${
                      isActive
                        ? 'bg-chain-cyan/10 text-chain-cyan font-semibold'
                        : 'text-text-dark hover:bg-gray-50'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto p-6 flex flex-col gap-3 border-t border-gray-100">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full py-3.5 text-center text-base font-body font-medium border border-chain-cyan text-chain-cyan rounded-xl"
              >
                Se connecter
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileOpen(false)}
                className="w-full py-3.5 text-center text-base font-sans font-semibold bg-chain-cyan text-white rounded-xl"
              >
                Commencer
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
