import { Link } from 'react-router-dom'
import TeamAvatar from '../team/TeamAvatar'
import Badge from '../ui/Badge'

const FLAGS = {
  BE: '🇧🇪',
  DE: '🇩🇪',
  FR: '🇫🇷',
  NL: '🇳🇱',
  CH: '🇨🇭',
}

const CONTRACT_STATUS_CONFIG = {
  active: { label: 'Actif', variant: 'success' },
  renewal: { label: 'Renouvellement', variant: 'warning' },
  new: { label: 'Nouveau', variant: 'info' },
}

export default function BuyerCard({ buyer, stats = {} }) {
  const { weightThisQuarterKg = 0, shipmentsCount = 0, contractStatus = 'active' } = stats
  const flag = FLAGS[buyer.country] || '🏳️'
  const contractConfig = CONTRACT_STATUS_CONFIG[contractStatus] || CONTRACT_STATUS_CONFIG.active

  return (
    <Link
      to={`/exporter/export-records?buyer=${buyer.id}`}
      className="block bg-white rounded-2xl shadow-sm border border-chain-cyan/10 p-4 hover:shadow-md transition-shadow"
    >
      {/* Header with avatar and flag */}
      <div className="flex items-start gap-3 mb-3">
        <TeamAvatar name={buyer.name} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{flag}</span>
            <h3 className="font-sans font-semibold text-text-dark truncate">
              {buyer.name}
            </h3>
          </div>
          <p className="text-xs font-body text-text-dark/50 mt-0.5">
            {buyer.city}, {buyer.country}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-chain-bg/5 rounded-lg p-2 text-center">
          <div className="text-sm font-sans font-bold text-text-dark">
            {new Intl.NumberFormat('fr-FR').format(weightThisQuarterKg)}
          </div>
          <div className="text-xs font-body text-text-dark/50">kg ce trimestre</div>
        </div>
        <div className="bg-chain-bg/5 rounded-lg p-2 text-center">
          <div className="text-sm font-sans font-bold text-text-dark">
            {shipmentsCount}
          </div>
          <div className="text-xs font-body text-text-dark/50">expéditions</div>
        </div>
      </div>

      {/* Contract status */}
      <div className="flex items-center justify-between">
        <Badge variant={contractConfig.variant} className="text-xs">
          {contractConfig.label}
        </Badge>
        <span className="text-xs font-body text-chain-cyan">Voir l'historique →</span>
      </div>
    </Link>
  )
}
