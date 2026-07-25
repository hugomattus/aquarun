export function getHRZones(fcMax) {
  if (!fcMax || fcMax < 100 || fcMax > 230) return null
  return {
    z1: { min: Math.round(fcMax * 0.50), max: Math.round(fcMax * 0.60), label: 'Recuperação ativa' },
    z2: { min: Math.round(fcMax * 0.60), max: Math.round(fcMax * 0.70), label: 'Aeróbico base' },
    z3: { min: Math.round(fcMax * 0.70), max: Math.round(fcMax * 0.80), label: 'Aeróbico/limiar' },
    z4: { min: Math.round(fcMax * 0.80), max: Math.round(fcMax * 0.90), label: 'Limiar anaeróbico' },
    z5: { min: Math.round(fcMax * 0.90), max: fcMax, label: 'VO2max/anaeróbico' },
  }
}

export function estimateVO2Max(distanceMeters, timeSeconds) {
  if (!distanceMeters || !timeSeconds || timeSeconds <= 0) return null
  const distKm = distanceMeters / 1000
  const distMiles = distKm * 0.621371
  const timeMin = timeSeconds / 60
  const vo2 = -4.60 + 0.182258 * distMiles + 0.000104 * distMiles * distMiles
  const pct = 0.8 + 0.1894393 * Math.exp(-0.012778 * timeMin) + 0.2989558 * Math.exp(-0.1932605 * timeMin)
  if (pct <= 0) return null
  return Math.round((vo2 / pct) * 10) / 10
}

export function getZoneForPace(paceSecondsPerKm, fcMax) {
  if (!paceSecondsPerKm || !fcMax) return null
  const zones = getHRZones(fcMax)
  if (!zones) return null
  const maxPace = 600
  const minPace = 150
  const normalized = (paceSecondsPerKm - minPace) / (maxPace - minPace)
  if (normalized < 0.2) return 'z5'
  if (normalized < 0.4) return 'z4'
  if (normalized < 0.6) return 'z3'
  if (normalized < 0.8) return 'z2'
  return 'z1'
}
