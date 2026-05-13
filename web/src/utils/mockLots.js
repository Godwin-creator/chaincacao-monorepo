// ─── GeoJSON Polygons (coordonnées réelles, région Plateaux, Togo) ────────────
// Format GeoJSON : [longitude, latitude]

const GEOJSON_WAWA = {
  type: 'Feature',
  properties: { name: 'Parcelle Wawa Nord' },
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [0.7279, 6.9479],
      [0.7294, 6.9479],
      [0.7296, 6.9488],
      [0.7292, 6.9499],
      [0.7279, 6.9496],
      [0.7279, 6.9479],
    ]],
  },
};

const GEOJSON_AKEBOU = {
  type: 'Feature',
  properties: { name: 'Parcelle Akébou Vallée' },
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [0.5799, 7.3490],
      [0.5813, 7.3490],
      [0.5815, 7.3498],
      [0.5812, 7.3506],
      [0.5799, 7.3503],
      [0.5799, 7.3490],
    ]],
  },
};

const GEOJSON_KLOTO = {
  type: 'Feature',
  properties: { name: 'Parcelle Kloto Colline' },
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [0.6199, 6.8990],
      [0.6211, 6.8990],
      [0.6213, 6.8997],
      [0.6210, 6.9003],
      [0.6199, 6.9001],
      [0.6199, 6.8990],
    ]],
  },
};

// ─── Lots de démonstration ────────────────────────────────────────────────────

export const mockLots = [
  // ── LOT-001 : Cas idéal — Cacao Wawa, Verified ─────────────────────────────
  {
    shortId: 'LOT-001',
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    lotUuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    qrCode: 'https://chaincacao.tg/verify/LOT-001',
    species: 'Theobroma cacao',
    weightGrams: 50000,
    harvestDate: '2026-01-15',
    status: 'Verified',
    eudrCompliant: true,
    certificateUrl: '#',
    producer: {
      name: 'Kossi Amétépé',
      organization: 'Producteur indépendant',
      commune: 'Wawa',
      region: 'Plateaux',
    },
    parcel: {
      name: 'Parcelle Wawa Nord',
      areaHa: 2.3,
      geoJson: GEOJSON_WAWA,
    },
    chain: [
      {
        step: 'Harvested',
        actor: 'Kossi Amétépé',
        organization: 'Producteur indépendant',
        timestamp: '2026-01-15T07:30:00Z',
        txHash: '0xf8a5b2c9e3d4710b8af623c14d9e2f51a8c7b3e90d625f148937ab2c64d1e073',
        txUrl: 'https://amoy.polygonscan.com/tx/0xf8a5b2c9e3d4710b8af623c14d9e2f51a8c7b3e90d625f148937ab2c64d1e073',
      },
      {
        step: 'Collected',
        actor: 'Kofi Mawuli',
        organization: 'Coopérative SCOOPS Wawa',
        timestamp: '2026-01-18T10:00:00Z',
        txHash: '0x3d7e912f48a6bc25e80f1439d5c7a2b684091e5f2d8c63b4a17e9f0c25d48a36',
        txUrl: 'https://amoy.polygonscan.com/tx/0x3d7e912f48a6bc25e80f1439d5c7a2b684091e5f2d8c63b4a17e9f0c25d48a36',
      },
      {
        step: 'Processed',
        actor: 'Mensah Agbéko',
        organization: 'Transformateur ATC Kpalimé',
        timestamp: '2026-01-25T08:00:00Z',
        txHash: '0x9c3f7a2d5e184b60f2e8a3d7c1b9045f8e6d2a3c7b49e1f0d52c84a7b3e620d',
        txUrl: 'https://amoy.polygonscan.com/tx/0x9c3f7a2d5e184b60f2e8a3d7c1b9045f8e6d2a3c7b49e1f0d52c84a7b3e620d',
      },
      {
        step: 'Exported',
        actor: 'Ibrahim Salou',
        organization: 'CACAOMAX Lomé',
        timestamp: '2026-02-10T14:00:00Z',
        txHash: '0x5a1e8b3f726d904c2e17f5a83d0c4b9e7f621a3d8b0e4c925f736d1a2b85e09',
        txUrl: 'https://amoy.polygonscan.com/tx/0x5a1e8b3f726d904c2e17f5a83d0c4b9e7f621a3d8b0e4c925f736d1a2b85e09',
      },
      {
        step: 'Verified',
        actor: 'Inspecteur Jean Dupont',
        organization: 'Autorité douanière FR — Le Havre',
        timestamp: '2026-02-20T09:00:00Z',
        txHash: '0x2f6d9c4a8e13b705f2d9e4a7c3b81f60d45e9a2c7f3b8d1e06c4a2590f7d38e1',
        txUrl: 'https://amoy.polygonscan.com/tx/0x2f6d9c4a8e13b705f2d9e4a7c3b81f60d45e9a2c7f3b8d1e06c4a2590f7d38e1',
      },
    ],
    hashes: {
      geoJsonHash: 'f8d3b9a5c2e6490d1b7a3e8c4f2b1d6a9c5e7b3f0d4a8c1e2b5f7d9a3c6e4b8',
      photoHash: 'a7c3f9d1e5b8420f6c2d8a4e1b7c3f5d9a6e2b8c4f7d1a3e8c2f6d0b5a9e3c7',
      contractAddress: '0x742d35Cc6634C0532925a3b8D4C9A2E5F8B3D1E7',
    },
  },

  // ── LOT-002 : Café Robusta Akébou, Exported ────────────────────────────────
  {
    shortId: 'LOT-002',
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    lotUuid: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    qrCode: 'https://chaincacao.tg/verify/LOT-002',
    species: 'Coffea canephora (Robusta)',
    weightGrams: 30000,
    harvestDate: '2026-02-01',
    status: 'Exported',
    eudrCompliant: true,
    certificateUrl: '#',
    producer: {
      name: 'Akouavi Dossou',
      organization: 'Groupement Akébou Café',
      commune: 'Akébou',
      region: 'Plateaux',
    },
    parcel: {
      name: 'Parcelle Akébou Vallée',
      areaHa: 1.8,
      geoJson: GEOJSON_AKEBOU,
    },
    chain: [
      {
        step: 'Harvested',
        actor: 'Akouavi Dossou',
        organization: 'Groupement Akébou Café',
        timestamp: '2026-02-01T06:00:00Z',
        txHash: '0xd4c2f8b9e17a53062bfa9c3e8d15274b690f3e2c8a57d1b09e4f3c26a18d705',
        txUrl: 'https://amoy.polygonscan.com/tx/0xd4c2f8b9e17a53062bfa9c3e8d15274b690f3e2c8a57d1b09e4f3c26a18d705',
      },
      {
        step: 'Collected',
        actor: 'Yao Gbégnon',
        organization: 'Coopérative CAFETOGO Atakpamé',
        timestamp: '2026-02-05T09:30:00Z',
        txHash: '0x8b3e6f1d29c45a708e2f1b97d43c50a6e8f917d2c4b63a09e5f1d28c40b97e3',
        txUrl: 'https://amoy.polygonscan.com/tx/0x8b3e6f1d29c45a708e2f1b97d43c50a6e8f917d2c4b63a09e5f1d28c40b97e3',
      },
      {
        step: 'Processed',
        actor: 'Didier Tchassem',
        organization: 'Moulin TOGOROAST Lomé',
        timestamp: '2026-02-18T11:00:00Z',
        txHash: '0x4a7c1e9f2b538d60e4c9b27a15f38d04c7b6e2a19d840f35c1b8e72d06a4c9f',
        txUrl: 'https://amoy.polygonscan.com/tx/0x4a7c1e9f2b538d60e4c9b27a15f38d04c7b6e2a19d840f35c1b8e72d06a4c9f',
      },
      {
        step: 'Exported',
        actor: 'Pascal Amara',
        organization: 'Togo Export Group — Port de Lomé',
        timestamp: '2026-03-10T08:00:00Z',
        txHash: '0xe1b8f36a049c275d8b4e7f2a13d906c5b2e8f17a4c9d30b56e2f8a14c079b3d',
        txUrl: 'https://amoy.polygonscan.com/tx/0xe1b8f36a049c275d8b4e7f2a13d906c5b2e8f17a4c9d30b56e2f8a14c079b3d',
      },
    ],
    hashes: {
      geoJsonHash: '3e9d7c2b8f4a1056d9e3c7b2f8a4d1069e3c7a2b5f8d4c1a06e9b3d7f5c2a40',
      photoHash: 'c1f8b4d9a2e730b5c8f4d1e9a2b730f5c8e4b1d9a2f730c5b8e4d1a9f2c7b30',
      contractAddress: '0x83F4a6B9C2D8E1F5A0b7c3D4e5F6a7B8c9D0E1F2',
    },
  },

  // ── LOT-003 : Cacao Kloto, Processed ──────────────────────────────────────
  {
    shortId: 'LOT-003',
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    lotUuid: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    qrCode: 'https://chaincacao.tg/verify/LOT-003',
    species: 'Theobroma cacao',
    weightGrams: 25000,
    harvestDate: '2026-03-01',
    status: 'Processed',
    eudrCompliant: true,
    certificateUrl: '#',
    producer: {
      name: 'Eléonore Koffi',
      organization: 'Union des Producteurs Kloto',
      commune: 'Kpalimé',
      region: 'Plateaux',
    },
    parcel: {
      name: 'Parcelle Kloto Colline',
      areaHa: 1.5,
      geoJson: GEOJSON_KLOTO,
    },
    chain: [
      {
        step: 'Harvested',
        actor: 'Eléonore Koffi',
        organization: 'Union des Producteurs Kloto',
        timestamp: '2026-03-01T07:00:00Z',
        txHash: '0x7f2a9d3e8c156b40f9e2d7a15c38b6048f1e72c4b93d50a86f2e4c1d7b09a3e',
        txUrl: 'https://amoy.polygonscan.com/tx/0x7f2a9d3e8c156b40f9e2d7a15c38b6048f1e72c4b93d50a86f2e4c1d7b09a3e',
      },
      {
        step: 'Collected',
        actor: 'Komlan Ayité',
        organization: 'Coopérative CACAOTOGO Kpalimé',
        timestamp: '2026-03-06T10:30:00Z',
        txHash: '0xb4e71f8a23c96d50e4b8f17c2a395d08b6e4f2a13c9d80e57b4f1a2c83d6e09',
        txUrl: 'https://amoy.polygonscan.com/tx/0xb4e71f8a23c96d50e4b8f17c2a395d08b6e4f2a13c9d80e57b4f1a2c83d6e09',
      },
      {
        step: 'Processed',
        actor: 'Mensah Agbéko',
        organization: 'Transformateur ATC Kpalimé',
        timestamp: '2026-04-01T09:00:00Z',
        txHash: '0x6d1b4e9f3a827c50f8d2b4e7a13c960b5d8f1e24c7a39b80f26d4c1e8a057b3',
        txUrl: 'https://amoy.polygonscan.com/tx/0x6d1b4e9f3a827c50f8d2b4e7a13c960b5d8f1e24c7a39b80f26d4c1e8a057b3',
      },
    ],
    hashes: {
      geoJsonHash: '9b4f2d8c1e6a3057b9f4d2c8e1a6305b9f4d2c8e1a6b305f9d4c2e8b1a63057',
      photoHash: '5e2a8f4b1d7c0396e2a8f4b1d7c039e6a2b8f4d1c7039e6a28f4b1d70c3962',
      contractAddress: '0x1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B',
    },
  },
];

// ─── Exports utilitaires ─────────────────────────────────────────────────────

export function getMockLot(lotId) {
  if (!lotId) return null;
  return (
    mockLots.find(
      (lot) =>
        lot.shortId === lotId ||
        lot.id === lotId ||
        lot.lotUuid === lotId
    ) ?? null
  );
}
