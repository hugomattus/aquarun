import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../utils/supabase'
import { useAuthStore } from './auth'

export const useWorkoutStore = defineStore('workouts', () => {
  const auth = useAuthStore()
  const workouts = ref([])
  const loading = ref(false)

  async function fetchWorkouts() {
    if (!auth.user) return
    loading.value = true

    const { data } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('scheduled_date', { ascending: true })

    workouts.value = data || []
    loading.value = false
  }

  async function createWorkout(workout) {
    const { data, error } = await supabase
      .from('workouts')
      .insert({
        user_id: auth.user.id,
        type: workout.type,
        name: workout.name,
        description: workout.description,
        scheduled_date: workout.scheduled_date,
        duration: workout.duration,
        intervals: workout.intervals,
        structure: workout.structure || null,
        week_number: workout.week_number || 1,
        planned_distance: workout.planned_distance || null,
        planned_pace: workout.planned_pace || null,
        status: 'planned',
      })
      .select()
      .single()

    if (!error) workouts.value.push(data)
    return data
  }

  async function completeWorkout(workoutId, activityId) {
    await supabase
      .from('workouts')
      .update({ status: 'completed', completed_activity_id: activityId })
      .eq('id', workoutId)

    const idx = workouts.value.findIndex(w => w.id === workoutId)
    if (idx !== -1) {
      workouts.value[idx].status = 'completed'
      workouts.value[idx].completed_activity_id = activityId
    }
  }

  async function saveWorkoutPerformance(workoutId, performance) {
    const { error } = await supabase
      .from('workouts')
      .update({
        actual_distance: performance.distance,
        actual_duration: performance.duration,
        actual_pace: performance.pace,
        actual_heartrate: performance.heartrate,
        actual_max_heartrate: performance.maxHeartrate,
        actual_cadence: performance.cadence,
        actual_elevation: performance.elevation,
        actual_calories: performance.calories,
        actual_strokes: performance.strokes,
        actual_swolf: performance.swolf,
        actual_moving_time: performance.movingTime,
        actual_elapsed_time: performance.elapsedTime,
        splits: performance.splits,
      })
      .eq('id', workoutId)

    if (!error) {
      const idx = workouts.value.findIndex(w => w.id === workoutId)
      if (idx !== -1) {
        Object.assign(workouts.value[idx], {
          actual_distance: performance.distance,
          actual_duration: performance.duration,
          actual_pace: performance.pace,
          actual_heartrate: performance.heartrate,
          actual_max_heartrate: performance.maxHeartrate,
          actual_cadence: performance.cadence,
          actual_elevation: performance.elevation,
          actual_calories: performance.calories,
          actual_moving_time: performance.movingTime,
          actual_elapsed_time: performance.elapsedTime,
          splits: performance.splits,
        })
      }
    }
  }

  async function saveWorkoutFeedback(workoutId, feedback) {
    const { error } = await supabase
      .from('workouts')
      .update({
        feedback_effort: feedback.effort,
        feedback_pain: feedback.pain,
        feedback_energy: feedback.energy,
        feedback_sleep: feedback.sleep,
        feedback_stress: feedback.stress,
        feedback_notes: feedback.notes,
      })
      .eq('id', workoutId)

    if (!error) {
      const idx = workouts.value.findIndex(w => w.id === workoutId)
      if (idx !== -1) {
        Object.assign(workouts.value[idx], {
          feedback_effort: feedback.effort,
          feedback_pain: feedback.pain,
          feedback_energy: feedback.energy,
          feedback_sleep: feedback.sleep,
          feedback_stress: feedback.stress,
          feedback_notes: feedback.notes,
        })
      }
    }
  }

  async function skipWorkout(workoutId) {
    const { error } = await supabase
      .from('workouts')
      .update({ status: 'skipped' })
      .eq('id', workoutId)

    if (!error) {
      const idx = workouts.value.findIndex(w => w.id === workoutId)
      if (idx !== -1) {
        workouts.value[idx].status = 'skipped'
      }
    }
  }

  async function deleteWorkout(workoutId) {
    await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId)

    workouts.value = workouts.value.filter(w => w.id !== workoutId)
  }

  function getWeekWorkouts(weekNumber) {
    return workouts.value
      .filter(w => w.week_number === weekNumber)
      .sort((a, b) => {
        const dayA = new Date(a.scheduled_date).getDay()
        const dayB = new Date(b.scheduled_date).getDay()
        return dayA - dayB
      })
  }

  function getWeekStats(weekNumber) {
    const week = getWeekWorkouts(weekNumber)
    const completed = week.filter(w => w.status === 'completed')
    const runs = completed.filter(w => w.type === 'run')
    const swims = completed.filter(w => w.type === 'swim')

    const effortMap = { very_easy: 1, easy: 2, moderate: 3, hard: 4, very_hard: 5 }
    const avgEffort = completed.length > 0
      ? completed.reduce((sum, w) => sum + (effortMap[w.feedback_effort] || 0), 0) / completed.length
      : 0

    const avgPain = completed.length > 0
      ? completed.reduce((sum, w) => sum + (w.feedback_pain || 0), 0) / completed.length
      : 0
    const avgEnergy = completed.length > 0
      ? completed.reduce((sum, w) => sum + (w.feedback_energy || 0), 0) / completed.length
      : 0
    const avgSleep = completed.length > 0
      ? completed.reduce((sum, w) => sum + (w.feedback_sleep || 0), 0) / completed.length
      : 0
    const avgStress = completed.length > 0
      ? completed.reduce((sum, w) => sum + (w.feedback_stress || 0), 0) / completed.length
      : 0

    const totalRunDistance = runs.reduce((sum, w) => sum + (w.actual_distance || 0), 0)
    const totalSwimDistance = swims.reduce((sum, w) => sum + (w.actual_distance || 0), 0)
    const totalRunTime = runs.reduce((sum, w) => sum + (w.actual_duration || 0), 0)
    const totalSwimTime = swims.reduce((sum, w) => sum + (w.actual_duration || 0), 0)

    let runLoad = 0
    runs.forEach(w => {
      if (w.actual_distance && w.actual_pace) {
        const intensityFactor = w.planned_pace && w.actual_pace < w.planned_pace ? 1.2 : 1.0
        runLoad += (w.actual_distance / 1000) * intensityFactor
      }
    })
    let swimLoad = 0
    swims.forEach(w => {
      if (w.actual_distance) {
        swimLoad += (w.actual_distance / 1000) * 1.0
      }
    })

    return {
      total: week.length,
      completed: completed.length,
      skipped: week.filter(w => w.status === 'skipped').length,
      runDistance: totalRunDistance,
      swimDistance: totalSwimDistance,
      runTime: totalRunTime,
      swimTime: totalSwimTime,
      weeklyVolume: (totalRunDistance + totalSwimDistance) / 1000,
      weeklyLoad: runLoad + swimLoad,
      avgEffort,
      avgPain,
      avgEnergy,
      avgSleep,
      avgStress,
      avgExhaustion: avgEffort * 2,
      avgHeartrate: runs.length > 0
        ? runs.reduce((sum, w) => sum + (w.actual_heartrate || 0), 0) / runs.length
        : 0,
      avgMaxHeartrate: runs.length > 0
        ? runs.filter(w => w.actual_max_heartrate).reduce((sum, w) => sum + w.actual_max_heartrate, 0) / (runs.filter(w => w.actual_max_heartrate).length || 1)
        : 0,
      avgElevation: runs.length > 0
        ? runs.reduce((sum, w) => sum + (w.actual_elevation || 0), 0) / runs.length
        : 0,
      avgCadence: runs.length > 0
        ? runs.filter(w => w.actual_cadence).reduce((sum, w) => sum + w.actual_cadence, 0) / (runs.filter(w => w.actual_cadence).length || 1)
        : 0,
      totalElevation: runs.reduce((sum, w) => sum + (w.actual_elevation || 0), 0),
      avgRunPace: runs.length > 0
        ? runs.filter(w => w.actual_pace).reduce((sum, w) => sum + w.actual_pace, 0) / runs.filter(w => w.actual_pace).length
        : 0,
      avgSwimPace: swims.length > 0
        ? swims.filter(w => w.actual_pace).reduce((sum, w) => sum + w.actual_pace, 0) / swims.filter(w => w.actual_pace).length
        : 0,
      avgSwolf: swims.length > 0
        ? swims.filter(w => w.actual_swolf).reduce((sum, w) => sum + w.actual_swolf, 0) / (swims.filter(w => w.actual_swolf).length || 1)
        : 0,
      totalStrokes: swims.reduce((sum, w) => sum + (w.actual_strokes || 0), 0),
      painReports: completed
        .filter(w => w.feedback_pain > 0)
        .map(w => `dor ${w.feedback_pain}/10`),
    }
  }

  function getRecentWorkouts(type, limit = 8) {
    return workouts.value
      .filter(w => w.status === 'completed' && (!type || w.type === type))
      .sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date))
      .slice(0, limit)
  }

  function getTrends(currentWeekNumber) {
    const weeks = []
    for (let w = Math.max(1, currentWeekNumber - 3); w < currentWeekNumber; w++) {
      weeks.push(getWeekStats(w))
    }
    if (weeks.length < 2) return null

    const paceValues = weeks.filter(w => w.avgRunPace > 0).map(w => w.avgRunPace)
    const distValues = weeks.filter(w => w.runDistance > 0).map(w => w.runDistance)
    const effortValues = weeks.filter(w => w.avgEffort > 0).map(w => w.avgEffort)
    const painValues = weeks.filter(w => w.avgPain > 0).map(w => w.avgPain)

    function trendLabel(values, unit = '', invert = false) {
      if (values.length < 2) return null
      const first = values[0]
      const last = values[values.length - 1]
      const diff = last - first
      const pct = first > 0 ? Math.round((diff / first) * 100) : 0
      if (Math.abs(pct) < 3) return `Estável (${unit ? last.toFixed(1) + unit : ''})`
      const improving = invert ? diff < 0 : diff > 0
      return `${improving ? 'Melhorando' : 'Piorando'} ${Math.abs(pct)}% (${unit ? last.toFixed(1) + unit : ''})`
    }

    function formatPace(pace) {
      if (!pace) return null
      const min = Math.floor(pace / 60)
      const sec = Math.floor(pace % 60)
      return `${min}:${sec.toString().padStart(2, '0')}/km`
    }

    const completed = workouts.value.filter(w => w.status === 'completed')
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysStr = thirtyDaysAgo.toLocaleDateString('sv-SE')
    const recent30d = completed.filter(w => w.scheduled_date >= thirtyDaysStr)
    const bestPace30d = recent30d.filter(w => w.actual_pace).reduce((min, w) => !min || w.actual_pace < min ? w.actual_pace : min, null)
    const totalDist30d = recent30d.reduce((sum, w) => sum + (w.actual_distance || 0), 0)

    const avgPainRecent = recent30d.filter(w => w.feedback_pain > 0)
    const avgSleepRecent = recent30d.filter(w => w.feedback_sleep > 0)
    const avgStressRecent = recent30d.filter(w => w.feedback_stress > 0)
    let recoveryPatterns = null
    if (avgPainRecent.length >= 3) {
      const avgP = avgPainRecent.reduce((s, w) => s + w.feedback_pain, 0) / avgPainRecent.length
      const avgS = avgSleepRecent.length > 0 ? avgSleepRecent.reduce((s, w) => s + w.feedback_sleep, 0) / avgSleepRecent.length : 0
      const avgSt = avgStressRecent.length > 0 ? avgStressRecent.reduce((s, w) => s + w.feedback_stress, 0) / avgStressRecent.length : 0
      recoveryPatterns = `Dor média: ${avgP.toFixed(1)}/10 | Sono: ${avgS.toFixed(1)}/10 | Estresse: ${avgSt.toFixed(1)}/10`
    }

    return {
      paceTrend: trendLabel(paceValues, '/km', true),
      distanceTrend: trendLabel(distValues, 'km'),
      effortTrend: effortValues.length >= 2 ? trendLabel(effortValues, '/5', true) : null,
      painTrend: painValues.length >= 2 ? trendLabel(painValues, '/10', true) : null,
      bestPace30d: bestPace30d ? formatPace(bestPace30d) : null,
      totalDistance30d: totalDist30d > 0 ? `${(totalDist30d / 1000).toFixed(1)}km` : null,
      totalWorkouts30d: recent30d.length || null,
      recoveryPatterns,
    }
  }

  function getPreviousWeeks(currentWeekNumber, count = 3) {
    const weeks = []
    for (let w = Math.max(1, currentWeekNumber - count); w < currentWeekNumber; w++) {
      weeks.push(getWeekStats(w))
    }
    return weeks
  }

  async function saveWeekLog(weekNumber, startDate, endDate) {
    const stats = getWeekStats(weekNumber)

    const { data: existing } = await supabase
      .from('week_logs')
      .select('id')
      .eq('user_id', auth.user.id)
      .eq('week_number', weekNumber)
      .maybeSingle()

    const payload = {
      user_id: auth.user.id,
      week_number: weekNumber,
      start_date: startDate,
      end_date: endDate,
      avg_exhaustion: stats.avgEffort,
      total_run_distance: stats.runDistance,
      total_swim_distance: stats.swimDistance,
      total_run_time: stats.runTime,
      total_swim_time: stats.swimTime,
      total_workouts: stats.total,
      completed_workouts: stats.completed,
      skipped_workouts: stats.skipped,
      avg_run_pace: stats.avgRunPace,
      avg_swim_pace: stats.avgSwimPace,
      avg_heartrate: stats.avgHeartrate,
      pain_report: stats.painReports.join('; ') || null,
      notes: `Energia:${stats.avgEnergy.toFixed(1)} Sono:${stats.avgSleep.toFixed(1)} Estresse:${stats.avgStress.toFixed(1)} Carga:${stats.weeklyLoad.toFixed(1)} Volume:${stats.weeklyVolume.toFixed(1)}km`,
    }

    if (existing) {
      await supabase.from('week_logs').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('week_logs').insert(payload)
    }

    return true
  }

  function estimateFcMax() {
    const completed = workouts.value.filter(w => w.status === 'completed' && w.actual_max_heartrate)
    if (completed.length === 0) return null
    const sorted = completed.sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date))
    const recent = sorted.slice(0, 20)
    return Math.max(...recent.map(w => w.actual_max_heartrate))
  }

  function estimateVO2Max() {
    const completed = workouts.value.filter(w => w.status === 'completed' && w.type === 'run' && w.actual_distance && w.actual_duration)
    if (completed.length === 0) return null
    const best5k = completed
      .filter(w => w.actual_distance >= 4500 && w.actual_distance <= 5500)
      .sort((a, b) => (a.actual_pace || Infinity) - (b.actual_pace || Infinity))[0]
    const best10k = completed
      .filter(w => w.actual_distance >= 9000 && w.actual_distance <= 11000)
      .sort((a, b) => (a.actual_pace || Infinity) - (b.actual_pace || Infinity))[0]
    let best = best5k || best10k
    if (!best) {
      const bestLong = completed
        .filter(w => w.actual_distance >= 3000)
        .sort((a, b) => (a.actual_pace || Infinity) - (b.actual_pace || Infinity))[0]
      best = bestLong
    }
    if (!best) return null
    const distMiles = (best.actual_distance / 1000) * 0.621371
    const timeMin = best.actual_duration / 60
    const vo2 = -4.60 + 0.182258 * distMiles + 0.000104 * distMiles * distMiles
    const pct = 0.8 + 0.1894393 * Math.exp(-0.012778 * timeMin) + 0.2989558 * Math.exp(-0.1932605 * timeMin)
    if (pct <= 0) return null
    return Math.round((vo2 / pct) * 10) / 10
  }

  function getEnrichedProfile(profile) {
    const enriched = { ...profile }
    if (!enriched.fc_max) {
      const estimated = estimateFcMax()
      if (estimated) enriched.fc_max = estimated
      enriched.fc_max_source = estimated ? 'estimado_strava' : null
    }
    if (!enriched.vo2_max) {
      const estimated = estimateVO2Max()
      if (estimated) enriched.vo2_max = estimated
      enriched.vo2_max_source = estimated ? 'estimado_strava' : null
    }
    return enriched
  }

  async function markMissedWorkouts() {
    if (!auth.user) return
    const today = new Date().toLocaleDateString('sv-SE')
    const missed = workouts.value.filter(w =>
      w.status === 'planned' && w.scheduled_date && w.scheduled_date < today
    )
    if (!missed.length) return
    const { error } = await supabase
      .from('workouts')
      .update({ status: 'missed' })
      .eq('user_id', auth.user.id)
      .in('id', missed.map(w => w.id))
    if (!error) {
      missed.forEach(w => (w.status = 'missed'))
    }
  }

  function calendarWeekNumber() {
    const startDate = auth.profile?.start_date
    if (!startDate) return null
    const start = new Date(startDate + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffDays = Math.floor((today - start) / 86400000)
    return Math.floor(diffDays / 7) + 1
  }

  async function syncCurrentWeek() {
    if (!auth.user || !auth.profile?.start_date) return
    const calWeek = calendarWeekNumber()
    if (calWeek === null) return
    const current = auth.profile?.current_week || 0
    if (current >= calWeek) return
    const hasWorkouts = workouts.value.some(w => w.week_number === calWeek)
    if (!hasWorkouts) return
    await auth.updateProfile({ current_week: calWeek })
  }

  return {
    workouts,
    loading,
    fetchWorkouts,
    createWorkout,
    completeWorkout,
    saveWorkoutPerformance,
    saveWorkoutFeedback,
    skipWorkout,
    deleteWorkout,
    getWeekWorkouts,
    getWeekStats,
    getRecentWorkouts,
    getTrends,
    getPreviousWeeks,
    saveWeekLog,
    estimateFcMax,
    estimateVO2Max,
    getEnrichedProfile,
    markMissedWorkouts,
    syncCurrentWeek,
  }
})
