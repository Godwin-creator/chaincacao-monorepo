const COOPERATIVES = [
  { cooperative: 'SCOOPS Wawa', commune: 'Kpalime', center: [0.681244, 6.902411] },
  { cooperative: 'Union Akebou', commune: 'Akebou', center: [0.742118, 7.014225] },
  { cooperative: 'Cacao Maritime Sud', commune: 'Vogan', center: [1.207551, 6.167842] },
  { cooperative: 'Plateaux Durable', commune: 'Badou', center: [0.632118, 7.533145] },
  { cooperative: 'Kpalime Ouest', commune: 'Tomegbe', center: [0.651108, 6.996314] },
]

const EXPORTERS = [
  { id: 'exp-001', name: 'CACAOMAX Lome', port: 'Port autonome de Lome' },
  { id: 'exp-002', name: 'Togo Premium Cocoa', port: 'Port autonome de Lome' },
  { id: 'exp-003', name: 'Golfe Export Commodities', port: 'Port autonome de Lome' },
]

const DESTINATIONS = [
  { buyer: 'Barry Callebaut', country: 'BE', port: 'Port d Anvers', city: 'Anvers' },
  { buyer: 'Cargill Cocoa', country: 'DE', port: 'Port de Hambourg', city: 'Hambourg' },
  { buyer: 'Cemoi', country: 'FR', port: 'Port du Havre', city: 'Le Havre' },
  { buyer: 'Tonys Chocolonely', country: 'NL', port: 'Port de Rotterdam', city: 'Rotterdam' },
  { buyer: 'ETO Lindt', country: 'CH', port: 'Terminal de Bale', city: 'Bale' },
]

const ALERT_CATALOG = {
  none: [],
  geojson_modified: [
    {
      code: 'GEOJSON_MODIFIED',
      severity: 'high',
      message: 'Le GeoJSON actuellement expose ne correspond plus au hash inscrit on-chain.',
    },
  ],
  hash_mismatch: [
    {
      code: 'HASH_MISMATCH',
      severity: 'high',
      message: 'Un decalage a ete detecte entre le hash de controle et la preuve blockchain.',
    },
  ],
  metadata_gap: [
    {
      code: 'CERTIFICATE_METADATA_GAP',
      severity: 'medium',
      message: 'Le numero de certificat est present mais le dossier douanier est incomplet.',
    },
  ],
  warning_manual_review: [
    {
      code: 'MANUAL_REVIEW',
      severity: 'low',
      message: 'Controle documentaire manuel recommande avant validation finale.',
    },
  ],
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function createPolygonFeature(name, centerLng, centerLat, delta = 0.0045) {
  return {
    type: 'Feature',
    properties: {
      name,
      crs: 'EPSG:4326',
    },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [Number((centerLng - delta).toFixed(6)), Number((centerLat - delta / 1.4).toFixed(6))],
        [Number((centerLng + delta / 1.2).toFixed(6)), Number((centerLat - delta / 1.9).toFixed(6))],
        [Number((centerLng + delta).toFixed(6)), Number((centerLat + delta / 1.6).toFixed(6))],
        [Number((centerLng - delta / 1.5).toFixed(6)), Number((centerLat + delta).toFixed(6))],
        [Number((centerLng - delta).toFixed(6)), Number((centerLat - delta / 1.4).toFixed(6))],
      ]],
    },
  }
}

function buildVerificationHistory(index, status, exportDate) {
  const history = [
    {
      id: `vh-${index + 1}-01`,
      actor: 'Registre ChainCacao',
      action: 'Lot exporté et dossier EUDR publié',
      timestamp: exportDate,
      txHash: `0xexp${String(index + 1).padStart(4, '0')}a93f7c1b6e5d4c2b8a7f6d5c4b3a2910f8e7d6c5b4a3`,
    },
  ]

  if (status === 'verified') {
    history.push({
      id: `vh-${index + 1}-02`,
      actor: 'Autorité douanière UE',
      action: 'Vérification on-chain confirmée',
      timestamp: `2026-05-${String((index % 9) + 11).padStart(2, '0')}T10:45:00Z`,
      txHash: `0xver${String(index + 1).padStart(4, '0')}b17d8c6e5a4f3c2d1e9a8b7c6d5e4f3a2b1c0d9e8f7`,
    })
  }

  return history
}

function buildLot(index) {
  const origin = COOPERATIVES[index % COOPERATIVES.length]
  const exporter = EXPORTERS[index % EXPORTERS.length]
  const destination = DESTINATIONS[index % DESTINATIONS.length]
  const scenarioKeys = ['none', 'warning_manual_review', 'none', 'geojson_modified', 'none', 'hash_mismatch', 'metadata_gap']
  const scenario = scenarioKeys[index % scenarioKeys.length]
  const status = index % 3 === 0 || index % 7 === 0 ? 'verified' : 'exported'
  const lotNumber = String(index + 1).padStart(3, '0')
  const exportDay = String((index % 20) + 1).padStart(2, '0')
  const exportDate = `2026-05-${exportDay}T08:30:00Z`
  const geoJson = createPolygonFeature(
    `${origin.cooperative} ${lotNumber}`,
    origin.center[0] + index * 0.0032,
    origin.center[1] + index * 0.0018,
    0.0038 + (index % 3) * 0.0005,
  )

  return {
    id: `ver-lot-${lotNumber}`,
    lotUuid: `EUDR-LOT-2026-${lotNumber}`,
    status,
    verified: status === 'verified',
    verifiedBy: status === 'verified' ? 'Autorite douaniere UE' : null,
    verifiedAt: status === 'verified' ? `2026-05-${String((index % 9) + 11).padStart(2, '0')}T10:45:00Z` : null,
    exporter,
    destination,
    exportDate,
    certificate: {
      number: `CC-EUDR-2026-${String(2000 + index).padStart(6, '0')}`,
      pdfUrl: '#',
    },
    product: {
      species: index % 5 === 0 ? 'Robusta' : 'Cacao',
      grade: index % 4 === 0 ? 'B' : 'A',
      weightKg: 72 + index * 4.8,
    },
    producer: {
      cooperative: origin.cooperative,
      commune: origin.commune,
      label: `${origin.cooperative} · ${origin.commune}`,
    },
    parcel: {
      name: `Parcelle ${lotNumber}`,
      areaHa: Number((1.6 + (index % 5) * 0.45).toFixed(2)),
      geoJson,
    },
    blockchain: {
      contractAddress: `0x${String(index + 1).padStart(2, '0')}a7c9d5e1f3b4c6d8e0a2b4c6d8e0f2a4b6c8d0e2`,
      registrationTxHash: `0xreg${String(index + 1).padStart(4, '0')}f5a7c9d1e3b5a7c9d1e3b5a7c9d1e3b5a7c9d1e3`,
      verificationTxHash: status === 'verified'
        ? `0xcnf${String(index + 1).padStart(4, '0')}e1d3c5b7a9f1e3d5c7b9a1e3d5c7b9a1e3d5c7b9`
        : null,
      network: 'Polygon Amoy Testnet',
    },
    conformityStatus: scenario === 'none' || scenario === 'warning_manual_review' ? 'compliant' : 'non_compliant',
    alerts: clone(ALERT_CATALOG[scenario]),
    integrityScenario: scenario,
    verificationHistory: buildVerificationHistory(index, status, exportDate),
    auditNotes: status === 'verified'
      ? 'Dossier complet et marqué comme vérifié.'
      : "En attente de vérification manuelle par l'autorité compétente.",
  }
}

let verifierLotsStore = Array.from({ length: 20 }, (_, index) => buildLot(index))

export function getMockVerifierLots(filters = {}) {
  const query = (filters.search ?? '').trim().toLowerCase()
  const statusFilter = (filters.status ?? 'all').toLowerCase()
  const complianceFilter = (filters.compliance ?? 'all').toLowerCase()

  return clone(
    verifierLotsStore.filter((lot) => {
      const matchesQuery =
        query.length === 0 ||
        lot.lotUuid.toLowerCase().includes(query) ||
        lot.producer.cooperative.toLowerCase().includes(query) ||
        lot.producer.commune.toLowerCase().includes(query) ||
        lot.exporter.name.toLowerCase().includes(query) ||
        lot.certificate.number.toLowerCase().includes(query)

      const matchesStatus = statusFilter === 'all' || lot.status.toLowerCase() === statusFilter
      const matchesCompliance =
        complianceFilter === 'all' || lot.conformityStatus.toLowerCase() === complianceFilter

      return matchesQuery && matchesStatus && matchesCompliance
    }),
  )
}

export function getMockLotDetails(uuid) {
  const lot = verifierLotsStore.find((item) => item.lotUuid === uuid || item.id === uuid)
  return lot ? clone(lot) : null
}

export function markMockLotVerified(lotId, verifiedBy = 'Autorité de vérification UE') {
  const lot = verifierLotsStore.find((item) => item.id === lotId || item.lotUuid === lotId)
  if (!lot) return null

  const timestamp = new Date().toISOString()
  const txHash = `0xvrf${String(Date.now()).slice(-10)}a7c9d1e3b5f7a9c1d3e5b7a9c1d3e5b7a9c1d3e5b7`

  lot.status = 'verified'
  lot.verified = true
  lot.verifiedBy = verifiedBy
  lot.verifiedAt = timestamp
  lot.blockchain.verificationTxHash = txHash
  lot.verificationHistory.push({
    id: `vh-${lot.id}-${lot.verificationHistory.length + 1}`,
    actor: verifiedBy,
    action: 'Lot marqué comme vérifié on-chain',
    timestamp,
    txHash,
  })

  return clone(lot)
}
