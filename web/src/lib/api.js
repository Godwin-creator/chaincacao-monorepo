import { supabase } from './supabase';
import { getMockLot } from '../utils/mockLots';
import {
  getMockCooperativeData,
  getMockCooperativeLots,
  getMockLotByUuid,
  getMockProcessors,
  getMockTransferableLots,
  getMockTransferHistory,
  MOCK_PROCESSORS,
} from '../utils/mockCooperative';

function normalizeLot(row) {
  return {
    shortId: row.short_id ?? row.lot_uuid,
    id: row.id,
    lotUuid: row.lot_uuid,
    qrCode: row.qr_code_url ?? null,
    species: row.species ?? '',
    weightGrams: row.weight_grams ?? 0,
    harvestDate: row.harvest_date ?? '',
    status: row.status ?? 'Harvested',
    eudrCompliant: row.eudr_compliant ?? false,
    certificateUrl: row.certificate_url ?? '#',
    producer: {
      name: row.producer?.name ?? '',
      organization: row.producer?.organization ?? '',
      commune: row.producer?.commune ?? '',
      region: row.producer?.region ?? '',
    },
    parcel: {
      name: row.parcel?.name ?? '',
      areaHa: row.parcel?.area_ha ?? 0,
      geoJson: row.parcel?.geo_json ?? null,
    },
    chain: (row.transfers ?? []).map((t) => ({
      step: t.step,
      actor: t.actor_name ?? '',
      organization: t.organization ?? '',
      timestamp: t.created_at ?? t.timestamp ?? '',
      txHash: t.tx_hash ?? '',
      txUrl: t.tx_url ?? '',
    })),
    hashes: {
      geoJsonHash: row.geo_json_hash ?? '',
      photoHash: row.photo_hash ?? '',
      contractAddress: row.contract_address ?? '',
    },
  };
}

export async function fetchLotById(lotId) {
  // 1. Tenter Supabase
  try {
    const { data, error } = await supabase
      .from('lots')
      .select(`
        *,
        producer:producers(*),
        parcel:parcels(*),
        transfers(*)
      `)
      .eq('lot_uuid', lotId)
      .single();

    if (data && !error) return { source: 'supabase', lot: normalizeLot(data) };
  } catch (_) {
    // Silencieux — fallback mock
  }

  // 2. Fallback données de démonstration
  const mock = getMockLot(lotId);
  if (mock) return { source: 'mock', lot: mock };

  return { source: null, lot: null };
}

export async function fetchCooperativeDashboard(cooperativeId) {
  // 1. Tenter Supabase
  try {
    const { data, error } = await supabase
      .from('cooperatives')
      .select(`
        id, name, commune, region, member_count,
        lots:lots(
          id, lot_uuid, species, weight_grams, status, received_at,
          producer:producers(name, commune)
        )
      `)
      .eq('id', cooperativeId)
      .single();

    if (data && !error) {
      return { source: 'supabase', data: normalizeDashboard(data) };
    }
  } catch (_) {
    // Silencieux — fallback mock
  }

  // 2. Fallback données de démonstration
  return { source: 'mock', data: getMockCooperativeData() };
}

export async function fetchCooperativeLots(cooperativeId, filters = {}) {
  try {
    let query = supabase
      .from('lots')
      .select(`
        id, lot_uuid, species, weight_grams, status, received_at, harvest_date,
        producer:producers(name, organization, commune, phone),
        parcel:parcels(name, area_ha)
      `)
      .eq('cooperative_id', cooperativeId)
      .order('received_at', { ascending: false })

    if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status)
    if (filters.species && filters.species !== 'all') query = query.eq('species', filters.species)

    const { data, error } = await query
    if (data && !error) {
      let lots = data.map(normalizeLotFull)
      if (filters.search) {
        const q = filters.search.toLowerCase()
        lots = lots.filter(
          (l) =>
            l.lotUuid.toLowerCase().includes(q) ||
            l.producer.name.toLowerCase().includes(q) ||
            l.producer.commune.toLowerCase().includes(q),
        )
      }
      return { source: 'supabase', lots }
    }
  } catch (_) {}

  return { source: 'mock', lots: getMockCooperativeLots(filters) }
}

export async function fetchLotByUuid(uuid) {
  try {
    const { data, error } = await supabase
      .from('lots')
      .select(`
        id, lot_uuid, species, weight_grams, status, harvest_date, received_at,
        producer:producers(name, organization, commune, phone),
        parcel:parcels(name, area_ha)
      `)
      .eq('lot_uuid', uuid)
      .single()
    if (data && !error) return { source: 'supabase', lot: normalizeLotFull(data) }
  } catch (_) {}

  const mock = getMockLotByUuid(uuid)
  return { source: 'mock', lot: mock }
}

export async function confirmLotReception(lotUuid, { verifiedWeightKg, notes }) {
  const announced = (await fetchLotByUuid(lotUuid)).lot?.weightAnnouncedKg ?? verifiedWeightKg
  const deltaPct = announced > 0 ? ((verifiedWeightKg - announced) / announced) * 100 : 0
  const newStatus = Math.abs(deltaPct) > 2 ? 'alert' : 'received'

  try {
    const { error } = await supabase
      .from('lots')
      .update({
        weight_verified_grams: Math.round(verifiedWeightKg * 1000),
        weight_delta_pct: deltaPct,
        status: newStatus,
        received_at: new Date().toISOString(),
        notes,
      })
      .eq('lot_uuid', lotUuid)
    if (!error) {
      return { success: true, source: 'supabase', status: newStatus, deltaPct, txHash: null }
    }
  } catch (_) {}

  // Simulation mock : délai blockchain
  await new Promise((r) => setTimeout(r, 1500))
  const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  return { success: true, source: 'mock', status: newStatus, deltaPct, txHash }
}

export async function fetchProcessors() {
  try {
    const { data, error } = await supabase
      .from('processors')
      .select('id, name, commune, region, specialties, capacity_kg, current_load_kg, distance_km, certifications, contact_phone')
      .order('distance_km')
    if (data && !error) {
      return {
        source: 'supabase',
        processors: data.map((r) => ({
          id: r.id,
          name: r.name,
          commune: r.commune,
          region: r.region,
          specialties: r.specialties ?? [],
          capacityKg: r.capacity_kg ?? 0,
          currentLoad: r.current_load_kg ?? 0,
          distanceKm: r.distance_km ?? 0,
          certifications: r.certifications ?? [],
          contactPhone: r.contact_phone ?? '',
        })),
      }
    }
  } catch (_) {}
  return { source: 'mock', processors: getMockProcessors() }
}

export async function fetchTransferableLots(cooperativeId) {
  try {
    const { data, error } = await supabase
      .from('lots')
      .select(`
        id, lot_uuid, species, weight_grams, weight_verified_grams, weight_delta_pct,
        status, received_at, harvest_date,
        producer:producers(name, organization, commune, phone),
        parcel:parcels(name, area_ha)
      `)
      .eq('cooperative_id', cooperativeId)
      .eq('status', 'received')
      .order('received_at', { ascending: false })
    if (data && !error) {
      return { source: 'supabase', lots: data.map(normalizeLotFull) }
    }
  } catch (_) {}
  return { source: 'mock', lots: getMockTransferableLots() }
}

export async function fetchTransferHistory(cooperativeId, { limit = 20 } = {}) {
  try {
    const { data, error } = await supabase
      .from('transfers')
      .select(`
        id, lots_count, total_weight_kg, transferred_at, tx_hash, status,
        processor:processors(id, name, commune),
        transfer_lots(lot_uuid, species, weight_kg)
      `)
      .eq('cooperative_id', cooperativeId)
      .order('transferred_at', { ascending: false })
      .limit(limit)
    if (data && !error) {
      return {
        source: 'supabase',
        transfers: data.map((r) => ({
          id: r.id,
          lotsCount: r.lots_count,
          totalWeightKg: r.total_weight_kg,
          processor: r.processor,
          transferredAt: r.transferred_at,
          txHash: r.tx_hash,
          status: r.status,
          lotsUuids: (r.transfer_lots ?? []).map((l) => l.lot_uuid),
          speciesBreakdown: [],
        })),
      }
    }
  } catch (_) {}
  return { source: 'mock', transfers: getMockTransferHistory() }
}

export async function executeBatchTransfer({ lotUuids, processorId, notes }) {
  try {
    const { error } = await supabase.rpc('batch_transfer_lots', {
      p_lot_uuids: lotUuids,
      p_processor_id: processorId,
      p_notes: notes ?? '',
    })
    if (!error) {
      const processor = MOCK_PROCESSORS.find((p) => p.id === processorId) ?? { name: '?', commune: '' }
      const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      return { success: true, source: 'supabase', txHash, lotUuids, processor, timestamp: new Date().toISOString() }
    }
  } catch (_) {}

  // Simulation mock — délai blockchain groupée
  await new Promise((r) => setTimeout(r, 2000))
  const processor = MOCK_PROCESSORS.find((p) => p.id === processorId) ?? { name: 'Transformateur', commune: '' }
  const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  return { success: true, source: 'mock', txHash, lotUuids, processor, timestamp: new Date().toISOString() }
}

function normalizeLotFull(row) {
  return {
    id: row.id,
    lotUuid: row.lot_uuid,
    status: (row.status ?? 'pending').toLowerCase(),
    producer: {
      name: row.producer?.name ?? '',
      organization: row.producer?.organization ?? '',
      commune: row.producer?.commune ?? '',
      phone: row.producer?.phone ?? '',
    },
    species: row.species ?? '',
    weightAnnouncedKg: (row.weight_grams ?? 0) / 1000,
    weightVerifiedKg: row.weight_verified_grams != null ? row.weight_verified_grams / 1000 : null,
    weightDeltaPct: row.weight_delta_pct ?? null,
    harvestDate: row.harvest_date ?? '',
    receivedAt: row.received_at ?? null,
    parcelName: row.parcel?.name ?? '',
    parcelAreaHa: row.parcel?.area_ha ?? 0,
  }
}

function normalizeDashboard(row) {
  return {
    profile: {
      id: row.id,
      name: row.name,
      commune: row.commune,
      region: row.region,
      memberCount: row.member_count ?? 0,
    },
    pendingLots: (row.lots ?? [])
      .filter((l) => l.status === 'Pending')
      .map((l) => ({
        id: l.id,
        lotUuid: l.lot_uuid,
        producerName: l.producer?.name ?? '',
        species: l.species ?? '',
        weightKg: (l.weight_grams ?? 0) / 1000,
        harvestDate: l.harvest_date ?? '',
        distanceKm: 0,
      })),
    recentLots: (row.lots ?? [])
      .filter((l) => l.status !== 'Pending')
      .slice(0, 8)
      .map((l) => ({
        id: l.id,
        lotUuid: l.lot_uuid,
        producerName: l.producer?.name ?? '',
        species: l.species ?? '',
        weightKg: (l.weight_grams ?? 0) / 1000,
        receivedAt: l.received_at ?? '',
        status: l.status ?? 'Received',
        weightDelta: 0,
      })),
    monthlyStats: { lotsReceived: 0, weightTotalKg: 0, discrepancyAlerts: 0, avgDelta: 0 },
    weeklyVolume: [],
    speciesBreakdown: [],
    supplierProducers: [],
  };
}
