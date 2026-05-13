import { RotateCcw, ArrowRight } from 'lucide-react'
import Badge from '../ui/Badge'
import { formatWeight } from '../../utils/format'

const SPECIES_VARIANT = { cacao: 'cacao', robusta: 'robusta', arabica: 'arabica' }

function countUp(n) {
  return n
}

export default function SelectionSummary({
  selectedLots,
  processor,
  onConfirm,
  onReset,
}) {
  const count = selectedLots.length
  const totalKg = selectedLots.reduce((s, l) => s + (l.weightVerifiedKg ?? l.weightAnnouncedKg), 0)

  const speciesMap = {}
  for (const l of selectedLots) {
    speciesMap[l.species] = (speciesMap[l.species] ?? 0) + (l.weightVerifiedKg ?? l.weightAnnouncedKg)
  }
  const speciesList = Object.entries(speciesMap)

  const canConfirm = count > 0 && !!processor

  return (
    <div className="bg-white rounded-2xl border border-chain-cyan/20 shadow-sm p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-sans font-bold text-text-dark">Résumé du transfert</h3>
        {count > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-body text-text-dark/40 hover:text-error transition-colors"
          >
            <RotateCcw size={12} />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Compteur lots */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-chain-cyan/10 flex items-center justify-center shrink-0">
          <span className="text-lg font-sans font-bold text-chain-cyan tabular-nums">{count}</span>
        </div>
        <div>
          <p className="text-sm font-body font-medium text-text-dark">
            {count === 0 ? 'Aucun lot sélectionné' : `${count} lot${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''}`}
          </p>
          {totalKg > 0 && (
            <p className="text-xs font-body text-text-dark/50">{formatWeight(totalKg)}</p>
          )}
        </div>
      </div>

      {/* Répartition espèces */}
      {speciesList.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {speciesList.map(([sp, kg]) => (
            <Badge key={sp} variant={SPECIES_VARIANT[sp.toLowerCase()] ?? 'neutral'}>
              {sp} · {formatWeight(kg)}
            </Badge>
          ))}
        </div>
      )}

      {/* Transformateur */}
      <div className="flex flex-col gap-1">
        <p className="text-xs font-body text-text-dark/50">Transformateur destinataire</p>
        {processor ? (
          <p className="text-sm font-body font-semibold text-text-dark">
            {processor.name}
            <span className="font-normal text-text-dark/50"> · {processor.commune}</span>
          </p>
        ) : (
          <p className="text-sm font-body text-text-dark/30 italic">Non choisi</p>
        )}
      </div>

      {/* Bouton confirmation */}
      <button
        onClick={onConfirm}
        disabled={!canConfirm}
        className="w-full flex items-center justify-center gap-2 bg-chain-cyan text-white rounded-xl py-3 text-sm font-sans font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-chain-cyan/90 transition-colors"
      >
        Confirmer le transfert
        <ArrowRight size={15} />
      </button>

      {!canConfirm && count > 0 && !processor && (
        <p className="text-xs font-body text-text-dark/40 text-center -mt-2">
          Choisissez un transformateur pour continuer
        </p>
      )}
    </div>
  )
}
