export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}min`
  return `${m}min ${s}s`
}

export function formatDistance(meters) {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`
  }
  return `${meters} m`
}

export function formatPace(metersPerSecond) {
  if (!metersPerSecond) return '--'
  const totalSeconds = 1000 / metersPerSecond
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')} /km`
}

export function formatSwimPace(metersPerSecond) {
  if (!metersPerSecond) return '--'
  const totalSeconds = 100 / metersPerSecond
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')} /100m`
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function getActivityIcon(type) {
  return type === 'swim' ? '🏊' : '🏃'
}

export function getActivityColor(type) {
  return type === 'swim' ? '#06b6d4' : '#a855f7'
}
