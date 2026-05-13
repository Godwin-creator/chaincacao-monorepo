import { Check, Lock } from 'lucide-react'
import { getQualityProgress } from '../../utils/mockProcessor'

const STAGES = [
  { key: 'fermentation', label: 'Fermentation', color: 'text-cacao-brown', bg: 'bg-cacao-brown' },
  { key: 'drying',       label: 'Séchage',       color: 'text-gold-premium', bg: 'bg-gold-premium' },
  { key: 'sorting',      label: 'Tri & calibrage', color: 'text-chain-cyan', bg: 'bg-chain-cyan' },
  { key: 'grading',      label: 'Grade final',   color: 'text-cacao-green', bg: 'bg-cacao-green' },
]

const STAGE_ORDER = ['fermentation', 'drying', 'sorting', 'grading', 'done']

function stageIndex(stage) {
  return STAGE_ORDER.indexOf(stage)
}

function getStageStatus(stageKey, currentStage, progressPct) {
  const current = stageIndex(currentStage)
  const idx = stageIndex(stageKey)

  if (currentStage === 'done') return 'done'
  if (idx < current) return 'done'
  if (idx === current) return 'active'
  return 'pending'
}

function sublabel(lot, stageKey, status) {
  const { quality } = lot
  if (status === 'pending') return 'À venir'

  if (stageKey === 'fermentation') {
    if (quality.fermentation.completedAt) {
      return `Terminée le ${new Date(quality.fermentation.completedAt).toLocaleDateString('fr-FR')}`
    }
    const days = quality.fermentation.readings.length
    return `J+${days}/${quality.fermentation.targetDays}`
  }
  if (stageKey === 'drying') {
    if (quality.drying.completedAt) {
      return `Terminé le ${new Date(quality.drying.completedAt).toLocaleDateString('fr-FR')}`
    }
    const last = quality.drying.readings[quality.drying.readings.length - 1]
    return last ? `Hum. actuelle : ${last.humidityPct.toString().replace('.', ',')} %` : 'En cours'
  }
  if (stageKey === 'sorting') {
    if (quality.sorting.completedAt) {
      return `Terminé le ${new Date(quality.sorting.completedAt).toLocaleDateString('fr-FR')}`
    }
    return 'En attente'
  }
  if (stageKey === 'grading') {
    if (quality.grading.finalGrade) {
      return `Grade ${quality.grading.finalGrade} · ${new Date(quality.grading.inspectedAt).toLocaleDateString('fr-FR')}`
    }
    return 'En attente'
  }
  return ''
}

export default function StageTimeline({ lot }) {
  const { stage: currentStage, progressPct } = getQualityProgress(lot)

  return (
    <div className="flex flex-col gap-0">
      {STAGES.map((s, i) => {
        const status = getStageStatus(s.key, currentStage, progressPct)
        const isLast = i === STAGES.length - 1
        const sub = sublabel(lot, s.key, status)

        return (
          <div key={s.key} className="flex gap-3">
            {/* Colonne icône + connecteur */}
            <div className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center shrink-0
                border-2 transition-all
                ${status === 'done'
                  ? 'bg-cacao-green border-cacao-green'
                  : status === 'active'
                    ? `${s.bg} border-transparent`
                    : 'bg-white border-gray-200'
                }
              `}>
                {status === 'done' && <Check size={14} className="text-white" />}
                {status === 'active' && (
                  <div className="w-3 h-3 rounded-full bg-white opacity-90" />
                )}
                {status === 'pending' && <Lock size={12} className="text-gray-300" />}
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-[28px] mt-1 ${
                  status === 'done' ? 'bg-cacao-green/30' : 'bg-gray-100'
                }`} />
              )}
            </div>

            {/* Contenu */}
            <div className="pb-5 flex-1 min-w-0">
              <p className={`text-sm font-body font-semibold leading-none mb-1 ${
                status === 'pending' ? 'text-gray-300' : 'text-text-dark'
              }`}>
                {s.label}
              </p>
              <p className={`text-xs font-body leading-snug ${
                status === 'pending' ? 'text-gray-300' : 'text-text-dark/60'
              }`}>
                {sub}
              </p>

              {/* Barre de progression pour l'étape active */}
              {status === 'active' && (
                <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.bg} transition-all duration-700`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
