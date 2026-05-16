import { supabaseAdmin } from '../_lib/supabase.js'
import { getAuthenticatedUser, setCorsHeaders } from '../_lib/auth.js'
import { transferCustodyOnChain } from '../_lib/blockchain.js'

/**
 * POST /api/lots/transfer
 *
 * Transfère la custode d'un lot vers un nouvel acteur.
 * Met à jour le statut dans Supabase et enregistre la transaction blockchain.
 * Appelé par le mobile (LotRepository.transferLot) et le web (coopérative, transformateur).
 *
 * Body: { lotId, toUserId, newStatus, contextData? }
 * Response 200: { transferId, blockchainTxHash, blockchainSimulated }
 */
export default async function handler(req, res) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { user, error: authError } = await getAuthenticatedUser(req)
  if (authError) return res.status(401).json({ error: authError })

  const { lotId, toUserId, newStatus, contextData } = req.body ?? {}

  if (!lotId || !newStatus) {
    return res.status(400).json({ error: 'Champs requis manquants : lotId, newStatus' })
  }

  const VALID_STATUSES = ['collected', 'processed', 'exported', 'verified']
  if (!VALID_STATUSES.includes(newStatus)) {
    return res.status(400).json({
      error: `Statut invalide : ${newStatus}. Valeurs acceptées : ${VALID_STATUSES.join(', ')}`,
    })
  }

  try {
    // Vérifier que le lot existe
    const { data: lot, error: lotError } = await supabaseAdmin
      .from('lots')
      .select('id, lot_uuid, blockchain_token_id, status, producer_id, current_owner_id')
      .eq('id', lotId)
      .single()

    if (lotError || !lot) {
      return res.status(404).json({ error: 'Lot introuvable' })
    }

    // Blockchain : transfert de custode (échec gracieux)
    const { txHash, simulated } = await transferCustodyOnChain(
      lot.blockchain_token_id,
      toUserId ?? user.id,
      newStatus
    )

    // Créer l'enregistrement de transfert
    const { data: transfer, error: transferError } = await supabaseAdmin
      .from('transfers')
      .insert({
        lot_id: lotId,
        from_user_id: user.id,
        to_user_id: toUserId ?? null,
        step: newStatus,
        actor_name: user.email,
        tx_hash: txHash,
        tx_url: `https://amoy.polygonscan.com/tx/${txHash}`,
        context_data: contextData ?? {},
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (transferError) {
      console.error('[lots/transfer] Erreur création transfert:', transferError)
      return res.status(500).json({ error: "Échec de l'enregistrement du transfert" })
    }

    // Mettre à jour le statut du lot
    const { error: updateError } = await supabaseAdmin
      .from('lots')
      .update({
        status: newStatus,
        current_owner_id: toUserId ?? user.id,
        is_synced_blockchain: !simulated,
        updated_at: new Date().toISOString(),
      })
      .eq('id', lotId)

    if (updateError) {
      console.error('[lots/transfer] Erreur mise à jour lot:', updateError)
      // Le transfert est déjà enregistré, on continue quand même
    }

    return res.status(200).json({
      transferId: transfer.id,
      blockchainTxHash: txHash,
      blockchainSimulated: simulated,
    })
  } catch (err) {
    console.error('[lots/transfer] Erreur non gérée:', err)
    return res.status(500).json({ error: 'Erreur interne du serveur' })
  }
}
