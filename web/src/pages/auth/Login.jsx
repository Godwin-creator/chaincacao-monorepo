import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const ROLE_ROUTES = {
  cooperative: '/cooperative',
  processor:   '/processor',
  exporter:    '/exporter',
  verifier:    '/verifier',
}

const DEMO_ACCOUNTS = [
  { label: 'Coopérative',     email: 'demo-cooperative@chaincacao.tg', password: 'Demo2026!' },
  { label: 'Transformateur',  email: 'demo-processor@chaincacao.tg',   password: 'Demo2026!' },
  { label: 'Exportateur',     email: 'demo-exporter@chaincacao.tg',    password: 'Demo2026!' },
  { label: 'Vérificateur UE', email: 'demo-verifier@chaincacao.tg',    password: 'Demo2026!' },
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
    'w-full px-4 py-3 border border-gray-300 rounded-lg font-body text-base text-text-dark ' +
    'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-chain-cyan focus:border-transparent'

  return (
    <main className="min-h-screen flex items-center justify-center bg-chain-bg px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <img
            src="/logo-chaincacao-sans-fond.png"
            alt="ChainCacao"
            className="h-16 mx-auto mb-4"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          <h1 className="text-3xl font-sans font-bold text-chain-cyan">Connexion</h1>
          <p className="mt-1 text-chain-cyan-light font-body text-sm">
            Accédez à votre espace ChainCacao
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-chain-cyan/20 p-8 shadow-lg">

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm font-body" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-chain-cyan transition-colors"
                >
                  {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="mt-1.5 text-right">
                <a href="#" className="text-xs text-chain-cyan hover:underline font-body">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-chain-cyan text-white font-sans font-semibold rounded-lg hover:bg-chain-cyan-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
            >
              {submitting && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              )}
              Se connecter
            </button>
          </form>

          <p className="mt-5 text-center text-sm font-body text-gray-500">
            Pas encore de compte ?{' '}
            <Link to="/signup" className="text-chain-cyan hover:underline">S'inscrire</Link>
          </p>

          <div className="mt-6 flex items-center gap-3">
            <span className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-body whitespace-nowrap">ou connexion démo</span>
            <span className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => { setMobileNote(true); setError(null) }}
              className="w-full py-2.5 border border-gray-200 rounded-lg text-sm font-body text-gray-400 hover:bg-gray-50 transition-colors"
            >
              Producteur
            </button>

            {mobileNote && (
              <p className="text-xs text-center text-gold-link font-body px-2 py-1">
                L'espace Producteur est disponible sur l'application mobile ChainCacao.
              </p>
            )}

            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => fillDemo(account)}
                className="w-full py-2.5 border border-chain-cyan/30 rounded-lg text-sm font-body text-chain-cyan hover:bg-chain-cyan/5 transition-colors"
              >
                {account.label}
              </button>
            ))}
          </div>

        </div>
      </div>
    </main>
  )
}
