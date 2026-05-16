import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FileSearch, LayoutDashboard, LogOut, Menu, Shield, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import TeamAvatar from '../team/TeamAvatar'

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-body transition-colors ${
    isActive
      ? 'bg-chain-cyan text-white'
      : 'text-chain-cyan-light hover:bg-white/10'
  }`

function SidebarContent({ user, signOut, onLinkClick }) {
  const userName = user?.user_metadata?.full_name || user?.email || 'Vérificateur UE'

  return (
    <>
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chain-cyan/10 shrink-0">
            <Shield size={18} className="text-chain-cyan" />
          </div>
          <div>
            <h2 className="font-sans text-base font-bold text-white">ChainCacao</h2>
            <p className="mt-0.5 text-xs text-white/60">Espace Vérificateur UE</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <NavLink to="/verifier" end className={navLinkClass} onClick={onLinkClick}>
          <LayoutDashboard size={16} className="shrink-0" />
          Tableau de bord
        </NavLink>
        <NavLink to="/verifier/lot-inspection" className={navLinkClass} onClick={onLinkClick}>
          <FileSearch size={16} className="shrink-0" />
          Inspection de lot
        </NavLink>
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <div className="flex items-center gap-3 px-2 py-1">
          <TeamAvatar name={userName} size="sm" />
          <span className="text-chain-cyan-light text-sm font-body truncate">{userName}</span>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm font-body text-error hover:bg-error/10 rounded-lg transition-colors"
        >
          <LogOut size={15} />
          Déconnexion
        </button>
      </div>
    </>
  )
}

export default function VerifierLayout() {
  const { user, signOut } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-cream">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 bg-chain-bg flex-col shrink-0 sticky top-0 h-screen">
        <SidebarContent user={user} signOut={signOut} />
      </aside>

      {/* Overlay + drawer mobile */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 left-0 h-full z-50 w-64 bg-chain-bg flex flex-col md:hidden"
            >
              <div className="flex justify-end p-4 border-b border-white/10">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="text-chain-cyan-light hover:text-white transition-colors"
                  aria-label="Fermer le menu"
                >
                  <X size={20} />
                </button>
              </div>
              <SidebarContent
                user={user}
                signOut={signOut}
                onLinkClick={() => setDrawerOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barre mobile */}
        <div className="sticky top-0 z-30 md:hidden bg-chain-bg px-4 py-3 flex items-center gap-3 border-b border-white/10">
          <button
            onClick={() => setDrawerOpen(true)}
            className="text-chain-cyan-light hover:text-white transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu size={22} />
          </button>
          <h2 className="text-white font-sans font-bold">ChainCacao</h2>
        </div>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
