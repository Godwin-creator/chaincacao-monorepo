import { useRef, useState, useEffect } from 'react'
import { useInView } from 'framer-motion'

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

export default function StatCounter({ numericTarget, staticDisplay, suffix = '', label }) {
  const ref     = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView || numericTarget === null) return

    const duration = 1400
    const start    = performance.now()

    function tick(now) {
      const elapsed  = now - start
      const progress = Math.min(elapsed / duration, 1)
      setCount(Math.round(easeOutCubic(progress) * numericTarget))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [isInView, numericTarget])

  const formatted =
    numericTarget !== null
      ? count.toLocaleString('fr-FR') + suffix
      : staticDisplay

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <span className="text-4xl md:text-5xl font-sans font-bold text-chain-cyan tabular-nums">
        {formatted}
      </span>
      <span className="mt-2 text-sm font-body text-white/60 max-w-[160px] leading-snug">
        {label}
      </span>
    </div>
  )
}
