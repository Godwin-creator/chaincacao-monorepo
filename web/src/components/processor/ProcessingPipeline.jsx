import { useRef, useState, useEffect } from 'react'
import { useInView } from 'framer-motion'
import { motion } from 'framer-motion'
import { PackageOpen, Thermometer, Sun, CheckCircle, ArrowRight, ArrowDown } from 'lucide-react'
import { Link } from 'react-router-dom'

function useCountUp(target, active) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active || target === 0) { setCount(target); return }
    const duration = 900
    const start = performance.now()
    function tick(now) {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setCount(Math.round(ease * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [active, target])
  return count
}

const STAGES = [
  { key: 'received',   label: 'Reçus',        icon: PackageOpen,  color: 'text-chain-cyan',  bg: 'bg-chain-cyan/10',  filter: 'received'   },
  { key: 'fermenting', label: 'Fermentation',  icon: Thermometer,  color: 'text-cacao-brown', bg: 'bg-cacao-brown/10', filter: 'fermenting' },
  { key: 'drying',     label: 'Séchage',       icon: Sun,          color: 'text-gold-premium',bg: 'bg-gold-premium/10',filter: 'drying'     },
  { key: 'ready',      label: 'Prêts',         icon: CheckCircle,  color: 'text-cacao-green', bg: 'bg-cacao-green/10', filter: 'processed'  },
]

function PipelineStage({ stage, count, hint, delay, active, isLast }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-30px' })
  const displayed = useCountUp(count, inView && active)
  const Icon = stage.icon
  const empty = count === 0

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.35, delay }}
      className="flex md:flex-col items-center gap-3 md:gap-0 flex-1"
    >
      <Link
        to={`/processor/quality-entry?filter=${stage.filter}`}
        className={`
          flex-1 w-full flex md:flex-col items-center md:items-center gap-3 md:gap-2
          rounded-2xl border-2 p-4 md:p-5 transition-all group
          ${empty
            ? 'border-gray-100 bg-gray-50 opacity-50 cursor-default pointer-events-none'
            : 'border-gray-100 bg-white hover:border-chain-cyan/40 hover:shadow-sm cursor-pointer'
          }
        `}
      >
        {/* Icône */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stage.bg}`}>
          <Icon size={20} className={stage.color} />
        </div>

        {/* Compteur + libellé */}
        <div className="flex-1 md:flex-none text-center">
          <div className={`text-3xl md:text-4xl font-sans font-bold tabular-nums leading-none ${empty ? 'text-gray-300' : stage.color}`}>
            {displayed}
          </div>
          <div className={`text-xs font-body mt-1 ${empty ? 'text-gray-300' : 'text-text-dark/60'}`}>
            {stage.label}
          </div>
          {hint && !empty && (
            <div className="text-xs font-body text-text-dark/40 mt-0.5">{hint}</div>
          )}
        </div>

        {/* Lien Transférer sur l'étape "Prêts" */}
        {stage.key === 'ready' && !empty && (
          <span className="hidden md:inline-flex items-center gap-1 text-xs font-body text-chain-cyan group-hover:underline mt-1">
            Transférer <ArrowRight size={11} />
          </span>
        )}
      </Link>

      {/* Flèche séparatrice */}
      {!isLast && (
        <>
          <ArrowRight size={18} className="text-gray-300 shrink-0 hidden md:block" />
          <ArrowDown  size={18} className="text-gray-300 shrink-0 md:hidden" />
        </>
      )}
    </motion.div>
  )
}

export default function ProcessingPipeline({ pipeline }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  const hints = {
    fermenting: pipeline.avgFermentDays   ? `J+${pipeline.avgFermentDays} en moyenne`   : null,
    drying:     pipeline.avgDryingHumidity ? `Humidité moy. ${pipeline.avgDryingHumidity} %` : null,
  }

  return (
    <div ref={ref} className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2">
      {STAGES.map((stage, i) => (
        <PipelineStage
          key={stage.key}
          stage={stage}
          count={pipeline[stage.key] ?? 0}
          hint={hints[stage.key] ?? null}
          delay={i * 0.1}
          active={inView}
          isLast={i === STAGES.length - 1}
        />
      ))}
    </div>
  )
}
