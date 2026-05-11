import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, ArrowRight, Loader2, AlertTriangle, ExternalLink } from 'lucide-react'
import Modal from '../ui/Modal'
import Badge from '../ui/Badge'
import TeamAvatar from '../team/TeamAvatar'
import { executeBatchTransfer } from '../../lib/api'
import { formatWeight, formatFullDate, formatDelta } from '../../utils/format'

const SPECIES_VARIANT = { cacao: 'cacao', robusta: 'robusta', arabica: 'arabica' }

const EXECUTING_MESSAGES = [
  'Préparation de la transaction…',
  'Signature on-chain…',
  'Confirmation Polygon…',
  'Enregistrement Supabase…',
]

function useRotatingMessage(active) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (!active) return
    setIdx(0)
    const t = setInterval(() => setIdx((i) => Math.min(i + 1, EXECUTING_MESSAGES.length - 1)), 600)
    return () => clearInterval(t)
  }, [active])
  return EXECUTING_MESSAGES[idx]
}

// ─── Étape 1 : confirmation ───────────────────────────────────────────────────

function ConfirmStep({ lots, processor, notes, onCancel, onConfirm }) {
  const totalKg = lots.reduce((s, l) => s + (l.weightVerifiedKg ?? l.weightAnnouncedKg), 0)
  const speciesMap = {}
  for (const l of lots) {
    speciesMap[l.species] = (speciesMap[l.species] ?? 0) + (l.weightVerifiedKg ?? l.weightAnnouncedKg)
  }
  const txShortHash = 'en attente de signature'

  return (
    <div className="p-5 flex flex-col gap-5">
      {/* Arrow animation coopérative → transformateur */}
      <div className="flex items-center justify-center gap-4 py-2">
        <div className="flex flex-col items-center gap-1">
          <TeamAvatar name="SCOOPS Wawa" size="sm" />
          <p className="text-xs font-body text-text-dark/50 text-center max-w-[80px] truncate">SCOOPS Wawa</p>
        </div>
        <motion.div
          animate={{ x: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
        >
          <ArrowRight size={22} className="text-chain-cyan" />
        </motion.div>
        <div className="flex flex-col items-center gap-1">
          <TeamAvatar name={processor.name} size="sm" />
          <p className="text-xs font-body text-text-dark/50 text-center max-w-[80px] truncate">{processor.name}</p>
        </div>
      </div>

      {/* Récap détails */}
      <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3 text-sm font-body">
          <div>
            <p className="text-text-dark/40 text-xs mb-0.5">Nombre de lots</p>
            <p className="font-semibold text-text-dark">{lots.length}</p>
          </div>
          <div>
            <p className="text-text-dark/40 text-xs mb-0.5">Poids total</p>
            <p className="font-semibold text-text-dark">{formatWeight(totalKg)}</p>
          </div>
          <div>
            <p className="text-text-dark/40 text-xs mb-0.5">Destinataire</p>
            <p className="font-semibold text-text-dark truncate">{processor.name}</p>
          </div>
          <div>
            <p className="text-text-dark/40 text-xs mb-0.5">Commune</p>
            <p className="font-semibold text-text-dark">{processor.commune}</p>
          </div>
        </div>

        {/* Répartition espèces */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {Object.entries(speciesMap).map(([sp, kg]) => (
            <Badge key={sp} variant={SPECIES_VARIANT[sp.toLowerCase()] ?? 'neutral'}>
              {sp} · {formatWeight(kg)}
            </Badge>
          ))}
        </div>

        {/* Notes */}
        {notes && (
          <div className="text-xs font-body text-text-dark/60 bg-white rounded-xl px-3 py-2 border border-gray-100">
            <span className="font-medium">Note : </span>{notes}
          </div>
        )}
      </div>

      {/* Liste UUIDs */}
      <div>
        <p className="text-xs font-body text-text-dark/50 mb-1.5">Lots inclus</p>
        <div className="max-h-28 overflow-y-auto bg-gray-50 rounded-xl p-2 flex flex-col gap-1">
          {lots.map((l) => (
            <span key={l.lotUuid} className="text-xs font-mono text-text-dark/70 px-1">{l.lotUuid}</span>
          ))}
        </div>
      </div>

      {/* Encart info blockchain */}
      <div className="flex gap-2 text-xs font-body text-chain-cyan bg-chain-cyan/8 border border-chain-cyan/20 rounded-xl px-3 py-2.5">
        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
        <span>
          Cette opération enregistrera une transaction blockchain groupée.
          Une fois validée, elle est <strong>irréversible</strong>.
        </span>
      </div>

      {/* Boutons */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onConfirm}
          className="w-full bg-chain-cyan text-white rounded-xl py-3 text-sm font-sans font-semibold hover:bg-chain-cyan/90 transition-colors"
        >
          Confirmer et signer on-chain
        </button>
        <button
          onClick={onCancel}
          className="text-sm font-body text-text-dark/50 hover:text-text-dark transition-colors py-2 text-center"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}

// ─── Étape 2 : exécution ─────────────────────────────────────────────────────

function ExecutingStep() {
  const msg = useRotatingMessage(true)
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-14 px-5">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-chain-cyan/20 flex items-center justify-center">
          <Loader2 size={28} className="text-chain-cyan animate-spin" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-base font-sans font-semibold text-text-dark">Transaction en cours</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={msg}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-sm font-body text-text-dark/50 mt-1"
          >
            {msg}
          </motion.p>
        </AnimatePresence>
      </div>
      <p className="text-xs font-body text-text-dark/30 text-center">
        Veuillez patienter, ne fermez pas cette fenêtre.
      </p>
    </div>
  )
}

// ─── Étape 3 : succès ────────────────────────────────────────────────────────

function SuccessStep({ result, lots, onNewTransfer, onViewHistory, onClose }) {
  const txShort = result.txHash
    ? result.txHash.slice(0, 10) + '…' + result.txHash.slice(-6)
    : null
  const totalKg = lots.reduce((s, l) => s + (l.weightVerifiedKg ?? l.weightAnnouncedKg), 0)

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
        <h3 className="text-lg font-sans font-bold text-text-dark">Transfert effectué</h3>
        <p className="text-sm font-body text-text-dark/60 mt-1">
          Les lots ont été enregistrés on-chain avec succès.
        </p>
      </div>

      <div className="w-full bg-gray-50 rounded-2xl p-4 text-left flex flex-col gap-3">
        <div className="flex justify-between text-sm font-body">
          <span className="text-text-dark/50">Lots transférés</span>
          <span className="font-semibold text-text-dark">{lots.length}</span>
        </div>
        <div className="flex justify-between text-sm font-body">
          <span className="text-text-dark/50">Poids total</span>
          <span className="font-semibold text-text-dark">{formatWeight(totalKg)}</span>
        </div>
        <div className="flex justify-between text-sm font-body">
          <span className="text-text-dark/50">Destinataire</span>
          <span className="font-semibold text-text-dark">{result.processor?.name}</span>
        </div>
        <div className="flex justify-between text-sm font-body">
          <span className="text-text-dark/50">Timestamp</span>
          <span className="text-text-dark/70">{formatFullDate(result.timestamp)}</span>
        </div>
        {txShort && (
          <div className="flex justify-between text-sm font-body items-center">
            <span className="text-text-dark/50">Tx blockchain</span>
            <a
              href={`https://polygonscan.com/tx/${result.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-mono text-xs text-chain-cyan hover:underline"
            >
              {txShort}
              <ExternalLink size={10} />
            </a>
          </div>
        )}
        {result.source === 'mock' && (
          <p className="text-xs font-body text-text-dark/40 text-center pt-1">— Mode démonstration —</p>
        )}
      </div>

      <div className="w-full flex flex-col gap-2">
        <button
          onClick={onNewTransfer}
          className="w-full bg-chain-cyan text-white rounded-xl py-3 text-sm font-sans font-semibold hover:bg-chain-cyan/90 transition-colors"
        >
          Nouveau transfert
        </button>
        <button
          onClick={onViewHistory}
          className="w-full border border-chain-cyan/30 text-chain-cyan rounded-xl py-3 text-sm font-sans font-semibold hover:bg-chain-cyan/5 transition-colors"
        >
          Voir l'historique
        </button>
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

// ─── Étape 4 : erreur ────────────────────────────────────────────────────────

function ErrorStep({ errorMsg, onCancel, onRetry }) {
  return (
    <div className="p-5 flex flex-col gap-5 items-center text-center">
      <div className="w-16 h-16 rounded-full bg-error/15 flex items-center justify-center">
        <XCircle size={36} className="text-error" />
      </div>
      <div>
        <h3 className="text-lg font-sans font-bold text-text-dark">Échec du transfert</h3>
        <p className="text-sm font-body text-text-dark/60 mt-1">{errorMsg}</p>
      </div>
      <div className="w-full flex flex-col gap-2">
        <button
          onClick={onRetry}
          className="w-full bg-chain-cyan text-white rounded-xl py-3 text-sm font-sans font-semibold hover:bg-chain-cyan/90 transition-colors"
        >
          Réessayer
        </button>
        <button
          onClick={onCancel}
          className="text-sm font-body text-text-dark/50 hover:text-text-dark transition-colors py-2"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function TransferConfirmModal({
  isOpen,
  onClose,
  lots,
  processor,
  notes,
  onSuccess,
  onViewHistory,
}) {
  const [step, setStep] = useState('confirm')
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (isOpen) setStep('confirm')
  }, [isOpen])

  async function handleConfirm() {
    setStep('executing')
    try {
      const res = await executeBatchTransfer({
        lotUuids: lots.map((l) => l.lotUuid),
        processorId: processor.id,
        notes,
      })
      if (res.success) {
        setResult(res)
        setStep('success')
        onSuccess?.(res)
      } else {
        setErrorMsg(res.error ?? 'Une erreur inattendue est survenue.')
        setStep('error')
      }
    } catch (e) {
      setErrorMsg(e?.message ?? 'Erreur de connexion.')
      setStep('error')
    }
  }

  const TITLE_MAP = {
    confirm: 'Confirmer le transfert',
    executing: 'Transaction en cours',
    success: 'Transfert effectué',
    error: 'Échec du transfert',
  }

  return (
    <Modal isOpen={isOpen} onClose={step === 'executing' ? undefined : onClose} title={TITLE_MAP[step]} size="md">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.18 }}
        >
          {step === 'confirm' && (
            <ConfirmStep
              lots={lots}
              processor={processor}
              notes={notes}
              onCancel={onClose}
              onConfirm={handleConfirm}
            />
          )}
          {step === 'executing' && <ExecutingStep />}
          {step === 'success' && result && (
            <SuccessStep
              result={result}
              lots={lots}
              onNewTransfer={() => { onClose(); onSuccess?.(result, 'reset') }}
              onViewHistory={() => { onClose(); onViewHistory?.() }}
              onClose={onClose}
            />
          )}
          {step === 'error' && (
            <ErrorStep
              errorMsg={errorMsg}
              onCancel={onClose}
              onRetry={handleConfirm}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </Modal>
  )
}
