import { motion } from 'framer-motion'
import { Award, Star, CheckCircle } from 'lucide-react'

const GRADES = [
  {
    value: 'A',
    icon: Award,
    label: 'Grade A',
    desc: 'Premier choix · Excellent profil · Aucun défaut significatif',
    border: 'border-yellow-400',
    bg: 'bg-yellow-50',
    iconColor: 'text-yellow-500',
    iconBg: 'bg-yellow-100',
    selectedBorder: 'border-yellow-400',
    selectedShadow: 'shadow-yellow-200',
  },
  {
    value: 'B',
    icon: Star,
    label: 'Grade B',
    desc: 'Bon choix · Qualité standard · Défauts mineurs tolérés',
    border: 'border-gray-300',
    bg: 'bg-gray-50',
    iconColor: 'text-gray-400',
    iconBg: 'bg-gray-100',
    selectedBorder: 'border-gray-400',
    selectedShadow: 'shadow-gray-200',
  },
  {
    value: 'C',
    icon: CheckCircle,
    label: 'Grade C',
    desc: 'Choix industriel · Défauts présents · Usage secondaire',
    border: 'border-gray-200',
    bg: 'bg-white',
    iconColor: 'text-gray-300',
    iconBg: 'bg-gray-50',
    selectedBorder: 'border-chain-cyan',
    selectedShadow: 'shadow-chain-cyan/20',
  },
]

export default function GradeSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {GRADES.map((g) => {
        const Icon = g.icon
        const selected = value === g.value

        return (
          <motion.button
            key={g.value}
            type="button"
            onClick={() => onChange(g.value)}
            whileTap={{ scale: 0.97 }}
            animate={{ scale: selected ? 1.02 : 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`
              relative text-left rounded-2xl border-2 p-4 transition-all cursor-pointer
              ${selected
                ? `${g.selectedBorder} ${g.bg} shadow-lg ${g.selectedShadow} ring-2 ring-chain-cyan/30`
                : `${g.border} bg-white hover:border-chain-cyan/30 hover:shadow-sm`
              }
            `}
            aria-pressed={selected}
            aria-label={`Sélectionner le ${g.label}`}
          >
            {/* Indicateur sélection */}
            {selected && (
              <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-chain-cyan flex items-center justify-center">
                <CheckCircle size={12} className="text-white" />
              </span>
            )}

            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${g.iconBg}`}>
              <Icon size={20} className={g.iconColor} />
            </div>

            <p className="text-base font-sans font-bold text-text-dark mb-1">{g.label}</p>
            <p className="text-xs font-body text-text-dark/60 leading-snug">{g.desc}</p>
          </motion.button>
        )
      })}
    </div>
  )
}
