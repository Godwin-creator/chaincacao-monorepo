/**
 * Script de seed des données de démonstration ChainCacao
 * -------------------------------------------------------
 * Crée 5 comptes utilisateurs + profils + parcelles + lots + transferts
 * dans Supabase pour la démo hackathon.
 *
 * Usage:
 *   node scripts/seed_demo.js
 *
 * Variables requises (depuis web/.env.local) :
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { randomUUID } from 'crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const CONTRACT_ADDRESS = '0x8E643C6bEEAa8E19a108a74B3A266cE4De9daDC4'
const DEMO_PASSWORD = 'Demo2026!'

// ── Utilitaires ───────────────────────────────────────────────────────────────

function fakeTxHash() {
  return '0x' + Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')
}

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function dateOnly(n) {
  return daysAgo(n).split('T')[0]
}

async function createUser(email, fullName, role, metadata = {}) {
  // Créer le compte Auth
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName, role, ...metadata },
  })
  if (authErr) {
    if (authErr.message.includes('already been registered')) {
      console.log(`  ↩ Compte existant : ${email}`)
      const { data: list } = await supabase.auth.admin.listUsers()
      const existing = list.users.find((u) => u.email === email)
      return existing
    }
    throw new Error(`Auth createUser ${email}: ${authErr.message}`)
  }
  console.log(`  ✓ Compte créé : ${email}`)
  return authData.user
}

async function upsert(table, data, conflictColumn = 'id') {
  const { error } = await supabase.from(table).upsert(data, { onConflict: conflictColumn })
  if (error) throw new Error(`upsert(${table}): ${error.message}`)
}

// ── Données GeoJSON (coordonnées réelles Togo) ────────────────────────────────

const PARCELS_GEOJSON = {
  wawa: {
    type: 'Feature',
    properties: { name: 'Parcelle Wawa Nord', commune: 'Wawa', region: 'Plateaux' },
    geometry: {
      type: 'Polygon',
      coordinates: [[[0.7279, 6.9479], [0.7294, 6.9479], [0.7296, 6.9488], [0.7292, 6.9499], [0.7279, 6.9496], [0.7279, 6.9479]]],
    },
  },
  akebou: {
    type: 'Feature',
    properties: { name: 'Parcelle Akébou Vallée', commune: 'Akébou', region: 'Plateaux' },
    geometry: {
      type: 'Polygon',
      coordinates: [[[0.5799, 7.3490], [0.5813, 7.3490], [0.5815, 7.3498], [0.5812, 7.3506], [0.5799, 7.3503], [0.5799, 7.3490]]],
    },
  },
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n🌱 Seed ChainCacao — Données de démonstration\n')

  // ── 1. Créer les utilisateurs ──────────────────────────────────────────────
  console.log('1/6 Création des comptes utilisateurs...')

  const producerUser = await createUser('producteur@demo.chaincacao.tg', 'Kossi Amétépé', 'producer')
  const coopUser     = await createUser('cooperative@demo.chaincacao.tg', 'SCOOPS Wawa', 'cooperative')
  const processorUser = await createUser('transformateur@demo.chaincacao.tg', 'TransformaCacao SARL', 'processor')
  const exporterUser  = await createUser('exportateur@demo.chaincacao.tg', 'Togo Export SA', 'exporter')
  const verifierUser  = await createUser('verificateur@demo.chaincacao.tg', 'Autorité UE', 'verifier')

  // ── 2. Profils acteurs ─────────────────────────────────────────────────────
  console.log('\n2/6 Création des profils acteurs...')

  const coopId      = 'coop-scoops-wawa-001'
  const processorId = 'proc-transformacacao-001'
  const exporterId  = 'exp-togo-export-001'

  await upsert('cooperatives', {
    id: coopId,
    name: 'SCOOPS Wawa',
    commune: 'Wawa',
    region: 'Plateaux',
    member_count: 47,
    user_id: coopUser?.id ?? null,
    contact_email: 'cooperative@demo.chaincacao.tg',
  })
  console.log('  ✓ Coopérative SCOOPS Wawa')

  await upsert('processors', {
    id: processorId,
    name: 'TransformaCacao SARL',
    commune: 'Kpalimé',
    region: 'Plateaux',
    capacity_kg: 5000,
    current_load_kg: 1240,
    staff_count: 12,
    user_id: processorUser?.id ?? null,
    contact_email: 'transformateur@demo.chaincacao.tg',
  })
  console.log('  ✓ Transformateur TransformaCacao SARL')

  await upsert('exporters', {
    id: exporterId,
    name: 'Togo Export SA',
    legal_name: 'Togo Export Société Anonyme',
    tax_id: 'TG-2019-0042',
    operator_eudr_id: 'EU-OP-TG-00127',
    address: 'Zone Portuaire, Lomé, Togo',
    contact_email: 'exportateur@demo.chaincacao.tg',
    region: 'Maritime',
    port: 'Port Autonome de Lomé',
    years_active: 7,
    certifications: ['UTZ', 'Rainforest Alliance'],
    user_id: exporterUser?.id ?? null,
  })
  console.log('  ✓ Exportateur Togo Export SA')

  const producerId = randomUUID()
  await upsert('producers', {
    id: producerId,
    user_id: producerUser?.id,
    name: 'Kossi Amétépé',
    organization: 'Producteur indépendant',
    commune: 'Wawa',
    region: 'Plateaux',
    phone: '+228 90 12 34 56',
    cooperative_id: coopId,
  })
  console.log('  ✓ Producteur Kossi Amétépé')

  // ── 3. Parcelles GPS ───────────────────────────────────────────────────────
  console.log('\n3/6 Création des parcelles...')

  const parcelWawaId   = randomUUID()
  const parcelAkebouId = randomUUID()

  await upsert('parcels', {
    id: parcelWawaId,
    producer_id: producerUser?.id,
    name: 'Parcelle Wawa Nord',
    area_ha: 2.3,
    geo_json: PARCELS_GEOJSON.wawa,
    commune: 'Wawa',
    region: 'Plateaux',
    created_at: daysAgo(30),
  })
  await upsert('parcels', {
    id: parcelAkebouId,
    producer_id: producerUser?.id,
    name: 'Parcelle Akébou Vallée',
    area_ha: 1.8,
    geo_json: PARCELS_GEOJSON.akebou,
    commune: 'Akébou',
    region: 'Plateaux',
    created_at: daysAgo(25),
  })
  console.log('  ✓ 2 parcelles créées')

  // ── 4. Lots de cacao à différents stades ───────────────────────────────────
  console.log('\n4/6 Création des lots...')

  const lots = [
    {
      id: randomUUID(),
      lot_uuid: 'cc-demo-verified-001',
      short_id: 'CC-DEMO-V01',
      producer_id: producerUser?.id,
      parcel_id: parcelWawaId,
      cooperative_id: coopId,
      species: 'cacao',
      weight_grams: 52000,
      harvest_date: dateOnly(45),
      status: 'verified',
      quality_data: { fermentationDays: 6, dryingHumidity: 7.2, finalGrade: 'A', aromaNotes: 'Fruité, légèrement acidulé' },
      tx_hash: fakeTxHash(),
      contract_address: CONTRACT_ADDRESS,
      is_synced_blockchain: true,
      eudr_compliant: true,
      certificate_number: 'EUDR-TG-2026-0042',
      destination_country: 'Belgium',
      destination_port: 'Port d'Anvers',
      buyer_name: 'Callebaut Ingredients NV',
      exported_at: daysAgo(5),
      verified_at: daysAgo(2),
      created_at: daysAgo(45),
      updated_at: daysAgo(2),
    },
    {
      id: randomUUID(),
      lot_uuid: 'cc-demo-exported-002',
      short_id: 'CC-DEMO-E02',
      producer_id: producerUser?.id,
      parcel_id: parcelWawaId,
      cooperative_id: coopId,
      species: 'cacao',
      weight_grams: 38500,
      harvest_date: dateOnly(30),
      status: 'exported',
      quality_data: { fermentationDays: 5, dryingHumidity: 7.8, finalGrade: 'A', aromaNotes: 'Chocolaté, épicé' },
      tx_hash: fakeTxHash(),
      contract_address: CONTRACT_ADDRESS,
      is_synced_blockchain: true,
      eudr_compliant: true,
      certificate_number: 'EUDR-TG-2026-0051',
      destination_country: 'France',
      destination_port: 'Port du Havre',
      buyer_name: 'Cémoi France SAS',
      exported_at: daysAgo(8),
      created_at: daysAgo(30),
      updated_at: daysAgo(8),
    },
    {
      id: randomUUID(),
      lot_uuid: 'cc-demo-processed-003',
      short_id: 'CC-DEMO-P03',
      producer_id: producerUser?.id,
      parcel_id: parcelAkebouId,
      cooperative_id: coopId,
      species: 'robusta_coffee',
      weight_grams: 27000,
      harvest_date: dateOnly(20),
      status: 'processed',
      quality_data: { fermentationDays: 4, dryingHumidity: 8.1, finalGrade: 'B+' },
      tx_hash: fakeTxHash(),
      contract_address: CONTRACT_ADDRESS,
      is_synced_blockchain: true,
      created_at: daysAgo(20),
      updated_at: daysAgo(7),
    },
    {
      id: randomUUID(),
      lot_uuid: 'cc-demo-collected-004',
      short_id: 'CC-DEMO-C04',
      producer_id: producerUser?.id,
      parcel_id: parcelWawaId,
      cooperative_id: coopId,
      species: 'cacao',
      weight_grams: 64000,
      harvest_date: dateOnly(10),
      status: 'collected',
      quality_data: {},
      tx_hash: fakeTxHash(),
      contract_address: CONTRACT_ADDRESS,
      is_synced_blockchain: false,
      created_at: daysAgo(10),
      updated_at: daysAgo(3),
    },
    {
      id: randomUUID(),
      lot_uuid: 'cc-demo-harvested-005',
      short_id: 'CC-DEMO-H05',
      producer_id: producerUser?.id,
      parcel_id: parcelAkebouId,
      cooperative_id: null,
      species: 'cacao',
      weight_grams: 41000,
      harvest_date: dateOnly(3),
      status: 'harvested',
      quality_data: {},
      tx_hash: null,
      contract_address: null,
      is_synced_blockchain: false,
      created_at: daysAgo(3),
      updated_at: daysAgo(3),
    },
  ]

  for (const lot of lots) {
    await upsert('lots', lot)
    console.log(`  ✓ Lot ${lot.short_id} [${lot.status}] — ${(lot.weight_grams / 1000).toFixed(1)} kg`)
  }

  // ── 5. Transferts (chaîne de traçabilité) ──────────────────────────────────
  console.log('\n5/6 Création des transferts...')

  const verifiedLot    = lots[0]
  const exportedLot    = lots[1]
  const processedLot   = lots[2]

  const transfers = [
    // Lot vérifié : chaîne complète
    { lot_id: verifiedLot.id,  step: 'collected',  from_user_id: producerUser?.id,  to_user_id: coopUser?.id,       tx_hash: fakeTxHash(), created_at: daysAgo(40) },
    { lot_id: verifiedLot.id,  step: 'processed',  from_user_id: coopUser?.id,      to_user_id: processorUser?.id,  tx_hash: fakeTxHash(), created_at: daysAgo(30) },
    { lot_id: verifiedLot.id,  step: 'exported',   from_user_id: processorUser?.id, to_user_id: exporterUser?.id,   tx_hash: fakeTxHash(), created_at: daysAgo(10) },
    { lot_id: verifiedLot.id,  step: 'verified',   from_user_id: exporterUser?.id,  to_user_id: verifierUser?.id,   tx_hash: fakeTxHash(), created_at: daysAgo(2)  },
    // Lot exporté
    { lot_id: exportedLot.id,  step: 'collected',  from_user_id: producerUser?.id,  to_user_id: coopUser?.id,       tx_hash: fakeTxHash(), created_at: daysAgo(25) },
    { lot_id: exportedLot.id,  step: 'processed',  from_user_id: coopUser?.id,      to_user_id: processorUser?.id,  tx_hash: fakeTxHash(), created_at: daysAgo(18) },
    { lot_id: exportedLot.id,  step: 'exported',   from_user_id: processorUser?.id, to_user_id: exporterUser?.id,   tx_hash: fakeTxHash(), created_at: daysAgo(8)  },
    // Lot transformé
    { lot_id: processedLot.id, step: 'collected',  from_user_id: producerUser?.id,  to_user_id: coopUser?.id,       tx_hash: fakeTxHash(), created_at: daysAgo(15) },
    { lot_id: processedLot.id, step: 'processed',  from_user_id: coopUser?.id,      to_user_id: processorUser?.id,  tx_hash: fakeTxHash(), created_at: daysAgo(7)  },
  ]

  for (const t of transfers) {
    await upsert('transfers', {
      id: randomUUID(),
      ...t,
      tx_url: `https://amoy.polygonscan.com/tx/${t.tx_hash}`,
    }, 'lot_id')  // upsert sur lot_id+step n'est pas idéal, mais suffisant pour le seed
  }
  console.log(`  ✓ ${transfers.length} transferts créés`)

  // ── 6. Résumé ─────────────────────────────────────────────────────────────
  console.log('\n6/6 Seed terminé ✅\n')
  console.log('─'.repeat(55))
  console.log('COMPTES DE DÉMONSTRATION (mot de passe : Demo2026!)\n')
  const accounts = [
    { role: 'Producteur',     email: 'producteur@demo.chaincacao.tg'    },
    { role: 'Coopérative',    email: 'cooperative@demo.chaincacao.tg'   },
    { role: 'Transformateur', email: 'transformateur@demo.chaincacao.tg'},
    { role: 'Exportateur',    email: 'exportateur@demo.chaincacao.tg'   },
    { role: 'Vérificateur UE',email: 'verificateur@demo.chaincacao.tg'  },
  ]
  for (const a of accounts) {
    console.log(`  ${a.role.padEnd(18)} ${a.email}`)
  }
  console.log('\nLOTS CRÉÉS')
  console.log('  CC-DEMO-V01  [verified]  52 kg cacao   — chaîne complète')
  console.log('  CC-DEMO-E02  [exported]  38.5 kg cacao — exporté vers France')
  console.log('  CC-DEMO-P03  [processed] 27 kg robusta — en transformation')
  console.log('  CC-DEMO-C04  [collected] 64 kg cacao   — collecté par coop')
  console.log('  CC-DEMO-H05  [harvested] 41 kg cacao   — fraîchement récolté')
  console.log('─'.repeat(55) + '\n')
}

seed().catch((err) => {
  console.error('\n❌ Seed échoué :', err.message)
  process.exit(1)
})
