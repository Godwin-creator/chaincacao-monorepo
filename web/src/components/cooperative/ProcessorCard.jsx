import { MapPin, Check } from 'lucide-react'
import TeamAvatar from '../team/TeamAvatar'
import Badge from '../ui/Badge'

const CERT_COLORS = {
  Bio: 'bg-cacao-green/10 text-cacao-green border-cacao-green/20',
  Fairtrade: 'bg-gold-premium/15 text-cacao-brown border-gold-premium/30',
  Rainforest: 'bg-chain-cyan/10 text-chain-cyan border-chain-cyan/20',
}

function LoadBar({ current, capacity }) {
  const pct = capacity > 0 ? Math.min((current / capacity) * 100, 100) : 0
  const color = pct > 90 ? 'bg-error' : pct > 70 ? 'bg-warning' : 'bg-cacao-green'
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs font-body text-text-dark/50">
        <span>Capacité</span>
        <span>{Math.round(pct)} %</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs font-body text-text-dark/40">
        {current.toLocaleString('fr-FR')} / {capacity.toLocaleString('fr-FR')} kg
      </p>
    </div>
  )
}

export default function ProcessorCard({
  processor,
  selected,
  onSelect,
  incompatibleSpecies,
}) {
  const isIncompatible = incompatibleSpecies && incompatibleSpecies.length > 0
  const loadPct = processor.capacityKg > 0
    ? (processor.currentLoad / processor.capacityKg) * 100
    : 0

  return (
    <button
      type="button"
      onClick={isIncompatible ? undefined : onSelect}
      disabled={isIncompatible}
      className={`
        relative w-full text-left rounded-2xl border-2 p-4 transition-all flex flex-col gap-3
        ${isIncompatible
          ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50'
          : selected
          ? 'border-chain-cyan bg-chain-bg/5 shadow-md'
          : 'border-gray-100 bg-white hover:border-chain-cyan/40 hover:shadow-sm cursor-pointer'
        }
      `}
    >
      {/* Check mark */}
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-cacao-green flex items-center justify-center">
          <Check size={13} className="text-white" strokeWidth={3} />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 pr-6">
        <TeamAvatar name={processor.name} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-sans font-semibold text-text-dark truncate">{processor.name}</p>
          <p className="flex items-center gap-1 text-xs font-body text-text-dark/50">
            <MapPin size={11} className="shrink-0" />
            {processor.commune} · À {processor.distanceKm} km
          </p>
        </div>
      </div>

      {/* Spécialités */}
      <div className="flex flex-wrap gap-1">
        {processor.specialties.map((s) => (
          <Badge
            key={s}
            variant={s === 'Cacao' ? 'cacao' : s === 'Robusta' ? 'robusta' : 'arabica'}
          >
            {s}
          </Badge>
        ))}
      </div>

      {/* Jauge capacité */}
      <LoadBar current={processor.currentLoad} capacity={processor.capacityKg} />

      {/* Certifications */}
      {processor.certifications.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {processor.certifications.map((c) => (
            <span
              key={c}
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body font-medium border ${CERT_COLORS[c] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}
            >
              {c}
            </span>
          ))}
        </div>
      )}

      {/* Badge incompatibilité */}
      {isIncompatible && (
        <p className="text-xs font-body text-error bg-error/10 rounded-lg px-2 py-1.5">
          Non compatible avec votre sélection
          {incompatibleSpecies.length > 0 && ` (${incompatibleSpecies.join(', ')})`}
        </p>
      )}

      {/* Capacité saturée */}
      {!isIncompatible && loadPct > 90 && (
        <p className="text-xs font-body text-warning bg-warning/10 rounded-lg px-2 py-1.5">
          Capacité proche de saturation
        </p>
      )}
    </button>
  )
}
