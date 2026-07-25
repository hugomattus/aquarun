<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-2xl font-medium text-white">Meu Treino</h1>
      <p class="text-neutral-500 mt-1">Seu plano de treino atual</p>
    </div>

    <div v-if="currentWeek === 0" class="bg-surface rounded p-12 border border-neutral-800 text-center">
      <Icon name="award" :size="48" class="mx-auto text-neutral-600 mb-4" />
      <h3 class="text-xl font-medium text-white mt-4">Nenhum plano ativo</h3>
      <p class="text-neutral-500 mt-2 mb-6">Crie seu plano de treino personalizado</p>
      <router-link
        v-if="hasOnboardingData"
        to="/generating-plan"
        class="inline-block px-6 py-2.5 bg-primary hover:bg-primary-dark rounded font-medium transition-colors text-sm"
      >
        Gerar Meu Plano
      </router-link>
      <router-link
        v-else
        to="/onboarding"
        class="inline-block px-6 py-2.5 bg-primary hover:bg-primary-dark rounded font-medium transition-colors text-sm"
      >
        Fazer Onboarding
      </router-link>
    </div>

    <template v-else>
      <div class="bg-surface rounded p-6 border border-neutral-800">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-medium text-white">Semana {{ currentWeek }}</h3>
            <p class="text-sm text-neutral-500">{{ weekProgress.completed }}/{{ weekProgress.total }} treinos concluídos</p>
          </div>
          <div class="text-right">
            <div class="text-2xl font-medium text-primary">{{ weekProgress.percentage }}%</div>
            <div class="text-xs text-neutral-500">progresso</div>
          </div>
        </div>
        <div class="w-full bg-dark rounded-full h-2">
          <div
            class="bg-primary h-2 rounded-full transition-all duration-500"
            :style="{ width: weekProgress.percentage + '%' }"
          />
        </div>
      </div>

      <div class="space-y-2">
        <router-link
          v-for="workout in weekWorkouts"
          :key="workout.id"
          :to="workout.status === 'planned' ? `/workout/${workout.id}` : '#'"
          class="flex items-center gap-4 p-4 rounded bg-surface border border-neutral-800 transition-colors"
          :class="workout.status === 'planned' ? 'hover:bg-surface-light cursor-pointer' : ''"
        >
          <div
            class="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
            :class="workout.status === 'completed' ? 'bg-green-500/10' : workout.type === 'swim' ? 'bg-neutral-800' : 'bg-primary/10'"
          >
            <Icon
              :name="workout.status === 'completed' ? 'check-circle' : workout.type === 'swim' ? 'droplet' : 'activity'"
              :size="20"
              :class="workout.status === 'completed' ? 'text-green-500' : workout.type === 'swim' ? 'text-neutral-400' : 'text-primary'"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium text-white">{{ workout.name }}</span>
              <span class="text-xs text-neutral-600">{{ dayShort(workout.scheduled_date) }}</span>
            </div>
            <div class="text-sm text-neutral-500">
              {{ workout.duration }}min
              <span v-if="workout.actual_distance"> · {{ formatDistance(workout.actual_distance) }}</span>
              <span v-if="workout.feedback_effort"> · {{ effortLabel(workout.feedback_effort) }}</span>
            </div>
            <div v-if="getWorkoutObjective(workout)" class="text-xs text-neutral-600 mt-1 line-clamp-1">
              {{ getWorkoutObjective(workout) }}
            </div>
          </div>
          <div class="flex-shrink-0">
            <span
              v-if="workout.status === 'completed'"
              class="text-xs text-green-500"
            >
              Concluído
            </span>
            <span
              v-else-if="workout.status === 'skipped'"
              class="text-xs text-neutral-500"
            >
              Pulado
            </span>
            <Icon v-else name="chevron-right" :size="18" class="text-neutral-600" />
          </div>
        </router-link>
      </div>

      <div v-if="weekProgress.allDone" class="bg-surface rounded p-6 border border-neutral-800">
        <div class="text-center">
          <Icon name="check-circle" :size="32" class="mx-auto text-green-500 mb-3" />
          <h3 class="font-medium text-white mb-1">Semana Concluída!</h3>
          <p class="text-sm text-neutral-500 mb-4">Todos os treinos desta semana foram concluídos</p>
          <button
            @click="generateNextWeek"
            :disabled="generating"
            class="px-6 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-50 rounded font-medium transition-colors text-sm"
          >
            {{ generating ? 'Gerando...' : 'Gerar Próxima Semana' }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useWorkoutStore } from '../stores/workouts'
import { formatDistance } from '../utils/formatters'
import Icon from '../components/Icon.vue'

const auth = useAuthStore()
const workoutStore = useWorkoutStore()
const generating = ref(false)

const currentWeek = computed(() => auth.profile?.current_week || 0)

const hasOnboardingData = computed(() => {
  const p = auth.profile
  return p?.run_days?.length > 0 || p?.swim_days?.length > 0
})

const weekWorkouts = computed(() => {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  const mondayStr = monday.toLocaleDateString('sv-SE')
  const sundayStr = sunday.toLocaleDateString('sv-SE')

  return workoutStore.workouts
    .filter(w => w.scheduled_date >= mondayStr && w.scheduled_date <= sundayStr)
    .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
})

const weekProgress = computed(() => {
  const total = weekWorkouts.value.length
  const completed = weekWorkouts.value.filter(w => w.status === 'completed').length
  return {
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    allDone: total > 0 && completed === total,
  }
})

function dayShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
}

const effortLabels = {
  very_easy: '😊 muito fácil',
  easy: '👍 fácil',
  moderate: '💪 normal',
  hard: '😤 difícil',
  very_hard: '🔥 muito difícil',
}

function effortLabel(effort) {
  return effortLabels[effort] || effort
}

function getWorkoutObjective(workout) {
  if (!workout.structure) return null
  const s = typeof workout.structure === 'string' ? (() => { try { return JSON.parse(workout.structure) } catch { return null } })() : workout.structure
  return s?.objective || null
}

async function generateNextWeek() {
  generating.value = true
  try {
    const weekStats = workoutStore.getWeekStats(currentWeek.value)

    const response = await fetch('/api/adaptive-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: auth.profile,
        previousWeek: {
          total_workouts: weekStats.total,
          completed_workouts: weekStats.completed,
          skipped_workouts: weekStats.skipped,
          total_run_distance: weekStats.runDistance,
          total_swim_distance: weekStats.swimDistance,
          total_run_time: weekStats.runTime,
          total_swim_time: weekStats.swimTime,
          weekly_volume: weekStats.weeklyVolume,
          weekly_load: weekStats.weeklyLoad,
          avg_effort: weekStats.avgEffort,
          avg_exhaustion: weekStats.avgEffort,
          avg_pain: weekStats.avgPain,
          avg_energy: weekStats.avgEnergy,
          avg_sleep: weekStats.avgSleep,
          avg_stress: weekStats.avgStress,
          avg_heartrate: weekStats.avgHeartrate,
          avg_run_pace: weekStats.avgRunPace,
          avg_swim_pace: weekStats.avgSwimPace,
          pain_report: weekStats.painReports.join('; ') || null,
        },
        weekNumber: currentWeek.value + 1,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error || 'Erro ao gerar plano')
    }

    const plan = await response.json()

    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7))

    const weekOffset = (nextWeekNumber - 1) * 7

    const dayNameToIndex = {
      domingo: 0, sunday: 0,
      segunda: 1, monday: 1,
      terça: 2, tuesday: 2,
      quarta: 3, wednesday: 3,
      quinta: 4, thursday: 4,
      sexta: 5, friday: 5,
      sábado: 6, saturday: 6,
    }

    const runDays = (auth.profile.run_days || []).map(d => dayNameToIndex[d]).filter(d => d !== undefined)
    const swimDays = (auth.profile.swim_days || []).map(d => dayNameToIndex[d]).filter(d => d !== undefined)

    const nextWeek = plan.week || []
    const nextWeekNumber = currentWeek.value + 1

    for (const workout of nextWeek) {
      const targetDayIdx = dayNameToIndex[workout.day.toLowerCase()]
      if (targetDayIdx === undefined) continue
      if (workout.type === 'rest') continue

      let daysUntil = (targetDayIdx - startOfWeek.getDay() + 7) % 7

      const scheduledDate = new Date(startOfWeek)
      scheduledDate.setDate(startOfWeek.getDate() + daysUntil + weekOffset)

      let workoutType = workout.type
      if (runDays.includes(targetDayIdx)) {
        workoutType = 'run'
      } else if (swimDays.includes(targetDayIdx)) {
        workoutType = 'swim'
      }

      await workoutStore.createWorkout({
        type: workoutType,
        name: workout.name,
        description: workout.description || '',
        scheduled_date: scheduledDate.toLocaleDateString('sv-SE'),
        duration: workout.duration,
        intervals: JSON.stringify(workout.intervals || []),
        structure: workout.structure || null,
        week_number: nextWeekNumber,
      })
    }

    await auth.updateProfile({ current_week: nextWeekNumber })

    await workoutStore.saveWeekLog(
      currentWeek.value,
      weekWorkouts.value[0]?.scheduled_date,
      weekWorkouts.value[weekWorkouts.value.length - 1]?.scheduled_date,
    )
  } catch (e) {
    console.error('Erro ao gerar próxima semana:', e)
  } finally {
    generating.value = false
  }
}

onMounted(async () => {
  await workoutStore.fetchWorkouts()
})
</script>
