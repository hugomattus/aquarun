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
        actual_calories: performance.calories,
      })
      .eq('id', workoutId)

    if (!error) {
      const idx = workouts.value.findIndex(w => w.id === workoutId)
      if (idx !== -1) {
        workouts.value[idx].actual_distance = performance.distance
        workouts.value[idx].actual_duration = performance.duration
        workouts.value[idx].actual_pace = performance.pace
        workouts.value[idx].actual_heartrate = performance.heartrate
        workouts.value[idx].actual_calories = performance.calories
      }
    }
  }

  async function saveWorkoutFeedback(workoutId, feedback) {
    const { error } = await supabase
      .from('workouts')
      .update({
        feedback_exhaustion: feedback.exhaustion,
        feedback_pain: feedback.pain,
        feedback_notes: feedback.notes,
      })
      .eq('id', workoutId)

    if (!error) {
      const idx = workouts.value.findIndex(w => w.id === workoutId)
      if (idx !== -1) {
        workouts.value[idx].feedback_exhaustion = feedback.exhaustion
        workouts.value[idx].feedback_pain = feedback.pain
        workouts.value[idx].feedback_notes = feedback.notes
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

    return {
      total: week.length,
      completed: completed.length,
      skipped: week.filter(w => w.status === 'skipped').length,
      runDistance: runs.reduce((sum, w) => sum + (w.actual_distance || 0), 0),
      swimDistance: swims.reduce((sum, w) => sum + (w.actual_distance || 0), 0),
      runTime: runs.reduce((sum, w) => sum + (w.actual_duration || 0), 0),
      swimTime: swims.reduce((sum, w) => sum + (w.actual_duration || 0), 0),
      avgExhaustion: completed.length > 0
        ? completed.reduce((sum, w) => sum + (w.feedback_exhaustion || 0), 0) / completed.length
        : 0,
      avgHeartrate: runs.length > 0
        ? runs.reduce((sum, w) => sum + (w.actual_heartrate || 0), 0) / runs.length
        : 0,
      painReports: completed
        .filter(w => w.feedback_pain)
        .map(w => w.feedback_pain),
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
      avg_exhaustion: stats.avgExhaustion,
      total_run_distance: stats.runDistance,
      total_swim_distance: stats.swimDistance,
      total_run_time: stats.runTime,
      total_swim_time: stats.swimTime,
      total_workouts: stats.total,
      completed_workouts: stats.completed,
      skipped_workouts: stats.skipped,
      avg_run_pace: null,
      avg_swim_pace: null,
      avg_heartrate: stats.avgHeartrate,
      pain_report: stats.painReports.join('; ') || null,
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
