import { randomUUID } from 'crypto'
import { supabaseAdmin } from '../_lib/supabase.js'
import { getAuthenticatedUser, setCorsHeaders } from '../_lib/auth.js'
import { mintLotOnChain } from '../_lib/blockchain.js'

/**
 * POST /api/lots/register
 *
 * Enregistre un lot dans Supabase et tente de minter un NFT sur Polygon Amoy.
 * Appelé par le mobile lors de la synchronisation offline-first.
 *
 * Body: { parcelId, species, weightGrams, harvestDate, qualityData?, createdOffline?, offlineCreatedAt? }
 * Response 201: { lotId, lotUuid, shortId, blockchainTxHash, blockchainSimulated }
 */
export default async function handler(req, res) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { user, error: authError } = await getAuthenticatedUser(req)
  if (authError) return res.status(401).json({ error: authError })

  const { parcelId, species, weightGrams, harvestDate, qualityData, createdOffline, offlineCreatedAt } =
    req.body ?? {}

  if (!parcelId || !species || !weightGrams || !harvestDate) {
    return res.status(400).json({
      error: 'Champs requis manquants : parcelId, species, weightGrams, harvestDate',
    })
  }

  try {
    const lotUuid = randomUUID()
    const shortId = `CC-${lotUuid.slice(0, 8).toUpperCase()}`
    const createdAt =
      createdOffline && offlineCreatedAt ? offlineCreatedAt : new Date().toISOString()

    // Blockchain : mint NFT (échec gracieux)
    const { txHash, tokenId, simulated } = await mintLotOnChain(
      user.email,   // adresse wallet non disponible → on passe l'email comme identifiant
      lotUuid,
      ''            // geoJsonHash calculé depuis la parcelle — enrichi côté backend si besoin
    )

    // Persistance Supabase via service role (bypass RLS)
    const { data, error: dbError } = await supabaseAdmin
      .from('lots')
      .insert({
        lot_uuid: lotUuid,
        short_id: shortId,
        producer_id: user.id,
        parcel_id: parcelId,
        species,
        weight_grams: weightGrams,
        harvest_date: harvestDate,
        status: 'harvested',
        quality_data: qualityData ?? {},
        tx_hash: txHash,
        contract_address: process.env.CONTRACT_ADDRESS,
        blockchain_token_id: tokenId ? Number(tokenId) : null,
        is_synced_blockchain: !simulated,
        created_at: createdAt,
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (dbError) {
      console.error('[lots/register] Supabase error:', dbError)
      return res.status(500).json({ error: 'Échec de la création du lot', details: dbError.message })
    }

    return res.status(201).json({
      lotId: data.id,
      lotUuid,
      shortId,
      blockchainTxHash: txHash,
      blockchainSimulated: simulated,
    })
  } catch (err) {
    console.error('[lots/register] Erreur non gérée:', err)
    return res.status(500).json({ error: 'Erreur interne du serveur' })
  }
}
