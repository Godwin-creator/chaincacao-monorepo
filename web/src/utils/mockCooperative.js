const ALL_LOTS = [
  // ── En attente (pending) ───────────────────────────────────────────────────
  {
    id: 'lot-001', lotUuid: 'LOT-2026-0891', status: 'pending',
    producer: { name: 'Kwami Adjovi', organization: 'GIE Akébou', commune: 'Akébou', phone: '+228 90 11 22 33' },
    species: 'Cacao', weightAnnouncedKg: 72.4, weightVerifiedKg: null, weightDeltaPct: null,
    harvestDate: '2026-05-09', receivedAt: null,
    parcelName: 'Parcelle Kpalimé-Nord', parcelAreaHa: 1.8,
    geoJson: null,
  },
  {
    id: 'lot-002', lotUuid: 'LOT-2026-0892', status: 'pending',
    producer: { name: 'Ama Dossou', organization: 'Indépendant', commune: 'Kloto', phone: '+228 90 44 55 66' },
    species: 'Robusta', weightAnnouncedKg: 55.8, weightVerifiedKg: null, weightDeltaPct: null,
    harvestDate: '2026-05-10', receivedAt: null,
    parcelName: 'Parcelle Agou-Bas', parcelAreaHa: 1.2,
    geoJson: null,
  },
  {
    id: 'lot-003', lotUuid: 'LOT-2026-0893', status: 'pending',
    producer: { name: 'Kofi Agbenyega', organization: 'GIE Wawa', commune: 'Wawa', phone: '+228 91 77 88 99' },
    species: 'Cacao', weightAnnouncedKg: 88.0, weightVerifiedKg: null, weightDeltaPct: null,
    harvestDate: '2026-05-10', receivedAt: null,
    parcelName: 'Parcelle Dzogbégan', parcelAreaHa: 2.1,
    geoJson: null,
  },
  {
    id: 'lot-004', lotUuid: 'LOT-2026-0894', status: 'pending',
    producer: { name: 'Séna Amétépé', organization: 'Indépendant', commune: 'Badou', phone: '+228 92 00 11 22' },
    species: 'Arabica', weightAnnouncedKg: 34.5, weightVerifiedKg: null, weightDeltaPct: null,
    harvestDate: '2026-05-11', receivedAt: null,
    parcelName: 'Parcelle Badou-Est', parcelAreaHa: 0.9,
    geoJson: null,
  },

  // ── Reçus — écart acceptable (received) ──────────────────────────────────
  {
    id: 'lot-005', lotUuid: 'LOT-2026-0882', status: 'received',
    producer: { name: 'Edem Tchakalo', organization: 'SCOOPS Wawa', commune: 'Wawa', phone: '+228 93 22 33 44' },
    species: 'Cacao', weightAnnouncedKg: 92.0, weightVerifiedKg: 91.2, weightDeltaPct: -0.87,
    harvestDate: '2026-05-08', receivedAt: '2026-05-11T08:15:00Z',
    parcelName: 'Parcelle Wawa-Centre', parcelAreaHa: 2.4,
    geoJson: {
      type: 'Polygon',
      coordinates: [[[1.021, 7.482], [1.023, 7.482], [1.023, 7.484], [1.021, 7.484], [1.021, 7.482]]],
    },
  },
  {
    id: 'lot-006', lotUuid: 'LOT-2026-0875', status: 'received',
    producer: { name: 'Abla Sossah', organization: 'GIE Kloto', commune: 'Kloto', phone: '+228 94 55 66 77' },
    species: 'Arabica', weightAnnouncedKg: 42.0, weightVerifiedKg: 42.0, weightDeltaPct: 0.0,
    harvestDate: '2026-05-09', receivedAt: '2026-05-10T14:10:00Z',
    parcelName: 'Parcelle Kpimé-Sud', parcelAreaHa: 1.1,
    geoJson: null,
  },
  {
    id: 'lot-007', lotUuid: 'LOT-2026-0865', status: 'received',
    producer: { name: 'Mensah Gbéha', organization: 'Indépendant', commune: 'Tomégbé', phone: '+228 95 88 99 00' },
    species: 'Robusta', weightAnnouncedKg: 60.2, weightVerifiedKg: 59.6, weightDeltaPct: -1.0,
    harvestDate: '2026-05-08', receivedAt: '2026-05-09T09:45:00Z',
    parcelName: 'Parcelle Tomégbé-Haut', parcelAreaHa: 1.5,
    geoJson: null,
  },
  {
    id: 'lot-008', lotUuid: 'LOT-2026-0855', status: 'received',
    producer: { name: 'Yawa Kakou', organization: 'GIE Kpalimé', commune: 'Kpalimé', phone: '+228 96 11 22 33' },
    species: 'Arabica', weightAnnouncedKg: 29.0, weightVerifiedKg: 28.8, weightDeltaPct: -0.69,
    harvestDate: '2026-05-07', receivedAt: '2026-05-08T10:30:00Z',
    parcelName: 'Parcelle Kpalimé-Vallée', parcelAreaHa: 0.8,
    geoJson: null,
  },
  {
    id: 'lot-009', lotUuid: 'LOT-2026-0848', status: 'received',
    producer: { name: 'Kodzo Apedo', organization: 'SCOOPS Wawa', commune: 'Wawa', phone: '+228 97 44 55 66' },
    species: 'Cacao', weightAnnouncedKg: 115.0, weightVerifiedKg: 114.2, weightDeltaPct: -0.70,
    harvestDate: '2026-05-06', receivedAt: '2026-05-07T13:20:00Z',
    parcelName: 'Parcelle Grande Forêt', parcelAreaHa: 3.2,
    geoJson: {
      type: 'Polygon',
      coordinates: [[[1.015, 7.490], [1.018, 7.490], [1.018, 7.493], [1.015, 7.493], [1.015, 7.490]]],
    },
  },
  {
    id: 'lot-010', lotUuid: 'LOT-2026-0840', status: 'received',
    producer: { name: 'Afua Segbenou', organization: 'Indépendant', commune: 'Akébou', phone: '+228 98 77 88 99' },
    species: 'Robusta', weightAnnouncedKg: 48.5, weightVerifiedKg: 47.9, weightDeltaPct: -1.24,
    harvestDate: '2026-05-05', receivedAt: '2026-05-06T11:00:00Z',
    parcelName: 'Parcelle Colline Akébou', parcelAreaHa: 1.3,
    geoJson: null,
  },

  // ── Alertes (alert — écart > 2%) ──────────────────────────────────────────
  {
    id: 'lot-011', lotUuid: 'LOT-2026-0879', status: 'alert',
    producer: { name: 'Kafui Dantoh', organization: 'GIE Badou', commune: 'Badou', phone: '+228 90 33 44 55' },
    species: 'Cacao', weightAnnouncedKg: 111.5, weightVerifiedKg: 108.5, weightDeltaPct: -2.69,
    harvestDate: '2026-05-09', receivedAt: '2026-05-10T16:30:00Z',
    parcelName: 'Parcelle Badou-Ouest', parcelAreaHa: 2.8,
    geoJson: null,
  },
  {
    id: 'lot-012', lotUuid: 'LOT-2026-0870', status: 'alert',
    producer: { name: 'Kwami Adjovi', organization: 'GIE Akébou', commune: 'Akébou', phone: '+228 90 11 22 33' },
    species: 'Cacao', weightAnnouncedKg: 80.2, weightVerifiedKg: 77.3, weightDeltaPct: -3.62,
    harvestDate: '2026-05-07', receivedAt: '2026-05-09T11:00:00Z',
    parcelName: 'Parcelle Akébou-Nord', parcelAreaHa: 2.0,
    geoJson: null,
  },
  {
    id: 'lot-013', lotUuid: 'LOT-2026-0860', status: 'alert',
    producer: { name: 'Ama Dossou', organization: 'Indépendant', commune: 'Kloto', phone: '+228 90 44 55 66' },
    species: 'Cacao', weightAnnouncedKg: 97.8, weightVerifiedKg: 95.0, weightDeltaPct: -2.86,
    harvestDate: '2026-05-06', receivedAt: '2026-05-08T15:20:00Z',
    parcelName: 'Parcelle Agou-Haut', parcelAreaHa: 2.5,
    geoJson: null,
  },

  // ── Transférés (transferred) ──────────────────────────────────────────────
  {
    id: 'lot-014', lotUuid: 'LOT-2026-0881', status: 'transferred',
    producer: { name: 'Kossi Akakpo', organization: 'SCOOPS Wawa', commune: 'Tomégbé', phone: '+228 91 00 11 22' },
    species: 'Robusta', weightAnnouncedKg: 65.0, weightVerifiedKg: 63.7, weightDeltaPct: -2.0,
    harvestDate: '2026-05-09', receivedAt: '2026-05-11T07:42:00Z',
    parcelName: 'Parcelle Tomégbé-Bas', parcelAreaHa: 1.7,
    geoJson: null,
  },
  {
    id: 'lot-015', lotUuid: 'LOT-2026-0845', status: 'transferred',
    producer: { name: 'Edem Tchakalo', organization: 'SCOOPS Wawa', commune: 'Wawa', phone: '+228 93 22 33 44' },
    species: 'Cacao', weightAnnouncedKg: 135.0, weightVerifiedKg: 134.0, weightDeltaPct: -0.74,
    harvestDate: '2026-05-04', receivedAt: '2026-05-05T09:30:00Z',
    parcelName: 'Parcelle Wawa-Plateau', parcelAreaHa: 3.5,
    geoJson: {
      type: 'Polygon',
      coordinates: [[[1.025, 7.485], [1.028, 7.485], [1.028, 7.488], [1.025, 7.488], [1.025, 7.485]]],
    },
  },
  {
    id: 'lot-016', lotUuid: 'LOT-2026-0838', status: 'transferred',
    producer: { name: 'Kafui Dantoh', organization: 'GIE Badou', commune: 'Badou', phone: '+228 90 33 44 55' },
    species: 'Arabica', weightAnnouncedKg: 68.0, weightVerifiedKg: 67.5, weightDeltaPct: -0.74,
    harvestDate: '2026-05-03', receivedAt: '2026-05-04T14:00:00Z',
    parcelName: 'Parcelle Badou-Forêt', parcelAreaHa: 1.9,
    geoJson: null,
  },
  {
    id: 'lot-017', lotUuid: 'LOT-2026-0830', status: 'transferred',
    producer: { name: 'Mensah Gbéha', organization: 'Indépendant', commune: 'Tomégbé', phone: '+228 95 88 99 00' },
    species: 'Cacao', weightAnnouncedKg: 82.0, weightVerifiedKg: 81.5, weightDeltaPct: -0.61,
    harvestDate: '2026-05-02', receivedAt: '2026-05-03T10:15:00Z',
    parcelName: 'Parcelle Tomégbé-Centre', parcelAreaHa: 2.2,
    geoJson: null,
  },
  {
    id: 'lot-018', lotUuid: 'LOT-2026-0820', status: 'transferred',
    producer: { name: 'Kodzo Apedo', organization: 'SCOOPS Wawa', commune: 'Wawa', phone: '+228 97 44 55 66' },
    species: 'Robusta', weightAnnouncedKg: 53.0, weightVerifiedKg: 52.5, weightDeltaPct: -0.94,
    harvestDate: '2026-05-01', receivedAt: '2026-05-02T08:45:00Z',
    parcelName: 'Parcelle Wawa-Sud', parcelAreaHa: 1.4,
    geoJson: null,
  },
  {
    id: 'lot-019', lotUuid: 'LOT-2026-0810', status: 'transferred',
    producer: { name: 'Abla Sossah', organization: 'GIE Kloto', commune: 'Kloto', phone: '+228 94 55 66 77' },
    species: 'Arabica', weightAnnouncedKg: 38.5, weightVerifiedKg: 38.0, weightDeltaPct: -1.30,
    harvestDate: '2026-04-30', receivedAt: '2026-05-01T15:00:00Z',
    parcelName: 'Parcelle Kpimé-Haut', parcelAreaHa: 1.0,
    geoJson: null,
  },
  {
    id: 'lot-020', lotUuid: 'LOT-2026-0800', status: 'transferred',
    producer: { name: 'Kossi Akakpo', organization: 'SCOOPS Wawa', commune: 'Tomégbé', phone: '+228 91 00 11 22' },
    species: 'Cacao', weightAnnouncedKg: 98.0, weightVerifiedKg: 97.2, weightDeltaPct: -0.82,
    harvestDate: '2026-04-29', receivedAt: '2026-04-30T11:30:00Z',
    parcelName: 'Parcelle Tomégbé-Vallée', parcelAreaHa: 2.6,
    geoJson: null,
  },
]

export function getMockCooperativeLots(filters = {}) {
  let lots = [...ALL_LOTS]

  if (filters.status && filters.status !== 'all') {
    lots = lots.filter((l) => l.status === filters.status)
  }
  if (filters.species && filters.species !== 'all') {
    lots = lots.filter((l) => l.species.toLowerCase() === filters.species.toLowerCase())
  }
  if (filters.search) {
    const q = filters.search.toLowerCase()
    lots = lots.filter(
      (l) =>
        l.lotUuid.toLowerCase().includes(q) ||
        l.producer.name.toLowerCase().includes(q) ||
        l.producer.commune.toLowerCase().includes(q),
    )
  }

  return lots
}

export function getMockLotByUuid(uuid) {
  return ALL_LOTS.find((l) => l.lotUuid === uuid) ?? null
}

export function getMockPendingLots() {
  return ALL_LOTS.filter((l) => l.status === 'pending')
}

export function getMockCooperativeData() {
  const pending = getMockPendingLots()
  const received = ALL_LOTS.filter((l) => l.status === 'received').slice(0, 8)

  return {
    profile: {
      id: 'coop-scoops-wawa-001',
      name: 'Coopérative SCOOPS Wawa',
      commune: 'Wawa',
      region: 'Plateaux',
      memberCount: 142,
    },

    pendingLots: pending.map((l) => ({
      id: l.id,
      lotUuid: l.lotUuid,
      producerName: l.producer.name,
      species: l.species,
      weightKg: l.weightAnnouncedKg,
      harvestDate: l.harvestDate,
      distanceKm: Math.round(Math.random() * 12 * 10) / 10,
    })),

    recentLots: received.map((l) => ({
      id: l.id,
      lotUuid: l.lotUuid,
      producerName: l.producer.name,
      species: l.species,
      weightKg: l.weightVerifiedKg ?? l.weightAnnouncedKg,
      receivedAt: l.receivedAt,
      status: l.status === 'received' ? 'Received' : 'Transferred',
      weightDelta: Math.abs(l.weightDeltaPct ?? 0),
    })),

    monthlyStats: {
      lotsReceived: 47,
      weightTotalKg: 2840,
      discrepancyAlerts: 3,
      avgDelta: 0.8,
    },

    weeklyVolume: [
      { day: 'Lun', weightKg: 320 },
      { day: 'Mar', weightKg: 485 },
      { day: 'Mer', weightKg: 390 },
      { day: 'Jeu', weightKg: 520 },
      { day: 'Ven', weightKg: 275 },
      { day: 'Sam', weightKg: 410 },
      { day: 'Dim', weightKg: 190 },
    ],

    speciesBreakdown: [
      { species: 'Cacao',   weight: 1820 },
      { species: 'Robusta', weight: 720  },
      { species: 'Arabica', weight: 300  },
    ],

    supplierProducers: [
      { id: 'p-01', name: 'Edem Tchakalo',  commune: 'Wawa',     volumeKg: 521 },
      { id: 'p-02', name: 'Kwami Adjovi',   commune: 'Akébou',   volumeKg: 468 },
      { id: 'p-03', name: 'Kafui Dantoh',   commune: 'Badou',    volumeKg: 385 },
      { id: 'p-04', name: 'Kossi Akakpo',   commune: 'Tomégbé',  volumeKg: 312 },
      { id: 'p-05', name: 'Ama Dossou',     commune: 'Kloto',    volumeKg: 247 },
    ],
  }
}

// ─── Transformateurs ──────────────────────────────────────────────────────────

export const MOCK_PROCESSORS = [
  {
    id: 'proc-001',
    name: 'ATC Kpalimé',
    commune: 'Kpalimé',
    region: 'Plateaux',
    specialties: ['Cacao', 'Robusta'],
    capacityKg: 5000,
    currentLoad: 2840,
    distanceKm: 18,
    certifications: ['Bio'],
    contactPhone: '+228 22 41 00 11',
  },
  {
    id: 'proc-002',
    name: 'CPCT Atakpamé',
    commune: 'Atakpamé',
    region: 'Plateaux',
    specialties: ['Cacao'],
    capacityKg: 8000,
    currentLoad: 6200,
    distanceKm: 45,
    certifications: ['Bio', 'Fairtrade'],
    contactPhone: '+228 22 42 00 22',
  },
  {
    id: 'proc-003',
    name: 'Togo Cacao Process',
    commune: 'Notsé',
    region: 'Plateaux',
    specialties: ['Cacao', 'Arabica', 'Robusta'],
    capacityKg: 12000,
    currentLoad: 4100,
    distanceKm: 72,
    certifications: ['Rainforest'],
    contactPhone: '+228 22 43 00 33',
  },
  {
    id: 'proc-004',
    name: 'Wawa Processing Unit',
    commune: 'Wawa',
    region: 'Plateaux',
    specialties: ['Cacao'],
    capacityKg: 3000,
    currentLoad: 1800,
    distanceKm: 5,
    certifications: [],
    contactPhone: '+228 22 44 00 44',
  },
]

export function getMockProcessors() {
  return MOCK_PROCESSORS
}

// ─── Transferts historiques ───────────────────────────────────────────────────

const MOCK_TRANSFER_HISTORY = [
  {
    id: 'tr-001',
    lotsCount: 6,
    lotsUuids: ['LOT-2026-0800', 'LOT-2026-0810', 'LOT-2026-0820', 'LOT-2026-0830', 'LOT-2026-0838', 'LOT-2026-0845'],
    totalWeightKg: 475.7,
    speciesBreakdown: [{ species: 'Cacao', weightKg: 314.5 }, { species: 'Robusta', weightKg: 120.5 }, { species: 'Arabica', weightKg: 40.7 }],
    processor: { id: 'proc-001', name: 'ATC Kpalimé', commune: 'Kpalimé' },
    transferredAt: '2026-05-08T06:30:00Z',
    txHash: '0x4a3f2b1c9e8d7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2',
    status: 'received_by_processor',
  },
  {
    id: 'tr-002',
    lotsCount: 4,
    lotsUuids: ['LOT-2026-0860', 'LOT-2026-0865', 'LOT-2026-0870', 'LOT-2026-0875'],
    totalWeightKg: 274.4,
    speciesBreakdown: [{ species: 'Cacao', weightKg: 172.3 }, { species: 'Robusta', weightKg: 59.6 }, { species: 'Arabica', weightKg: 42.0 }],
    processor: { id: 'proc-004', name: 'Wawa Processing Unit', commune: 'Wawa' },
    transferredAt: '2026-05-09T07:00:00Z',
    txHash: '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    status: 'in_transit',
  },
  {
    id: 'tr-003',
    lotsCount: 3,
    lotsUuids: ['LOT-2026-0879', 'LOT-2026-0881', 'LOT-2026-0882'],
    totalWeightKg: 263.4,
    speciesBreakdown: [{ species: 'Cacao', weightKg: 199.7 }, { species: 'Robusta', weightKg: 63.7 }],
    processor: { id: 'proc-002', name: 'CPCT Atakpamé', commune: 'Atakpamé' },
    transferredAt: '2026-05-10T08:15:00Z',
    txHash: '0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8',
    status: 'received_by_processor',
  },
  {
    id: 'tr-004',
    lotsCount: 2,
    lotsUuids: ['LOT-2026-0755', 'LOT-2026-0762'],
    totalWeightKg: 189.5,
    speciesBreakdown: [{ species: 'Cacao', weightKg: 189.5 }],
    processor: { id: 'proc-003', name: 'Togo Cacao Process', commune: 'Notsé' },
    transferredAt: '2026-05-03T09:45:00Z',
    txHash: '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4',
    status: 'received_by_processor',
  },
  {
    id: 'tr-005',
    lotsCount: 5,
    lotsUuids: ['LOT-2026-0710', 'LOT-2026-0718', 'LOT-2026-0725', 'LOT-2026-0732', 'LOT-2026-0740'],
    totalWeightKg: 402.1,
    speciesBreakdown: [{ species: 'Cacao', weightKg: 280.0 }, { species: 'Arabica', weightKg: 122.1 }],
    processor: { id: 'proc-001', name: 'ATC Kpalimé', commune: 'Kpalimé' },
    transferredAt: '2026-04-28T06:00:00Z',
    txHash: '0x7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8',
    status: 'received_by_processor',
  },
  {
    id: 'tr-006',
    lotsCount: 3,
    lotsUuids: ['LOT-2026-0680', 'LOT-2026-0690', 'LOT-2026-0698'],
    totalWeightKg: 228.8,
    speciesBreakdown: [{ species: 'Robusta', weightKg: 115.3 }, { species: 'Cacao', weightKg: 113.5 }],
    processor: { id: 'proc-004', name: 'Wawa Processing Unit', commune: 'Wawa' },
    transferredAt: '2026-04-22T10:30:00Z',
    txHash: '0x2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3',
    status: 'received_by_processor',
  },
  {
    id: 'tr-007',
    lotsCount: 7,
    lotsUuids: ['LOT-2026-0600', 'LOT-2026-0610', 'LOT-2026-0618', 'LOT-2026-0625', 'LOT-2026-0632', 'LOT-2026-0640', 'LOT-2026-0650'],
    totalWeightKg: 581.3,
    speciesBreakdown: [{ species: 'Cacao', weightKg: 405.0 }, { species: 'Robusta', weightKg: 110.0 }, { species: 'Arabica', weightKg: 66.3 }],
    processor: { id: 'proc-002', name: 'CPCT Atakpamé', commune: 'Atakpamé' },
    transferredAt: '2026-04-15T07:00:00Z',
    txHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6',
    status: 'received_by_processor',
  },
  {
    id: 'tr-008',
    lotsCount: 4,
    lotsUuids: ['LOT-2026-0540', 'LOT-2026-0550', 'LOT-2026-0560', 'LOT-2026-0570'],
    totalWeightKg: 347.6,
    speciesBreakdown: [{ species: 'Cacao', weightKg: 247.6 }, { species: 'Arabica', weightKg: 100.0 }],
    processor: { id: 'proc-003', name: 'Togo Cacao Process', commune: 'Notsé' },
    transferredAt: '2026-04-08T08:30:00Z',
    txHash: '0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9',
    status: 'received_by_processor',
  },
]

export function getMockTransferHistory() {
  return [...MOCK_TRANSFER_HISTORY].sort(
    (a, b) => new Date(b.transferredAt) - new Date(a.transferredAt),
  )
}

export function getMockTransferableLots() {
  return ALL_LOTS.filter((l) => l.status === 'received')
}
