import { supabaseAdmin } from './supabase.js'

/**
 * Vérifie le JWT Bearer et retourne l'utilisateur Supabase.
 * @returns {{ user: object|null, error: string|null }}
 */
export async function getAuthenticatedUser(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'] || ''
  if (!authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Authorization header manquant ou invalide' }
  }

  const token = authHeader.slice(7).trim()
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !user) {
    return { user: null, error: 'Token invalide ou expiré' }
  }

  return { user, error: null }
}

/** Headers CORS à ajouter sur chaque réponse */
export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}
