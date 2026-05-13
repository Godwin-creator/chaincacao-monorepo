import { Fragment } from 'react'
import { motion } from 'framer-motion'
import { Sprout, Users, Factory, Ship, ShieldCheck, ChevronRight } from 'lucide-react'

const CHAIN = [
  {
    Icon: Sprout,
    label: 'Producteur',
    sub: 'GPS · Lot',
    bg: 'bg-cacao-green/10',
    border: 'border-cacao-green/20',
    text: 'text-cacao-green',
  },
  {
    Icon: Users,
    label: 'Coopérative',
    sub: 'Pesée · Transfert',
    bg: 'bg-chain-cyan/10',
    border: 'border-chain-cyan/20',
    text: 'text-chain-cyan',
  },
  {
    Icon: Factory,
    label: 'Transformateur',
    sub: 'Qualité',
    bg: 'bg-cacao-brown/10',
    border: 'border-cacao-brown/20',
    text: 'text-cacao-brown',
  },
  {
    Icon: Ship,
    label: 'Exportateur',
    sub: 'EUDR · Export',
    bg: 'bg-gold-premium/10',
    border: 'border-gold-premium/20',
    text: 'text-gold-premium',
  },
  {
    Icon: ShieldCheck,
    label: 'Vérificateur UE',
    sub: 'Audit · QR',
    bg: 'bg-success/10',
    border: 'border-success/20',
    text: 'text-success',
  },
]

export default function HeroChain() {
  return (
    <div className="relative">
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-3 -right-2 z-10 flex items-center gap-1.5 bg-chain-cyan text-white text-xs font-mono font-semibold px-3 py-1.5 rounded-full shadow-lg"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
        On-chain
      </motion.div>

      <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-1">
          {CHAIN.map((step, i) => (
            <Fragment key={step.label}>
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.12, duration: 0.35, ease: 'easeOut' }}
                className="flex flex-col items-center text-center min-w-0"
              >
                <div
                  className={`w-14 h-14 rounded-xl ${step.bg} border ${step.border} flex items-center justify-center shadow-xs`}
                >
                  <step.Icon size={24} className={step.text} />
                </div>
                <p className="mt-2 text-xs font-body font-semibold text-text-dark leading-tight">
                  {step.label}
                </p>
                <p className="text-xs font-body text-gray-400 leading-tight">{step.sub}</p>
              </motion.div>

              {i < CHAIN.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.12 + 0.25 }}
                  className="shrink-0 my-1 md:my-0"
                >
                  <ChevronRight
                    size={18}
                    className="text-gray-200 rotate-90 md:rotate-0"
                  />
                </motion.div>
              )}
            </Fragment>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          className="mt-5 bg-chain-bg rounded-xl px-4 py-3"
        >
          <p className="text-xs font-mono text-chain-cyan-light truncate">
            0x7f3a2b1c…d8e9f0a1 · Bloc #19 827 364 · Polygon Mainnet
          </p>
        </motion.div>
      </div>
    </div>
  )
}
