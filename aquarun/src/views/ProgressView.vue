<template>
  <div class="space-y-8 max-w-6xl">
    <div>
      <h1 class="text-2xl font-medium text-white">Evolução</h1>
      <p class="text-neutral-500 mt-1">Seu desempenho semana a semana</p>
    </div>

    <div v-if="workoutStore.workouts.length === 0" class="bg-surface rounded p-12 border border-neutral-800 text-center">
      <Icon name="trending-up" :size="48" class="mx-auto text-neutral-600 mb-4" />
      <h3 class="text-lg font-medium text-white mb-1">Sem dados ainda</h3>
      <p class="text-sm text-neutral-500">Complete seus primeiros treinos para ver sua evolução aqui.</p>
    </div>

    <template v-else>
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div class="bg-surface rounded p-4 border border-neutral-800">
          <div class="text-xs text-neutral-500 mb-1">Treinos concluídos</div>
          <div class="text-2xl font-medium text-white">{{ totals.completed }}</div>
        </div>
        <div class="bg-surface rounded p-4 border border-neutral-800">
          <div class="text-xs text-neutral-500 mb-1">Distância total</div>
          <div class="text-2xl font-medium text-white">{{ formatDistance(totals.runDistance + totals.swimDistance) }}</div>
        </div>
        <div class="bg-surface rounded p-4 border border-neutral-800">
          <div class="text-xs text-neutral-500 mb-1">Horas treinadas</div>
          <div class="text-2xl font-medium text-white">{{ formatDuration(totals.duration) }}</div>
        </div>
        <div class="bg-surface rounded p-4 border border-neutral-800">
          <div class="text-xs text-neutral-500 mb-1">Carga total</div>
          <div class="text-2xl font-medium text-white">{{ Math.round(totals.load) }}</div>
        </div>
      </div>

      <div class="bg-surface rounded p-6 border border-neutral-800">
        <h3 class="font-medium text-white mb-1">Distância por semana</h3>
        <p class="text-xs text-neutral-500 mb-4">Corrida (km) + Natação (m)</p>
        <Bar :data="volumeChartData" :options="volumeOptions" />
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div class="bg-surface rounded p-6 border border-neutral-800">
          <h3 class="font-medium text-white mb-1">Carga de treino</h3>
          <p class="text-xs text-neutral-500 mb-4">Soma do load_score por semana</p>
          <Line :data="loadChartData" :options="lineOptions('')" />
        </div>

        <div class="bg-surface rounded p-6 border border-neutral-800">
          <h3 class="font-medium text-white mb-1">Ritmo médio (corrida)</h3>
          <p class="text-xs text-neutral-500 mb-4">min/km por semana</p>
          <Line :data="paceChartData" :options="lineOptions('min/km')" />
        </div>

        <div class="bg-surface rounded p-6 border border-neutral-800">
          <h3 class="font-medium text-white mb-1">Prontidão (feedback)</h3>
          <p class="text-xs text-neutral-500 mb-4">Energia, sono e stress médios por semana (0–10)</p>
          <Line :data="readinessChartData" :options="lineOptions('pontos')" />
        </div>

        <div class="bg-surface rounded p-6 border border-neutral-800">
          <h3 class="font-medium text-white mb-1">VO₂max estimado</h3>
          <p class="text-xs text-neutral-500 mb-4">Últimos valores registrados</p>
          <Line :data="vo2ChartData" :options="lineOptions('ml/kg/min')" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { useWorkoutStore } from '../stores/workouts'
import { formatDistance, formatDuration } from '../utils/formatters'
import Icon from '../components/Icon.vue'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend
)

const workoutStore = useWorkoutStore()

const weekSeries = computed(() => {
  const map = new Map()
  for (const w of workoutStore.workouts) {
    if (w.status !== 'completed') continue
    const key = w.week_number
    if (!map.has(key)) {
      map.set(key, {
        week: key,
        firstDate: w.scheduled_date,
        runDistance: 0,
        swimDistance: 0,
        duration: 0,
        load: 0,
        hr: 0,
        paces: [],
        energy: [],
        sleep: [],
        stress: [],
        vo2max: [],
        completed: 0,
      })
    }
    const serie = map.get(key)
    if (w.type === 'run') serie.runDistance += (w.actual_distance || 0)
    else serie.swimDistance += (w.actual_distance || 0)
    serie.duration += (w.actual_duration || 0)
    serie.load += (w.load_score || 0)
    if (w.actual_heartrate) { serie.hr += w.actual_heartrate; serie.hrCount = (serie.hrCount || 0) + 1 }
    if (w.actual_pace > 0) serie.paces.push(w.actual_pace)
    if (w.feedback_energy != null) serie.energy.push(w.feedback_energy)
    if (w.feedback_sleep != null) serie.sleep.push(w.feedback_sleep)
    if (w.feedback_stress != null) serie.stress.push(w.feedback_stress)
    if (w.actual_vo2max) serie.vo2max.push(w.actual_vo2max)
    serie.completed++
  }
  return [...map.values()].sort((a, b) => a.week - b.week)
})

const totals = computed(() => {
  const t = { completed: 0, runDistance: 0, swimDistance: 0, duration: 0, load: 0 }
  for (const s of weekSeries.value) {
    t.completed += s.completed
    t.runDistance += s.runDistance
    t.swimDistance += s.swimDistance
    t.duration += s.duration
    t.load += s.load
  }
  return t
})

const labels = computed(() => weekSeries.value.map(s => `S${s.week}`))

const volumeChartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'Corrida (m)',
      data: weekSeries.value.map(s => Math.round(s.runDistance)),
      backgroundColor: 'rgba(249, 65, 1, 0.7)',
      borderRadius: 4,
    },
    {
      label: 'Natação (m)',
      data: weekSeries.value.map(s => Math.round(s.swimDistance)),
      backgroundColor: 'rgba(56, 189, 248, 0.7)',
      borderRadius: 4,
    },
  ],
}))

const volumeOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { ticks: { color: '#737373' }, grid: { color: '#262626' } },
    x: { ticks: { color: '#737373' }, grid: { display: false } },
  },
  plugins: {
    legend: { labels: { color: '#a3a3a3' } },
  },
}

function baseLineOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { ticks: { color: '#737373' }, grid: { color: '#262626' } },
      x: { ticks: { color: '#737373' }, grid: { display: false } },
    },
    plugins: { legend: { labels: { color: '#a3a3a3' } } },
  }
}

function lineOptions(unit) {
  const options = baseLineOptions()
  if (unit) {
    options.plugins.tooltip = {
      callbacks: {
        label: (ctx) => ` ${ctx.parsed.y.toFixed(2)} ${unit}`,
      },
    }
  }
  return options
}

const loadChartData = computed(() => ({
  labels: labels.value,
  datasets: [{
    label: 'Carga',
    data: weekSeries.value.map(s => Math.round(s.load * 10) / 10),
    borderColor: '#F94101',
    backgroundColor: 'rgba(249, 65, 1, 0.15)',
    fill: true,
    tension: 0.3,
  }],
}))

const paceChartData = computed(() => ({
  labels: labels.value,
  datasets: [{
    label: 'Ritmo corrida (s/km)',
    data: weekSeries.value.map(s => {
      if (!s.paces.length) return null
      return Math.round(s.paces.reduce((a, b) => a + b, 0) / s.paces.length)
    }),
    borderColor: '#F94101',
    tension: 0.3,
    spanGaps: true,
  }],
}))

const readinessChartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'Energia',
      data: weekSeries.value.map(s => s.energy.length ? s.energy.reduce((a, b) => a + b, 0) / s.energy.length : null),
      borderColor: '#22c55e',
      tension: 0.3,
      spanGaps: true,
    },
    {
      label: 'Sono',
      data: weekSeries.value.map(s => s.sleep.length ? s.sleep.reduce((a, b) => a + b, 0) / s.sleep.length : null),
      borderColor: '#a78bfa',
      tension: 0.3,
      spanGaps: true,
    },
    {
      label: 'Stress',
      data: weekSeries.value.map(s => s.stress.length ? s.stress.reduce((a, b) => a + b, 0) / s.stress.length : null),
      borderColor: '#f59e0b',
      tension: 0.3,
      spanGaps: true,
    },
  ],
}))

const vo2ChartData = computed(() => {
  const vo2 = []
  for (const s of weekSeries.value) {
    if (s.vo2max.length) {
      vo2.push({ week: s.week, value: Math.max(...s.vo2max) })
    }
  }
  return {
    labels: vo2.map(v => `S${v.week}`),
    datasets: [{
      label: 'VO₂max',
      data: vo2.map(v => v.value),
      borderColor: '#38bdf8',
      backgroundColor: 'rgba(56, 189, 248, 0.15)',
      fill: true,
      tension: 0.3,
    }],
  }
})
</script>

<style scoped>
:deep(canvas) {
  height: 260px !important;
}
</style>