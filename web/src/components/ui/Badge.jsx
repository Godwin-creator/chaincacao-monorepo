const variants = {
  success: 'bg-cacao-green/10 text-cacao-green border-cacao-green/20',
  warning: 'bg-gold-premium/15 text-cacao-brown border-gold-premium/30',
  danger:  'bg-error/10 text-error border-error/20',
  neutral: 'bg-chain-bg/10 text-chain-bg border-chain-bg/20',
  info:    'bg-chain-cyan/10 text-chain-cyan border-chain-cyan/20',
  cacao:   'bg-cacao-brown/10 text-cacao-brown border-cacao-brown/20',
  robusta: 'bg-cacao-brown-light/10 text-cacao-brown-light border-cacao-brown-light/20',
  arabica: 'bg-gold-link/15 text-cacao-brown border-gold-link/30',
}

export default function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body font-medium border whitespace-nowrap ${
        variants[variant] ?? variants.neutral
      } ${className}`}
    >
      {children}
    </span>
  )
}
