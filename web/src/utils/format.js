const weightFmt = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatWeight(kg) {
  return weightFmt.format(kg) + ' kg'
}

export function formatRelativeDate(isoString) {
  if (!isoString) return '—'
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(diff / 3600000)
  if (hours < 24) return `il y a ${hours} h`
  const days = Math.floor(diff / 86400000)
  if (days < 7) return `il y a ${days} j`
  return dateFmt.format(new Date(isoString))
}

export function formatFullDate(isoString) {
  if (!isoString) return '—'
  return dateFmt.format(new Date(isoString))
}

export function formatDelta(pct) {
  if (pct === 0) return '0 %'
  const sign = pct > 0 ? '+' : ''
  return sign + new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(pct) + ' %'
}
