import { CheckCircle2, MapPin, PackageCheck, User2 } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { formatWeight } from '../../utils/format'

const GRADE_VARIANTS = {
  A: 'success',
  B: 'warning',
  C: 'danger',
}

function truncateUuid(value) {
  if (!value) return '—'
  if (value.length <= 16) return value
  return `${value.slice(0, 10)}…${value.slice(-4)}`
}

export default function LotCard({ lot, selected, onToggle }) {
  return (
    <Card
      onClick={() => onToggle(lot.id)}
      className={`relative p-5 transition-all ${
        selected
          ? 'border-chain-cyan shadow-lg ring-2 ring-chain-cyan/20'
          : 'hover:border-chain-cyan/30'
      }`}
    >
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onToggle(lot.id)
          }}
          className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
            selected
              ? 'border-chain-cyan bg-chain-cyan text-white'
              : 'border-gray-300 bg-white text-transparent'
          }`}
          aria-pressed={selected}
          aria-label={`Sélectionner le lot ${lot.lotUuid}`}
        >
          <CheckCircle2 size={14} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-mono text-sm font-semibold text-text-dark">
              {truncateUuid(lot.lotUuid)}
            </h3>
            <Badge variant={GRADE_VARIANTS[lot.quality.finalGrade] ?? 'neutral'}>
              Grade {lot.quality.finalGrade}
            </Badge>
            <Badge variant={lot.species === 'Cacao' ? 'cacao' : 'robusta'}>
              {lot.species}
            </Badge>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-text-dark/75 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <User2 size={15} className="text-chain-cyan" />
              <span className="truncate">{lot.producer.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-cacao-green" />
              <span>{lot.producer.commune}</span>
            </div>
            <div className="flex items-center gap-2">
              <PackageCheck size={15} className="text-gold-premium" />
              <span>{formatWeight(lot.weightKg)}</span>
            </div>
            <div className="text-xs text-text-dark/55">
              Hash qualité on-chain : <span className="font-mono">{lot.onChainHash.slice(0, 12)}…</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
