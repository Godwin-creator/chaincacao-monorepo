import { useState, useCallback } from 'react'

// Hook minimal de gestion des toasts pour les pages qualité
export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, variant = 'info') => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, variant }])
    return id
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    info:    (msg) => addToast(msg, 'info'),
  }

  return { toasts, toast, dismissToast }
}

// Calcul live du hash SHA-256 via browser crypto.subtle
export async function computeQualityHash(qualityObject) {
  try {
    const text = JSON.stringify(qualityObject)
    const buffer = new TextEncoder().encode(text)
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  } catch (_) {
    return null
  }
}

// Formate un numérique fr-FR (virgule décimale dans l'affichage)
export function formatFR(value, decimals = 1) {
  if (value == null || isNaN(value)) return '—'
  return Number(value).toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

// Jours écoulés depuis une date ISO
export function daysSince(isoDate) {
  if (!isoDate) return 0
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000)
}
