<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-medium text-white">Dashboard</h1>
        <p class="text-neutral-500 mt-1">Visão geral do seu desempenho</p>
      </div>
      <div class="text-right text-sm text-neutral-500">
        {{ today }}
      </div>
    </div>

    <div v-if="weeklyPlan.length === 0 && !todayWorkout" class="bg-surface rounded p-8 border border-neutral-800 text-center">
      <Icon name="zap" :size="32" class="mx-auto text-primary mb-3" />
      <h3 class="font-medium text-white mb-1">Nenhum plano de treino</h3>
      <p class="text-sm text-neutral-500 mb-4">Gere seu plano personalizado para começar</p>
      <router-link
        to="/generating-plan"
        class="inline-block px-6 py-2.5 bg-primary hover:bg-primary-dark rounded font-medium transition-colors text-sm"
      >
        Gerar Plano
      </router-link>
    </div>

    <div v-if="todayWorkout && todayWorkout.status === 'planned'" class="bg-surface rounded p-6 border border-neutral-800">
      <div class="flex items-center gap-3 mb-4">
        <Icon
          :name="todayWorkout.type === 'swim' ? 'droplet' : 'activity'"
          :size="22"
          :class="todayWorkout.type === 'swim' ? 'text-neutral-400' : 'text-primary'"
        />
        <h3 class="font-medium text-white">Treino de Hoje</h3>
      </div>
      <div class="flex items-center gap-4 mb-4">
        <div>
          <div class="text-xl font-medium text-white">{{ todayWorkout.name }}</div>
          <div class="text-sm text-neutral-500">
            {{ todayWorkout.duration }}min
          </div>
        </div>
      </div>
      <div v-if="todayWorkout.description" class="text-sm text-neutral-400 mb-4">
        {{ todayWorkout.description }}
      </div>
      <div v-if="parsedIntervals(todayWorkout.intervals).length" class="space-y-2 mb-4">
        <div
          v-for="(interval, i) in parsedIntervals(todayWorkout.intervals)"
          :key="i"
          class="flex items-center gap-3 p-2 rounded bg-dark"
        >
          <div
            class="w-1.5 h-1.5 rounded-full flex-shrink-0"
            :class="interval.type === 'warmup' ? 'bg-yellow-500' : interval.type === 'cooldown' ? 'bg-blue-500' : interval.type === 'repetition' ? 'bg-green-500' : 'bg-primary'"
          />
          <div class="flex-1 min-w-0">
            <span class="text-sm text-white">{{ interval.description }}</span>
          </div>
          <div class="text-xs text-neutral-500 flex-shrink-0">
            {{ interval.duration }}min
          </div>
        </div>
      </div>
      <router-link
        :to="`/workout/${todayWorkout.id}`"
        class="block w-full py-2.5 bg-primary hover:bg-primary-dark rounded font-medium transition-colors text-sm text-center"
      >
        Concluir Treino
      </router-link>
    </div>

    <div v-if="todayWorkout && todayWorkout.status === 'completed'" class="bg-surface rounded p-6 border border-neutral-800">
      <div class="flex items-center gap-3 mb-2">
        <Icon name="check-circle" :size="22" class="text-green-500" />
        <h3 class="font-medium text-white">Treino de Hoje Concluído</h3>
      </div>
      <div class="text-sm text-neutral-500">
        {{ todayWorkout.name }} · {{ todayWorkout.actual_distance ? formatDistance(todayWorkout.actual_distance) : '' }}
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-surface rounded p-5 border border-neutral-800"
      >
        <div class="flex items-center justify-between">
          <Icon :name="stat.icon" :size="24" :class="stat.type === 'run' ? 'text-primary' : 'text-neutral-400'" />
          <span
            class="text-xs px-2 py-1 rounded-full"
            :class="stat.type === 'run' ? 'bg-primary/10 text-primary' : 'bg-neutral-800 text-neutral-400'"
          >
            {{ stat.type === 'run' ? 'Corrida' : 'Natação' }}
          </span>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-medium text-white">{{ stat.value }}</div>
          <div class="text-sm text-neutral-500">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <div class="bg-surface rounded p-6 border border-neutral-800">
      <div class="flex items-center gap-3 mb-4">
        <Icon name="calendar" :size="20" class="text-primary" />
        <h3 class="font-medium text-white">Plano da Semana</h3>
      </div>
      <div v-if="weeklyPlan.length === 0" class="text-center py-8 text-neutral-500">
        <Icon name="calendar" :size="32" class="mx-auto mb-2 opacity-50" />
        <p class="mt-2">Nenhum treino planejado</p>
        <p class="text-sm mt-1">Gere um plano com o Coach IA</p>
      </div>
      <div v-else class="space-y-2">
        <router-link
          v-for="(workout, i) in weeklyPlan"
          :key="workout.id"
          :to="workout.status === 'planned' ? `/workout/${workout.id}` : '#'"
          class="flex items-center gap-4 p-3 rounded cursor-pointer transition-colors"
          :class="[
            isToday(workout.scheduled_date) ? 'bg-primary/10 border border-primary/20' : 'bg-dark',
            workout.status === 'planned' ? 'hover:bg-dark/80' : '',
          ]"
        >
          <div class="text-sm font-medium w-8 flex-shrink-0" :class="isToday(workout.scheduled_date) ? 'text-primary' : 'text-neutral-500'">
            {{ dayShort(workout.scheduled_date) }}
          </div>
          <Icon
            :name="workout.status === 'completed' ? 'check-circle' : workout.type === 'swim' ? 'droplet' : 'activity'"
            :size="18"
            :class="workout.status === 'completed' ? 'text-green-500' : workout.type === 'swim' ? 'text-neutral-400' : 'text-primary'"
          />
          <div class="flex-1 min-w-0">
            <div class="text-sm text-white truncate">{{ workout.name }}</div>
            <div class="text-xs text-neutral-500">{{ workout.duration }}min</div>
          </div>
          <div v-if="workout.status === 'completed' && workout.feedback_exhaustion" class="text-xs text-neutral-500">
            cansaço {{ workout.feedback_exhaustion }}/10
          </div>
          <div v-else class="text-xs text-neutral-600">
            {{ formatDate(workout.scheduled_date) }}
          </div>
        </router-link>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-surface rounded p-6 border border-neutral-800">
        <h3 class="font-medium text-white mb-4">Atividades Recentes</h3>
        <div v-if="recentActivities.length === 0" class="text-center py-8 text-neutral-500">
          <Icon name="bar-chart-2" :size="32" class="mx-auto mb-2 opacity-50" />
          <p class="mt-2">Nenhuma atividade ainda</p>
          <p class="text-sm mt-1">Conecte o Strava para importar seus treinos</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="activity in recentActivities"
            :key="activity.id"
            class="flex items-center gap-4 p-3 rounded bg-dark"
          >
            <Icon :name="activity.type === 'swim' ? 'droplet' : 'activity'" :size="20" :class="activity.type === 'swim' ? 'text-neutral-400' : 'text-primary'" />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-white truncate">{{ activity.name }}</div>
              <div class="text-sm text-neutral-500">
                {{ formatDistance(activity.distance) }} · {{ formatDuration(activity.moving_time) }}
              </div>
            </div>
            <div class="text-sm text-neutral-600">
              {{ formatDate(activity.start_date) }}
            </div>
          </div>
        </div>
      </div>

      <div class="bg-surface rounded p-6 border border-neutral-800">
        <h3 class="font-medium text-white mb-4">Próximos Treinos</h3>
        <div v-if="upcomingWorkouts.length === 0" class="text-center py-8 text-neutral-500">
          <Icon name="award" :size="32" class="mx-auto mb-2 opacity-50" />
          <p class="mt-2">Nenhum treino planejado</p>
          <p class="text-sm mt-1">Gere um plano com o Coach IA</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="workout in upcomingWorkouts"
            :key="workout.id"
            class="flex items-center gap-4 p-3 rounded bg-dark"
          >
            <Icon :name="workout.type === 'swim' ? 'droplet' : 'activity'" :size="20" :class="workout.type === 'swim' ? 'text-neutral-400' : 'text-primary'" />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-white truncate">{{ workout.name }}</div>
              <div class="text-sm text-neutral-500">
                {{ workout.duration }}min · {{ formatDate(workout.scheduled_date) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStravaStore } from '../stores/strava'
import { useWorkoutStore } from '../stores/workouts'
import { formatDistance, formatDuration, formatDate } from '../utils/formatters'
import Icon from '../components/Icon.vue'

const strava = useStravaStore()
const workoutStore = useWorkoutStore()

const today = new Date().toLocaleDateString('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const recentActivities = computed(() => strava.activities.slice(0, 5))

const upcomingWorkouts = computed(() =>
  workoutStore.workouts
    .filter(w => w.status === 'planned')
    .slice(0, 5)
)

const todayWorkout = computed(() => {
  const todayStr = new Date().toISOString().split('T')[0]
  return workoutStore.workouts.find(w => w.scheduled_date === todayStr && w.status === 'planned') || null
})

const weeklyPlan = computed(() => {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const mondayStr = monday.toISOString().split('T')[0]
  const sundayStr = sunday.toISOString().split('T')[0]

  return workoutStore.workouts
    .filter(w => w.scheduled_date >= mondayStr && w.scheduled_date <= sundayStr)
    .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
})

function parsedIntervals(intervals) {
  if (!intervals) return []
  if (typeof intervals === 'string') {
    try { return JSON.parse(intervals) } catch { return [] }
  }
  return Array.isArray(intervals) ? intervals : []
}

function isToday(dateStr) {
  return dateStr === new Date().toISOString().split('T')[0]
}

function dayShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
}

const weekRange = computed(() => {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { monday, sunday }
})

function isThisWeek(dateStr) {
  const d = new Date(dateStr)
  return d >= weekRange.value.monday && d <= weekRange.value.sunday
}

const stats = computed(() => {
  const weekRuns = strava.runActivities.filter(a => isThisWeek(a.start_date))
  const weekSwims = strava.swimActivities.filter(a => isThisWeek(a.start_date))

  const totalRunDistance = weekRuns.reduce((sum, a) => sum + (a.distance || 0), 0)
  const totalSwimDistance = weekSwims.reduce((sum, a) => sum + (a.distance || 0), 0)
  const totalRunTime = weekRuns.reduce((sum, a) => sum + (a.moving_time || 0), 0)
  const totalSwimTime = weekSwims.reduce((sum, a) => sum + (a.moving_time || 0), 0)

  return [
    { icon: 'activity', label: 'Corrida Semana', value: formatDistance(totalRunDistance), type: 'run' },
    { icon: 'droplet', label: 'Natação Semana', value: formatDistance(totalSwimDistance), type: 'swim' },
    { icon: 'clock', label: 'Tempo Correndo', value: formatDuration(totalRunTime), type: 'run' },
    { icon: 'clock', label: 'Tempo Nadando', value: formatDuration(totalSwimTime), type: 'swim' },
  ]
})

onMounted(async () => {
  await workoutStore.fetchWorkouts()
  await strava.checkConnection()
  if (strava.connected) {
    await strava.fetchActivities()
  }
})
</script>
