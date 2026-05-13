import { Link } from 'react-router-dom'

const COLUMNS = [
  {
    title: 'Produit',
    links: [
      { label: 'Comment ça marche', to: '/how-it-works' },
      { label: 'Vérifier un lot',   to: '/verify' },
      { label: 'Certificat EUDR',   to: '/exporter/eudr-certificate' },
    ],
  },
  {
    title: 'Équipe',
    links: [
      { label: 'À propos',  to: '/about' },
      { label: 'Contact',   to: '#' },
      { label: 'GitHub',    href: 'https://github.com/Godwin-creator/chaincacao-monorepo' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { label: 'Conditions',       to: '#' },
      { label: 'Confidentialité',  to: '#' },
      { label: 'Mentions légales', to: '#' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-chain-bg text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src="/logo-chaincacao-sans-fond.png"
                alt="ChainCacao"
                className="h-8 w-auto"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
              <span className="font-sans font-bold text-lg text-chain-cyan">ChainCacao</span>
            </div>
            <p className="text-sm font-body text-white/60 leading-relaxed">
              La technologie au service de la terre
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-sans font-semibold text-sm text-white/80 uppercase tracking-wider mb-4">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-body text-white/60 hover:text-chain-cyan transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.to}
                        className="text-sm font-body text-white/60 hover:text-chain-cyan transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-body text-white/40 text-center md:text-left">
            © 2026 ChainCacao · Miabé Hackathon 2026 · Équipe TG-16 Shadow Garden · Fait au Togo 🇹🇬
          </p>
          <a
            href="https://github.com/Godwin-creator/chaincacao-monorepo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-white/40 hover:text-chain-cyan transition-colors"
          >
            github.com/Godwin-creator/chaincacao-monorepo
          </a>
        </div>
      </div>
    </footer>
  )
}
