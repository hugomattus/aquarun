<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-medium text-white">Dashboard</h1>
        <p class="text-neutral-500 mt-1">Visão geral do seu desempenho</p>
      </div>
      <div class="text-right text-sm text-neutral-500">
        {{ today }}
      </div>
    </div>

    <div v-if="bannerWorkout" class="bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg p-5 border border-primary/20">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <Icon
            :name="bannerWorkout.workout.type === 'swim' ? 'droplet' : 'activity'"
            :size="18"
            class="text-primary"
          />
          <h3 class="text-sm font-medium text-primary uppercase tracking-wide">{{ bannerWorkout.label }}</h3>
        </div>
        <span class="text-xs text-neutral-500">{{ formatDateFull(bannerWorkout.workout.scheduled_date) }}</span>
      </div>
      <div class="mb-3">
        <div class="text-lg font-medium text-white">{{ bannerWorkout.workout.name }}</div>
        <div class="text-sm text-neutral-400">{{ bannerWorkout.workout.duration }}min</div>
      </div>
      <div v-if="bannerWorkout.workout.description" class="text-sm text-neutral-400 mb-4">
        {{ bannerWorkout.workout.description }}
      </div>

      <div v-if="showDetails && bannerWorkout.workout.structure" class="mb-4 space-y-3">
        <div v-if="bannerWorkout.workout.structure.objective" class="bg-dark/50 rounded p-3">
          <div class="flex items-center gap-2 mb-1">
            <Icon name="target" :size="14" class="text-primary" />
            <span class="text-xs font-medium text-white">Objetivo</span>
          </div>
          <p class="text-sm text-neutral-400">{{ bannerWorkout.workout.structure.objective }}</p>
        </div>
        <div v-if="bannerWorkout.workout.structure.warmup" class="bg-dark/50 rounded p-3">
          <div class="flex items-center gap-2 mb-1">
            <Icon name="thermometer" :size="14" class="text-yellow-500" />
            <span class="text-xs font-medium text-white">Aquecimento</span>
          </div>
          <p class="text-sm text-neutral-400 whitespace-pre-line">{{ bannerWorkout.workout.structure.warmup }}</p>
        </div>
        <div v-if="bannerWorkout.workout.structure.main_part" class="bg-dark/50 rounded p-3">
          <div class="flex items-center gap-2 mb-1">
            <Icon name="star" :size="14" class="text-primary" />
            <span class="text-xs font-medium text-white">Parte Principal</span>
          </div>
          <p class="text-sm text-neutral-400 whitespace-pre-line">{{ bannerWorkout.workout.structure.main_part }}</p>
        </div>
        <div v-if="bannerWorkout.workout.structure.cooldown" class="bg-dark/50 rounded p-3">
          <div class="flex items-center gap-2 mb-1">
            <Icon name="sun" :size="14" class="text-blue-500" />
            <span class="text-xs font-medium text-white">Desaquecimento</span>
          </div>
          <p class="text-sm text-neutral-400 whitespace-pre-line">{{ bannerWorkout.workout.structure.cooldown }}</p>
        </div>
        <div v-if="bannerWorkout.workout.structure.drills && bannerWorkout.workout.structure.drills.length" class="bg-dark/50 rounded p-3">
          <div class="flex items-center gap-2 mb-1">
            <Icon name="book-open" :size="14" class="text-green-400" />
            <span class="text-xs font-medium text-white">Educativos</span>
          </div>
          <ul class="space-y-1">
            <li v-for="(drill, i) in bannerWorkout.workout.structure.drills" :key="i" class="text-sm text-neutral-400 flex items-start gap-2">
              <span class="text-neutral-600">•</span>
              <span>{{ drill }}</span>
            </li>
          </ul>
        </div>
        <div v-if="bannerWorkout.workout.structure.attention_points && bannerWorkout.workout.structure.attention_points.length" class="bg-dark/50 rounded p-3">
          <div class="flex items-center gap-2 mb-1">
            <Icon name="eye" :size="14" class="text-purple-400" />
            <span class="text-xs font-medium text-white">Pontos de Atenção</span>
          </div>
          <ul class="space-y-1">
            <li v-for="(point, i) in bannerWorkout.workout.structure.attention_points" :key="i" class="text-sm text-neutral-400 flex items-start gap-2">
              <span class="text-neutral-600">•</span>
              <span>{{ point }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="flex gap-3">
        <button
          @click="showDetails = !showDetails"
          class="flex-1 py-2.5 bg-dark/50 hover:bg-dark/70 rounded text-sm font-medium transition-colors text-center text-neutral-300 border border-primary/10"
        >
          {{ showDetails ? 'Fechar' : 'Ver Detalhes' }}
        </button>
        <router-link
          :to="`/workout/${bannerWorkout.workout.id}`"
          class="flex-1 py-2.5 bg-primary hover:bg-primary-dark rounded text-sm font-medium transition-colors text-center"
        >
          Concluir Treino
        </router-link>
      </div>
    </div>

    <div v-if="nextWorkout" class="bg-surface rounded-lg p-5 border border-neutral-800">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <Icon name="arrow-right" :size="16" class="text-neutral-400" />
          <span class="text-xs font-medium text-neutral-400 uppercase tracking-wide">Próximo Treino</span>
        </div>
        <span class="text-xs text-neutral-500">{{ formatShortDate(nextWorkout.scheduled_date) }}</span>
      </div>
      <div class="flex items-center gap-4 mb-3">
        <div class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" :class="nextWorkout.type === 'swim' ? 'bg-neutral-800' : 'bg-primary/10'">
          <Icon :name="nextWorkout.type === 'swim' ? 'droplet' : 'activity'" :size="24" :class="nextWorkout.type === 'swim' ? 'text-neutral-400' : 'text-primary'" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-lg font-medium text-white">{{ nextWorkout.name }}</div>
          <div class="text-sm text-neutral-400">{{ nextWorkout.duration }}min · {{ formatDayName(nextWorkout.scheduled_date) }}</div>
        </div>
      </div>

      <div v-if="showNextDetails && nextWorkout.structure" class="mb-4 space-y-3">
        <div v-if="nextWorkout.structure.objective" class="bg-dark rounded p-3">
          <div class="flex items-center gap-2 mb-1">
            <Icon name="target" :size="14" class="text-primary" />
            <span class="text-xs font-medium text-white">Objetivo</span>
          </div>
          <p class="text-sm text-neutral-400">{{ nextWorkout.structure.objective }}</p>
        </div>
        <div v-if="nextWorkout.structure.warmup" class="bg-dark rounded p-3">
          <div class="flex items-center gap-2 mb-1">
            <Icon name="thermometer" :size="14" class="text-yellow-500" />
            <span class="text-xs font-medium text-white">Aquecimento</span>
          </div>
          <p class="text-sm text-neutral-400 whitespace-pre-line">{{ nextWorkout.structure.warmup }}</p>
        </div>
        <div v-if="nextWorkout.structure.main_part" class="bg-dark rounded p-3">
          <div class="flex items-center gap-2 mb-1">
            <Icon name="star" :size="14" class="text-primary" />
            <span class="text-xs font-medium text-white">Parte Principal</span>
          </div>
          <p class="text-sm text-neutral-400 whitespace-pre-line">{{ nextWorkout.structure.main_part }}</p>
        </div>
        <div v-if="nextWorkout.structure.cooldown" class="bg-dark rounded p-3">
          <div class="flex items-center gap-2 mb-1">
            <Icon name="sun" :size="14" class="text-blue-500" />
            <span class="text-xs font-medium text-white">Desaquecimento</span>
          </div>
          <p class="text-sm text-neutral-400 whitespace-pre-line">{{ nextWorkout.structure.cooldown }}</p>
        </div>
        <div v-if="nextWorkout.structure.drills && nextWorkout.structure.drills.length" class="bg-dark rounded p-3">
          <div class="flex items-center gap-2 mb-1">
            <Icon name="book-open" :size="14" class="text-green-400" />
            <span class="text-xs font-medium text-white">Educativos</span>
          </div>
          <ul class="space-y-1">
            <li v-for="(drill, i) in nextWorkout.structure.drills" :key="i" class="text-sm text-neutral-400 flex items-start gap-2">
              <span class="text-neutral-600">•</span>
              <span>{{ drill }}</span>
            </li>
          </ul>
        </div>
        <div v-if="nextWorkout.structure.attention_points && nextWorkout.structure.attention_points.length" class="bg-dark rounded p-3">
          <div class="flex items-center gap-2 mb-1">
            <Icon name="eye" :size="14" class="text-purple-400" />
            <span class="text-xs font-medium text-white">Pontos de Atenção</span>
          </div>
          <ul class="space-y-1">
            <li v-for="(point, i) in nextWorkout.structure.attention_points" :key="i" class="text-sm text-neutral-400 flex items-start gap-2">
              <span class="text-neutral-600">•</span>
              <span>{{ point }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="flex gap-3">
        <button
          @click="showNextDetails = !showNextDetails"
          class="w-full py-2.5 bg-dark hover:bg-dark/80 rounded text-sm font-medium transition-colors text-center text-neutral-300 border border-neutral-800"
        >
          {{ showNextDetails ? 'Fechar' : 'Ver Detalhes' }}
        </button>
      </div>
    </div>

    <div v-if="todayWorkout && todayWorkout.status === 'completed' && !bannerWorkout" class="bg-surface rounded p-6 border border-neutral-800">
      <div class="flex items-center gap-3 mb-2">
        <Icon name="check-circle" :size="22" class="text-green-500" />
        <h3 class="font-medium text-white">Treino de Hoje Concluído</h3>
      </div>
      <div class="text-sm text-neutral-500">
        {{ todayWorkout.name }} · {{ todayWorkout.actual_distance ? formatDistance(todayWorkout.actual_distance) : '' }}
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-surface rounded p-4 border border-neutral-800"
      >
        <div class="flex items-center justify-between mb-2">
          <Icon :name="stat.icon" :size="18" :class="stat.type === 'run' ? 'text-primary' : 'text-neutral-400'" />
        </div>
        <div class="text-xl font-medium text-white">{{ stat.value }}</div>
        <div class="text-xs text-neutral-500">{{ stat.label }}</div>
      </div>
    </div>

    <div class="bg-surface rounded p-5 border border-neutral-800">
      <div class="flex items-center gap-2 mb-4">
        <Icon name="calendar" :size="18" class="text-primary" />
        <h3 class="font-medium text-white">Plano da Semana</h3>
      </div>
      <div v-if="weeklyPlan.length === 0" class="text-center py-6 text-neutral-500">
        <Icon name="calendar" :size="28" class="mx-auto mb-2 opacity-50" />
        <p>Nenhum treino planejado</p>
      </div>
      <div v-else class="space-y-2">
        <router-link
          v-for="(workout, i) in weeklyPlan"
          :key="workout.id"
          :to="workout.status === 'planned' ? `/workout/${workout.id}` : '#'"
          class="flex items-center gap-3 p-3 rounded cursor-pointer transition-colors"
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
            :size="16"
            :class="workout.status === 'completed' ? 'text-green-500' : workout.type === 'swim' ? 'text-neutral-400' : 'text-primary'"
          />
          <div class="flex-1 min-w-0">
            <div class="text-sm text-white truncate">{{ workout.name }}</div>
          </div>
          <div v-if="workout.status === 'completed'" class="text-xs text-green-500">OK</div>
          <div v-else class="text-xs text-neutral-600">{{ dayShort(workout.scheduled_date) }}</div>
        </router-link>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div v-if="runChartData.labels.length > 0" class="bg-surface rounded p-4 border border-neutral-800">
        <div class="flex items-center gap-2 mb-1">
          <Icon name="activity" :size="16" class="text-primary" />
          <h3 class="text-sm font-medium text-white">Análise Corrida</h3>
        </div>
        <p class="text-xs text-neutral-500 mb-3">Esta semana · {{ runChartData.labels.length }} corridas</p>
        <div class="grid grid-cols-3 gap-2 mb-3">
          <div class="bg-dark rounded p-2 text-center">
            <div class="text-sm font-medium text-white">{{ runSummary.totalDistance }}</div>
            <div class="text-[10px] text-neutral-500">Distância</div>
          </div>
          <div class="bg-dark rounded p-2 text-center">
            <div class="text-sm font-medium text-white">{{ runSummary.avgPace }}</div>
            <div class="text-[10px] text-neutral-500">Ritmo Médio</div>
          </div>
          <div class="bg-dark rounded p-2 text-center">
            <div class="text-sm font-medium text-white">{{ runSummary.totalRuns }}</div>
            <div class="text-[10px] text-neutral-500">Corridas</div>
          </div>
        </div>
        <div class="space-y-3">
          <div>
            <div class="text-[10px] text-neutral-500 mb-1">Distância (km)</div>
            <div class="h-20">
              <Line :data="runDistanceChartData" :options="chartOptions('km')" />
            </div>
          </div>
          <div>
            <div class="text-[10px] text-neutral-500 mb-1">Ritmo (min/km)</div>
            <div class="h-20">
              <Line :data="runPaceChartData" :options="chartOptions('min/km', true)" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="swimChartData.labels.length > 0" class="bg-surface rounded p-4 border border-neutral-800">
        <div class="flex items-center gap-2 mb-1">
          <Icon name="droplet" :size="16" class="text-neutral-400" />
          <h3 class="text-sm font-medium text-white">Análise Natação</h3>
        </div>
        <p class="text-xs text-neutral-500 mb-3">Esta semana · {{ swimChartData.labels.length }} piscinas</p>
        <div class="grid grid-cols-3 gap-2 mb-3">
          <div class="bg-dark rounded p-2 text-center">
            <div class="text-sm font-medium text-white">{{ swimSummary.totalDistance }}</div>
            <div class="text-[10px] text-neutral-500">Distância</div>
          </div>
          <div class="bg-dark rounded p-2 text-center">
            <div class="text-sm font-medium text-white">{{ swimSummary.avgPace }}</div>
            <div class="text-[10px] text-neutral-500">Ritmo Médio</div>
          </div>
          <div class="bg-dark rounded p-2 text-center">
            <div class="text-sm font-medium text-white">{{ swimSummary.totalSwims }}</div>
            <div class="text-[10px] text-neutral-500">Natações</div>
          </div>
        </div>
        <div class="space-y-3">
          <div>
            <div class="text-[10px] text-neutral-500 mb-1">Distância (m)</div>
            <div class="h-20">
              <Line :data="swimDistanceChartData" :options="chartOptions('m')" />
            </div>
          </div>
          <div>
            <div class="text-[10px] text-neutral-500 mb-1">Ritmo (min/100m)</div>
            <div class="h-20">
              <Line :data="swimPaceChartData" :options="chartOptions('min/100m', true)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="recentActivities.length > 0" class="bg-surface rounded p-5 border border-neutral-800">
      <div class="flex items-center gap-2 mb-4">
        <Icon name="clock" :size="18" class="text-neutral-400" />
        <h3 class="font-medium text-white">Atividades Recentes</h3>
      </div>
      <div class="space-y-2">
        <div
          v-for="activity in recentActivities"
          :key="activity.id"
          class="flex items-center gap-3 p-3 rounded bg-dark"
        >
          <Icon :name="activity.type === 'swim' ? 'droplet' : 'activity'" :size="18" :class="activity.type === 'swim' ? 'text-neutral-400' : 'text-primary'" />
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-white truncate">{{ activity.name }}</div>
            <div class="text-xs text-neutral-500">
              {{ formatDistance(activity.distance) }} · {{ formatDuration(activity.moving_time) }}
            </div>
          </div>
          <div class="text-xs text-neutral-600">{{ formatDate(activity.start_date) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStravaStore } from '../stores/strava'
import { useWorkoutStore } from '../stores/workouts'
import { formatDistance, formatDuration, formatDate, formatDateFull } from '../utils/formatters'
import Icon from '../components/Icon.vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const strava = useStravaStore()
const workoutStore = useWorkoutStore()

const showDetails = ref(false)
const showNextDetails = ref(false)

const today = new Date().toLocaleDateString('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const todayStr = new Date().toISOString().split('T')[0]

const todayWorkout = computed(() => {
  return workoutStore.workouts.find(w => w.scheduled_date === todayStr) || null
})

const todayPlanned = computed(() => {
  return todayWorkout.value?.status === 'planned' ? todayWorkout.value : null
})

const tomorrowStr = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
})

const bannerWorkout = computed(() => {
  if (todayPlanned.value) return { workout: todayPlanned.value, label: 'Treino de Hoje' }
  const tomorrow = workoutStore.workouts.find(w => w.scheduled_date === tomorrowStr.value && w.status === 'planned')
  if (tomorrow) return { workout: tomorrow, label: 'Seu treino de amanhã' }
  return null
})

const nextWorkout = computed(() => {
  return workoutStore.workouts
    .filter(w => w.scheduled_date >= todayStr && w.status === 'planned')
    .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
    .find(w => w.id !== bannerWorkout.value?.workout?.id) || null
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

const recentActivities = computed(() => strava.activities.slice(0, 5))

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
  const weekSwims = strava.swimActivities.filter(a => isThisWeek(a.start_date) && a.moving_time >= 600)

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

const runChartData = computed(() => {
  const runs = strava.runActivities
    .filter(a => a.distance > 0 && isThisWeek(a.start_date))
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))

  return {
    labels: runs.map(a => {
      const d = new Date(a.start_date)
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }),
    distances: runs.map(a => +(a.distance / 1000).toFixed(2)),
    paces: runs.map(a => {
      if (!a.moving_time || !a.distance) return 0
      const paceSeconds = a.moving_time / (a.distance / 1000)
      return +(paceSeconds / 60).toFixed(2)
    }),
  }
})

const runSummary = computed(() => {
  const distances = runChartData.value.distances
  const paces = runChartData.value.paces.filter(p => p > 0)
  const totalDist = distances.reduce((s, d) => s + d, 0)
  const avgPaceVal = paces.length > 0 ? paces.reduce((s, p) => s + p, 0) / paces.length : 0
  const paceMin = Math.floor(avgPaceVal)
  const paceSec = Math.round((avgPaceVal - paceMin) * 60)
  return {
    totalDistance: totalDist.toFixed(1) + ' km',
    avgPace: paceMin + ':' + paceSec.toString().padStart(2, '0') + '/km',
    totalRuns: distances.length,
  }
})

const runDistanceChartData = computed(() => ({
  labels: runChartData.value.labels,
  datasets: [{
    data: runChartData.value.distances,
    borderColor: '#F94101',
    backgroundColor: 'rgba(249, 65, 1, 0.1)',
    borderWidth: 2,
    pointRadius: 3,
    pointBackgroundColor: '#F94101',
    tension: 0.3,
    fill: true,
  }],
}))

const runPaceChartData = computed(() => ({
  labels: runChartData.value.labels,
  datasets: [{
    data: runChartData.value.paces,
    borderColor: '#F97316',
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderWidth: 2,
    pointRadius: 3,
    pointBackgroundColor: '#F97316',
    tension: 0.3,
    fill: true,
  }],
}))

const swimChartData = computed(() => {
  const swims = strava.swimActivities
    .filter(a => a.distance > 0 && isThisWeek(a.start_date) && a.moving_time >= 600)
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))

  return {
    labels: swims.map(a => {
      const d = new Date(a.start_date)
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }),
    distances: swims.map(a => +a.distance.toFixed(0)),
    paces: swims.map(a => {
      if (!a.moving_time || !a.distance) return 0
      const paceSeconds = a.moving_time / (a.distance / 100)
      return +(paceSeconds / 60).toFixed(2)
    }),
  }
})

const swimSummary = computed(() => {
  const distances = swimChartData.value.distances
  const paces = swimChartData.value.paces.filter(p => p > 0)
  const totalDist = distances.reduce((s, d) => s + d, 0)
  const avgPaceVal = paces.length > 0 ? paces.reduce((s, p) => s + p, 0) / paces.length : 0
  const paceMin = Math.floor(avgPaceVal)
  const paceSec = Math.round((avgPaceVal - paceMin) * 60)
  return {
    totalDistance: totalDist + ' m',
    avgPace: paceMin + ':' + paceSec.toString().padStart(2, '0') + '/100m',
    totalSwims: distances.length,
  }
})

const swimDistanceChartData = computed(() => ({
  labels: swimChartData.value.labels,
  datasets: [{
    data: swimChartData.value.distances,
    borderColor: '#9CA3AF',
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    borderWidth: 2,
    pointRadius: 3,
    pointBackgroundColor: '#9CA3AF',
    tension: 0.3,
    fill: true,
  }],
}))

const swimPaceChartData = computed(() => ({
  labels: swimChartData.value.labels,
  datasets: [{
    data: swimChartData.value.paces,
    borderColor: '#6B7280',
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    borderWidth: 2,
    pointRadius: 3,
    pointBackgroundColor: '#6B7280',
    tension: 0.3,
    fill: true,
  }],
}))

function chartOptions(unit, invertY = false) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1A1A1C',
        titleColor: '#fff',
        bodyColor: '#9CA3AF',
        borderColor: '#262628',
        borderWidth: 1,
        padding: 8,
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed.y
            if (unit === 'min/km' || unit === 'min/100m') {
              const min = Math.floor(val)
              const sec = Math.round((val - min) * 60)
              return min + ':' + sec.toString().padStart(2, '0') + ' ' + unit
            }
            return val + ' ' + unit
          },
        },
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
        reverse: invertY,
      },
    },
    elements: {
      line: { borderCapStyle: 'round' },
    },
  }
}

function isToday(dateStr) {
  return dateStr === todayStr
}

function dayShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
}

function formatDayName(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'long' })
}

onMounted(async () => {
  await workoutStore.fetchWorkouts()
  await strava.checkConnection()
  if (strava.connected) {
    await strava.fetchActivities()
  }
})
</script>
