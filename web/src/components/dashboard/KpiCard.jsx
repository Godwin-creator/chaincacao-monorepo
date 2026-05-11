import { useRef, useState, useEffect } from 'react'
import { useInView } from 'framer-motion'

function useCountUp(target, isActive, decimals) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isActive) return
    const duration = 1200
    const start = performance.now()

    function tick(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      const raw = ease * target
      setCount(decimals > 0 ? parseFloat(raw.toFixed(decimals)) : Math.round(raw))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [isActive, target, decimals])

  return count
}

export default function KpiCard({
  icon: Icon,
  value,
  label,
  iconColor,
  iconBg,
  suffix = '',
  decimals = 0,
  trend,
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const count = useCountUp(typeof value === 'number' ? value : 0, isInView, decimals)

  const formatted =
    typeof value === 'number'
      ? new Intl.NumberFormat('fr-FR', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(count) + suffix
      : String(value) + suffix

  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl shadow-sm border border-chain-cyan/10 p-5 flex flex-col gap-1 h-full"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 ${iconBg}`}>
        <Icon size={18} className={iconColor} />
      </div>
      <div className="text-2xl md:text-3xl font-sans font-bold text-text-dark tabular-nums leading-none">
        {formatted}
      </div>
      <div className="text-xs md:text-sm font-body text-text-dark/60 leading-snug">{label}</div>
      {trend && (
        <div className={`text-xs font-body mt-1 ${trend.positive ? 'text-cacao-green' : 'text-error'}`}>
          {trend.positive ? '↑' : '↓'} {trend.label}
        </div>
      )}
    </div>
  )
}
