<template>
  <div class="min-h-screen bg-dark p-4">
    <div class="max-w-lg mx-auto">
      <button @click="router.back()" class="flex items-center gap-2 text-neutral-500 hover:text-white mb-6 transition-colors">
        <Icon name="arrow-left" :size="18" />
        <span class="text-sm">Voltar</span>
      </button>

      <div v-if="!workout" class="text-center py-12 text-neutral-500">
        <p>Treino não encontrado</p>
      </div>

      <template v-else>
        <div class="mb-6">
          <div class="flex items-center gap-3 mb-2">
            <Icon
              :name="workout.type === 'swim' ? 'droplet' : 'activity'"
              :size="22"
              :class="workout.type === 'swim' ? 'text-neutral-400' : 'text-primary'"
            />
            <h1 class="text-xl font-medium text-white">{{ workout.name }}</h1>
          </div>
          <div class="text-sm text-neutral-500">
            {{ formatWorkoutDate(workout.scheduled_date) }} · {{ workout.duration }}min
          </div>
        </div>

        <div class="bg-surface rounded p-5 border border-neutral-800 mb-6">
          <div v-if="workout.description" class="text-sm text-neutral-400 mb-4">{{ workout.description }}</div>
          <div v-if="parsedIntervals.length" class="space-y-2">
            <div
              v-for="(interval, i) in parsedIntervals"
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
              <div class="text-xs text-neutral-500 flex-shrink-0">{{ interval.duration }}min</div>
            </div>
          </div>
        </div>

        <div v-if="workout.status === 'completed'" class="bg-surface rounded p-5 border border-neutral-800 mb-6">
          <div class="flex items-center gap-2 mb-3">
            <Icon name="check-circle" :size="18" class="text-green-500" />
            <span class="text-sm font-medium text-white">Treino Concluído</span>
          </div>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="bg-dark rounded p-3">
              <div class="text-neutral-500">Distância</div>
              <div class="text-white">{{ formatDistance(workout.actual_distance) }}</div>
            </div>
            <div class="bg-dark rounded p-3">
              <div class="text-neutral-500">Tempo</div>
              <div class="text-white">{{ formatDuration(workout.actual_duration) }}</div>
            </div>
            <div class="bg-dark rounded p-3">
              <div class="text-neutral-500">Ritmo</div>
              <div class="text-white">{{ workout.actual_pace ? formatPace(workout.actual_pace) : '-' }}</div>
            </div>
            <div class="bg-dark rounded p-3">
              <div class="text-neutral-500">BPM</div>
              <div class="text-white">{{ workout.actual_heartrate ? Math.round(workout.actual_heartrate) : '-' }}</div>
            </div>
          </div>
          <div v-if="workout.feedback_exhaustion" class="mt-3 bg-dark rounded p-3">
            <div class="text-neutral-500 text-sm">Cansaço</div>
            <div class="text-white">{{ workout.feedback_exhaustion }}/10</div>
          </div>
          <div v-if="workout.feedback_pain" class="mt-3 bg-dark rounded p-3">
            <div class="text-neutral-500 text-sm">Dores</div>
            <div class="text-white text-sm">{{ workout.feedback_pain }}</div>
          </div>
          <div v-if="workout.feedback_notes" class="mt-3 bg-dark rounded p-3">
            <div class="text-neutral-500 text-sm">Observações</div>
            <div class="text-white text-sm">{{ workout.feedback_notes }}</div>
          </div>
        </div>

        <div v-if="workout.status === 'planned'" class="space-y-6">
          <div v-if="strava.connected && stravaActivities.length > 0" class="bg-surface rounded p-5 border border-neutral-800">
            <h3 class="text-sm font-medium text-white mb-3">Vincular atividade do Strava</h3>
            <div class="space-y-2">
              <button
                v-for="activity in stravaActivities"
                :key="activity.id"
                @click="selectActivity(activity)"
                class="w-full flex items-center gap-3 p-3 rounded text-left transition-colors"
                :class="selectedActivity?.id === activity.id ? 'bg-primary/10 border border-primary/30' : 'bg-dark hover:bg-dark/80'"
              >
                <Icon :name="activity.type === 'swim' ? 'droplet' : 'activity'" :size="18" :class="activity.type === 'swim' ? 'text-neutral-400' : 'text-primary'" />
                <div class="flex-1 min-w-0">
                  <div class="text-sm text-white truncate">{{ activity.name }}</div>
                  <div class="text-xs text-neutral-500">
                    {{ formatDistance(activity.distance) }} · {{ formatDuration(activity.moving_time) }}
                  </div>
                </div>
                <div class="text-xs text-neutral-600">{{ formatDate(activity.start_date) }}</div>
              </button>
            </div>
          </div>

          <div v-if="!selectedActivity" class="bg-surface rounded p-5 border border-neutral-800">
            <h3 class="text-sm font-medium text-white mb-4">Dados do treino</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-neutral-500 mb-1">Distância (km)</label>
                <input
                  v-model="manualData.distance"
                  type="number"
                  step="0.1"
                  placeholder="5.0"
                  class="w-full bg-dark border border-neutral-800 rounded px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label class="block text-xs text-neutral-500 mb-1">Tempo (min)</label>
                <input
                  v-model="manualData.duration"
                  type="number"
                  placeholder="45"
                  class="w-full bg-dark border border-neutral-800 rounded px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label class="block text-xs text-neutral-500 mb-1">Ritmo (min/km)</label>
                <input
                  v-model="manualData.pace"
                  type="text"
                  placeholder="6:30"
                  class="w-full bg-dark border border-neutral-800 rounded px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label class="block text-xs text-neutral-500 mb-1">BPM médio</label>
                <input
                  v-model="manualData.heartrate"
                  type="number"
                  placeholder="140"
                  class="w-full bg-dark border border-neutral-800 rounded px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div class="bg-surface rounded p-5 border border-neutral-800">
            <h3 class="text-sm font-medium text-white mb-4">Feedback do Treino</h3>

            <div class="mb-5">
              <label class="block text-sm text-neutral-400 mb-2">Nível de cansaço (1-10)</label>
              <div class="flex gap-2">
                <button
                  v-for="n in 10"
                  :key="n"
                  @click="feedback.exhaustion = n"
                  class="w-9 h-9 rounded text-sm font-medium transition-all"
                  :class="feedback.exhaustion === n
                    ? 'bg-primary text-white'
                    : n <= 3 ? 'bg-dark text-green-400 hover:bg-dark/80'
                    : n <= 6 ? 'bg-dark text-yellow-400 hover:bg-dark/80'
                    : 'bg-dark text-red-400 hover:bg-dark/80'"
                >
                  {{ n }}
                </button>
              </div>
              <div class="flex justify-between text-xs text-neutral-600 mt-1">
                <span>Leve</span>
                <span>Moderado</span>
                <span>Exaustivo</span>
              </div>
            </div>

            <div class="mb-5">
              <label class="block text-sm text-neutral-400 mb-2">Sentiu alguma dor?</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="pain in painOptions"
                  :key="pain"
                  @click="togglePain(pain)"
                  class="px-3 py-1.5 rounded text-sm transition-colors"
                  :class="feedback.pain.includes(pain) ? 'bg-primary text-white' : 'bg-dark text-neutral-400 hover:bg-dark/80'"
                >
                  {{ pain }}
                </button>
              </div>
            </div>

            <div class="mb-5">
              <label class="block text-sm text-neutral-400 mb-2">Observações</label>
              <textarea
                v-model="feedback.notes"
                placeholder="Como se sentiu? Alguma observação?"
                class="w-full bg-dark border border-neutral-800 rounded px-3 py-2 text-sm text-white placeholder-neutral-600 resize-none focus:outline-none focus:border-primary"
                rows="3"
              />
            </div>

            <button
              @click="completeWorkout"
              :disabled="!feedback.exhaustion"
              class="w-full py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed rounded font-medium transition-colors text-sm"
            >
              Concluir Treino
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useWorkoutStore } from '../stores/workouts'
import { useStravaStore } from '../stores/strava'
import { formatDistance, formatDuration, formatDate } from '../utils/formatters'
import Icon from '../components/Icon.vue'

const router = useRouter()
const route = useRoute()
const workoutStore = useWorkoutStore()
const strava = useStravaStore()

const feedback = ref({
  exhaustion: null,
  pain: [],
  notes: '',
})

const manualData = ref({
  distance: '',
  duration: '',
  pace: '',
  heartrate: '',
})

const selectedActivity = ref(null)

const painOptions = [
  'Joelho', 'Tornozelo', 'Quadril', 'Lombar',
  'Ombro', 'Panturrilha', 'Peito', 'Nenhum',
]

const workout = computed(() =>
  workoutStore.workouts.find(w => w.id === route.params.id)
)

const parsedIntervals = computed(() => {
  if (!workout.value?.intervals) return []
  if (typeof workout.value.intervals === 'string') {
    try { return JSON.parse(workout.value.intervals) } catch { return [] }
  }
  return Array.isArray(workout.value.intervals) ? workout.value.intervals : []
})

const stravaActivities = computed(() => {
  if (!strava.connected) return []
  const workoutDate = workout.value?.scheduled_date
  if (!workoutDate) return []
  return strava.activities.filter(a => {
    const aDate = a.start_date?.split('T')[0]
    return aDate === workoutDate
  }).slice(0, 5)
})

function formatWorkoutDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
}

function formatPace(metersPerSecond) {
  if (!metersPerSecond) return '-'
  const paceSeconds = 1000 / metersPerSecond
  const min = Math.floor(paceSeconds / 60)
  const sec = Math.floor(paceSeconds % 60)
  return `${min}:${sec.toString().padStart(2, '0')}/km`
}

function selectActivity(activity) {
  selectedActivity.value = activity
}

function togglePain(pain) {
  if (pain === 'Nenhum') {
    feedback.value.pain = ['Nenhum']
    return
  }
  feedback.value.pain = feedback.value.pain.filter(p => p !== 'Nenhum')
  const idx = feedback.value.pain.indexOf(pain)
  if (idx === -1) {
    feedback.value.pain.push(pain)
  } else {
    feedback.value.pain.splice(idx, 1)
  }
}

async function completeWorkout() {
  if (!feedback.value.exhaustion) return

  if (selectedActivity.value) {
    const pace = selectedActivity.value.moving_time > 0
      ? selectedActivity.value.distance / selectedActivity.value.moving_time
      : null

    await workoutStore.saveWorkoutPerformance(workout.value.id, {
      distance: selectedActivity.value.distance,
      duration: selectedActivity.value.moving_time,
      pace: pace,
      heartrate: selectedActivity.value.average_heartrate,
      calories: selectedActivity.value.calories,
    })
  } else if (manualData.value.distance || manualData.value.duration) {
    const distance = manualData.value.distance ? parseFloat(manualData.value.distance) * 1000 : null
    const duration = manualData.value.duration ? parseInt(manualData.value.duration) * 60 : null
    let pace = null
    if (manualData.value.pace) {
      const parts = manualData.value.pace.split(':')
      if (parts.length === 2) {
        pace = (parseInt(parts[0]) * 60 + parseInt(parts[1])) / 1000
      }
    } else if (distance && duration) {
      pace = duration / distance
    }

    await workoutStore.saveWorkoutPerformance(workout.value.id, {
      distance: distance,
      duration: duration,
      pace: pace,
      heartrate: manualData.value.heartrate ? parseFloat(manualData.value.heartrate) : null,
      calories: null,
    })
  }

  await workoutStore.saveWorkoutFeedback(workout.value.id, {
    exhaustion: feedback.value.exhaustion,
    pain: feedback.value.pain.join(', ') || null,
    notes: feedback.value.notes || null,
  })

  await workoutStore.completeWorkout(workout.value.id, selectedActivity.value?.id || null)

  router.push('/')
}

onMounted(async () => {
  await workoutStore.fetchWorkouts()
  await strava.checkConnection()
  if (strava.connected) {
    await strava.fetchActivities()
  }
})
</script>
