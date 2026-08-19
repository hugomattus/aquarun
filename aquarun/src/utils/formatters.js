let unitSystem = 'km'

export function setUnitSystem(unit) {
  unitSystem = unit === 'mi' ? 'mi' : 'km'
}

export function getUnitSystem() {
  return unitSystem
}

export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}min`
  return `${m}min ${s}s`
}

export function formatDistance(meters) {
  if (!meters && meters !== 0) return '--'
  if (unitSystem === 'mi') {
    return `${(meters * 0.000621371).toFixed(2)} mi`
  }
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`
  }
  return `${meters} m`
}

export function formatPace(metersPerSecond) {
  if (!metersPerSecond) return '--'
  const unitMeters = unitSystem === 'mi' ? 1609.34 : 1000
  const unitLabel = unitSystem === 'mi' ? ' /mi' : ' /km'
  const totalSeconds = unitMeters / metersPerSecond
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}${unitLabel}`
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

export function formatDateFull(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
}