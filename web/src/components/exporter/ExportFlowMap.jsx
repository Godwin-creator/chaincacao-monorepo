import { motion } from 'framer-motion'

// Coordonnées simplifiées pour la carte SVG (viewBox 0 0 800 600)
const PORTS = [
  { id: 'lome', name: 'Lomé', country: 'TG', x: 320, y: 520 },
  { id: 'antwerp', name: 'Anvers', country: 'BE', x: 380, y: 180 },
  { id: 'hamburg', name: 'Hambourg', country: 'DE', x: 410, y: 140 },
  { id: 'lehavre', name: 'Le Havre', country: 'FR', x: 340, y: 160 },
  { id: 'rotterdam', name: 'Rotterdam', country: 'NL', x: 370, y: 150 },
  { id: 'basel', name: 'Bâle', country: 'CH', x: 420, y: 200 },
]

const FLAGS = {
  TG: '🇹🇬',
  BE: '🇧🇪',
  DE: '🇩🇪',
  FR: '🇫🇷',
  NL: '🇳🇱',
  CH: '🇨🇭',
}

const STATUS_COLORS = {
  certified: '#06B6D4', // chain-cyan
  in_transit: '#10B981', // chain-green
  delivered: '#9CA3AF', // gray
}

// Fonction pour générer une courbe de Bézier entre deux points
function generateCurvePath(x1, y1, x2, y2) {
  const cx1 = x1 + (x2 - x1) * 0.3
  const cy1 = y1 - (y1 - y2) * 0.5
  const cx2 = x2 - (x2 - x1) * 0.3
  const cy2 = y2 + (y1 - y2) * 0.3
  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`
}

export default function ExportFlowMap({ activeShipments = [] }) {
  // Regrouper les shipments par destination
  const shipmentsByDestination = activeShipments.reduce((acc, shipment) => {
    const port = PORTS.find(p =>
      shipment.destinationPort?.toLowerCase().includes(p.name.toLowerCase()) ||
      shipment.buyer?.city?.toLowerCase().includes(p.name.toLowerCase())
    )
    
    if (port) {
      if (!acc[port.id]) {
        acc[port.id] = {
          port,
          shipments: [],
          totalWeightKg: 0,
          status: shipment.status,
        }
      }
      acc[port.id].shipments.push(shipment)
      acc[port.id].totalWeightKg += shipment.totalWeightKg || 0
      // Prioriser le statut: certified > in_transit > delivered
      if (shipment.status === 'certified' && acc[port.id].status !== 'certified') {
        acc[port.id].status = 'certified'
      } else if (shipment.status === 'in_transit' && acc[port.id].status === 'delivered') {
        acc[port.id].status = 'in_transit'
      }
    }
    return acc
  }, {})

  const destinations = Object.values(shipmentsByDestination)
  const lomePort = PORTS.find(p => p.id === 'lome')

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-chain-cyan/10 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-sans font-bold text-text-dark">Flux d'exportation en cours</h3>
        <p className="text-sm font-body text-text-dark/50 mt-1">
          Vos expéditions actives entre Lomé et les ports européens
        </p>
      </div>

      {/* SVG Map */}
      <div className="relative w-full aspect-[4/3] mb-6">
        <svg
          viewBox="0 0 800 600"
          className="w-full h-full"
          style={{ backgroundColor: '#F8FAFC', borderRadius: '12px' }}
        >
          {/* Simplified world map background - Atlantic focus */}
          <g opacity="0.1">
            {/* Africa outline - very simplified */}
            <path
              d="M 200 300 Q 250 280 300 320 Q 350 360 320 450 Q 280 520 250 500 Q 200 480 180 400 Q 160 350 200 300"
              fill="#1E293B"
            />
            {/* Europe outline - very simplified */}
            <path
              d="M 320 100 Q 380 80 450 120 Q 500 160 480 220 Q 440 260 380 240 Q 320 220 300 160 Q 290 120 320 100"
              fill="#1E293B"
            />
          </g>

          {/* Connection lines */}
          {destinations.map(({ port, status, totalWeightKg }) => {
            const color = STATUS_COLORS[status] || STATUS_COLORS.delivered
            // Épaisseur proportionnelle au tonnage (min 2, max 8)
            const strokeWidth = Math.max(2, Math.min(8, Math.sqrt(totalWeightKg) / 5))
            const path = generateCurvePath(lomePort.x, lomePort.y, port.x, port.y)

            return (
              <g key={port.id}>
                {/* Static line */}
                <path
                  d={path}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  fill="none"
                  opacity="0.3"
                />
                {/* Animated stream */}
                <motion.path
                  d={path}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: path.length, strokeDashoffset: path.length }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  opacity={0.8}
                />
              </g>
            )
          })}

          {/* Port markers */}
          {[lomePort, ...destinations.map(d => d.port)].filter(Boolean).map((port) => {
            const isLome = port.id === 'lome'
            const destData = destinations.find(d => d.port.id === port.id)
            const status = isLome ? null : destData?.status
            const color = status ? STATUS_COLORS[status] : '#1E293B'

            return (
              <g key={port.id}>
                {/* Marker circle */}
                <circle
                  cx={port.x}
                  cy={port.y}
                  r={isLome ? 12 : 8}
                  fill={color}
                  stroke="white"
                  strokeWidth={2}
                  className={isLome ? '' : 'cursor-pointer hover:r-10 transition-all'}
                />
                {/* Pulse effect for active destinations */}
                {!isLome && status && (
                  <motion.circle
                    cx={port.x}
                    cy={port.y}
                    r={8}
                    fill={color}
                    opacity={0.5}
                    animate={{ r: [8, 16, 8], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                {/* Flag emoji */}
                <text
                  x={port.x}
                  y={port.y - 20}
                  fontSize={20}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {FLAGS[port.country] || ''}
                </text>
                {/* Port name */}
                <text
                  x={port.x}
                  y={port.y + 28}
                  fontSize={11}
                  textAnchor="middle"
                  fill="#1E293B"
                  fontWeight="600"
                >
                  {port.name}
                </text>
                {/* Shipment count for destinations */}
                {!isLome && destData && (
                  <text
                    x={port.x}
                    y={port.y + 42}
                    fontSize={10}
                    textAnchor="middle"
                    fill="#64748B"
                  >
                    {destData.shipments.length} exp. · {new Intl.NumberFormat('fr-FR').format(destData.totalWeightKg)} kg
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs font-body">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#06B6D4]" />
          <span className="text-text-dark/70">Certifié (attente embarquement)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#10B981]" />
          <span className="text-text-dark/70">En transit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#9CA3AF]" />
          <span className="text-text-dark/70">Livré ce mois</span>
        </div>
      </div>

      {/* Empty state */}
      {destinations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm font-body text-text-dark/50">
            Aucune expédition en cours
          </p>
        </div>
      )}
    </div>
  )
}
