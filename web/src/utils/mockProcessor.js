// ── Profil transformateur ──────────────────────────────────────────────────────
export function getMockProcessorProfile() {
  return {
    id: 'proc-atc-kpalime',
    name: 'ATC Kpalimé',
    commune: 'Kpalimé',
    region: 'Plateaux',
    capacityKg: 5000,
    currentLoadKg: 2840,
    specialties: ['Cacao', 'Robusta'],
    certifications: ['Bio'],
    staffCount: 8,
  }
}

// ── Structure vide d'un objet quality ──────────────────────────────────────────
const EMPTY_QUALITY = {
  fermentation: { startedAt: null, completedAt: null, targetDays: 6, readings: [] },
  drying: { startedAt: null, completedAt: null, method: null, humidityStart: null, humidityFinal: null, readings: [] },
  sorting: { completedAt: null, weightAfterSortingKg: null, rejectPct: null, beanSizeCategory: null },
  grading: { finalGrade: null, flavorProfile: [], defects: [], inspectedBy: null, inspectedAt: null, notes: '', photos: [], onChainHash: null, onChainTxHash: null },
}

// ── Données enrichies ──────────────────────────────────────────────────────────
const ALL_LOTS = [

  // ══ Reçus — en attente de démarrage ═══════════════════════════════════════
  {
    id: 'plot-001', lotUuid: 'LOT-2026-0882',
    originCooperative: { name: 'SCOOPS Wawa', commune: 'Wawa' },
    producerName: 'Edem Tchakalo', producerPhone: '+228 90 11 23 45', producerCommune: 'Wawa',
    parcelName: 'Parcelle Wawa-Centre', parcelAreaHa: 1.8,
    species: 'Cacao', weightKg: 91.2,
    receivedAt: '2026-05-13T07:30:00Z', status: 'received',
    quality: { ...EMPTY_QUALITY },
    estimatedReadyDate: '2026-05-22',
  },
  {
    id: 'plot-002', lotUuid: 'LOT-2026-0893',
    originCooperative: { name: 'SCOOPS Wawa', commune: 'Wawa' },
    producerName: 'Kofi Agbenyega', producerPhone: '+228 91 34 56 78', producerCommune: 'Kpalimé',
    parcelName: 'Parcelle Dzogbégan', parcelAreaHa: 2.1,
    species: 'Cacao', weightKg: 88.0,
    receivedAt: '2026-05-13T09:00:00Z', status: 'received',
    quality: { ...EMPTY_QUALITY },
    estimatedReadyDate: '2026-05-22',
  },
  {
    id: 'plot-003', lotUuid: 'LOT-2026-0881',
    originCooperative: { name: 'SCOOPS Wawa', commune: 'Wawa' },
    producerName: 'Kossi Akakpo', producerPhone: '+228 92 56 78 90', producerCommune: 'Tomégbé',
    parcelName: 'Parcelle Tomégbé-Bas', parcelAreaHa: 1.3,
    species: 'Robusta', weightKg: 63.7,
    receivedAt: '2026-05-12T14:00:00Z', status: 'received',
    quality: { ...EMPTY_QUALITY },
    estimatedReadyDate: '2026-05-21',
  },
  {
    id: 'plot-004', lotUuid: 'LOT-2026-0879',
    originCooperative: { name: 'SCOOPS Wawa', commune: 'Wawa' },
    producerName: 'Kafui Dantoh', producerPhone: '+228 93 78 90 12', producerCommune: 'Badou',
    parcelName: 'Parcelle Badou-Ouest', parcelAreaHa: 2.6,
    species: 'Cacao', weightKg: 108.5,
    receivedAt: '2026-05-12T10:30:00Z', status: 'received',
    quality: { ...EMPTY_QUALITY },
    estimatedReadyDate: '2026-05-21',
  },

  // ══ Fermentation en cours ══════════════════════════════════════════════════
  {
    id: 'plot-005', lotUuid: 'LOT-2026-0870',
    originCooperative: { name: 'SCOOPS Wawa', commune: 'Wawa' },
    producerName: 'Kwami Adjovi', producerPhone: '+228 90 23 45 67', producerCommune: 'Akébou',
    parcelName: 'Parcelle Akébou-Nord', parcelAreaHa: 3.2,
    species: 'Cacao', weightKg: 77.3,
    receivedAt: '2026-05-08T08:00:00Z', status: 'fermenting',
    quality: {
      fermentation: {
        startedAt: '2026-05-08T10:00:00Z', completedAt: null, targetDays: 6,
        readings: [
          { day: 1, takenAt: '2026-05-09T10:00:00Z', tempC: 38.2, humidityPct: 82, notes: 'Démarrage normal' },
          { day: 2, takenAt: '2026-05-10T10:00:00Z', tempC: 43.5, humidityPct: 79, notes: '' },
          { day: 3, takenAt: '2026-05-11T10:00:00Z', tempC: 46.8, humidityPct: 77, notes: 'Montée en température normale' },
          { day: 4, takenAt: '2026-05-12T10:00:00Z', tempC: 47.2, humidityPct: 76, notes: '' },
          { day: 5, takenAt: '2026-05-13T10:00:00Z', tempC: 45.1, humidityPct: 78, notes: 'Belle fermentation, arômes fruités' },
        ],
      },
      drying: { startedAt: null, completedAt: null, method: null, humidityStart: null, humidityFinal: null, readings: [] },
      sorting: { completedAt: null, weightAfterSortingKg: null, rejectPct: null, beanSizeCategory: null },
      grading: { finalGrade: null, flavorProfile: [], defects: [], inspectedBy: null, inspectedAt: null, notes: '', photos: [], onChainHash: null, onChainTxHash: null },
    },
    estimatedReadyDate: '2026-05-16',
  },
  {
    id: 'plot-006', lotUuid: 'LOT-2026-0865',
    originCooperative: { name: 'SCOOPS Wawa', commune: 'Wawa' },
    producerName: 'Mensah Gbéha', producerPhone: '+228 91 45 67 89', producerCommune: 'Tomégbé',
    parcelName: 'Parcelle Tomégbé-Haut', parcelAreaHa: 1.7,
    species: 'Robusta', weightKg: 59.6,
    receivedAt: '2026-05-09T07:00:00Z', status: 'fermenting',
    quality: {
      fermentation: {
        startedAt: '2026-05-09T08:00:00Z', completedAt: null, targetDays: 6,
        readings: [
          { day: 1, takenAt: '2026-05-10T08:00:00Z', tempC: 39.0, humidityPct: 83, notes: '' },
          { day: 2, takenAt: '2026-05-11T08:00:00Z', tempC: 44.2, humidityPct: 80, notes: '' },
          { day: 3, takenAt: '2026-05-12T08:00:00Z', tempC: 46.8, humidityPct: 77, notes: '' },
          { day: 4, takenAt: '2026-05-13T08:00:00Z', tempC: 47.5, humidityPct: 75, notes: '' },
        ],
      },
      drying: { startedAt: null, completedAt: null, method: null, humidityStart: null, humidityFinal: null, readings: [] },
      sorting: { completedAt: null, weightAfterSortingKg: null, rejectPct: null, beanSizeCategory: null },
      grading: { finalGrade: null, flavorProfile: [], defects: [], inspectedBy: null, inspectedAt: null, notes: '', photos: [], onChainHash: null, onChainTxHash: null },
    },
    estimatedReadyDate: '2026-05-17',
  },
  {
    id: 'plot-007', lotUuid: 'LOT-2026-0860',
    originCooperative: { name: 'SCOOPS Wawa', commune: 'Wawa' },
    producerName: 'Ama Dossou', producerPhone: '+228 92 67 89 01', producerCommune: 'Agou',
    parcelName: 'Parcelle Agou-Haut', parcelAreaHa: 2.4,
    species: 'Cacao', weightKg: 95.0,
    receivedAt: '2026-05-06T09:00:00Z', status: 'fermenting',
    quality: {
      fermentation: {
        startedAt: '2026-05-06T10:00:00Z', completedAt: null, targetDays: 6,
        readings: [
          { day: 1, takenAt: '2026-05-07T10:00:00Z', tempC: 38.5, humidityPct: 82, notes: 'Démarrage' },
          { day: 2, takenAt: '2026-05-08T10:00:00Z', tempC: 44.0, humidityPct: 79, notes: '' },
          { day: 3, takenAt: '2026-05-09T10:00:00Z', tempC: 48.2, humidityPct: 76, notes: '' },
          { day: 4, takenAt: '2026-05-10T10:00:00Z', tempC: 49.1, humidityPct: 75, notes: 'Température haute' },
          { day: 5, takenAt: '2026-05-11T10:00:00Z', tempC: 50.1, humidityPct: 74, notes: 'Fermentation prolongée — surveiller' },
          { day: 6, takenAt: '2026-05-12T10:00:00Z', tempC: 48.8, humidityPct: 75, notes: '' },
          { day: 7, takenAt: '2026-05-13T10:00:00Z', tempC: 47.2, humidityPct: 76, notes: 'À clôturer dès que possible' },
        ],
      },
      drying: { startedAt: null, completedAt: null, method: null, humidityStart: null, humidityFinal: null, readings: [] },
      sorting: { completedAt: null, weightAfterSortingKg: null, rejectPct: null, beanSizeCategory: null },
      grading: { finalGrade: null, flavorProfile: [], defects: [], inspectedBy: null, inspectedAt: null, notes: '', photos: [], onChainHash: null, onChainTxHash: null },
    },
    estimatedReadyDate: '2026-05-15',
  },
  {
    id: 'plot-008', lotUuid: 'LOT-2026-0855',
    originCooperative: { name: 'SCOOPS Wawa', commune: 'Wawa' },
    producerName: 'Yawa Kakou', producerPhone: '+228 93 89 01 23', producerCommune: 'Kpalimé',
    parcelName: 'Parcelle Kpalimé-Vallée', parcelAreaHa: 0.9,
    species: 'Cacao', weightKg: 28.8,
    receivedAt: '2026-05-10T11:00:00Z', status: 'fermenting',
    quality: {
      fermentation: {
        startedAt: '2026-05-10T12:00:00Z', completedAt: null, targetDays: 6,
        readings: [
          { day: 1, takenAt: '2026-05-11T12:00:00Z', tempC: 39.5, humidityPct: 81, notes: '' },
          { day: 2, takenAt: '2026-05-12T12:00:00Z', tempC: 44.5, humidityPct: 78, notes: '' },
          { day: 3, takenAt: '2026-05-13T08:00:00Z', tempC: 46.3, humidityPct: 77, notes: '' },
        ],
      },
      drying: { startedAt: null, completedAt: null, method: null, humidityStart: null, humidityFinal: null, readings: [] },
      sorting: { completedAt: null, weightAfterSortingKg: null, rejectPct: null, beanSizeCategory: null },
      grading: { finalGrade: null, flavorProfile: [], defects: [], inspectedBy: null, inspectedAt: null, notes: '', photos: [], onChainHash: null, onChainTxHash: null },
    },
    estimatedReadyDate: '2026-05-18',
  },
  {
    id: 'plot-009', lotUuid: 'LOT-2026-0848',
    originCooperative: { name: 'SCOOPS Wawa', commune: 'Wawa' },
    producerName: 'Kodzo Apedo', producerPhone: '+228 90 01 23 45', producerCommune: 'Kpalimé',
    parcelName: 'Parcelle Grande Forêt', parcelAreaHa: 4.1,
    species: 'Cacao', weightKg: 114.2,
    receivedAt: '2026-05-11T08:00:00Z', status: 'fermenting',
    quality: {
      fermentation: {
        startedAt: '2026-05-11T09:00:00Z', completedAt: null, targetDays: 6,
        readings: [
          { day: 1, takenAt: '2026-05-12T09:00:00Z', tempC: 38.8, humidityPct: 82, notes: '' },
          { day: 2, takenAt: '2026-05-13T09:00:00Z', tempC: 42.0, humidityPct: 80, notes: '' },
        ],
      },
      drying: { startedAt: null, completedAt: null, method: null, humidityStart: null, humidityFinal: null, readings: [] },
      sorting: { completedAt: null, weightAfterSortingKg: null, rejectPct: null, beanSizeCategory: null },
      grading: { finalGrade: null, flavorProfile: [], defects: [], inspectedBy: null, inspectedAt: null, notes: '', photos: [], onChainHash: null, onChainTxHash: null },
    },
    estimatedReadyDate: '2026-05-19',
  },
  {
    id: 'plot-010', lotUuid: 'LOT-2026-0840',
    originCooperative: { name: 'SCOOPS Wawa', commune: 'Wawa' },
    producerName: 'Afua Segbenou', producerPhone: '+228 91 12 34 56', producerCommune: 'Akébou',
    parcelName: 'Parcelle Colline Akébou', parcelAreaHa: 1.5,
    species: 'Robusta', weightKg: 47.9,
    receivedAt: '2026-05-12T06:00:00Z', status: 'fermenting',
    quality: {
      fermentation: {
        startedAt: '2026-05-12T07:00:00Z', completedAt: null, targetDays: 6,
        readings: [
          { day: 1, takenAt: '2026-05-13T07:00:00Z', tempC: 39.8, humidityPct: 83, notes: 'Démarrage normal' },
        ],
      },
      drying: { startedAt: null, completedAt: null, method: null, humidityStart: null, humidityFinal: null, readings: [] },
      sorting: { completedAt: null, weightAfterSortingKg: null, rejectPct: null, beanSizeCategory: null },
      grading: { finalGrade: null, flavorProfile: [], defects: [], inspectedBy: null, inspectedAt: null, notes: '', photos: [], onChainHash: null, onChainTxHash: null },
    },
    estimatedReadyDate: '2026-05-20',
  },

  // ══ Séchage en cours ══════════════════════════════════════════════════════
  {
    id: 'plot-011', lotUuid: 'LOT-2026-0830',
    originCooperative: { name: 'SCOOPS Wawa', commune: 'Wawa' },
    producerName: 'Mensah Gbéha', producerPhone: '+228 91 45 67 89', producerCommune: 'Tomégbé',
    parcelName: 'Parcelle Tomégbé-Centre', parcelAreaHa: 2.0,
    species: 'Cacao', weightKg: 81.5,
    receivedAt: '2026-05-03T07:00:00Z', status: 'drying',
    quality: {
      fermentation: {
        startedAt: '2026-05-03T08:00:00Z', completedAt: '2026-05-09T08:00:00Z', targetDays: 6,
        readings: [
          { day: 1, takenAt: '2026-05-04T08:00:00Z', tempC: 38.9, humidityPct: 83, notes: '' },
          { day: 2, takenAt: '2026-05-05T08:00:00Z', tempC: 44.1, humidityPct: 80, notes: '' },
          { day: 3, takenAt: '2026-05-06T08:00:00Z', tempC: 47.0, humidityPct: 77, notes: 'Bonne évolution' },
          { day: 4, takenAt: '2026-05-07T08:00:00Z', tempC: 48.5, humidityPct: 76, notes: '' },
          { day: 5, takenAt: '2026-05-08T08:00:00Z', tempC: 46.2, humidityPct: 77, notes: '' },
          { day: 6, takenAt: '2026-05-09T08:00:00Z', tempC: 43.0, humidityPct: 79, notes: 'Prêt pour le séchage' },
        ],
      },
      drying: {
        startedAt: '2026-05-09T08:00:00Z', completedAt: null, method: 'solaire',
        humidityStart: 55, humidityFinal: null,
        readings: [
          { hour: 12,  takenAt: '2026-05-09T20:00:00Z', humidityPct: 48, tempC: 35 },
          { hour: 24,  takenAt: '2026-05-10T08:00:00Z', humidityPct: 38, tempC: 33 },
          { hour: 48,  takenAt: '2026-05-11T08:00:00Z', humidityPct: 22, tempC: 34 },
          { hour: 72,  takenAt: '2026-05-12T08:00:00Z', humidityPct: 12, tempC: 33 },
          { hour: 96,  takenAt: '2026-05-13T08:00:00Z', humidityPct: 8.4, tempC: 32 },
        ],
      },
      sorting: { completedAt: null, weightAfterSortingKg: null, rejectPct: null, beanSizeCategory: null },
      grading: { finalGrade: null, flavorProfile: [], defects: [], inspectedBy: null, inspectedAt: null, notes: '', photos: [], onChainHash: null, onChainTxHash: null },
    },
    estimatedReadyDate: '2026-05-15',
  },
  {
    id: 'plot-012', lotUuid: 'LOT-2026-0820',
    originCooperative: { name: 'SCOOPS Wawa', commune: 'Wawa' },
    producerName: 'Kodzo Apedo', producerPhone: '+228 90 01 23 45', producerCommune: 'Kpalimé',
    parcelName: 'Parcelle Wawa-Sud', parcelAreaHa: 1.6,
    species: 'Robusta', weightKg: 52.5,
    receivedAt: '2026-05-02T09:00:00Z', status: 'drying',
    quality: {
      fermentation: {
        startedAt: '2026-05-02T10:00:00Z', completedAt: '2026-05-07T09:00:00Z', targetDays: 5,
        readings: [
          { day: 1, takenAt: '2026-05-03T10:00:00Z', tempC: 38.2, humidityPct: 84, notes: '' },
          { day: 2, takenAt: '2026-05-04T10:00:00Z', tempC: 43.8, humidityPct: 81, notes: '' },
          { day: 3, takenAt: '2026-05-05T10:00:00Z', tempC: 46.5, humidityPct: 78, notes: '' },
          { day: 4, takenAt: '2026-05-06T10:00:00Z', tempC: 47.1, humidityPct: 77, notes: '' },
          { day: 5, takenAt: '2026-05-07T10:00:00Z', tempC: 44.0, humidityPct: 79, notes: '' },
        ],
      },
      drying: {
        startedAt: '2026-05-07T09:00:00Z', completedAt: null, method: 'solaire',
        humidityStart: 52, humidityFinal: null,
        readings: [
          { hour: 12,  takenAt: '2026-05-07T21:00:00Z', humidityPct: 44, tempC: 34 },
          { hour: 24,  takenAt: '2026-05-08T09:00:00Z', humidityPct: 34, tempC: 33 },
          { hour: 48,  takenAt: '2026-05-09T09:00:00Z', humidityPct: 24, tempC: 33 },
          { hour: 72,  takenAt: '2026-05-10T09:00:00Z', humidityPct: 18, tempC: 32 },
          { hour: 96,  takenAt: '2026-05-11T09:00:00Z', humidityPct: 13, tempC: 31 },
          { hour: 120, takenAt: '2026-05-12T09:00:00Z', humidityPct: 10, tempC: 31 },
          { hour: 144, takenAt: '2026-05-13T09:00:00Z', humidityPct: 9.2, tempC: 30 },
        ],
      },
      sorting: { completedAt: null, weightAfterSortingKg: null, rejectPct: null, beanSizeCategory: null },
      grading: { finalGrade: null, flavorProfile: [], defects: [], inspectedBy: null, inspectedAt: null, notes: '', photos: [], onChainHash: null, onChainTxHash: null },
    },
    estimatedReadyDate: '2026-05-15',
  },
  {
    id: 'plot-013', lotUuid: 'LOT-2026-0810',
    originCooperative: { name: 'SCOOPS Wawa', commune: 'Wawa' },
    producerName: 'Abla Sossah', producerPhone: '+228 92 23 45 67', producerCommune: 'Kpimé',
    parcelName: 'Parcelle Kpimé-Haut', parcelAreaHa: 1.2,
    species: 'Cacao', weightKg: 38.0,
    receivedAt: '2026-05-04T08:00:00Z', status: 'drying',
    quality: {
      fermentation: {
        startedAt: '2026-05-04T09:00:00Z', completedAt: '2026-05-10T09:00:00Z', targetDays: 6,
        readings: [
          { day: 1, takenAt: '2026-05-05T09:00:00Z', tempC: 38.0, humidityPct: 82, notes: '' },
          { day: 2, takenAt: '2026-05-06T09:00:00Z', tempC: 43.0, humidityPct: 80, notes: '' },
          { day: 3, takenAt: '2026-05-07T09:00:00Z', tempC: 46.2, humidityPct: 77, notes: '' },
          { day: 4, takenAt: '2026-05-08T09:00:00Z', tempC: 48.9, humidityPct: 76, notes: '' },
          { day: 5, takenAt: '2026-05-09T09:00:00Z', tempC: 46.1, humidityPct: 77, notes: '' },
          { day: 6, takenAt: '2026-05-10T09:00:00Z', tempC: 42.5, humidityPct: 80, notes: '' },
        ],
      },
      drying: {
        startedAt: '2026-05-10T09:00:00Z', completedAt: null, method: 'mécanique',
        humidityStart: 58, humidityFinal: null,
        readings: [
          { hour: 12, takenAt: '2026-05-10T21:00:00Z', humidityPct: 42, tempC: 36 },
          { hour: 24, takenAt: '2026-05-11T09:00:00Z', humidityPct: 28, tempC: 36 },
          { hour: 36, takenAt: '2026-05-11T21:00:00Z', humidityPct: 16, tempC: 35 },
          { hour: 48, takenAt: '2026-05-12T09:00:00Z', humidityPct: 10, tempC: 35 },
          { hour: 60, takenAt: '2026-05-12T21:00:00Z', humidityPct: 8.1, tempC: 34 },
        ],
      },
      sorting: { completedAt: null, weightAfterSortingKg: null, rejectPct: null, beanSizeCategory: null },
      grading: { finalGrade: null, flavorProfile: [], defects: [], inspectedBy: null, inspectedAt: null, notes: '', photos: [], onChainHash: null, onChainTxHash: null },
    },
    estimatedReadyDate: '2026-05-15',
  },
  {
    id: 'plot-014', lotUuid: 'LOT-2026-0800',
    originCooperative: { name: 'SCOOPS Wawa', commune: 'Wawa' },
    producerName: 'Kossi Akakpo', producerPhone: '+228 92 56 78 90', producerCommune: 'Tomégbé',
    parcelName: 'Parcelle Tomégbé-Vallée', parcelAreaHa: 3.0,
    species: 'Cacao', weightKg: 97.2,
    receivedAt: '2026-04-30T07:00:00Z', status: 'drying',
    quality: {
      fermentation: {
        startedAt: '2026-04-30T08:00:00Z', completedAt: '2026-05-07T08:00:00Z', targetDays: 7,
        readings: [
          { day: 1, takenAt: '2026-05-01T08:00:00Z', tempC: 38.3, humidityPct: 83, notes: '' },
          { day: 2, takenAt: '2026-05-02T08:00:00Z', tempC: 44.5, humidityPct: 80, notes: '' },
          { day: 3, takenAt: '2026-05-03T08:00:00Z', tempC: 47.8, humidityPct: 77, notes: '' },
          { day: 4, takenAt: '2026-05-04T08:00:00Z', tempC: 50.4, humidityPct: 75, notes: 'Fermentation très active' },
          { day: 5, takenAt: '2026-05-05T08:00:00Z', tempC: 49.0, humidityPct: 76, notes: '' },
          { day: 6, takenAt: '2026-05-06T08:00:00Z', tempC: 45.8, humidityPct: 78, notes: '' },
          { day: 7, takenAt: '2026-05-07T08:00:00Z', tempC: 42.1, humidityPct: 80, notes: 'Très belle fermentation' },
        ],
      },
      drying: {
        startedAt: '2026-05-07T08:00:00Z', completedAt: null, method: 'solaire',
        humidityStart: 60, humidityFinal: null,
        readings: [
          { hour: 12,  takenAt: '2026-05-07T20:00:00Z', humidityPct: 50, tempC: 36 },
          { hour: 24,  takenAt: '2026-05-08T08:00:00Z', humidityPct: 38, tempC: 35 },
          { hour: 48,  takenAt: '2026-05-09T08:00:00Z', humidityPct: 26, tempC: 34 },
          { hour: 72,  takenAt: '2026-05-10T08:00:00Z', humidityPct: 16, tempC: 33 },
          { hour: 96,  takenAt: '2026-05-11T08:00:00Z', humidityPct: 11, tempC: 33 },
          { hour: 120, takenAt: '2026-05-12T08:00:00Z', humidityPct: 7.6, tempC: 32 },
        ],
      },
      sorting: { completedAt: null, weightAfterSortingKg: null, rejectPct: null, beanSizeCategory: null },
      grading: { finalGrade: null, flavorProfile: [], defects: [], inspectedBy: null, inspectedAt: null, notes: '', photos: [], onChainHash: null, onChainTxHash: null },
    },
    estimatedReadyDate: '2026-05-15',
  },
  {
    id: 'plot-015', lotUuid: 'LOT-2026-0838',
    originCooperative: { name: 'SCOOPS Wawa', commune: 'Wawa' },
    producerName: 'Kafui Dantoh', producerPhone: '+228 93 78 90 12', producerCommune: 'Badou',
    parcelName: 'Parcelle Badou-Forêt', parcelAreaHa: 2.2,
    species: 'Cacao', weightKg: 67.5,
    receivedAt: '2026-05-04T10:00:00Z', status: 'drying',
    quality: {
      fermentation: {
        startedAt: '2026-05-04T11:00:00Z', completedAt: '2026-05-10T11:00:00Z', targetDays: 6,
        readings: [
          { day: 1, takenAt: '2026-05-05T11:00:00Z', tempC: 39.2, humidityPct: 82, notes: '' },
          { day: 2, takenAt: '2026-05-06T11:00:00Z', tempC: 44.8, humidityPct: 79, notes: '' },
          { day: 3, takenAt: '2026-05-07T11:00:00Z', tempC: 47.5, humidityPct: 76, notes: '' },
          { day: 4, takenAt: '2026-05-08T11:00:00Z', tempC: 47.8, humidityPct: 76, notes: '' },
          { day: 5, takenAt: '2026-05-09T11:00:00Z', tempC: 45.0, humidityPct: 78, notes: '' },
          { day: 6, takenAt: '2026-05-10T11:00:00Z', tempC: 42.0, humidityPct: 80, notes: '' },
        ],
      },
      drying: {
        startedAt: '2026-05-10T11:00:00Z', completedAt: null, method: 'solaire',
        humidityStart: 54, humidityFinal: null,
        readings: [
          { hour: 12, takenAt: '2026-05-10T23:00:00Z', humidityPct: 45, tempC: 34 },
          { hour: 24, takenAt: '2026-05-11T11:00:00Z', humidityPct: 32, tempC: 34 },
          { hour: 48, takenAt: '2026-05-12T11:00:00Z', humidityPct: 18, tempC: 33 },
          { hour: 72, takenAt: '2026-05-13T11:00:00Z', humidityPct: 8.7, tempC: 32 },
        ],
      },
      sorting: { completedAt: null, weightAfterSortingKg: null, rejectPct: null, beanSizeCategory: null },
      grading: { finalGrade: null, flavorProfile: [], defects: [], inspectedBy: null, inspectedAt: null, notes: '', photos: [], onChainHash: null, onChainTxHash: null },
    },
    estimatedReadyDate: '2026-05-16',
  },

  // ══ Transformation terminée ════════════════════════════════════════════════
  {
    id: 'plot-016', lotUuid: 'LOT-2026-0762',
    originCooperative: { name: 'SCOOPS Wawa', commune: 'Wawa' },
    producerName: 'Edem Tchakalo', producerPhone: '+228 90 11 23 45', producerCommune: 'Wawa',
    parcelName: 'Parcelle Wawa-Plateau', parcelAreaHa: 2.8,
    species: 'Cacao', weightKg: 89.3,
    receivedAt: '2026-04-24T08:00:00Z', status: 'processed',
    quality: {
      fermentation: {
        startedAt: '2026-04-24T09:00:00Z', completedAt: '2026-04-30T09:00:00Z', targetDays: 6,
        readings: [
          { day: 1, takenAt: '2026-04-25T09:00:00Z', tempC: 38.1, humidityPct: 83, notes: '' },
          { day: 2, takenAt: '2026-04-26T09:00:00Z', tempC: 43.2, humidityPct: 80, notes: '' },
          { day: 3, takenAt: '2026-04-27T09:00:00Z', tempC: 47.5, humidityPct: 77, notes: '' },
          { day: 4, takenAt: '2026-04-28T09:00:00Z', tempC: 49.0, humidityPct: 76, notes: 'Pic optimal' },
          { day: 5, takenAt: '2026-04-29T09:00:00Z', tempC: 46.5, humidityPct: 77, notes: '' },
          { day: 6, takenAt: '2026-04-30T09:00:00Z', tempC: 42.8, humidityPct: 79, notes: 'Fermentation parfaite' },
        ],
      },
      drying: {
        startedAt: '2026-04-30T09:00:00Z', completedAt: '2026-05-08T09:00:00Z', method: 'solaire',
        humidityStart: 57, humidityFinal: 6.8,
        readings: [
          { hour: 12,  takenAt: '2026-04-30T21:00:00Z', humidityPct: 48, tempC: 35 },
          { hour: 24,  takenAt: '2026-05-01T09:00:00Z', humidityPct: 36, tempC: 35 },
          { hour: 48,  takenAt: '2026-05-02T09:00:00Z', humidityPct: 24, tempC: 34 },
          { hour: 72,  takenAt: '2026-05-03T09:00:00Z', humidityPct: 16, tempC: 33 },
          { hour: 96,  takenAt: '2026-05-04T09:00:00Z', humidityPct: 12, tempC: 33 },
          { hour: 120, takenAt: '2026-05-05T09:00:00Z', humidityPct: 10, tempC: 32 },
          { hour: 144, takenAt: '2026-05-06T09:00:00Z', humidityPct: 8.5, tempC: 32 },
          { hour: 168, takenAt: '2026-05-07T09:00:00Z', humidityPct: 7.2, tempC: 31 },
          { hour: 192, takenAt: '2026-05-08T09:00:00Z', humidityPct: 6.8, tempC: 31 },
        ],
      },
      sorting: {
        completedAt: '2026-05-08T14:00:00Z',
        weightAfterSortingKg: 82.5,
        rejectPct: 7.6,
        beanSizeCategory: 'large',
      },
      grading: {
        finalGrade: 'A',
        flavorProfile: ['fruité', 'cacao intense', 'épicé'],
        defects: [],
        inspectedBy: 'Kodjo Mensah',
        inspectedAt: '2026-05-08T16:00:00Z',
        notes: 'Lot exceptionnel — grade A confirmé. Arômes très prononcés.',
        photos: [],
        onChainHash: 'a3f8c2d14e9b7065432f1a8c3e5d7b92a1f6e4c8d2b0a9f7e5c3d1b8a4f6e2c0',
        onChainTxHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      },
    },
    estimatedReadyDate: '2026-05-08',
  },
  {
    id: 'plot-017', lotUuid: 'LOT-2026-0755',
    originCooperative: { name: 'SCOOPS Wawa', commune: 'Wawa' },
    producerName: 'Kwami Adjovi', producerPhone: '+228 90 23 45 67', producerCommune: 'Akébou',
    parcelName: 'Parcelle Akébou-Nord', parcelAreaHa: 3.2,
    species: 'Cacao', weightKg: 100.2,
    receivedAt: '2026-04-22T07:00:00Z', status: 'processed',
    quality: {
      fermentation: {
        startedAt: '2026-04-22T08:00:00Z', completedAt: '2026-04-29T08:00:00Z', targetDays: 7,
        readings: [
          { day: 1, takenAt: '2026-04-23T08:00:00Z', tempC: 38.5, humidityPct: 82, notes: '' },
          { day: 2, takenAt: '2026-04-24T08:00:00Z', tempC: 44.0, humidityPct: 79, notes: '' },
          { day: 3, takenAt: '2026-04-25T08:00:00Z', tempC: 47.8, humidityPct: 76, notes: '' },
          { day: 4, takenAt: '2026-04-26T08:00:00Z', tempC: 50.5, humidityPct: 75, notes: 'Pic très élevé — normal pour cette parcelle' },
          { day: 5, takenAt: '2026-04-27T08:00:00Z', tempC: 48.2, humidityPct: 76, notes: '' },
          { day: 6, takenAt: '2026-04-28T08:00:00Z', tempC: 44.5, humidityPct: 78, notes: '' },
          { day: 7, takenAt: '2026-04-29T08:00:00Z', tempC: 40.8, humidityPct: 80, notes: 'Fermentation longue — excellente' },
        ],
      },
      drying: {
        startedAt: '2026-04-29T08:00:00Z', completedAt: '2026-05-08T08:00:00Z', method: 'solaire',
        humidityStart: 59, humidityFinal: 7.0,
        readings: [
          { hour: 12,  takenAt: '2026-04-29T20:00:00Z', humidityPct: 50, tempC: 36 },
          { hour: 24,  takenAt: '2026-04-30T08:00:00Z', humidityPct: 38, tempC: 35 },
          { hour: 48,  takenAt: '2026-05-01T08:00:00Z', humidityPct: 26, tempC: 34 },
          { hour: 72,  takenAt: '2026-05-02T08:00:00Z', humidityPct: 18, tempC: 34 },
          { hour: 96,  takenAt: '2026-05-03T08:00:00Z', humidityPct: 13, tempC: 33 },
          { hour: 120, takenAt: '2026-05-04T08:00:00Z', humidityPct: 10, tempC: 33 },
          { hour: 144, takenAt: '2026-05-05T08:00:00Z', humidityPct: 8.5, tempC: 32 },
          { hour: 168, takenAt: '2026-05-06T08:00:00Z', humidityPct: 7.8, tempC: 32 },
          { hour: 192, takenAt: '2026-05-07T08:00:00Z', humidityPct: 7.2, tempC: 31 },
          { hour: 216, takenAt: '2026-05-08T08:00:00Z', humidityPct: 7.0, tempC: 31 },
        ],
      },
      sorting: {
        completedAt: '2026-05-08T13:00:00Z',
        weightAfterSortingKg: 92.8,
        rejectPct: 7.4,
        beanSizeCategory: 'large',
      },
      grading: {
        finalGrade: 'A',
        flavorProfile: ['floral', 'noisette', 'cacao intense'],
        defects: [],
        inspectedBy: 'Kodjo Mensah',
        inspectedAt: '2026-05-08T10:00:00Z',
        notes: 'Fermentation très longue, profil floral exceptionnel.',
        photos: [],
        onChainHash: 'b4e9d3c25f0a8176543e2b9d4f6c8a03b2e7f5a9c1d0b8e6c4a2d0b9e7f5c3a1',
        onChainTxHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
      },
    },
    estimatedReadyDate: '2026-05-08',
  },
  {
    id: 'plot-018', lotUuid: 'LOT-2026-0740',
    originCooperative: { name: 'SCOOPS Wawa', commune: 'Wawa' },
    producerName: 'Ama Dossou', producerPhone: '+228 92 67 89 01', producerCommune: 'Agou',
    parcelName: 'Parcelle Agou-Haut', parcelAreaHa: 1.9,
    species: 'Robusta', weightKg: 56.8,
    receivedAt: '2026-04-20T09:00:00Z', status: 'processed',
    quality: {
      fermentation: {
        startedAt: '2026-04-20T10:00:00Z', completedAt: '2026-04-25T10:00:00Z', targetDays: 5,
        readings: [
          { day: 1, takenAt: '2026-04-21T10:00:00Z', tempC: 38.0, humidityPct: 83, notes: '' },
          { day: 2, takenAt: '2026-04-22T10:00:00Z', tempC: 43.5, humidityPct: 80, notes: '' },
          { day: 3, takenAt: '2026-04-23T10:00:00Z', tempC: 46.2, humidityPct: 78, notes: '' },
          { day: 4, takenAt: '2026-04-24T10:00:00Z', tempC: 44.8, humidityPct: 79, notes: '' },
          { day: 5, takenAt: '2026-04-25T10:00:00Z', tempC: 41.5, humidityPct: 81, notes: '' },
        ],
      },
      drying: {
        startedAt: '2026-04-25T10:00:00Z', completedAt: '2026-05-02T10:00:00Z', method: 'mécanique',
        humidityStart: 51, humidityFinal: 7.3,
        readings: [
          { hour: 12,  takenAt: '2026-04-25T22:00:00Z', humidityPct: 42, tempC: 36 },
          { hour: 24,  takenAt: '2026-04-26T10:00:00Z', humidityPct: 30, tempC: 36 },
          { hour: 48,  takenAt: '2026-04-27T10:00:00Z', humidityPct: 20, tempC: 35 },
          { hour: 72,  takenAt: '2026-04-28T10:00:00Z', humidityPct: 14, tempC: 35 },
          { hour: 96,  takenAt: '2026-04-29T10:00:00Z', humidityPct: 11, tempC: 34 },
          { hour: 120, takenAt: '2026-04-30T10:00:00Z', humidityPct: 9.0, tempC: 34 },
          { hour: 144, takenAt: '2026-05-01T10:00:00Z', humidityPct: 7.8, tempC: 33 },
          { hour: 168, takenAt: '2026-05-02T10:00:00Z', humidityPct: 7.3, tempC: 33 },
        ],
      },
      sorting: {
        completedAt: '2026-05-02T14:00:00Z',
        weightAfterSortingKg: 52.2,
        rejectPct: 8.1,
        beanSizeCategory: 'medium',
      },
      grading: {
        finalGrade: 'B',
        flavorProfile: ['cacao intense', 'terreux'],
        defects: ['fermenté insuffisant'],
        inspectedBy: 'Adjoa Togbé',
        inspectedAt: '2026-05-02T16:00:00Z',
        notes: 'Grade B — bonne qualité. Légère sous-fermentation sur quelques fèves.',
        photos: [],
        onChainHash: 'c5f0e4d36a1b9287654d3c0e5f7d9b14c3f8g6b0e2c1a9f8d6c4b2a0e8f6d4b2',
        onChainTxHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
      },
    },
    estimatedReadyDate: '2026-05-02',
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

export function getQualityProgress(lot) {
  const { status, quality } = lot

  if (status === 'received') {
    return { stage: 'fermentation', progressPct: 0 }
  }

  if (status === 'fermenting') {
    const days = quality.fermentation.readings.length
    const target = quality.fermentation.targetDays
    return {
      stage: 'fermentation',
      progressPct: Math.min(Math.round((days / target) * 100), 99),
    }
  }

  if (status === 'drying') {
    if (quality.sorting.completedAt) {
      return { stage: 'grading', progressPct: 90 }
    }
    const readings = quality.drying.readings
    if (readings.length === 0) return { stage: 'drying', progressPct: 0 }
    const start = quality.drying.humidityStart ?? 55
    const current = readings[readings.length - 1].humidityPct
    const target = 7
    if (current <= target + 1) {
      return { stage: 'sorting', progressPct: 75 }
    }
    const pct = Math.max(0, Math.min(Math.round(((start - current) / (start - target)) * 65), 64))
    return { stage: 'drying', progressPct: pct }
  }

  if (status === 'processed') {
    return { stage: 'done', progressPct: 100 }
  }

  return { stage: 'fermentation', progressPct: 0 }
}

export function getQualityAlerts(lot) {
  const alerts = []
  const { status, quality } = lot

  if (status === 'fermenting') {
    const { fermentation } = quality
    const days = fermentation.readings.length
    if (days > fermentation.targetDays) {
      alerts.push(`Fermentation prolongée de ${days - fermentation.targetDays} jour(s)`)
    }
    const last = fermentation.readings[fermentation.readings.length - 1]
    if (last) {
      if (last.tempC > 49) alerts.push(`Température trop élevée : ${last.tempC}°C`)
      if (last.humidityPct > 85) alerts.push(`Humidité trop élevée : ${last.humidityPct} %`)
      const hoursSince = (Date.now() - new Date(last.takenAt).getTime()) / 3_600_000
      if (hoursSince > 26) alerts.push(`Pas de relevé depuis ${Math.round(hoursSince)} h`)
    }
  }

  if (status === 'drying') {
    const { drying } = quality
    const last = drying.readings[drying.readings.length - 1]
    if (last && last.humidityPct > 10) {
      alerts.push(`Humidité encore élevée : ${last.humidityPct} %`)
    }
  }

  return alerts
}

export function getNextAction(lot) {
  const { status, quality } = lot

  if (status === 'received') return 'Démarrer la fermentation'

  if (status === 'fermenting') {
    const days = quality.fermentation.readings.length
    const target = quality.fermentation.targetDays
    if (days >= target - 1) return 'Clôturer la fermentation et démarrer le séchage'
    return `Ajouter relevé J+${days + 1}`
  }

  if (status === 'drying') {
    const { drying, sorting } = quality
    if (sorting.completedAt) return 'Saisir le grade final'
    const last = drying.readings[drying.readings.length - 1]
    if (last && last.humidityPct <= 8) return 'Valider le tri et passer au grade final'
    return 'Ajouter relevé séchage'
  }

  if (status === 'processed') {
    return `Lot terminé — Grade ${quality.grading.finalGrade ?? '?'}`
  }

  return 'Aucune action requise'
}

// ── Exports publics ────────────────────────────────────────────────────────────

export function getMockProcessorLots() {
  return ALL_LOTS
}

export function getMockProcessorLotById(id) {
  return ALL_LOTS.find((l) => l.id === id || l.lotUuid === id) ?? null
}

export function getMockProcessorDashboard() {
  const lots = ALL_LOTS
  const received   = lots.filter((l) => l.status === 'received')
  const fermenting = lots.filter((l) => l.status === 'fermenting')
  const drying     = lots.filter((l) => l.status === 'drying')
  const processed  = lots.filter((l) => l.status === 'processed')

  const avgFermentDays =
    fermenting.reduce((s, l) => s + l.quality.fermentation.readings.length, 0) /
    (fermenting.length || 1)

  const dryingLastHumidities = drying
    .map((l) => {
      const r = l.quality.drying.readings
      return r.length > 0 ? r[r.length - 1].humidityPct : null
    })
    .filter(Boolean)
  const avgDryingHumidity =
    dryingLastHumidities.reduce((s, v) => s + v, 0) / (dryingLastHumidities.length || 1)

  const alertLots = lots.filter((l) => getQualityAlerts(l).length > 0)

  return {
    profile: getMockProcessorProfile(),
    pipeline: {
      received: received.length,
      fermenting: fermenting.length,
      drying: drying.length,
      ready: processed.length,
      avgFermentDays: parseFloat(avgFermentDays.toFixed(1)),
      avgDryingHumidity: parseFloat(avgDryingHumidity.toFixed(1)),
    },
    monthlyStats: {
      lotsProcessedThisMonth: 23,
      weightProcessedKg: 1240,
      avgFermentationDays: 6.2,
      avgFinalHumidity: 7.1,
      qualityGradeABreakdown: 78,
      rejectionRate: 1.2,
    },
    weeklyProduction: [
      { day: 'Lun', kgProcessed: 142 },
      { day: 'Mar', kgProcessed: 198 },
      { day: 'Mer', kgProcessed: 175 },
      { day: 'Jeu', kgProcessed: 220 },
      { day: 'Ven', kgProcessed: 168 },
      { day: 'Sam', kgProcessed: 205 },
      { day: 'Dim', kgProcessed: 132 },
    ],
    qualityGrades: [
      { grade: 'Grade A', value: 78, kg: 967, fill: '#4A6B2A' },
      { grade: 'Grade B', value: 18, kg: 223, fill: '#E8B547' },
      { grade: 'Grade C', value: 4,  kg: 50,  fill: '#D97706' },
    ],
    recentActivity: [
      { id: 'ev-01', type: 'lot_received',         lotUuid: 'LOT-2026-0893', description: 'Lot reçu de SCOOPS Wawa',                  timestamp: '2026-05-13T09:00:00Z' },
      { id: 'ev-02', type: 'lot_received',         lotUuid: 'LOT-2026-0882', description: 'Lot reçu de SCOOPS Wawa',                  timestamp: '2026-05-13T07:30:00Z' },
      { id: 'ev-03', type: 'fermentation_started', lotUuid: 'LOT-2026-0840', description: 'Fermentation démarrée (J+1)',              timestamp: '2026-05-12T07:00:00Z' },
      { id: 'ev-04', type: 'alert_humidity',       lotUuid: 'LOT-2026-0820', description: 'Alerte : humidité 9,2 % — encore élevée', timestamp: '2026-05-11T14:00:00Z' },
      { id: 'ev-05', type: 'drying_started',       lotUuid: 'LOT-2026-0830', description: 'Séchage démarré — humidité initiale 55 %', timestamp: '2026-05-09T08:00:00Z' },
      { id: 'ev-06', type: 'lot_completed',        lotUuid: 'LOT-2026-0762', description: 'Transformation terminée — Grade A',        timestamp: '2026-05-08T16:00:00Z' },
      { id: 'ev-07', type: 'fermentation_started', lotUuid: 'LOT-2026-0848', description: 'Fermentation démarrée (J+2)',              timestamp: '2026-05-11T09:00:00Z' },
      { id: 'ev-08', type: 'lot_completed',        lotUuid: 'LOT-2026-0755', description: 'Transformation terminée — Grade A',        timestamp: '2026-05-08T10:00:00Z' },
      { id: 'ev-09', type: 'drying_started',       lotUuid: 'LOT-2026-0810', description: 'Séchage démarré — humidité initiale 58 %', timestamp: '2026-05-10T09:00:00Z' },
      { id: 'ev-10', type: 'transferred_to_exporter', lotUuid: 'LOT-2026-0700', description: 'Transféré vers exportateur ETCA',      timestamp: '2026-05-07T11:00:00Z' },
    ],
    alertLots: alertLots.map((l) => ({
      id: l.id,
      lotUuid: l.lotUuid,
      producerName: l.producerName,
      status: l.status,
      alerts: getQualityAlerts(l),
    })),
  }
}
