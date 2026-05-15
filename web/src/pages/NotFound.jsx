import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'

function Illustration404() {
  return (
    <svg
      viewBox="0 0 240 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-52 h-44"
      aria-hidden="true"
    >
      {/* Feuille de cacao stylisée */}
      <ellipse cx="120" cy="100" rx="64" ry="88" transform="rotate(-15 120 100)" fill="#00BCD4" opacity="0.08" />
      <ellipse cx="120" cy="100" rx="50" ry="70" transform="rotate(-15 120 100)" fill="#00BCD4" opacity="0.07" />
      {/* Nervure centrale */}
      <line x1="120" y1="25" x2="120" y2="175" stroke="#00BCD4" strokeWidth="2" strokeLinecap="round" opacity="0.25" />
      {/* Nervures secondaires */}
      <line x1="120" y1="70"  x2="88"  y2="92"  stroke="#00BCD4" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
      <line x1="120" y1="70"  x2="152" y2="92"  stroke="#00BCD4" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
      <line x1="120" y1="105" x2="82"  y2="122" stroke="#00BCD4" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
      <line x1="120" y1="105" x2="158" y2="122" stroke="#00BCD4" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
      <line x1="120" y1="135" x2="90"  y2="148" stroke="#00BCD4" strokeWidth="1.5" strokeLinecap="round" opacity="0.15" />
      <line x1="120" y1="135" x2="150" y2="148" stroke="#00BCD4" strokeWidth="1.5" strokeLinecap="round" opacity="0.15" />
      {/* Texte 404 */}
      <text
        x="120"
        y="112"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="38"
        fontWeight="700"
        fill="#00BCD4"
        opacity="0.85"
      >
        404
      </text>
    </svg>
  )
}

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-chain-bg gap-6 px-4">
      <Illustration404 />

      <div className="text-center">
        <h1 className="text-3xl font-sans font-bold text-chain-cyan mb-2">
          Page introuvable
        </h1>
        <p className="text-chain-cyan-light font-body text-sm max-w-xs mx-auto leading-relaxed">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-chain-cyan text-white font-body font-medium rounded-lg hover:bg-chain-cyan-light transition-colors text-sm"
        >
          <Home size={16} aria-hidden="true" />
          Retour à l'accueil
        </Link>
        <Link
          to="/verify"
          className="flex items-center justify-center gap-2 px-6 py-2.5 border border-chain-cyan text-chain-cyan font-body font-medium rounded-lg hover:bg-chain-cyan/10 transition-colors text-sm"
        >
          <Search size={16} aria-hidden="true" />
          Vérifier un lot
        </Link>
      </div>
    </main>
  )
}
