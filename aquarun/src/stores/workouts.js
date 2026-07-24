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
      avgRunPace: runs.length > 0
        ? runs.filter(w => w.actual_pace).reduce((sum, w) => sum + w.actual_pace, 0) / runs.filter(w => w.actual_pace).length
        : 0,
      avgSwimPace: swims.length > 0
        ? swims.filter(w => w.actual_pace).reduce((sum, w) => sum + w.actual_pace, 0) / swims.filter(w => w.actual_pace).length
        : 0,
      painReports: completed
        .filter(w => w.feedback_pain > 0)
        .map(w => `dor ${w.feedback_pain}/10`),
    }
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
    saveWeekLog,
  }
})
