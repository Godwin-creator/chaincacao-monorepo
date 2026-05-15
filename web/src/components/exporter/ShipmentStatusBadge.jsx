import { PackageCheck, FileCheck, Ship, CheckCircle2 } from 'lucide-react'

const STATUS_CONFIG = {
  preparing: {
    icon: PackageCheck,
    label: 'En préparation',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  certified: {
    icon: FileCheck,
    label: 'Certifié EUDR',
    color: 'text-chain-cyan',
    bg: 'bg-chain-cyan/10',
    border: 'border-chain-cyan/20',
  },
  in_transit: {
    icon: Ship,
    label: 'En transit',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
  delivered: {
    icon: CheckCircle2,
    label: 'Livré',
    color: 'text-cacao-green',
    bg: 'bg-cacao-green/10',
    border: 'border-cacao-green/20',
  },
}

export default function ShipmentStatusBadge({ status, estimatedArrival = null, className = '' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.preparing
  const Icon = config.icon

  // Formatter l'ETA si disponible
  const etaText = estimatedArrival
    ? `ETA ${new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(estimatedArrival))}`
    : null

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body font-medium border ${config.bg} ${config.color} ${config.border} ${className}`}
    >
      <Icon size={14} />
      <span>{config.label}</span>
      {etaText && status === 'in_transit' && (
        <span className="opacity-75 ml-1">· {etaText}</span>
      )}
    </div>
  )
}
