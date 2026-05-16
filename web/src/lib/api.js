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
import {
  getMockProcessorDashboard,
  getMockProcessorLots,
} from '../utils/mockProcessor';
import {
  getMockExporterDashboard,
  getMockAvailableLots,
  getMockGeoJsonValidation,
  getMockShipmentCreation,
  getMockExporterBuyers,
  getMockExportableLots,
  getMockShipments,
} from '../utils/mockExporter';
import {
  getMockLotDetails,
  getMockVerifierLots,
  markMockLotVerified,
} from '../utils/mockVerifier';

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

function encodeHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}

async function sha256Hex(value) {
  if (globalThis.crypto?.subtle) {
    const data = new TextEncoder().encode(value)
    const digest = await globalThis.crypto.subtle.digest('SHA-256', data)
    return encodeHex(digest)
  }

  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash).toString(16).padStart(64, '0').slice(0, 64)
}

function alterHash(hash = '') {
  if (!hash) return 'f'.repeat(64)
  const last = hash.slice(-1)
  const replacement = last === 'a' ? 'b' : 'a'
  return `${hash.slice(0, -1)}${replacement}`
}

async function enrichVerifierLot(lot) {
  const geoJsonPayload = JSON.stringify(lot.parcel?.geoJson ?? {})
  const currentGeoJsonHash = await sha256Hex(geoJsonPayload)
  const baseSeed = `${lot.lotUuid}:${lot.certificate?.number ?? ''}:${lot.exporter?.name ?? ''}`
  const photoHash = await sha256Hex(`${baseSeed}:photo`)
  const documentHash = await sha256Hex(`${baseSeed}:certificate`)
  const onChainGeoJsonHash =
    lot.integrityScenario === 'geojson_modified' || lot.integrityScenario === 'hash_mismatch'
      ? alterHash(currentGeoJsonHash)
      : currentGeoJsonHash

  return {
    ...lot,
    hashes: {
      geoJsonHashOnChain: onChainGeoJsonHash,
      geoJsonHashCurrent: currentGeoJsonHash,
      photoHash,
      documentHash,
      contractAddress: lot.blockchain?.contractAddress ?? '',
    },
    blockchain: {
      ...lot.blockchain,
      lotTxUrl: lot.blockchain?.registrationTxHash
        ? `https://amoy.polygonscan.com/tx/${lot.blockchain.registrationTxHash}`
        : null,
      verificationTxUrl: lot.blockchain?.verificationTxHash
        ? `https://amoy.polygonscan.com/tx/${lot.blockchain.verificationTxHash}`
        : null,
      contractUrl: lot.blockchain?.contractAddress
        ? `https://amoy.polygonscan.com/address/${lot.blockchain.contractAddress}`
        : null,
    },
    geoJsonHashMatches: onChainGeoJsonHash === currentGeoJsonHash,
    anonymizedProducer: lot.producer?.label ?? `${lot.producer?.cooperative ?? ''} · ${lot.producer?.commune ?? ''}`,
  }
}

function normalizeVerifierSupabaseRow(row) {
  return {
    id: row.id,
    lotUuid: row.lot_uuid,
    status: row.status ?? 'exported',
    verified: Boolean(row.verified_at),
    verifiedBy: row.verified_by ?? null,
    verifiedAt: row.verified_at ?? null,
    exporter: {
      id: row.exporter?.id ?? '',
      name: row.exporter?.name ?? 'Exportateur UE',
      port: row.exporter?.port ?? 'Port autonome de Lome',
    },
    destination: {
      buyer: row.buyer_name ?? 'Acheteur UE',
      country: row.destination_country ?? 'UE',
      port: row.destination_port ?? 'Port UE',
      city: row.destination_city ?? 'Destination UE',
    },
    exportDate: row.exported_at ?? row.updated_at ?? null,
    certificate: {
      number: row.certificate_number ?? '',
      pdfUrl: row.certificate_url ?? '#',
    },
    product: {
      species: row.species ?? 'Cacao',
      grade: row.quality_data?.finalGrade ?? 'A',
      weightKg: (row.weight_grams ?? 0) / 1000,
    },
    producer: {
      cooperative: row.cooperative?.name ?? 'Cooperative anonyme',
      commune: row.parcel?.commune ?? '',
      label: `${row.cooperative?.name ?? 'Cooperative anonyme'} · ${row.parcel?.commune ?? ''}`,
    },
    parcel: {
      name: row.parcel?.name ?? 'Parcelle',
      areaHa: row.parcel?.area_ha ?? 0,
      geoJson: row.parcel?.geo_json ?? null,
    },
    blockchain: {
      contractAddress: row.contract_address ?? '',
      registrationTxHash: row.tx_hash ?? '',
      verificationTxHash: row.verification_tx_hash ?? null,
      network: 'Polygon Amoy Testnet',
    },
    conformityStatus: row.conformity_status ?? 'compliant',
    alerts: row.alerts ?? [],
    integrityScenario: 'none',
    verificationHistory: row.verification_history ?? [],
    auditNotes: row.audit_notes ?? '',
  }
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
  } catch {
    // Silencieux — fallback mock
  }

  // 2. Fallback données de démonstration
  const mock = getMockLot(lotId);
  if (mock) return { source: 'mock', lot: mock };

  return { source: null, lot: null };
}

export async function fetchVerifierLots(filters = {}) {
  try {
    let query = supabase
      .from('lots')
      .select(`
        id,
        lot_uuid,
        status,
        weight_grams,
        species,
        quality_data,
        exported_at,
        updated_at,
        verified_at,
        verified_by,
        certificate_number,
        certificate_url,
        destination_port,
        destination_country,
        destination_city,
        buyer_name,
        contract_address,
        tx_hash,
        verification_tx_hash,
        conformity_status,
        alerts,
        verification_history,
        audit_notes,
        exporter:exporters(id, name, port),
        cooperative:cooperatives(name),
        parcel:parcels(name, commune, area_ha, geo_json)
      `)
      .in('status', ['exported', 'verified'])
      .order('exported_at', { ascending: false })

    const { data, error } = await query
    if (data && !error) {
      let lots = await Promise.all(data.map((row) => enrichVerifierLot(normalizeVerifierSupabaseRow(row))))
      if (filters.search) {
        const q = filters.search.toLowerCase()
        lots = lots.filter((lot) =>
          lot.lotUuid.toLowerCase().includes(q) ||
          lot.anonymizedProducer.toLowerCase().includes(q) ||
          lot.exporter.name.toLowerCase().includes(q) ||
          lot.certificate.number.toLowerCase().includes(q),
        )
      }
      if (filters.status && filters.status !== 'all') {
        lots = lots.filter((lot) => lot.status === filters.status)
      }
      if (filters.compliance && filters.compliance !== 'all') {
        lots = lots.filter((lot) => lot.conformityStatus === filters.compliance)
      }
      return { source: 'supabase', lots, totalCount: lots.length }
    }
  } catch { /* noop */ }

  const lots = await Promise.all(getMockVerifierLots(filters).map((lot) => enrichVerifierLot(lot)))
  return { source: 'mock', lots, totalCount: lots.length }
}

export async function fetchLotForInspection(uuid) {
  try {
    const { data, error } = await supabase
      .from('lots')
      .select(`
        id,
        lot_uuid,
        status,
        weight_grams,
        species,
        quality_data,
        exported_at,
        updated_at,
        verified_at,
        verified_by,
        certificate_number,
        certificate_url,
        destination_port,
        destination_country,
        destination_city,
        buyer_name,
        contract_address,
        tx_hash,
        verification_tx_hash,
        conformity_status,
        alerts,
        verification_history,
        audit_notes,
        exporter:exporters(id, name, port),
        cooperative:cooperatives(name),
        parcel:parcels(name, commune, area_ha, geo_json)
      `)
      .or(`lot_uuid.eq.${uuid},id.eq.${uuid}`)
      .single()

    if (data && !error) {
      return { source: 'supabase', lot: await enrichVerifierLot(normalizeVerifierSupabaseRow(data)) }
    }
  } catch { /* noop */ }

  const lot = getMockLotDetails(uuid)
  if (!lot) return { source: null, lot: null }
  return { source: 'mock', lot: await enrichVerifierLot(lot) }
}

export async function verifyLotOnChain(lotId) {
  try {
    const timestamp = new Date().toISOString()
    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
    const { error } = await supabase
      .from('lots')
      .update({
        status: 'verified',
        verified_at: timestamp,
        verified_by: 'Autorité de vérification UE',
        verification_tx_hash: txHash,
      })
      .eq('id', lotId)

    if (!error) {
      const { lot } = await fetchLotForInspection(lotId)
      return { success: true, source: 'supabase', txHash, lot }
    }
  } catch { /* noop */ }

  await new Promise((resolve) => setTimeout(resolve, 1400))
  const updated = markMockLotVerified(lotId, 'Autorité de vérification UE')
  if (!updated) {
    return {
      success: false,
      source: null,
      error: { code: 'LOT_NOT_FOUND', message: 'Le lot n a pas ete trouve dans le registre de verification.' },
    }
  }

  return {
    success: true,
    source: 'mock',
    txHash: updated.blockchain.verificationTxHash,
    lot: await enrichVerifierLot(updated),
  }
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
  } catch {
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
  } catch { /* noop */ }

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
  } catch { /* noop */ }

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
  } catch { /* noop */ }

  // Simulation mock : délai blockchain
  await new Promise((r) => setTimeout(r, 1500))
  const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  return { success: true, source: 'mock', status: newStatus, deltaPct, txHash }
}

export async function fetchProcessorDashboard(processorId) {
  try {
    const { data, error } = await supabase
      .from('processors')
      .select(`
        id, name, commune, region, capacity_kg, current_load_kg, staff_count,
        lots:lots(
          id, lot_uuid, species, weight_grams, status, received_at,
          producer:producers(name)
        )
      `)
      .eq('id', processorId)
      .single()
    if (data && !error) {
      return { source: 'supabase', data: normalizeProcessorDashboard(data) }
    }
  } catch { /* noop */ }
  return { source: 'mock', data: getMockProcessorDashboard() }
}

function normalizeProcessorDashboard(row) {
  const lots = row.lots ?? []
  const byStatus = (s) => lots.filter((l) => l.status === s)
  return {
    profile: {
      id: row.id, name: row.name, commune: row.commune, region: row.region,
      capacityKg: row.capacity_kg ?? 0, currentLoadKg: row.current_load_kg ?? 0,
      staffCount: row.staff_count ?? 0,
    },
    pipeline: {
      received: byStatus('received').length,
      fermenting: byStatus('fermenting').length,
      drying: byStatus('drying').length,
      ready: byStatus('processed').length,
      avgFermentDays: 0,
      avgDryingHumidity: 0,
    },
    monthlyStats: { lotsProcessedThisMonth: 0, weightProcessedKg: 0, avgFermentationDays: 0, avgFinalHumidity: 0, qualityGradeABreakdown: 0, rejectionRate: 0 },
    weeklyProduction: [],
    qualityGrades: [],
    recentActivity: [],
    alertLots: [],
  }
}

export async function fetchExporterDashboard(exporterId) {
  // 1. Tenter Supabase
  try {
    const { data, error } = await supabase
      .from('exporters')
      .select(`
        id, name, legal_name, tax_id, operator_eudr_id, address, contact_email, region, port, years_active, certifications
      `)
      .eq('id', exporterId)
      .single()

    if (data && !error) {
      return { source: 'supabase', data: normalizeExporterDashboard(data) }
    }
  } catch {
    // Silencieux — fallback mock
  }

  // 2. Fallback données de démonstration
  return { source: 'mock', data: getMockExporterDashboard() }
}

function buildShipmentTimeline(shipment) {
  const events = [
    {
      id: `${shipment.id}-created`,
      type: 'created',
      label: 'Expédition créée',
      description: `Référence ${shipment.reference} ouverte pour ${shipment.buyer?.name ?? 'l’acheteur'}.`,
      timestamp: shipment.createdAt,
    },
  ]

  if (shipment.certificate?.issuedAt || shipment.certifiedAt) {
    events.push({
      id: `${shipment.id}-certified`,
      type: 'certified',
      label: 'Certificat EUDR émis',
      description: shipment.certificate?.number
        ? `Certificat ${shipment.certificate.number} disponible.`
        : 'Dossier EUDR validé et signé.',
      timestamp: shipment.certificate?.issuedAt ?? shipment.certifiedAt,
    })
  }

  if (shipment.shippedAt) {
    events.push({
      id: `${shipment.id}-shipped`,
      type: 'shipped',
      label: 'Expédition en transit',
      description: shipment.vesselName
        ? `Départ sur ${shipment.vesselName} vers ${shipment.destinationPort}.`
        : `Départ confirmé vers ${shipment.destinationPort}.`,
      timestamp: shipment.shippedAt,
    })
  }

  if (shipment.deliveredAt || shipment.actualArrival) {
    events.push({
      id: `${shipment.id}-delivered`,
      type: 'delivered',
      label: 'Livraison confirmée',
      description: `Arrivée enregistrée à ${shipment.destinationPort}.`,
      timestamp: shipment.deliveredAt ?? shipment.actualArrival,
    })
  }

  return events
}

function enrichMockShipment(shipment, lotsById) {
  const lots = (shipment.lots ?? [])
    .map((lotId) => lotsById.get(lotId))
    .filter(Boolean)

  const speciesBreakdown = lots.reduce((acc, lot) => {
    const key = lot.species || 'Inconnu'
    const current = acc.get(key) ?? { species: key, weightKg: 0, count: 0 }
    current.weightKg += lot.weightKg ?? 0
    current.count += 1
    acc.set(key, current)
    return acc
  }, new Map())

  return {
    ...shipment,
    lots,
    totalLotsCount: shipment.totalLotsCount ?? lots.length,
    totalWeightKg: shipment.totalWeightKg ?? lots.reduce((sum, lot) => sum + (lot.weightKg ?? 0), 0),
    speciesBreakdown: Array.from(speciesBreakdown.values()),
    certificate: shipment.certificate
      ? {
          ...shipment.certificate,
          blockchainUrl: shipment.certificate.txHash
            ? `https://polygonscan.com/tx/${shipment.certificate.txHash}`
            : null,
        }
      : null,
    blockchainUrl: shipment.certificate?.txHash
      ? `https://polygonscan.com/tx/${shipment.certificate.txHash}`
      : null,
    timeline: buildShipmentTimeline(shipment),
  }
}

export async function fetchExporterShipments(exporterId, filters = {}) {
  try {
    let query = supabase
      .from('shipments')
      .select(`
        id,
        reference,
        status,
        created_at,
        certified_at,
        shipped_at,
        delivered_at,
        estimated_arrival,
        actual_arrival,
        destination_port,
        vessel_name,
        container_number,
        certificate_number,
        certificate_pdf_url,
        certificate_geojson_url,
        tx_hash,
        buyers:buyer_id(id, name, country, city, contract_ref),
        shipment_lots(
          lots(
            id,
            lot_uuid,
            species,
            weight_grams,
            quality_data,
            producers(name),
            parcels(commune, region)
          )
        )
      `)
      .eq('exporter_id', exporterId)
      .order('created_at', { ascending: false })

    if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status)
    if (filters.buyerId && filters.buyerId !== 'all') query = query.eq('buyer_id', filters.buyerId)

    const { data, error } = await query
    if (data && !error) {
      let shipments = data.map((row) => {
        const lots = (row.shipment_lots ?? []).map((entry) => ({
          id: entry.lots?.id,
          lotUuid: entry.lots?.lot_uuid ?? '',
          species: entry.lots?.species ?? 'Cacao',
          weightKg: (entry.lots?.weight_grams ?? 0) / 1000,
          origin: {
            producer: entry.lots?.producers?.name ?? 'Producteur inconnu',
          },
          producer: {
            name: entry.lots?.producers?.name ?? 'Producteur inconnu',
            commune: entry.lots?.parcels?.commune ?? '',
            region: entry.lots?.parcels?.region ?? '',
          },
          quality: {
            finalGrade: entry.lots?.quality_data?.finalGrade ?? 'A',
          },
        }))

        const speciesBreakdown = lots.reduce((acc, lot) => {
          const current = acc.get(lot.species) ?? { species: lot.species, weightKg: 0, count: 0 }
          current.weightKg += lot.weightKg
          current.count += 1
          acc.set(lot.species, current)
          return acc
        }, new Map())

        const shipment = {
          id: row.id,
          reference: row.reference,
          status: row.status,
          createdAt: row.created_at,
          certifiedAt: row.certified_at,
          shippedAt: row.shipped_at,
          deliveredAt: row.delivered_at,
          estimatedArrival: row.estimated_arrival,
          actualArrival: row.actual_arrival,
          destinationPort: row.destination_port,
          vesselName: row.vessel_name,
          containerNumber: row.container_number,
          buyer: {
            id: row.buyers?.id,
            name: row.buyers?.name ?? 'Acheteur UE',
            country: row.buyers?.country ?? '',
            city: row.buyers?.city ?? '',
            contractRef: row.buyers?.contract_ref ?? '',
          },
          lots,
          totalLotsCount: lots.length,
          totalWeightKg: lots.reduce((sum, lot) => sum + lot.weightKg, 0),
          speciesBreakdown: Array.from(speciesBreakdown.values()),
          certificate: row.certificate_number
            ? {
                number: row.certificate_number,
                pdfUrl: row.certificate_pdf_url ?? '#',
                geoJsonUrl: row.certificate_geojson_url ?? '#',
                txHash: row.tx_hash ?? null,
                blockchainUrl: row.tx_hash ? `https://polygonscan.com/tx/${row.tx_hash}` : null,
                issuedAt: row.certified_at,
              }
            : null,
        }

        return {
          ...shipment,
          blockchainUrl: shipment.certificate?.blockchainUrl ?? null,
          timeline: buildShipmentTimeline(shipment),
        }
      })

      if (filters.search) {
        const q = filters.search.toLowerCase()
        shipments = shipments.filter((shipment) =>
          shipment.reference.toLowerCase().includes(q) ||
          shipment.buyer.name.toLowerCase().includes(q) ||
          shipment.lots.some((lot) => lot.lotUuid.toLowerCase().includes(q))
        )
      }
      if (filters.dateFrom) {
        shipments = shipments.filter((shipment) => new Date(shipment.createdAt) >= new Date(`${filters.dateFrom}T00:00:00`))
      }
      if (filters.dateTo) {
        shipments = shipments.filter((shipment) => new Date(shipment.createdAt) <= new Date(`${filters.dateTo}T23:59:59`))
      }

      return { source: 'supabase', shipments, totalCount: shipments.length }
    }
  } catch { /* noop */ }

  const lotsById = new Map(getMockExportableLots().map((lot) => [lot.id, lot]))
  const shipments = getMockShipments(filters).map((shipment) => enrichMockShipment(shipment, lotsById))
  return { source: 'mock', shipments, totalCount: shipments.length }
}

export async function fetchAvailableLots(exporterId, filters = {}) {
  try {
    let query = supabase
      .from('lots')
      .select(`
        id, lot_uuid, species, weight_grams, status, updated_at, quality_data,
        producer:producers(name, commune, region),
        parcel:parcels(name, area_hectares, geojson_url, geojson_hash)
      `)
      .eq('current_owner_id', exporterId)
      .eq('status', 'processed')
      .order('updated_at', { ascending: false })

    const { data, error } = await query
    if (data && !error) {
      let lots = data.map((row) => ({
        id: row.id,
        lotUuid: row.lot_uuid,
        shortId: row.lot_uuid?.slice(-8) ?? row.id,
        status: 'available',
        availabilityStatus: 'available',
        processingStatus: row.status,
        species: row.species ?? 'cacao',
        weightKg: (row.weight_grams ?? 0) / 1000,
        weightGrams: row.weight_grams ?? 0,
        receivedFromProcessorAt: row.updated_at ?? null,
        producer: {
          name: row.producer?.name ?? '',
          commune: row.producer?.commune ?? '',
          region: row.producer?.region ?? '',
        },
        parcel: {
          name: row.parcel?.name ?? '',
          areaHa: row.parcel?.area_hectares ?? 0,
          geoJson: null,
          geometryType: 'Polygon',
          coordinatesPrecision: 6,
        },
        quality: {
          finalGrade: row.quality_data?.finalGrade ?? 'A',
          onChainHash: row.quality_data?.onChainHash ?? '',
          humidityFinal: row.quality_data?.humidityFinal ?? 0,
        },
        onChainHash: row.quality_data?.onChainHash ?? '',
        certifications: [],
      }))

      if (filters.search) {
        const q = filters.search.toLowerCase()
        lots = lots.filter((lot) =>
          lot.lotUuid.toLowerCase().includes(q) ||
          lot.producer.name.toLowerCase().includes(q) ||
          lot.producer.commune.toLowerCase().includes(q)
        )
      }
      if (filters.species && filters.species !== 'all') {
        lots = lots.filter((lot) => lot.species.toLowerCase() === filters.species.toLowerCase())
      }
      if (filters.grade && filters.grade !== 'all') {
        lots = lots.filter((lot) => lot.quality.finalGrade === filters.grade)
      }
      if (filters.minWeight != null && filters.minWeight !== '') {
        lots = lots.filter((lot) => lot.weightKg >= Number(filters.minWeight))
      }
      if (filters.maxWeight != null && filters.maxWeight !== '') {
        lots = lots.filter((lot) => lot.weightKg <= Number(filters.maxWeight))
      }

      return { source: 'supabase', lots }
    }
  } catch { /* noop */ }

  let lots = getMockAvailableLots()
  if (filters.search) {
    const q = filters.search.toLowerCase()
    lots = lots.filter((lot) =>
      lot.lotUuid.toLowerCase().includes(q) ||
      lot.producer.name.toLowerCase().includes(q) ||
      lot.producer.commune.toLowerCase().includes(q)
    )
  }
  if (filters.species && filters.species !== 'all') {
    lots = lots.filter((lot) => lot.species.toLowerCase() === filters.species.toLowerCase())
  }
  if (filters.grade && filters.grade !== 'all') {
    lots = lots.filter((lot) => lot.quality.finalGrade === filters.grade)
  }
  if (filters.minWeight != null && filters.minWeight !== '') {
    lots = lots.filter((lot) => lot.weightKg >= Number(filters.minWeight))
  }
  if (filters.maxWeight != null && filters.maxWeight !== '') {
    lots = lots.filter((lot) => lot.weightKg <= Number(filters.maxWeight))
  }

  return { source: 'mock', lots }
}

export async function validateLotForEUDR(lotId) {
  try {
    const { data, error } = await supabase
      .from('lots')
      .select(`
        lot_uuid, quality_data,
        parcel:parcels(geojson_hash, is_eudr_compliant)
      `)
      .eq('id', lotId)
      .single()

    if (data && !error) {
      const warnings = []
      if (!data.parcel?.is_eudr_compliant) warnings.push('Vérification terrain recommandée.')
      return {
        isValid: Boolean(data.parcel?.geojson_hash),
        errors: data.parcel?.geojson_hash ? [] : ['Hash GeoJSON manquant.'],
        warnings,
        noDeforestationDate: '2026-01-15',
      }
    }
  } catch { /* noop */ }

  const validation = getMockGeoJsonValidation(lotId)
  return {
    isValid: validation.isValid,
    errors: validation.errors ?? [],
    warnings: validation.warnings ?? [],
    noDeforestationDate: validation.noDeforestationDate ?? '2026-01-15',
    noDeforestationAfter2020: validation.noDeforestationAfter2020,
    precisionOk: validation.precisionOk,
  }
}

export async function createShipmentAndCertificate({ buyerId, lotsIds, destinationPort, vesselInfo, notes }) {
  // Import lazy — jsPDF est volumineux, on ne le charge qu'à la demande
  const { generateEudrPdf, generateTracesGeoJson } = await import("../utils/generateEudrPdf.js")

  try {
    // Délai simulé inscription Polygon
    await new Promise((resolve) => setTimeout(resolve, 2800))

    const mock = getMockShipmentCreation({ buyerId, lotsIds, destinationPort, vesselInfo, notes })
    const buyersMock = getMockExporterBuyers()
    const buyer = buyersMock.find((b) => b.id === buyerId) ?? buyersMock[0]
    const availableLots = getMockExportableLots()
    const selectedLots = availableLots.filter((l) => lotsIds.includes(l.id))

    const exporterProfile = {
      name: "Togo Export SA",
      legalName: "Togo Export Société Anonyme",
      taxId: "TG-2019-0042",
      operatorEudrId: "EU-OP-TG-00127",
      port: "Port Autonome de Lomé",
    }

    const pdfDataUri = generateEudrPdf({
      certificateNumber: mock.certificateNumber,
      exporter: exporterProfile,
      buyer,
      lots: selectedLots,
      destinationPort,
      vesselName: vesselInfo?.vesselName,
      containerNumber: vesselInfo?.containerNumber,
      estimatedDeparture: vesselInfo?.estimatedDeparture,
      txHash: mock.txHash,
    })

    const geoJsonUrl = generateTracesGeoJson({
      certificateNumber: mock.certificateNumber,
      lots: selectedLots,
      exporter: exporterProfile,
      buyer,
    })

    try {
      await supabase
        .from("lots")
        .update({ status: "exported", eudr_compliant: true, certificate_number: mock.certificateNumber })
        .in("lot_uuid", selectedLots.map((l) => l.lotUuid))
    } catch { /* noop */ }

    return {
      success: true,
      shipmentId: mock.shipmentId,
      certificateNumber: mock.certificateNumber,
      pdfUrl: pdfDataUri,
      geoJsonUrl,
      txHash: mock.txHash,
      shipment: mock.shipment,
      source: "generated",
    }
  } catch (err) {
    console.error("[createShipmentAndCertificate]", err)
    return {
      success: false,
      error: { code: "CERTIFICATE_GENERATION_FAILED", message: "Le dossier EUDR n’a pas pu être généré." },
      source: "mock",
    }
  }
}

export async function fetchBuyersList() {
  try {
    const { data, error } = await supabase
      .from('buyers')
      .select('id, name, country, city, contract_ref, contract_status, default_port')
      .order('name')

    if (data && !error) {
      return {
        source: 'supabase',
        buyers: data.map((buyer) => ({
          id: buyer.id,
          name: buyer.name,
          country: buyer.country,
          city: buyer.city,
          contractRef: buyer.contract_ref,
          contractStatus: buyer.contract_status,
          defaultPort: buyer.default_port ?? 'Port de destination UE',
        })),
      }
    }
  } catch { /* noop */ }

  const buyers = getMockExporterBuyers().map((buyer) => ({
    ...buyer,
    defaultPort:
      buyer.country === 'BE' ? 'Port d’Anvers' :
      buyer.country === 'DE' ? 'Port de Hambourg' :
      buyer.country === 'FR' ? 'Port du Havre' :
      buyer.country === 'NL' ? 'Port de Rotterdam' :
      buyer.country === 'CH' ? 'Terminal de Bâle' :
      'Port de destination UE',
  }))

  return { source: 'mock', buyers }
}

function normalizeExporterDashboard(row) {
  return {
    profile: {
      id: row.id,
      name: row.name,
      legalName: row.legal_name,
      taxId: row.tax_id,
      operatorEudrId: row.operator_eudr_id,
      address: row.address,
      contactEmail: row.contact_email,
      region: row.region,
      port: row.port,
      yearsActive: row.years_active,
      certifications: row.certifications ?? [],
    },
    buyers: [],
    lots: [],
    shipments: [],
    monthlyStats: { shipmentsThisMonth: 0, weightExportedKg: 0, certificatesIssued: 0, avgCertificationTimeHours: 0, buyersServed: 0, totalContractValueEur: 0, eudrComplianceRate: 0 },
    monthlyEvolution: [],
    buyerDistribution: [],
    destinationDistribution: [],
    recentActivity: [],
  }
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
  } catch { /* noop */ }
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
  } catch { /* noop */ }
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
  } catch { /* noop */ }
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
  } catch { /* noop */ }

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

// ── Fonctions Saisie Qualité Transformateur ────────────────────────────────────

function mockDelay(ms = 1000) {
  const jitter = Math.floor(Math.random() * 500)
  return new Promise((r) => setTimeout(r, ms + jitter))
}

function mockTxHash() {
  return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

// Copie profonde simple pour muter sans toucher le module
function cloneLot(lot) {
  return JSON.parse(JSON.stringify(lot))
}

// Cache mutable en mémoire pour la session (reset au rechargement)
let _lotsCache = null
function getLotsCache() {
  if (!_lotsCache) _lotsCache = getMockProcessorLots().map(cloneLot)
  return _lotsCache
}

export async function fetchProcessorLots(processorId, filters = {}) {
  try {
    // Tentative Supabase — non implémentée côté BDD pour l'instant
  } catch { /* noop */ }

  await mockDelay(600)
  let lots = getLotsCache()

  if (filters.status && filters.status !== 'all') {
    lots = lots.filter((l) => l.status === filters.status)
  }
  if (filters.search) {
    const q = filters.search.toLowerCase()
    lots = lots.filter(
      (l) =>
        l.lotUuid.toLowerCase().includes(q) ||
        l.producerName.toLowerCase().includes(q) ||
        l.originCooperative?.name.toLowerCase().includes(q),
    )
  }
  if (filters.alertsOnly) {
    const { getQualityAlerts } = await import('../utils/mockProcessor')
    lots = lots.filter((l) => getQualityAlerts(l).length > 0)
  }

  return { source: 'mock', lots }
}

export async function fetchLotQualityById(lotId) {
  try {
    // Tentative Supabase — non implémentée
  } catch { /* noop */ }

  await mockDelay(500)
  const cache = getLotsCache()
  const lot = cache.find((l) => l.id === lotId || l.lotUuid === lotId) ?? null
  return { source: 'mock', lot }
}

export async function saveFermentationReading(lotId, reading) {
  await mockDelay(800)
  const cache = getLotsCache()
  const lot = cache.find((l) => l.id === lotId || l.lotUuid === lotId)
  if (!lot) return { success: false, error: 'Lot introuvable' }

  lot.quality.fermentation.readings.push({
    day: reading.day,
    takenAt: new Date().toISOString(),
    tempC: reading.tempC,
    humidityPct: reading.humidityPct,
    notes: reading.notes ?? '',
  })

  const txHash = mockTxHash()
  return { success: true, lot: cloneLot(lot), txHash, source: 'mock' }
}

export async function startDryingStage(lotId, { method, initialHumidity }) {
  await mockDelay(1000)
  const cache = getLotsCache()
  const lot = cache.find((l) => l.id === lotId || l.lotUuid === lotId)
  if (!lot) return { success: false, error: 'Lot introuvable' }

  lot.status = 'drying'
  lot.quality.fermentation.completedAt = new Date().toISOString()
  lot.quality.drying.startedAt = new Date().toISOString()
  lot.quality.drying.method = method
  lot.quality.drying.humidityStart = initialHumidity

  const txHash = mockTxHash()
  return { success: true, lot: cloneLot(lot), txHash, source: 'mock' }
}

export async function saveDryingReading(lotId, reading) {
  await mockDelay(800)
  const cache = getLotsCache()
  const lot = cache.find((l) => l.id === lotId || l.lotUuid === lotId)
  if (!lot) return { success: false, error: 'Lot introuvable' }

  const start = new Date(lot.quality.drying.startedAt).getTime()
  const hoursSinceStart = Math.round((Date.now() - start) / 3_600_000)

  lot.quality.drying.readings.push({
    hour: reading.hour ?? hoursSinceStart,
    takenAt: new Date().toISOString(),
    humidityPct: reading.humidityPct,
    tempC: reading.tempC,
  })

  const txHash = mockTxHash()
  return { success: true, lot: cloneLot(lot), txHash, source: 'mock' }
}

export async function completeSortingStage(lotId, { weightAfterKg, rejectPct, beanSizeCategory }) {
  await mockDelay(1000)
  const cache = getLotsCache()
  const lot = cache.find((l) => l.id === lotId || l.lotUuid === lotId)
  if (!lot) return { success: false, error: 'Lot introuvable' }

  const lastReading = lot.quality.drying.readings[lot.quality.drying.readings.length - 1]
  lot.quality.drying.completedAt = new Date().toISOString()
  lot.quality.drying.humidityFinal = lastReading?.humidityPct ?? null
  lot.quality.sorting.completedAt = new Date().toISOString()
  lot.quality.sorting.weightAfterSortingKg = weightAfterKg
  lot.quality.sorting.rejectPct = rejectPct
  lot.quality.sorting.beanSizeCategory = beanSizeCategory

  const txHash = mockTxHash()
  return { success: true, lot: cloneLot(lot), txHash, source: 'mock' }
}

export async function finalizeGrading(lotId, { finalGrade, flavorProfile, defects, notes }) {
  await mockDelay(1200)
  const cache = getLotsCache()
  const lot = cache.find((l) => l.id === lotId || l.lotUuid === lotId)
  if (!lot) return { success: false, error: 'Lot introuvable' }

  lot.status = 'processed'
  lot.quality.grading.finalGrade = finalGrade
  lot.quality.grading.flavorProfile = flavorProfile
  lot.quality.grading.defects = defects
  lot.quality.grading.notes = notes
  lot.quality.grading.inspectedAt = new Date().toISOString()

  // SHA-256 simulé via crypto.subtle (appel côté browser via la page)
  // Ici on génère un hash factice pour le mock
  const fakeHash = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
  lot.quality.grading.onChainHash = fakeHash

  const txHash = mockTxHash()
  lot.quality.grading.onChainTxHash = txHash

  return { success: true, lot: cloneLot(lot), txHash, onChainHash: fakeHash, source: 'mock' }
}
