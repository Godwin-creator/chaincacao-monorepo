import { supabaseAdmin } from '../_lib/supabase.js'
import { getAuthenticatedUser, setCorsHeaders } from '../_lib/auth.js'

/**
 * POST /api/parcels/register
 *
 * Enregistre une parcelle agricole dans Supabase.
 * Appelé par le mobile (ParcelRepository.syncWithServer) lors de la synchronisation.
 *
 * Body: { name, areaHectares, geojson? }
 * Response 201: { parcelId }
 */
export default async function handler(req, res) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { user, error: authError } = await getAuthenticatedUser(req)
  if (authError) return res.status(401).json({ error: authError })

  const { name, areaHectares, geojson } = req.body ?? {}

  if (!name || !areaHectares) {
    return res.status(400).json({ error: 'Champs requis manquants : name, areaHectares' })
  }

  if (typeof areaHectares !== 'number' || areaHectares <= 0) {
    return res.status(400).json({ error: 'areaHectares doit être un nombre positif' })
  }

  try {
    // Extraire commune/région depuis les propriétés GeoJSON si disponibles
    const feature = geojson?.features?.[0] ?? geojson
    const props = feature?.properties ?? {}

    const { data, error: dbError } = await supabaseAdmin
      .from('parcels')
      .insert({
        producer_id: user.id,
        name,
        area_ha: areaHectares,
        geo_json: geojson ?? {},
        commune: props.commune ?? null,
        region: props.region ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (dbError) {
      console.error('[parcels/register] Supabase error:', dbError)
      return res.status(500).json({ error: 'Échec de la création de la parcelle', details: dbError.message })
    }

    return res.status(201).json({ parcelId: data.id })
  } catch (err) {
    console.error('[parcels/register] Erreur non gérée:', err)
    return res.status(500).json({ error: 'Erreur interne du serveur' })
  }
}
