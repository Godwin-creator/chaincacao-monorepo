import { lazy, Suspense, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertTriangle, ArrowLeft, Loader2, Phone, Keyboard } from 'lucide-react'
import Modal from '../ui/Modal'
import Badge from '../ui/Badge'
import TeamAvatar from '../team/TeamAvatar'
import { fetchLotByUuid, confirmLotReception } from '../../lib/api'
import { formatWeight, formatDelta } from '../../utils/format'

const QRScanner = lazy(() => import('../qr/QRScanner'))

const STEPS = ['scan', 'confirm', 'verify', 'success']

function StepIndicator({ current }) {
  const labels = ['Scan', 'Infos', 'Pesée', 'Validé']
  return (
    <div className="flex items-center justify-center gap-1 px-5 py-3 border-b border-gray-100">
      {STEPS.map((s, i) => {
        const done = STEPS.indexOf(current) > i
        const active = s === current
        return (
          <div key={s} className="flex items-center gap-1">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-sans font-bold transition-colors ${
                done
                  ? 'bg-cacao-green text-white'
                  : active
                  ? 'bg-chain-cyan text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {done ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-body hidden sm:block ${active ? 'text-chain-cyan' : 'text-gray-400'}`}>
              {labels[i]}
            </span>
            {i < STEPS.length - 1 && <div className="w-4 h-px bg-gray-200 mx-1" />}
          </div>
        )
      })}
    </div>
  )
}

function ScanStep({ onScanned, onClose }) {
  const [manual, setManual] = useState(false)
  const [manualVal, setManualVal] = useState('')
  const [permDenied, setPermDenied] = useState(false)
  const [scanError, setScanError] = useState('')

  function handleSubmitManual(e) {
    e.preventDefault()
    const v = manualVal.trim()
    if (v) onScanned(v)
  }

  return (
    <div className="p-5 flex flex-col gap-5">
      <div>
        <p className="text-sm font-body text-text-dark/70">
          Demandez au producteur de présenter le QR code généré sur son téléphone.
        </p>
      </div>

      {scanError && (
        <div className="flex items-center gap-2 text-sm text-error bg-error/10 border border-error/20 rounded-xl px-3 py-2.5">
          <AlertTriangle size={15} className="shrink-0" />
          {scanError}
        </div>
      )}

      {!manual && !permDenied && (
        <Suspense fallback={<div className="text-sm text-center text-chain-cyan py-8 font-body">Chargement du scanner…</div>}>
          <QRScanner
            onScan={(uuid) => { setScanError(''); onScanned(uuid) }}
            onError={(msg) => setScanError(msg)}
            onPermissionDenied={() => setPermDenied(true)}
          />
        </Suspense>
      )}

      {permDenied && (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <AlertTriangle size={32} className="text-warning" />
          <p className="text-sm font-body text-text-dark/70">
            L'accès à la caméra a été refusé. Veuillez autoriser l'accès dans les paramètres de votre navigateur, ou saisissez l'identifiant du lot manuellement.
          </p>
        </div>
      )}

      {(manual || permDenied) && (
        <form onSubmit={handleSubmitManual} className="flex flex-col gap-3">
          <label className="text-sm font-body font-medium text-text-dark">
            Identifiant du lot (ex : LOT-2026-0891)
          </label>
          <input
            type="text"
            value={manualVal}
            onChange={(e) => setManualVal(e.target.value)}
            placeholder="LOT-2026-XXXX"
            autoFocus
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-chain-cyan/50"
          />
          <button
            type="submit"
            disabled={!manualVal.trim()}
            className="w-full bg-chain-cyan text-white rounded-xl py-3 text-sm font-sans font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-chain-cyan/90 transition-colors"
          >
            Confirmer l'identifiant
          </button>
        </form>
      )}

      {!manual && !permDenied && (
        <button
          onClick={() => setManual(true)}
          className="flex items-center justify-center gap-2 text-sm font-body text-chain-cyan hover:underline"
        >
          <Keyboard size={14} />
          Saisir manuellement
        </button>
      )}

      <button
        onClick={onClose}
        className="text-sm font-body text-text-dark/50 hover:text-text-dark transition-colors text-center"
      >
        Annuler
      </button>
    </div>
  )
}

function ConfirmStep({ uuid, onConfirm, onBack }) {
  const [lot, setLot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchLotByUuid(uuid).then(({ lot: l }) => {
      if (!l) setNotFound(true)
      else setLot(l)
      setLoading(false)
    })
  }, [uuid])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <Loader2 size={28} className="text-chain-cyan animate-spin" />
        <p className="text-sm font-body text-text-dark/60">Recherche du lot…</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="p-5 flex flex-col gap-5">
        <div className="flex items-center gap-2 text-sm text-error bg-error/10 border border-error/20 rounded-xl px-3 py-3">
          <AlertTriangle size={15} className="shrink-0" />
          Lot introuvable · Vérifiez le QR et réessayez.
        </div>
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-body text-chain-cyan hover:underline">
          <ArrowLeft size={14} />
          Scanner à nouveau
        </button>
      </div>
    )
  }

  const speciesMap = { cacao: 'cacao', robusta: 'robusta', arabica: 'arabica' }
  const variant = speciesMap[(lot.species ?? '').toLowerCase()] ?? 'neutral'

  return (
    <div className="p-5 flex flex-col gap-5">
      <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <TeamAvatar name={lot.producer.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-sans font-semibold text-text-dark truncate">{lot.producer.name}</p>
            <p className="text-xs font-body text-text-dark/60">{lot.producer.organization} · {lot.producer.commune}</p>
          </div>
          {lot.producer.phone && (
            <a
              href={`tel:${lot.producer.phone}`}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-chain-cyan/10 text-chain-cyan"
            >
              <Phone size={15} />
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-body text-text-dark/50 mb-0.5">Espèce</p>
            <Badge variant={variant}>{lot.species}</Badge>
          </div>
          <div>
            <p className="text-xs font-body text-text-dark/50 mb-0.5">Poids annoncé</p>
            <p className="text-lg font-sans font-bold text-text-dark">{formatWeight(lot.weightAnnouncedKg)}</p>
          </div>
          <div>
            <p className="text-xs font-body text-text-dark/50 mb-0.5">Date récolte</p>
            <p className="text-sm font-body text-text-dark">{lot.harvestDate || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-body text-text-dark/50 mb-0.5">Parcelle</p>
            <p className="text-sm font-body text-text-dark truncate">{lot.parcelName || '—'}</p>
          </div>
        </div>

        <p className="text-xs font-mono text-text-dark/40 mt-1">ID : {lot.lotUuid}</p>
      </div>

      <p className="text-sm font-body text-text-dark/70 text-center">
        Est-ce bien le lot apporté par <strong>{lot.producer.name}</strong> ?
      </p>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => onConfirm(lot)}
          className="w-full bg-chain-cyan text-white rounded-xl py-3 text-sm font-sans font-semibold hover:bg-chain-cyan/90 transition-colors"
        >
          Oui, peser le lot
        </button>
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 text-sm font-body text-text-dark/50 hover:text-text-dark transition-colors py-2"
        >
          <ArrowLeft size={14} />
          Non, scanner à nouveau
        </button>
      </div>
    </div>
  )
}

function VerifyStep({ lot, onValidate, onBack, loading: submitting }) {
  const [weightInput, setWeightInput] = useState('')
  const [notes, setNotes] = useState('')
  const [alertConfirmed, setAlertConfirmed] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const verifiedKg = parseFloat(weightInput.replace(',', '.')) || 0
  const announced = lot.weightAnnouncedKg
  const delta = announced > 0 ? ((verifiedKg - announced) / announced) * 100 : 0
  const isAlert = Math.abs(delta) > 2
  const canSubmit =
    weightInput.trim() !== '' &&
    verifiedKg > 0 &&
    (!isAlert || alertConfirmed) &&
    !submitting

  function deltaLabel() {
    if (!weightInput || verifiedKg === 0) return null
    if (delta === 0) return { text: 'Écart : 0 % · Parfait', color: 'text-gray-400' }
    if (isAlert)
      return { text: `Écart : ${formatDelta(delta)} · Alerte automatique`, color: 'text-warning' }
    return { text: `Écart : ${formatDelta(delta)} · Acceptable`, color: 'text-cacao-green' }
  }

  const dl = deltaLabel()

  return (
    <div className="p-5 flex flex-col gap-5">
      <div className="text-sm font-body text-text-dark/70 bg-gray-50 rounded-xl px-4 py-3">
        Poids annoncé par <strong>{lot.producer.name}</strong> : <strong>{formatWeight(announced)}</strong>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-body font-medium text-text-dark">
          Poids vérifié <span className="text-error">*</span>
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            type="number"
            step="0.1"
            min="0"
            value={weightInput}
            onChange={(e) => { setWeightInput(e.target.value); setAlertConfirmed(false) }}
            placeholder="0,0"
            className="w-full border border-gray-200 rounded-xl px-4 py-4 text-2xl font-mono font-bold text-text-dark focus:outline-none focus:ring-2 focus:ring-chain-cyan/50 pr-14"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-body text-text-dark/40">kg</span>
        </div>

        {dl && (
          <p className={`text-sm font-body ${dl.color} flex items-center gap-1.5`}>
            {isAlert && <AlertTriangle size={14} className="shrink-0" />}
            {dl.text}
          </p>
        )}

        {isAlert && weightInput && (
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={alertConfirmed}
              onChange={(e) => setAlertConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-chain-cyan"
            />
            <span className="text-xs font-body text-text-dark/70">
              Je confirme avoir vérifié la pesée malgré l'écart constaté.
            </span>
          </label>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-body text-text-dark/60">Observations (optionnel)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Ex : sac humide, récolte tardive…"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-chain-cyan/50 resize-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <button
          disabled={!canSubmit}
          onClick={() => onValidate(verifiedKg, notes)}
          className="w-full bg-chain-cyan text-white rounded-xl py-3 text-sm font-sans font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-chain-cyan/90 transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Enregistrement en cours…
            </>
          ) : (
            'Valider la réception'
          )}
        </button>
        <button
          onClick={onBack}
          disabled={submitting}
          className="flex items-center justify-center gap-2 text-sm font-body text-text-dark/50 hover:text-text-dark transition-colors py-2 disabled:opacity-40"
        >
          <ArrowLeft size={14} />
          Retour
        </button>
      </div>
    </div>
  )
}

function SuccessStep({ result, lot, onReceiveAnother, onClose }) {
  const txShort = result.txHash
    ? result.txHash.slice(0, 6) + '…' + result.txHash.slice(-4)
    : null

  return (
    <div className="p-5 flex flex-col gap-5 items-center text-center">
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
        className="w-16 h-16 rounded-full bg-cacao-green/15 flex items-center justify-center"
      >
        <CheckCircle size={36} className="text-cacao-green" />
      </motion.div>

      <div>
        <h3 className="text-lg font-sans font-bold text-text-dark">Réception validée</h3>
        <p className="text-sm font-body text-text-dark/60 mt-1">
          Le lot a été enregistré avec succès.
        </p>
      </div>

      <div className="w-full bg-gray-50 rounded-2xl p-4 text-left flex flex-col gap-3">
        <div className="flex justify-between text-sm font-body">
          <span className="text-text-dark/50">Lot</span>
          <span className="font-mono font-medium text-text-dark">{lot.lotUuid}</span>
        </div>
        <div className="flex justify-between text-sm font-body">
          <span className="text-text-dark/50">Poids retenu</span>
          <span className="font-semibold text-text-dark">{formatWeight(result.verifiedKg)}</span>
        </div>
        <div className="flex justify-between text-sm font-body items-center">
          <span className="text-text-dark/50">Écart</span>
          <Badge variant={Math.abs(result.deltaPct) > 2 ? 'warning' : 'success'}>
            {formatDelta(result.deltaPct)}
          </Badge>
        </div>
        {txShort && (
          <div className="flex justify-between text-sm font-body items-center">
            <span className="text-text-dark/50">Tx blockchain</span>
            <span className="font-mono text-xs text-chain-cyan">{txShort}</span>
          </div>
        )}
        {result.source === 'mock' && (
          <p className="text-xs font-body text-text-dark/40 text-center pt-1">— Mode démonstration —</p>
        )}
      </div>

      <div className="w-full flex flex-col gap-2">
        <button
          onClick={onReceiveAnother}
          className="w-full bg-chain-cyan text-white rounded-xl py-3 text-sm font-sans font-semibold hover:bg-chain-cyan/90 transition-colors"
        >
          Réceptionner un autre lot
        </button>
        {lot.lotUuid && (
          <a
            href={`/verify/${lot.lotUuid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center border border-chain-cyan/30 text-chain-cyan rounded-xl py-3 text-sm font-sans font-semibold hover:bg-chain-cyan/5 transition-colors"
          >
            Voir le lot
          </a>
        )}
        <button
          onClick={onClose}
          className="text-sm font-body text-text-dark/50 hover:text-text-dark transition-colors py-2"
        >
          Fermer
        </button>
      </div>
    </div>
  )
}

export default function ReceptionModal({ isOpen, onClose, onSuccess, initialUuid }) {
  const [step, setStep] = useState('scan')
  const [uuid, setUuid] = useState(initialUuid ?? '')
  const [lot, setLot] = useState(null)
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (initialUuid) {
        setUuid(initialUuid)
        setStep('confirm')
      } else {
        setStep('scan')
        setUuid('')
        setLot(null)
        setResult(null)
      }
    }
  }, [isOpen, initialUuid])

  async function handleValidate(verifiedKg, notes) {
    setSubmitting(true)
    const res = await confirmLotReception(uuid, { verifiedWeightKg: verifiedKg, notes })
    setResult({ ...res, verifiedKg })
    setStep('success')
    setSubmitting(false)
    onSuccess?.({ ...lot, status: res.status })
  }

  function reset() {
    setStep('scan')
    setUuid('')
    setLot(null)
    setResult(null)
  }

  const TITLE_MAP = {
    scan: 'Scanner le QR du lot',
    confirm: 'Confirmer les informations',
    verify: 'Pesée de vérification',
    success: 'Réception confirmée',
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={TITLE_MAP[step]} size="md">
      <StepIndicator current={step} />
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.18 }}
        >
          {step === 'scan' && (
            <ScanStep
              onScanned={(id) => { setUuid(id); setStep('confirm') }}
              onClose={onClose}
            />
          )}
          {step === 'confirm' && (
            <ConfirmStep
              uuid={uuid}
              onConfirm={(l) => { setLot(l); setStep('verify') }}
              onBack={() => setStep('scan')}
            />
          )}
          {step === 'verify' && lot && (
            <VerifyStep
              lot={lot}
              onValidate={handleValidate}
              onBack={() => setStep('confirm')}
              loading={submitting}
            />
          )}
          {step === 'success' && result && lot && (
            <SuccessStep
              result={result}
              lot={lot}
              onReceiveAnother={reset}
              onClose={() => { onClose(); reset() }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </Modal>
  )
}
