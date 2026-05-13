import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

const VARIANTS = {
  success: { icon: CheckCircle, bg: 'bg-cacao-green', text: 'text-white', iconColor: 'text-white' },
  error:   { icon: XCircle,     bg: 'bg-error',       text: 'text-white', iconColor: 'text-white' },
  info:    { icon: Info,        bg: 'bg-chain-cyan',   text: 'text-white', iconColor: 'text-white' },
}

// Composant individuel — utilisé en interne et exporté pour usage direct
export function ToastItem({ id, message, variant = 'info', onDismiss }) {
  const cfg = VARIANTS[variant] ?? VARIANTS.info
  const Icon = cfg.icon

  useEffect(() => {
    const t = setTimeout(() => onDismiss(id), 4000)
    return () => clearTimeout(t)
  }, [id, onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{    opacity: 0, y: 12, scale: 0.96 }}
      transition={{ type: 'spring', damping: 22, stiffness: 280 }}
      className={`flex items-start gap-3 px-4 py-3 rounded-2xl shadow-lg min-w-[280px] max-w-sm ${cfg.bg}`}
      role="alert"
    >
      <Icon size={18} className={`${cfg.iconColor} shrink-0 mt-0.5`} />
      <p className={`flex-1 text-sm font-body leading-snug ${cfg.text}`}>{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Fermer la notification"
      >
        <X size={16} className={cfg.text} />
      </button>
    </motion.div>
  )
}

// Conteneur de toasts — à placer dans le layout racine
export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-5 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem {...t} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
