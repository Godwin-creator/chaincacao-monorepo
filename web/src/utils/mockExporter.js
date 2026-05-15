// ── Profil exportateur ──────────────────────────────────────────────────────
export function getMockExporterProfile() {
  return {
    id: 'exp-cacaomax-lome',
    name: 'CACAOMAX Lomé',
    legalName: 'CACAOMAX Togo SARL',
    taxId: 'TG-2018-0034521',
    operatorEudrId: 'EU-OP-TG-CCM-2025-0142',
    address: 'Zone Portuaire Nord, BP 4521, Lomé, Togo',
    contactEmail: 'export@cacaomax.tg',
    region: 'Maritime',
    port: 'Port Autonome de Lomé',
    yearsActive: 7,
    certifications: ['EUDR', 'ISO 22000', 'Fairtrade'],
  }
}

// ── Acheteurs européens ─────────────────────────────────────────────────────
export function getMockExporterBuyers() {
  return [
    {
      id: 'buyer-001',
      name: 'Barry Callebaut',
      country: 'BE',
      city: 'Anvers',
      contractRef: 'BC-2026-TG-014',
      contractStatus: 'active',
    },
    {
      id: 'buyer-002',
      name: 'Cargill Cocoa',
      country: 'DE',
      city: 'Hambourg',
      contractRef: 'CCG-2026-W42',
      contractStatus: 'active',
    },
    {
      id: 'buyer-003',
      name: 'Cémoi',
      country: 'FR',
      city: 'Le Havre',
      contractRef: 'CEM-26-031',
      contractStatus: 'active',
    },
    {
      id: 'buyer-004',
      name: "Tony's Chocolonely",
      country: 'NL',
      city: 'Rotterdam',
      contractRef: 'TC-LOT-887',
      contractStatus: 'renewal',
    },
    {
      id: 'buyer-005',
      name: 'ETO Lindt',
      country: 'CH',
      city: 'Bâle',
      contractRef: 'LDT-2026-04',
      contractStatus: 'new',
    },
  ]
}

// ── Lots disponibles à l'export (transformés agrégés) ───────────────────────
export function getMockExportableLots() {
  return [
    {
      id: 'lot-exp-001',
      lotUuid: 'LOT-2026-0882',
      origin: {
        producer: 'Edem Tchakalo',
        cooperative: 'SCOOPS Wawa',
        processor: 'ATC Kpalimé',
      },
      species: 'Cacao',
      weightKg: 91.2,
      quality: {
        finalGrade: 'A',
        flavorProfile: ['Fruité', 'Floral'],
        humidityFinal: 7.2,
        onChainHash: '0x7f8a3c9d2e1b4f5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9',
      },
      receivedFromProcessorAt: '2026-05-10T08:30:00Z',
      status: 'available',
      reservedForShipmentId: null,
      parcel: {
        name: 'Parcelle Wawa-Centre',
        areaHa: 1.8,
        geoJson: null,
        commune: 'Wawa',
        region: 'Plateaux',
      },
      certifications: ['Bio'],
    },
    {
      id: 'lot-exp-002',
      lotUuid: 'LOT-2026-0893',
      origin: {
        producer: 'Kofi Agbenyega',
        cooperative: 'SCOOPS Wawa',
        processor: 'ATC Kpalimé',
      },
      species: 'Cacao',
      weightKg: 88.0,
      quality: {
        finalGrade: 'A',
        flavorProfile: ['Chocolaté', 'Noisette'],
        humidityFinal: 7.5,
        onChainHash: '0x9e2d4f6a8b1c3e5d7f9a0b2c4d6e8f0a1b3c5d7e9f0a2b4c6d8e0f1a2b3c4d',
      },
      receivedFromProcessorAt: '2026-05-09T10:00:00Z',
      status: 'available',
      reservedForShipmentId: null,
      parcel: {
        name: 'Parcelle Dzogbégan',
        areaHa: 2.1,
        geoJson: null,
        commune: 'Kpalimé',
        region: 'Plateaux',
      },
      certifications: [],
    },
    {
      id: 'lot-exp-003',
      lotUuid: 'LOT-2026-0881',
      origin: {
        producer: 'Kossi Akakpo',
        cooperative: 'SCOOPS Wawa',
        processor: 'ATC Kpalimé',
      },
      species: 'Robusta',
      weightKg: 63.7,
      quality: {
        finalGrade: 'B',
        flavorProfile: ['Amer', 'Corps'],
        humidityFinal: 8.0,
        onChainHash: '0x3a5b7c9d1e2f4a6b8c0d1e2f4a6b8c0d1e2f4a6b8c0d1e2f4a6b8c0d1e2f4a6',
      },
      receivedFromProcessorAt: '2026-05-08T14:00:00Z',
      status: 'reserved',
      reservedForShipmentId: 'shp-001',
      parcel: {
        name: 'Parcelle Tomégbé-Bas',
        areaHa: 1.3,
        geoJson: null,
        commune: 'Tomégbé',
        region: 'Plateaux',
      },
      certifications: [],
    },
    {
      id: 'lot-exp-004',
      lotUuid: 'LOT-2026-0879',
      origin: {
        producer: 'Kafui Dantoh',
        cooperative: 'SCOOPS Wawa',
        processor: 'ATC Kpalimé',
      },
      species: 'Cacao',
      weightKg: 108.5,
      quality: {
        finalGrade: 'A',
        flavorProfile: ['Fruité', 'Épice'],
        humidityFinal: 7.0,
        onChainHash: '0x7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
      },
      receivedFromProcessorAt: '2026-05-07T10:30:00Z',
      status: 'available',
      reservedForShipmentId: null,
      parcel: {
        name: 'Parcelle Badou-Ouest',
        areaHa: 2.6,
        geoJson: null,
        commune: 'Badou',
        region: 'Plateaux',
      },
      certifications: ['Bio'],
    },
    {
      id: 'lot-exp-005',
      lotUuid: 'LOT-2026-0870',
      origin: {
        producer: 'Kwami Adjovi',
        cooperative: 'SCOOPS Wawa',
        processor: 'ATC Kpalimé',
      },
      species: 'Cacao',
      weightKg: 77.3,
      quality: {
        finalGrade: 'A',
        flavorProfile: ['Floral', 'Citrus'],
        humidityFinal: 7.1,
        onChainHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
      },
      receivedFromProcessorAt: '2026-05-06T08:00:00Z',
      status: 'shipped',
      reservedForShipmentId: 'shp-002',
      parcel: {
        name: 'Parcelle Akébou-Nord',
        areaHa: 3.2,
        geoJson: null,
        commune: 'Akébou',
        region: 'Plateaux',
      },
      certifications: ['Bio'],
    },
    {
      id: 'lot-exp-006',
      lotUuid: 'LOT-2026-0865',
      origin: {
        producer: 'Mensah Gbéha',
        cooperative: 'SCOOPS Wawa',
        processor: 'ATC Kpalimé',
      },
      species: 'Robusta',
      weightKg: 59.6,
      quality: {
        finalGrade: 'B',
        flavorProfile: ['Amer', 'Terreux'],
        humidityFinal: 7.8,
        onChainHash: '0x4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5',
      },
      receivedFromProcessorAt: '2026-05-05T07:00:00Z',
      status: 'available',
      reservedForShipmentId: null,
      parcel: {
        name: 'Parcelle Tomégbé-Haut',
        areaHa: 1.7,
        geoJson: null,
        commune: 'Tomégbé',
        region: 'Plateaux',
      },
      certifications: [],
    },
    {
      id: 'lot-exp-007',
      lotUuid: 'LOT-2026-0860',
      origin: {
        producer: 'Ama Dossou',
        cooperative: 'SCOOPS Wawa',
        processor: 'ATC Kpalimé',
      },
      species: 'Cacao',
      weightKg: 95.0,
      quality: {
        finalGrade: 'A',
        flavorProfile: ['Chocolaté', 'Vanille'],
        humidityFinal: 6.9,
        onChainHash: '0x8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e',
      },
      receivedFromProcessorAt: '2026-05-04T09:00:00Z',
      status: 'reserved',
      reservedForShipmentId: 'shp-001',
      parcel: {
        name: 'Parcelle Agou-Haut',
        areaHa: 2.4,
        geoJson: null,
        commune: 'Agou',
        region: 'Plateaux',
      },
      certifications: ['Bio'],
    },
    {
      id: 'lot-exp-008',
      lotUuid: 'LOT-2026-0855',
      origin: {
        producer: 'Yawa Kakou',
        cooperative: 'SCOOPS Wawa',
        processor: 'ATC Kpalimé',
      },
      species: 'Cacao',
      weightKg: 28.8,
      quality: {
        finalGrade: 'A',
        flavorProfile: ['Fruité', 'Léger'],
        humidityFinal: 7.3,
        onChainHash: '0x2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
      },
      receivedFromProcessorAt: '2026-05-03T11:00:00Z',
      status: 'available',
      reservedForShipmentId: null,
      parcel: {
        name: 'Parcelle Kpalimé-Vallée',
        areaHa: 0.9,
        geoJson: null,
        commune: 'Kpalimé',
        region: 'Plateaux',
      },
      certifications: [],
    },
    {
      id: 'lot-exp-009',
      lotUuid: 'LOT-2026-0848',
      origin: {
        producer: 'Komla Mensah',
        cooperative: 'SCOOPS Wawa',
        processor: 'ATC Kpalimé',
      },
      species: 'Cacao',
      weightKg: 102.3,
      quality: {
        finalGrade: 'A',
        flavorProfile: ['Épice', 'Boisé'],
        humidityFinal: 7.0,
        onChainHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
      },
      receivedFromProcessorAt: '2026-05-02T08:30:00Z',
      status: 'shipped',
      reservedForShipmentId: 'shp-003',
      parcel: {
        name: 'Parcelle Kpalimé-Centre',
        areaHa: 2.8,
        geoJson: null,
        commune: 'Kpalimé',
        region: 'Plateaux',
      },
      certifications: [],
    },
    {
      id: 'lot-exp-010',
      lotUuid: 'LOT-2026-0840',
      origin: {
        producer: 'Akouvi Gbeddy',
        cooperative: 'SCOOPS Wawa',
        processor: 'ATC Kpalimé',
      },
      species: 'Robusta',
      weightKg: 71.5,
      quality: {
        finalGrade: 'B',
        flavorProfile: ['Corps', 'Amer'],
        humidityFinal: 7.9,
        onChainHash: '0x9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
      },
      receivedFromProcessorAt: '2026-05-01T09:15:00Z',
      status: 'available',
      reservedForShipmentId: null,
      parcel: {
        name: 'Parcelle Notse-Ouest',
        areaHa: 2.0,
        geoJson: null,
        commune: 'Notse',
        region: 'Plateaux',
      },
      certifications: [],
    },
    {
      id: 'lot-exp-011',
      lotUuid: 'LOT-2026-0835',
      origin: {
        producer: 'Yawo Agbehonou',
        cooperative: 'SCOOPS Wawa',
        processor: 'ATC Kpalimé',
      },
      species: 'Cacao',
      weightKg: 86.4,
      quality: {
        finalGrade: 'A',
        flavorProfile: ['Floral', 'Doux'],
        humidityFinal: 7.1,
        onChainHash: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
      },
      receivedFromProcessorAt: '2026-04-30T07:45:00Z',
      status: 'reserved',
      reservedForShipmentId: 'shp-004',
      parcel: {
        name: 'Parcelle Vogan-Sud',
        areaHa: 1.9,
        geoJson: null,
        commune: 'Vogan',
        region: 'Maritime',
      },
      certifications: ['Bio'],
    },
    {
      id: 'lot-exp-012',
      lotUuid: 'LOT-2026-0828',
      origin: {
        producer: 'Komi Koffi',
        cooperative: 'SCOOPS Wawa',
        processor: 'ATC Kpalimé',
      },
      species: 'Cacao',
      weightKg: 93.7,
      quality: {
        finalGrade: 'A',
        flavorProfile: ['Chocolaté', 'Noisette'],
        humidityFinal: 6.8,
        onChainHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a1b2c3',
      },
      receivedFromProcessorAt: '2026-04-29T10:00:00Z',
      status: 'shipped',
      reservedForShipmentId: 'shp-005',
      parcel: {
        name: 'Parcelle Tabligbo-Nord',
        areaHa: 2.3,
        geoJson: null,
        commune: 'Tabligbo',
        region: 'Maritime',
      },
      certifications: [],
    },
    {
      id: 'lot-exp-013',
      lotUuid: 'LOT-2026-0820',
      origin: {
        producer: 'Mawufemor Agbo',
        cooperative: 'SCOOPS Wawa',
        processor: 'ATC Kpalimé',
      },
      species: 'Cacao',
      weightKg: 79.8,
      quality: {
        finalGrade: 'A',
        flavorProfile: ['Fruité', 'Acidulé'],
        humidityFinal: 7.2,
        onChainHash: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a1b2c3d4e',
      },
      receivedFromProcessorAt: '2026-04-28T08:30:00Z',
      status: 'available',
      reservedForShipmentId: null,
      parcel: {
        name: 'Parcelle Lomé-Est',
        areaHa: 1.6,
        geoJson: null,
        commune: 'Lomé',
        region: 'Maritime',
      },
      certifications: ['Bio'],
    },
    {
      id: 'lot-exp-014',
      lotUuid: 'LOT-2026-0815',
      origin: {
        producer: 'Sena Kossi',
        cooperative: 'SCOOPS Wawa',
        processor: 'ATC Kpalimé',
      },
      species: 'Robusta',
      weightKg: 65.2,
      quality: {
        finalGrade: 'B',
        flavorProfile: ['Amer', 'Intense'],
        humidityFinal: 7.7,
        onChainHash: '0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
      },
      receivedFromProcessorAt: '2026-04-27T09:00:00Z',
      status: 'available',
      reservedForShipmentId: null,
      parcel: {
        name: 'Parcelle Tsevie-Centre',
        areaHa: 1.4,
        geoJson: null,
        commune: 'Tsevie',
        region: 'Maritime',
      },
      certifications: [],
    },
    {
      id: 'lot-exp-015',
      lotUuid: 'LOT-2026-0808',
      origin: {
        producer: 'Kofi Amedzikpo',
        cooperative: 'SCOOPS Wawa',
        processor: 'ATC Kpalimé',
      },
      species: 'Cacao',
      weightKg: 97.5,
      quality: {
        finalGrade: 'A',
        flavorProfile: ['Vanille', 'Doux'],
        humidityFinal: 6.9,
        onChainHash: '0xa0b1c2d3e4f5a6b7c8d9e0f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
      },
      receivedFromProcessorAt: '2026-04-26T07:00:00Z',
      status: 'reserved',
      reservedForShipmentId: 'shp-006',
      parcel: {
        name: 'Parcelle Aného-Sud',
        areaHa: 2.5,
        geoJson: null,
        commune: 'Aného',
        region: 'Maritime',
      },
      certifications: [],
    },
    {
      id: 'lot-exp-016',
      lotUuid: 'LOT-2026-0800',
      origin: {
        producer: 'Mawuko Kpeglo',
        cooperative: 'SCOOPS Wawa',
        processor: 'ATC Kpalimé',
      },
      species: 'Cacao',
      weightKg: 84.3,
      quality: {
        finalGrade: 'A',
        flavorProfile: ['Épice', 'Chaleureux'],
        humidityFinal: 7.0,
        onChainHash: '0x2c3d4e5f6a7b8c9d0e1f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e',
      },
      receivedFromProcessorAt: '2026-04-25T10:30:00Z',
      status: 'shipped',
      reservedForShipmentId: 'shp-007',
      parcel: {
        name: 'Parcelle Kpalimé-Sud',
        areaHa: 2.1,
        geoJson: null,
        commune: 'Kpalimé',
        region: 'Plateaux',
      },
      certifications: ['Bio'],
    },
    {
      id: 'lot-exp-017',
      lotUuid: 'LOT-2026-0795',
      origin: {
        producer: 'Afiavi Koffi',
        cooperative: 'SCOOPS Wawa',
        processor: 'ATC Kpalimé',
      },
      species: 'Cacao',
      weightKg: 76.9,
      quality: {
        finalGrade: 'A',
        flavorProfile: ['Fruité', 'Tropical'],
        humidityFinal: 7.1,
        onChainHash: '0x5f6a7b8c9d0e1f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b',
      },
      receivedFromProcessorAt: '2026-04-24T08:00:00Z',
      status: 'available',
      reservedForShipmentId: null,
      parcel: {
        name: 'Parcelle Atakpamé-Ouest',
        areaHa: 1.8,
        geoJson: null,
        commune: 'Atakpamé',
        region: 'Plateaux',
      },
      certifications: [],
    },
    {
      id: 'lot-exp-018',
      lotUuid: 'LOT-2026-0788',
      origin: {
        producer: 'Kokou Tossou',
        cooperative: 'SCOOPS Wawa',
        processor: 'ATC Kpalimé',
      },
      species: 'Robusta',
      weightKg: 62.1,
      quality: {
        finalGrade: 'B',
        flavorProfile: ['Corps', 'Équilibré'],
        humidityFinal: 7.6,
        onChainHash: '0x8b9c0d1e1f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d',
      },
      receivedFromProcessorAt: '2026-04-23T09:15:00Z',
      status: 'available',
      reservedForShipmentId: null,
      parcel: {
        name: 'Parcelle Sokodé-Est',
        areaHa: 1.5,
        geoJson: null,
        commune: 'Sokodé',
        region: 'Centrale',
      },
      certifications: [],
    },
    {
      id: 'lot-exp-019',
      lotUuid: 'LOT-2026-0780',
      origin: {
        producer: 'Mawuena Dovi',
        cooperative: 'SCOOPS Wawa',
        processor: 'ATC Kpalimé',
      },
      species: 'Cacao',
      weightKg: 91.8,
      quality: {
        finalGrade: 'A',
        flavorProfile: ['Noisette', 'Crémeux'],
        humidityFinal: 6.8,
        onChainHash: '0xb0c1d1e1f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e',
      },
      receivedFromProcessorAt: '2026-04-22T07:30:00Z',
      status: 'reserved',
      reservedForShipmentId: 'shp-008',
      parcel: {
        name: 'Parcelle Kara-Nord',
        areaHa: 2.2,
        geoJson: null,
        commune: 'Kara',
        region: 'Kara',
      },
      certifications: ['Bio'],
    },
    {
      id: 'lot-exp-020',
      lotUuid: 'LOT-2026-0775',
      origin: {
        producer: 'Yawo Amegble',
        cooperative: 'SCOOPS Wawa',
        processor: 'ATC Kpalimé',
      },
      species: 'Cacao',
      weightKg: 83.4,
      quality: {
        finalGrade: 'A',
        flavorProfile: ['Chocolaté', 'Riche'],
        humidityFinal: 7.0,
        onChainHash: '0x2d3e4f5a6b7c8d9e0f1f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
      },
      receivedFromProcessorAt: '2026-04-21T08:45:00Z',
      status: 'shipped',
      reservedForShipmentId: 'shp-009',
      parcel: {
        name: 'Parcelle Bassar-Centre',
        areaHa: 1.9,
        geoJson: null,
        commune: 'Bassar',
        region: 'Kara',
      },
      certifications: [],
    },
    {
      id: 'lot-exp-021',
      lotUuid: 'LOT-2026-0768',
      origin: {
        producer: 'Akosua Mensah',
        cooperative: 'SCOOPS Wawa',
        processor: 'ATC Kpalimé',
      },
      species: 'Cacao',
      weightKg: 78.6,
      quality: {
        finalGrade: 'A',
        flavorProfile: ['Floral', 'Subtil'],
        humidityFinal: 7.2,
        onChainHash: '0x5f6a7b8c9d0e1f1f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6',
      },
      receivedFromProcessorAt: '2026-04-20T09:00:00Z',
      status: 'available',
      reservedForShipmentId: null,
      parcel: {
        name: 'Parcelle Niamtougou-Sud',
        areaHa: 1.7,
        geoJson: null,
        commune: 'Niamtougou',
        region: 'Kara',
      },
      certifications: ['Bio'],
    },
    {
      id: 'lot-exp-022',
      lotUuid: 'LOT-2026-0760',
      origin: {
        producer: 'Komi Dogbe',
        cooperative: 'SCOOPS Wawa',
        processor: 'ATC Kpalimé',
      },
      species: 'Robusta',
      weightKg: 67.9,
      quality: {
        finalGrade: 'B',
        flavorProfile: ['Amer', 'Prononcé'],
        humidityFinal: 7.8,
        onChainHash: '0x8c9d0e1f1f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9',
      },
      receivedFromProcessorAt: '2026-04-19T07:15:00Z',
      status: 'available',
      reservedForShipmentId: null,
      parcel: {
        name: 'Parcelle Dapaong-Ouest',
        areaHa: 1.6,
        geoJson: null,
        commune: 'Dapaong',
        region: 'Savanes',
      },
      certifications: [],
    },
    {
      id: 'lot-exp-023',
      lotUuid: 'LOT-2026-0755',
      origin: {
        producer: 'Mawulolo Kpadenou',
        cooperative: 'SCOOPS Wawa',
        processor: 'ATC Kpalimé',
      },
      species: 'Cacao',
      weightKg: 92.1,
      quality: {
        finalGrade: 'A',
        flavorProfile: ['Fruité', 'Vif'],
        humidityFinal: 6.9,
        onChainHash: '0xa0b1c1d1e1f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f',
      },
      receivedFromProcessorAt: '2026-04-18T08:30:00Z',
      status: 'reserved',
      reservedForShipmentId: 'shp-010',
      parcel: {
        name: 'Parcelle Mango-Centre',
        areaHa: 2.4,
        geoJson: null,
        commune: 'Mango',
        region: 'Savanes',
      },
      certifications: [],
    },
    {
      id: 'lot-exp-024',
      lotUuid: 'LOT-2026-0748',
      origin: {
        producer: 'Kokouvi Ganyo',
        cooperative: 'SCOOPS Wawa',
        processor: 'ATC Kpalimé',
      },
      species: 'Cacao',
      weightKg: 85.7,
      quality: {
        finalGrade: 'A',
        flavorProfile: ['Vanille', 'Aromatique'],
        humidityFinal: 7.0,
        onChainHash: '0x2c3d4e5f6a7b8c9d0e1e1f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a',
      },
      receivedFromProcessorAt: '2026-04-17T09:45:00Z',
      status: 'shipped',
      reservedForShipmentId: 'shp-011',
      parcel: {
        name: 'Parcelle Bafilo-Nord',
        areaHa: 2.0,
        geoJson: null,
        commune: 'Bafilo',
        region: 'Centrale',
      },
      certifications: ['Bio'],
    },
    {
      id: 'lot-exp-025',
      lotUuid: 'LOT-2026-0740',
      origin: {
        producer: 'Senam Koffi',
        cooperative: 'SCOOPS Wawa',
        processor: 'ATC Kpalimé',
      },
      species: 'Cacao',
      weightKg: 74.3,
      quality: {
        finalGrade: 'A',
        flavorProfile: ['Chocolaté', 'Profond'],
        humidityFinal: 7.1,
        onChainHash: '0x5f6a7b8c9d0e1f1e1f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c',
      },
      receivedFromProcessorAt: '2026-04-16T07:00:00Z',
      status: 'available',
      reservedForShipmentId: null,
      parcel: {
        name: 'Parcelle Sotouboua-Est',
        areaHa: 1.8,
        geoJson: null,
        commune: 'Sotouboua',
        region: 'Centrale',
      },
      certifications: [],
    },
  ]
}

// ── Shipments (expéditions) ──────────────────────────────────────────────────
function getBaseMockExporterShipments() {
  return [
    {
      id: 'shp-001',
      reference: 'SHP-2026-001',
      buyer: {
        id: 'buyer-001',
        name: 'Barry Callebaut',
        country: 'BE',
        city: 'Anvers',
        contractRef: 'BC-2026-TG-014',
      },
      status: 'preparing',
      createdAt: '2026-05-13T08:00:00Z',
      certifiedAt: null,
      shippedAt: null,
      deliveredAt: null,
      lots: ['lot-exp-003', 'lot-exp-007'],
      totalLotsCount: 2,
      totalWeightKg: 158.7,
      species: 'mixed',
      destinationPort: 'Port d\'Anvers',
      vesselName: null,
      containerNumber: null,
      estimatedArrival: null,
      actualArrival: null,
      certificate: null,
    },
    {
      id: 'shp-002',
      reference: 'SHP-2026-002',
      buyer: {
        id: 'buyer-002',
        name: 'Cargill Cocoa',
        country: 'DE',
        city: 'Hambourg',
        contractRef: 'CCG-2026-W42',
      },
      status: 'preparing',
      createdAt: '2026-05-12T09:30:00Z',
      certifiedAt: null,
      shippedAt: null,
      deliveredAt: null,
      lots: ['lot-exp-005'],
      totalLotsCount: 1,
      totalWeightKg: 77.3,
      species: 'cacao',
      destinationPort: 'Port de Hambourg',
      vesselName: null,
      containerNumber: null,
      estimatedArrival: null,
      actualArrival: null,
      certificate: null,
    },
    {
      id: 'shp-003',
      reference: 'SHP-2026-003',
      buyer: {
        id: 'buyer-003',
        name: 'Cémoi',
        country: 'FR',
        city: 'Le Havre',
        contractRef: 'CEM-26-031',
      },
      status: 'certified',
      createdAt: '2026-05-10T07:00:00Z',
      certifiedAt: '2026-05-10T10:30:00Z',
      shippedAt: null,
      deliveredAt: null,
      lots: ['lot-exp-009'],
      totalLotsCount: 1,
      totalWeightKg: 102.3,
      species: 'cacao',
      destinationPort: 'Port du Le Havre',
      vesselName: 'MV Atlantic Star',
      containerNumber: 'TGHU 1234567',
      estimatedArrival: '2026-05-20T08:00:00Z',
      actualArrival: null,
      certificate: {
        number: 'CC-EUDR-2026-000123',
        pdfUrl: '#',
        geoJsonUrl: '#',
        onChainHash: '0x7f8a3c9d2e1b4f5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9',
        txHash: '0x9e2d4f6a8b1c3e5d7f9a0b2c4d6e8f0a1b3c5d7e9f0a2b4c6d8e0f1a2b3c4d',
        issuedAt: '2026-05-10T10:30:00Z',
      },
    },
    {
      id: 'shp-004',
      reference: 'SHP-2026-004',
      buyer: {
        id: 'buyer-001',
        name: 'Barry Callebaut',
        country: 'BE',
        city: 'Anvers',
        contractRef: 'BC-2026-TG-014',
      },
      status: 'certified',
      createdAt: '2026-05-08T08:15:00Z',
      certifiedAt: '2026-05-08T11:45:00Z',
      shippedAt: null,
      deliveredAt: null,
      lots: ['lot-exp-011'],
      totalLotsCount: 1,
      totalWeightKg: 86.4,
      species: 'cacao',
      destinationPort: 'Port d\'Anvers',
      vesselName: 'MV Cacao Express',
      containerNumber: 'TGHU 9876543',
      estimatedArrival: '2026-05-18T10:00:00Z',
      actualArrival: null,
      certificate: {
        number: 'CC-EUDR-2026-000124',
        pdfUrl: '#',
        geoJsonUrl: '#',
        onChainHash: '0x3a5b7c9d1e2f4a6b8c0d1e2f4a6b8c0d1e2f4a6b8c0d1e2f4a6b8c0d1e2f4a6',
        txHash: '0x7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
        issuedAt: '2026-05-08T11:45:00Z',
      },
    },
    {
      id: 'shp-005',
      reference: 'SHP-2026-005',
      buyer: {
        id: 'buyer-004',
        name: "Tony's Chocolonely",
        country: 'NL',
        city: 'Rotterdam',
        contractRef: 'TC-LOT-887',
      },
      status: 'certified',
      createdAt: '2026-05-05T09:00:00Z',
      certifiedAt: '2026-05-05T12:30:00Z',
      shippedAt: null,
      deliveredAt: null,
      lots: ['lot-exp-012'],
      totalLotsCount: 1,
      totalWeightKg: 93.7,
      species: 'cacao',
      destinationPort: 'Port de Rotterdam',
      vesselName: 'MV Fair Trade',
      containerNumber: 'TGHU 4567890',
      estimatedArrival: '2026-05-15T14:00:00Z',
      actualArrival: null,
      certificate: {
        number: 'CC-EUDR-2026-000125',
        pdfUrl: '#',
        geoJsonUrl: '#',
        onChainHash: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
        txHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a1b2c3',
        issuedAt: '2026-05-05T12:30:00Z',
      },
    },
    {
      id: 'shp-006',
      reference: 'SHP-2026-006',
      buyer: {
        id: 'buyer-005',
        name: 'ETO Lindt',
        country: 'CH',
        city: 'Bâle',
        contractRef: 'LDT-2026-04',
      },
      status: 'in_transit',
      createdAt: '2026-05-02T08:30:00Z',
      certifiedAt: '2026-05-02T12:00:00Z',
      shippedAt: '2026-05-03T06:00:00Z',
      deliveredAt: null,
      lots: ['lot-exp-015'],
      totalLotsCount: 1,
      totalWeightKg: 97.5,
      species: 'cacao',
      destinationPort: 'Port de Bâle',
      vesselName: 'MV Lindt Voyager',
      containerNumber: 'TGHU 3456789',
      estimatedArrival: '2026-05-12T09:00:00Z',
      actualArrival: null,
      certificate: {
        number: 'CC-EUDR-2026-000126',
        pdfUrl: '#',
        geoJsonUrl: '#',
        onChainHash: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a1b2c3d4e',
        txHash: '0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
        issuedAt: '2026-05-02T12:00:00Z',
      },
    },
    {
      id: 'shp-007',
      reference: 'SHP-2026-007',
      buyer: {
        id: 'buyer-002',
        name: 'Cargill Cocoa',
        country: 'DE',
        city: 'Hambourg',
        contractRef: 'CCG-2026-W42',
      },
      status: 'in_transit',
      createdAt: '2026-05-01T09:15:00Z',
      certifiedAt: '2026-05-01T13:00:00Z',
      shippedAt: '2026-05-02T07:30:00Z',
      deliveredAt: null,
      lots: ['lot-exp-016'],
      totalLotsCount: 1,
      totalWeightKg: 84.3,
      species: 'cacao',
      destinationPort: 'Port de Hambourg',
      vesselName: 'MV Cargill Pioneer',
      containerNumber: 'TGHU 2345678',
      estimatedArrival: '2026-05-11T11:00:00Z',
      actualArrival: null,
      certificate: {
        number: 'CC-EUDR-2026-000127',
        pdfUrl: '#',
        geoJsonUrl: '#',
        onChainHash: '0xa0b1c2d3e4f5a6b7c8d9e0f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
        txHash: '0x2c3d4e5f6a7b8c9d0e1f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e',
        issuedAt: '2026-05-01T13:00:00Z',
      },
    },
    {
      id: 'shp-008',
      reference: 'SHP-2026-008',
      buyer: {
        id: 'buyer-003',
        name: 'Cémoi',
        country: 'FR',
        city: 'Le Havre',
        contractRef: 'CEM-26-031',
      },
      status: 'in_transit',
      createdAt: '2026-04-28T08:00:00Z',
      certifiedAt: '2026-04-28T11:30:00Z',
      shippedAt: '2026-04-29T05:00:00Z',
      deliveredAt: null,
      lots: ['lot-exp-019'],
      totalLotsCount: 1,
      totalWeightKg: 91.8,
      species: 'cacao',
      destinationPort: 'Port du Le Havre',
      vesselName: 'MV Cémoi Trader',
      containerNumber: 'TGHU 1234568',
      estimatedArrival: '2026-05-08T08:00:00Z',
      actualArrival: null,
      certificate: {
        number: 'CC-EUDR-2026-000128',
        pdfUrl: '#',
        geoJsonUrl: '#',
        onChainHash: '0x5f6a7b8c9d0e1f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b',
        txHash: '0xb0c1d1e1f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e',
        issuedAt: '2026-04-28T11:30:00Z',
      },
    },
    {
      id: 'shp-009',
      reference: 'SHP-2026-009',
      buyer: {
        id: 'buyer-001',
        name: 'Barry Callebaut',
        country: 'BE',
        city: 'Anvers',
        contractRef: 'BC-2026-TG-014',
      },
      status: 'in_transit',
      createdAt: '2026-04-25T09:30:00Z',
      certifiedAt: '2026-04-25T13:00:00Z',
      shippedAt: '2026-04-26T06:30:00Z',
      deliveredAt: null,
      lots: ['lot-exp-020'],
      totalLotsCount: 1,
      totalWeightKg: 83.4,
      species: 'cacao',
      destinationPort: 'Port d\'Anvers',
      vesselName: 'MV Barry Trader',
      containerNumber: 'TGHU 0123456',
      estimatedArrival: '2026-05-06T10:00:00Z',
      actualArrival: null,
      certificate: {
        number: 'CC-EUDR-2026-000129',
        pdfUrl: '#',
        geoJsonUrl: '#',
        onChainHash: '0x2d3e4f5a6b7c8d9e0f1f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
        txHash: '0x5f6a7b8c9d0e1f1f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6',
        issuedAt: '2026-04-25T13:00:00Z',
      },
    },
    {
      id: 'shp-010',
      reference: 'SHP-2026-010',
      buyer: {
        id: 'buyer-004',
        name: "Tony's Chocolonely",
        country: 'NL',
        city: 'Rotterdam',
        contractRef: 'TC-LOT-887',
      },
      status: 'delivered',
      createdAt: '2026-04-20T08:00:00Z',
      certifiedAt: '2026-04-20T11:30:00Z',
      shippedAt: '2026-04-21T06:00:00Z',
      deliveredAt: '2026-05-01T09:00:00Z',
      lots: ['lot-exp-023'],
      totalLotsCount: 1,
      totalWeightKg: 92.1,
      species: 'cacao',
      destinationPort: 'Port de Rotterdam',
      vesselName: 'MV Tony\'s Voyager',
      containerNumber: 'TGHU 8901234',
      estimatedArrival: '2026-04-30T10:00:00Z',
      actualArrival: '2026-05-01T09:00:00Z',
      certificate: {
        number: 'CC-EUDR-2026-000130',
        pdfUrl: '#',
        geoJsonUrl: '#',
        onChainHash: '0xa0b1c1d1e1f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f',
        txHash: '0x2c3d4e5f6a7b8c9d0e1e1f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a',
        issuedAt: '2026-04-20T11:30:00Z',
      },
    },
    {
      id: 'shp-011',
      reference: 'SHP-2026-011',
      buyer: {
        id: 'buyer-003',
        name: 'Cémoi',
        country: 'FR',
        city: 'Le Havre',
        contractRef: 'CEM-26-031',
      },
      status: 'delivered',
      createdAt: '2026-04-15T09:15:00Z',
      certifiedAt: '2026-04-15T12:45:00Z',
      shippedAt: '2026-04-16T07:00:00Z',
      deliveredAt: '2026-04-27T08:30:00Z',
      lots: ['lot-exp-024'],
      totalLotsCount: 1,
      totalWeightKg: 85.7,
      species: 'cacao',
      destinationPort: 'Port du Le Havre',
      vesselName: 'MV Cémoi Spirit',
      containerNumber: 'TGHU 7890123',
      estimatedArrival: '2026-04-26T09:00:00Z',
      actualArrival: '2026-04-27T08:30:00Z',
      certificate: {
        number: 'CC-EUDR-2026-000131',
        pdfUrl: '#',
        geoJsonUrl: '#',
        onChainHash: '0x5f6a7b8c9d0e1f1e1f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c',
        txHash: '0x8c9d0e1f1f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9',
        issuedAt: '2026-04-15T12:45:00Z',
      },
    },
    {
      id: 'shp-012',
      reference: 'SHP-2026-012',
      buyer: {
        id: 'buyer-002',
        name: 'Cargill Cocoa',
        country: 'DE',
        city: 'Hambourg',
        contractRef: 'CCG-2026-W42',
      },
      status: 'delivered',
      createdAt: '2026-04-10T07:30:00Z',
      certifiedAt: '2026-04-10T11:00:00Z',
      shippedAt: '2026-04-11T05:30:00Z',
      deliveredAt: '2026-04-22T07:00:00Z',
      lots: ['lot-exp-025'],
      totalLotsCount: 1,
      totalWeightKg: 74.3,
      species: 'cacao',
      destinationPort: 'Port de Hambourg',
      vesselName: 'MV Cargill Meridian',
      containerNumber: 'TGHU 5678901',
      estimatedArrival: '2026-04-21T08:00:00Z',
      actualArrival: '2026-04-22T07:00:00Z',
      certificate: {
        number: 'CC-EUDR-2026-000132',
        pdfUrl: '#',
        geoJsonUrl: '#',
        onChainHash: '0xb1c2d2e2f2f2a2b3c4d5e6f7a8b9c0d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
        txHash: '0xa0b1c1d1e1f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
        issuedAt: '2026-04-10T11:00:00Z',
      },
    },
  ]
}

function normalizeShipmentDateFilters(filters = {}) {
  if (filters.period?.from || filters.period?.to) {
    return {
      dateFrom: filters.period.from ?? null,
      dateTo: filters.period.to ?? null,
    }
  }

  return {
    dateFrom: filters.dateFrom ?? filters.startDate ?? null,
    dateTo: filters.dateTo ?? filters.endDate ?? null,
  }
}

function matchesShipmentDate(shipment, filters = {}) {
  const { dateFrom, dateTo } = normalizeShipmentDateFilters(filters)
  if (!dateFrom && !dateTo) return true

  const createdAt = new Date(shipment.createdAt)
  if (Number.isNaN(createdAt.getTime())) return false

  if (dateFrom) {
    const from = new Date(`${dateFrom}T00:00:00`)
    if (createdAt < from) return false
  }

  if (dateTo) {
    const to = new Date(`${dateTo}T23:59:59`)
    if (createdAt > to) return false
  }

  return true
}

export function getMockShipments(filters = {}) {
  const buyerFilter = (filters.buyerId ?? filters.buyer ?? filters.buyerName ?? 'all').toLowerCase()
  const statusFilter = (filters.status ?? 'all').toLowerCase()
  const searchQuery = (filters.search ?? '').trim().toLowerCase()
  const lotsById = new Map(getMockExportableLots().map((lot) => [lot.id, lot]))

  return getBaseMockExporterShipments().filter((shipment) => {
    const matchesStatus = statusFilter === 'all' || shipment.status.toLowerCase() === statusFilter
    const matchesBuyer =
      buyerFilter === 'all' ||
      shipment.buyer.id.toLowerCase() === buyerFilter ||
      shipment.buyer.name.toLowerCase() === buyerFilter
    const matchesDate = matchesShipmentDate(shipment, filters)
    const matchesSearch =
      searchQuery.length === 0 ||
      shipment.reference.toLowerCase().includes(searchQuery) ||
      shipment.buyer.name.toLowerCase().includes(searchQuery) ||
      shipment.lots.some((lotId) => {
        const lot = lotsById.get(lotId)
        return lotId.toLowerCase().includes(searchQuery) || lot?.lotUuid?.toLowerCase().includes(searchQuery)
      })

    return matchesStatus && matchesBuyer && matchesDate && matchesSearch
  })
}

export function getMockExporterShipments(filters = {}) {
  return getMockShipments(filters)
}

// ── Stats mensuelles ─────────────────────────────────────────────────────────
export function getMockExporterMonthlyStats() {
  return {
    shipmentsThisMonth: 4,
    weightExportedKg: 12450,
    certificatesIssued: 4,
    avgCertificationTimeHours: 2.3,
    buyersServed: 3,
    totalContractValueEur: 47800,
    eudrComplianceRate: 100,
  }
}

// ── Évolution mensuelle (12 mois) ─────────────────────────────────────────────
export function getMockExporterMonthlyEvolution() {
  return [
    { month: 'Jan', weightKg: 8500, shipments: 3 },
    { month: 'Fév', weightKg: 9200, shipments: 3 },
    { month: 'Mar', weightKg: 10800, shipments: 4 },
    { month: 'Avr', weightKg: 11200, shipments: 4 },
    { month: 'Mai', weightKg: 12450, shipments: 4 },
    { month: 'Juin', weightKg: 0, shipments: 0 },
    { month: 'Juil', weightKg: 0, shipments: 0 },
    { month: 'Aoû', weightKg: 0, shipments: 0 },
    { month: 'Sep', weightKg: 0, shipments: 0 },
    { month: 'Oct', weightKg: 0, shipments: 0 },
    { month: 'Nov', weightKg: 0, shipments: 0 },
    { month: 'Déc', weightKg: 0, shipments: 0 },
  ]
}

// ── Répartition par acheteur ───────────────────────────────────────────────────
export function getMockExporterBuyerDistribution() {
  return [
    { buyer: 'Barry Callebaut', weightKg: 328.5 },
    { buyer: 'Cargill Cocoa', weightKg: 256.6 },
    { buyer: 'Cémoi', weightKg: 279.8 },
    { buyer: "Tony's Chocolonely", weightKg: 185.8 },
    { buyer: 'ETO Lindt', weightKg: 97.5 },
  ]
}

// ── Répartition par destination ────────────────────────────────────────────────
export function getMockExporterDestinationDistribution() {
  return [
    { port: 'Anvers', country: 'BE', weightKg: 328.5 },
    { port: 'Hambourg', country: 'DE', weightKg: 256.6 },
    { port: 'Le Havre', country: 'FR', weightKg: 279.8 },
    { port: 'Rotterdam', country: 'NL', weightKg: 185.8 },
    { port: 'Bâle', country: 'CH', weightKg: 97.5 },
  ]
}

// ── Activité récente ───────────────────────────────────────────────────────────
export function getMockExporterRecentActivity() {
  return [
    {
      id: 'act-001',
      type: 'lot_received',
      lotId: 'lot-exp-001',
      lotUuid: 'LOT-2026-0882',
      message: 'Lot LOT-2026-0882 reçu de ATC Kpalimé',
      timestamp: '2026-05-13T07:30:00Z',
    },
    {
      id: 'act-002',
      type: 'lot_received',
      lotId: 'lot-exp-002',
      lotUuid: 'LOT-2026-0893',
      message: 'Lot LOT-2026-0893 reçu de ATC Kpalimé',
      timestamp: '2026-05-13T09:00:00Z',
    },
    {
      id: 'act-003',
      type: 'shipment_created',
      shipmentId: 'shp-001',
      shipmentRef: 'SHP-2026-001',
      message: 'Shipment SHP-2026-001 créé pour Barry Callebaut',
      timestamp: '2026-05-13T08:00:00Z',
    },
    {
      id: 'act-004',
      type: 'certificate_issued',
      shipmentId: 'shp-003',
      shipmentRef: 'SHP-2026-003',
      certificateNumber: 'CC-EUDR-2026-000123',
      message: 'Certificat EUDR CC-EUDR-2026-000123 émis pour SHP-2026-003',
      timestamp: '2026-05-10T10:30:00Z',
    },
    {
      id: 'act-005',
      type: 'shipment_departed',
      shipmentId: 'shp-006',
      shipmentRef: 'SHP-2026-006',
      vesselName: 'MV Lindt Voyager',
      message: 'SHP-2026-006 embarqué sur MV Lindt Voyager vers Bâle',
      timestamp: '2026-05-03T06:00:00Z',
    },
    {
      id: 'act-006',
      type: 'shipment_delivered',
      shipmentId: 'shp-010',
      shipmentRef: 'SHP-2026-010',
      message: 'SHP-2026-010 livré à Rotterdam',
      timestamp: '2026-05-01T09:00:00Z',
    },
    {
      id: 'act-007',
      type: 'certificate_issued',
      shipmentId: 'shp-004',
      shipmentRef: 'SHP-2026-004',
      certificateNumber: 'CC-EUDR-2026-000124',
      message: 'Certificat EUDR CC-EUDR-2026-000124 émis pour SHP-2026-004',
      timestamp: '2026-05-08T11:45:00Z',
    },
    {
      id: 'act-008',
      type: 'shipment_created',
      shipmentId: 'shp-002',
      shipmentRef: 'SHP-2026-002',
      message: 'Shipment SHP-2026-002 créé pour Cargill Cocoa',
      timestamp: '2026-05-12T09:30:00Z',
    },
    {
      id: 'act-009',
      type: 'certificate_issued',
      shipmentId: 'shp-005',
      shipmentRef: 'SHP-2026-005',
      certificateNumber: 'CC-EUDR-2026-000125',
      message: 'Certificat EUDR CC-EUDR-2026-000125 émis pour SHP-2026-005',
      timestamp: '2026-05-05T12:30:00Z',
    },
    {
      id: 'act-010',
      type: 'shipment_departed',
      shipmentId: 'shp-007',
      shipmentRef: 'SHP-2026-007',
      vesselName: 'MV Cargill Pioneer',
      message: 'SHP-2026-007 embarqué sur MV Cargill Pioneer vers Hambourg',
      timestamp: '2026-05-02T07:30:00Z',
    },
  ]
}

// ── Dashboard complet ─────────────────────────────────────────────────────────
export function getMockExporterDashboard() {
  return {
    profile: getMockExporterProfile(),
    buyers: getMockExporterBuyers(),
    lots: getMockExportableLots(),
    shipments: getMockExporterShipments(),
    monthlyStats: getMockExporterMonthlyStats(),
    monthlyEvolution: getMockExporterMonthlyEvolution(),
    buyerDistribution: getMockExporterBuyerDistribution(),
    destinationDistribution: getMockExporterDestinationDistribution(),
    recentActivity: getMockExporterRecentActivity(),
  }
}

const BUYER_PORTS = {
  BE: 'Port d’Anvers',
  DE: 'Port de Hambourg',
  FR: 'Port du Havre',
  NL: 'Port de Rotterdam',
  CH: 'Terminal de Bâle',
}

function createPolygonFeature(name, centerLng, centerLat, delta = 0.0048) {
  return {
    type: 'Feature',
    properties: {
      name,
      crs: 'EPSG:4326',
    },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [Number((centerLng - delta).toFixed(6)), Number((centerLat - delta / 1.5).toFixed(6))],
        [Number((centerLng + delta / 1.3).toFixed(6)), Number((centerLat - delta / 1.8).toFixed(6))],
        [Number((centerLng + delta).toFixed(6)), Number((centerLat + delta / 1.7).toFixed(6))],
        [Number((centerLng - delta / 1.6).toFixed(6)), Number((centerLat + delta).toFixed(6))],
        [Number((centerLng - delta).toFixed(6)), Number((centerLat - delta / 1.5).toFixed(6))],
      ]],
    },
  }
}

const GEOJSON_CENTERS = [
  { lng: 0.742118, lat: 6.923145 },
  { lng: 0.681244, lat: 6.902411 },
  { lng: 0.802311, lat: 6.874155 },
  { lng: 0.651108, lat: 6.996314 },
  { lng: 0.721442, lat: 7.014225 },
  { lng: 1.207551, lat: 6.167842 },
  { lng: 0.632118, lat: 7.533145 },
  { lng: 0.444521, lat: 8.983411 },
  { lng: 1.211442, lat: 10.862225 },
  { lng: 1.043218, lat: 9.551238 },
]

function getBuyerPort(countryCode) {
  return BUYER_PORTS[countryCode] ?? 'Port de destination UE'
}

function getCoordinateCount(geoJson) {
  const ring = geoJson?.geometry?.coordinates?.[0] ?? []
  return ring.flat().filter((coord) => typeof coord === 'number')
}

function withExporterLotShape(lot, index) {
  const center = GEOJSON_CENTERS[index % GEOJSON_CENTERS.length]
  const geoJson = createPolygonFeature(
    lot.parcel.name,
    center.lng + index * 0.0021,
    center.lat + index * 0.0014,
    0.0036 + (index % 3) * 0.0007,
  )

  return {
    id: lot.id,
    lotUuid: lot.lotUuid,
    shortId: lot.lotUuid.slice(-8),
    status: 'available',
    availabilityStatus: lot.status,
    processingStatus: 'processed',
    species: lot.species,
    weightKg: lot.weightKg,
    weightGrams: Math.round(lot.weightKg * 1000),
    receivedFromProcessorAt: lot.receivedFromProcessorAt,
    certifications: lot.certifications ?? [],
    onChainHash: lot.quality.onChainHash,
    origin: lot.origin,
    producer: {
      name: lot.origin.producer,
      commune: lot.parcel.commune,
      region: lot.parcel.region,
    },
    parcel: {
      ...lot.parcel,
      geoJson,
      geometryType: geoJson.geometry.type,
      coordinatesPrecision: Math.min(...getCoordinateCount(geoJson).map((value) => {
        const parts = String(value).split('.')
        return parts[1]?.length ?? 0
      })),
    },
    quality: {
      ...lot.quality,
      finalGrade: lot.quality.finalGrade,
      onChainHash: lot.quality.onChainHash,
    },
  }
}

export function getMockAvailableLots() {
  return getMockExportableLots()
    .filter((lot) => lot.status === 'available')
    .map(withExporterLotShape)
}

export function getMockGeoJsonValidation(lotId) {
  const lot = getMockAvailableLots().find((item) => item.id === lotId || item.lotUuid === lotId)
  if (!lot) {
    return {
      isValid: false,
      noDeforestationAfter2020: false,
      precisionOk: false,
      errors: ['Lot introuvable dans le registre exportateur.'],
      warnings: [],
      noDeforestationDate: null,
    }
  }

  if (lotId === 'lot-exp-force-invalid') {
    return {
      isValid: false,
      noDeforestationAfter2020: false,
      precisionOk: false,
      errors: ['Le polygone GeoJSON contient une auto-intersection.'],
      warnings: [],
      noDeforestationDate: null,
    }
  }

  const warnings = []
  if (lot.certifications.length === 0) {
    warnings.push('Aucun certificat tiers additionnel joint au lot.')
  }
  if (lot.parcel.areaHa < 1.2) {
    warnings.push('Petite parcelle : contrôle documentaire renforcé recommandé.')
  }

  return {
    isValid: true,
    noDeforestationAfter2020: true,
    precisionOk: lot.parcel.coordinatesPrecision >= 6,
    errors: [],
    warnings,
    noDeforestationDate: '2026-01-15',
  }
}

function createDemoPdfBlob({ certificateNumber, exporter, buyer, lots, destinationPort, vesselInfo, notes, txHash }) {
  const html = `
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>${certificateNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #1A1612; }
          h1 { color: #1A4A5A; margin-bottom: 8px; }
          .watermark { position: fixed; top: 40%; left: 18%; font-size: 72px; color: rgba(33,150,199,0.1); transform: rotate(-24deg); }
          .box { border: 1px solid #d9d9d9; border-radius: 12px; padding: 16px; margin-top: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ececec; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="watermark">DEMO</div>
        <h1>Certificat EUDR ${certificateNumber}</h1>
        <p>Exportateur : ${exporter.name}</p>
        <p>Destinataire : ${buyer.name} (${buyer.country})</p>
        <p>Port d'arrivée : ${destinationPort}</p>
        <p>Navire : ${vesselInfo.vesselName || 'À confirmer'} · Conteneur : ${vesselInfo.containerNumber || 'À confirmer'}</p>
        <p>Transaction blockchain : ${txHash}</p>
        <div class="box">
          <strong>Déclaration de non-déforestation</strong>
          <p>L’exportateur certifie que les lots listés ci-dessous satisfont aux exigences du règlement (UE) 2023/1115.</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Lot</th>
              <th>Producteur</th>
              <th>Commune</th>
              <th>Espèce</th>
              <th>Poids</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            ${lots.map((lot) => `
              <tr>
                <td>${lot.lotUuid}</td>
                <td>${lot.producer.name}</td>
                <td>${lot.producer.commune}</td>
                <td>${lot.species}</td>
                <td>${lot.weightKg.toFixed(1)} kg</td>
                <td>${lot.quality.finalGrade}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="box">
          <strong>Notes</strong>
          <p>${notes || 'Aucune note additionnelle.'}</p>
        </div>
      </body>
    </html>
  `

  return new Blob([html], { type: 'application/pdf' })
}

function createGeoJsonBlob(lots) {
  const featureCollection = {
    type: 'FeatureCollection',
    name: 'chaincacao-eudr-demo',
    crs: {
      type: 'name',
      properties: { name: 'EPSG:4326' },
    },
    features: lots.map((lot) => ({
      ...lot.parcel.geoJson,
      properties: {
        ...lot.parcel.geoJson.properties,
        lotUuid: lot.lotUuid,
        producer: lot.producer.name,
        commune: lot.producer.commune,
        region: lot.producer.region,
        species: lot.species,
      },
    })),
  }

  return new Blob([JSON.stringify(featureCollection, null, 2)], { type: 'application/geo+json' })
}

export function getMockShipmentCreation(payload) {
  const lots = getMockAvailableLots().filter((lot) => payload.lotsIds.includes(lot.id))
  const buyers = getMockExporterBuyers().map((buyer) => ({
    ...buyer,
    defaultPort: getBuyerPort(buyer.country),
  }))
  const buyer = buyers.find((item) => item.id === payload.buyerId) ?? buyers[0]
  const exporter = getMockExporterProfile()
  const shipmentId = `shp-demo-${Date.now()}`
  const certificateNumber = `CC-EUDR-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`
  const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
  const pdfUrl = URL.createObjectURL(createDemoPdfBlob({
    certificateNumber,
    exporter,
    buyer,
    lots,
    destinationPort: payload.destinationPort,
    vesselInfo: {
      vesselName: payload.vesselInfo?.vesselName,
      containerNumber: payload.vesselInfo?.containerNumber,
    },
    notes: payload.notes,
    txHash,
  }))
  const geoJsonUrl = URL.createObjectURL(createGeoJsonBlob(lots))

  const totalWeightKg = lots.reduce((sum, lot) => sum + lot.weightKg, 0)
  const species = Array.from(new Set(lots.map((lot) => lot.species.toLowerCase())))

  return {
    success: true,
    shipmentId,
    certificateNumber,
    pdfUrl,
    geoJsonUrl,
    txHash,
    shipment: {
      id: shipmentId,
      reference: `SHP-2026-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`,
      buyer,
      exporter,
      status: 'certified',
      createdAt: new Date().toISOString(),
      certifiedAt: new Date().toISOString(),
      destinationPort: payload.destinationPort,
      vesselName: payload.vesselInfo?.vesselName ?? '',
      containerNumber: payload.vesselInfo?.containerNumber ?? '',
      estimatedDeparture: payload.vesselInfo?.estimatedDeparture ?? '',
      notes: payload.notes ?? '',
      lots,
      totalLotsCount: lots.length,
      totalWeightKg,
      species,
      certificate: {
        number: certificateNumber,
        pdfUrl,
        geoJsonUrl,
        txHash,
        onChainHash: txHash,
        issuedAt: new Date().toISOString(),
      },
    },
  }
}
