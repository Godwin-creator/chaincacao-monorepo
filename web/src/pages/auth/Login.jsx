import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Eye, EyeOff, ArrowRight, Leaf, Link2, ShieldCheck, Globe,
  Building2, Factory, Ship, Search,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const ROLE_ROUTES = {
  cooperative: '/cooperative',
  processor:   '/processor',
  exporter:    '/exporter',
  verifier:    '/verifier',
}

const DEMO_ACCOUNTS = [
  {
    label:       'Coopérative',
    email:       'cooperative@chaincacao.tg',
    password:    'Demo1234!',
    description: 'Réception et gestion des lots agricoles',
    Icon:        Building2,
  },
  {
    label:       'Transformateur',
    email:       'transformateur@chaincacao.tg',
    password:    'Demo1234!',
    description: 'Contrôle qualité et traitement des fèves',
    Icon:        Factory,
  },
  {
    label:       'Exportateur',
    email:       'exportateur@chaincacao.tg',
    password:    'Demo1234!',
    description: 'Certification EUDR et gestion des envois',
    Icon:        Ship,
  },
  {
    label:       'Vérificateur UE',
    email:       'verificateur@chaincacao.tg',
    password:    'Demo1234!',
    description: 'Audit conformité blockchain & EUDR',
    Icon:        Search,
  },
]

const BRAND_FEATURES = [
  { Icon: Leaf,        text: 'Traçabilité de la parcelle à l\'export' },
  { Icon: Link2,       text: 'Blockchain Polygon — données immuables' },
  { Icon: ShieldCheck, text: 'Conformité EUDR 2025 — accès marché UE' },
  { Icon: Globe,       text: '40 000 familles agricoles togolaises' },
]

function mapErrorToFR(error) {
  const code = error?.code ?? ''
  const msg  = error?.message ?? ''
  if (code === 'invalid_credentials' || msg.includes('Invalid login credentials'))
    return 'Email ou mot de passe incorrect.'
  if (code === 'email_not_confirmed')
    return 'Veuillez confirmer votre adresse email avant de vous connecter.'
  if (code === 'too_many_requests')
    return 'Trop de tentatives. Réessayez dans quelques minutes.'
  return msg || 'Une erreur inattendue s\'est produite.'
}

export default function Login() {
  const { signIn } = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()

  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPwd, setShowPwd]       = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState(null)
  const [mobileNote, setMobileNote] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error: signInError, role: resolvedRole } = await signIn(email, password)

    if (signInError) {
      setError(mapErrorToFR(signInError))
      setSubmitting(false)
      return
    }

    const from = location.state?.from?.pathname
    navigate(from || ROLE_ROUTES[resolvedRole] || '/unauthorized', { replace: true })
  }

  function fillDemo(account) {
    setEmail(account.email)
    setPassword(account.password)
    setError(null)
    setMobileNote(false)
  }

  const inputClass =
    'w-full px-4 py-3 border border-gray-light rounded-lg font-body text-sm text-text-dark ' +
    'placeholder:text-gray-medium focus:outline-none focus:ring-2 focus:ring-cacao-green ' +
    'focus:border-transparent transition-shadow bg-white'

  return (
    <div className="min-h-screen flex">

      {/* ── Panneau gauche — Identité de marque (desktop) ─── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-2/5 flex-col relative overflow-hidden bg-cacao-green-dark">

        {/* Décors géométriques */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-cacao-green opacity-20 pointer-events-none" />
        <div className="absolute top-1/3 -right-16 w-56 h-56 rounded-full bg-cacao-green-light opacity-10 pointer-events-none" />
        <div className="absolute -bottom-24 -left-12 w-64 h-64 rounded-full bg-cacao-brown opacity-15 pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full px-10 py-12">

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <img
              src="/logo-chaincacao-sans-fond.png"
              alt="ChainCacao"
              className="h-9 w-auto"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
            <span className="font-sans font-bold text-lg text-white tracking-tight">ChainCacao</span>
          </div>

          {/* Contenu central */}
          <div className="my-auto py-12">

            {/* Badge EUDR */}
            <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full bg-gold-premium/15 border border-gold-premium/30">
              <ShieldCheck size={13} className="text-gold-premium" />
              <span className="text-xs font-body font-semibold text-gold-premium tracking-wider uppercase">
                Conforme EUDR 2025
              </span>
            </div>

            <h2 className="text-3xl xl:text-4xl font-sans font-bold text-white leading-snug mb-4">
              La technologie<br />
              au service<br />
              <span className="text-cacao-green-light">de la terre</span>
            </h2>

            <p className="text-white/60 font-body text-sm leading-relaxed mb-10 max-w-xs">
              Traçabilité blockchain des filières café-cacao togolaises.
              De la parcelle au marché européen, en toute transparence.
            </p>

            <ul className="space-y-4">
              {BRAND_FEATURES.map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                    <Icon size={14} className="text-cacao-green-light" />
                  </span>
                  <span className="text-sm font-body text-white/75 leading-snug">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pied de panneau */}
          <div className="shrink-0">
            <div className="h-px w-full bg-white/10 mb-5" />
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-chain-cyan-light animate-pulse shrink-0" />
              <p className="text-xs font-body text-white/40 leading-snug">
                Hackathon Miabé 2026 — Équipe TG-16 Shadow Garden
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Panneau droit — Formulaire ────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12 sm:px-10 lg:px-12 xl:px-16 overflow-y-auto">

        {/* Logo mobile (caché sur desktop) */}
        <div className="lg:hidden text-center mb-8 shrink-0">
          <img
            src="/logo-chaincacao-sans-fond.png"
            alt="ChainCacao"
            className="h-12 mx-auto mb-2"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          <span className="font-sans font-bold text-xl text-cacao-green-dark">ChainCacao</span>
          <p className="mt-1 text-xs font-body text-gray-medium">La technologie au service de la terre</p>
        </div>

        <div className="w-full max-w-sm">

          {/* En-tête formulaire */}
          <div className="mb-7">
            <h1 className="text-2xl font-sans font-bold text-text-dark">Connexion</h1>
            <p className="mt-1 font-body text-sm text-gray-medium">
              Accédez à votre espace ChainCacao
            </p>
          </div>

          {/* Alerte erreur */}
          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-lg bg-error/10 border border-error/25 text-error text-sm font-body flex items-start gap-2"
              role="alert"
            >
              <span className="shrink-0 font-bold mt-px">!</span>
              <span>{error}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-text-dark text-sm font-body font-medium mb-1.5">
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-text-dark text-sm font-body font-medium mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-medium hover:text-cacao-green transition-colors"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <a href="#" className="text-xs text-chain-cyan hover:text-chain-cyan-light font-body transition-colors">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 mt-1 bg-cacao-green text-white font-sans font-semibold rounded-lg
                         hover:bg-cacao-green-dark transition-colors disabled:opacity-60
                         disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-sm"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              ) : (
                <ArrowRight size={16} />
              )}
              Se connecter
            </button>
          </form>

          {/* Lien inscription */}
          <p className="mt-5 text-center text-sm font-body text-gray-medium">
            Pas encore de compte ?{' '}
            <Link to="/signup" className="text-cacao-green font-medium hover:underline">
              S'inscrire
            </Link>
          </p>

          {/* Séparateur démo */}
          <div className="mt-7 flex items-center gap-3">
            <span className="flex-1 h-px bg-gray-light" />
            <span className="text-xs font-body text-gray-medium whitespace-nowrap">
              Connexion démo hackathon
            </span>
            <span className="flex-1 h-px bg-gray-light" />
          </div>

          {/* Boutons démo */}
          <div className="mt-4 space-y-2">

            {/* Producteur — renvoi mobile */}
            <button
              type="button"
              onClick={() => { setMobileNote(true); setError(null) }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-light
                         hover:bg-cream hover:border-gray-medium transition-colors text-left group"
            >
              <span className="shrink-0 w-8 h-8 rounded-full bg-gray-light flex items-center justify-center group-hover:bg-gray-medium/20 transition-colors">
                <Leaf size={15} className="text-gray-medium" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body font-medium text-gray-text">Producteur</p>
                <p className="text-xs font-body text-gray-medium">Application mobile uniquement</p>
              </div>
              <span className="shrink-0 text-xs font-body font-medium bg-gray-light text-gray-medium px-2 py-0.5 rounded-full">
                Mobile
              </span>
            </button>

            {mobileNote && (
              <p className="text-xs text-center text-cacao-brown font-body px-3 py-2.5 bg-gold-link/10 rounded-lg border border-gold-link/25">
                L'espace Producteur est disponible sur l'application mobile ChainCacao.
              </p>
            )}

            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => fillDemo(account)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-cacao-green/20
                           hover:bg-cacao-green/5 hover:border-cacao-green/40 transition-colors text-left group"
              >
                <span className="shrink-0 w-8 h-8 rounded-full bg-cacao-green/10 flex items-center justify-center group-hover:bg-cacao-green/20 transition-colors">
                  <account.Icon size={15} className="text-cacao-green" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-medium text-text-dark">{account.label}</p>
                  <p className="text-xs font-body text-gray-medium leading-tight">{account.description}</p>
                </div>
                <ArrowRight size={14} className="shrink-0 text-cacao-green/30 group-hover:text-cacao-green transition-colors" />
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
