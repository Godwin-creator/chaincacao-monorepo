import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const ROLE_OPTIONS = [
  { label: 'Coopérative',     value: 'cooperative' },
  { label: 'Transformateur',  value: 'processor' },
  { label: 'Exportateur',     value: 'exporter' },
  { label: 'Vérificateur UE', value: 'verifier' },
]

function mapErrorToFR(error) {
  const code = error?.code ?? ''
  const msg  = error?.message ?? ''
  if (code === 'user_already_exists' || msg.includes('already registered'))
    return 'Un compte existe déjà avec cette adresse email.'
  if (code === 'weak_password' || msg.toLowerCase().includes('password'))
    return 'Mot de passe trop faible. Utilisez au moins 8 caractères avec des chiffres et des lettres.'
  if (code === 'invalid_email')
    return 'Adresse email invalide.'
  if (code === 'over_email_send_rate_limit')
    return 'Trop d\'inscriptions récentes. Réessayez dans quelques minutes.'
  return msg || 'Une erreur inattendue s\'est produite.'
}

export default function Signup() {
  const { signUp } = useAuth()

  const [fullName, setFullName]         = useState('')
  const [organization, setOrganization] = useState('')
  const [role, setRole]                 = useState('')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [confirmPwd, setConfirmPwd]     = useState('')
  const [showPwd, setShowPwd]           = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [accepted, setAccepted]         = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [error, setError]               = useState(null)
  const [success, setSuccess]           = useState(false)

  function validate() {
    if (password.length < 8)    return 'Le mot de passe doit contenir au moins 8 caractères.'
    if (password !== confirmPwd) return 'Les mots de passe ne correspondent pas.'
    if (!accepted)               return 'Vous devez accepter les conditions d\'utilisation.'
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setSubmitting(true)
    const { error: signUpError } = await signUp(email, password, { role, fullName, organization })

    if (signUpError) {
      setError(mapErrorToFR(signUpError))
      setSubmitting(false)
      return
    }

    setSuccess(true)
  }

  const inputClass =
    'w-full px-4 py-3 border border-gray-300 rounded-lg font-body text-base text-text-dark ' +
    'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-chain-cyan focus:border-transparent'

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-chain-bg px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl border border-chain-cyan/20 p-10 shadow-lg text-center">
          <CheckCircle2 size={56} className="mx-auto text-success mb-4" />
          <h2 className="text-2xl font-sans font-bold text-cacao-brown mb-2">Compte créé !</h2>
          <p className="text-gray-500 font-body text-sm mb-8">
            Vérifiez votre boîte email pour confirmer votre adresse avant de vous connecter.
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-3 bg-chain-cyan text-white font-sans font-semibold rounded-lg hover:bg-chain-cyan-light transition-colors text-base"
          >
            Aller à la connexion
          </Link>
        </div>
      </main>
    )
  }

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
          <h1 className="text-3xl font-sans font-bold text-chain-cyan">Inscription</h1>
          <p className="mt-1 text-chain-cyan-light font-body text-sm">
            Créez votre compte ChainCacao
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-chain-cyan/20 p-8 shadow-lg">

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm font-body" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            <div>
              <label htmlFor="fullName" className="block text-text-dark text-sm font-body font-medium mb-1.5">
                Nom complet
              </label>
              <input
                id="fullName"
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ama Kouassi"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="organization" className="block text-text-dark text-sm font-body font-medium mb-1.5">
                Organisation
              </label>
              <input
                id="organization"
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Coopérative SCOOPS Wawa"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-text-dark text-sm font-body font-medium mb-1.5">
                Rôle
              </label>
              <select
                id="role"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`${inputClass} bg-white`}
              >
                <option value="" disabled>Choisissez votre rôle</option>
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="signupEmail" className="block text-text-dark text-sm font-body font-medium mb-1.5">
                Adresse e-mail
              </label>
              <input
                id="signupEmail"
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
              <label htmlFor="signupPwd" className="block text-text-dark text-sm font-body font-medium mb-1.5">
                Mot de passe{' '}
                <span className="text-gray-400 font-normal">(8 caractères minimum)</span>
              </label>
              <div className="relative">
                <input
                  id="signupPwd"
                  type={showPwd ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? 'Masquer' : 'Afficher'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-chain-cyan transition-colors"
                >
                  {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPwd" className="block text-text-dark text-sm font-body font-medium mb-1.5">
                Confirmation du mot de passe
              </label>
              <div className="relative">
                <input
                  id="confirmPwd"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Masquer' : 'Afficher'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-chain-cyan transition-colors"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 w-5 h-5 shrink-0 rounded border-gray-300 accent-chain-cyan"
              />
              <span className="text-sm font-body text-gray-600 leading-snug">
                J'accepte les{' '}
                <a href="#" className="text-chain-cyan hover:underline">conditions d'utilisation</a>
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-chain-cyan text-white font-sans font-semibold rounded-lg hover:bg-chain-cyan-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
            >
              {submitting && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              )}
              Créer mon compte
            </button>

          </form>

          <p className="mt-5 text-center text-sm font-body text-gray-500">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-chain-cyan hover:underline">Se connecter</Link>
          </p>

        </div>
      </div>
    </main>
  )
}
