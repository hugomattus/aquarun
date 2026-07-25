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

        <template v-if="structure">
          <div class="space-y-4 mb-6">
            <div class="bg-surface rounded p-5 border border-neutral-800">
              <div class="flex items-center gap-2 mb-3">
                <Icon name="target" :size="16" class="text-primary" />
                <h3 class="text-sm font-medium text-white">Objetivo</h3>
              </div>
              <p class="text-sm text-neutral-400 leading-relaxed">{{ structure.objective }}</p>
            </div>

            <div v-if="structure.warmup" class="bg-surface rounded p-5 border border-neutral-800">
              <div class="flex items-center gap-2 mb-3">
                <Icon name="thermometer" :size="16" class="text-yellow-500" />
                <h3 class="text-sm font-medium text-white">Aquecimento</h3>
              </div>
              <p class="text-sm text-neutral-400 leading-relaxed whitespace-pre-line">{{ structure.warmup }}</p>
            </div>

            <div v-if="structure.mobility && structure.mobility.length" class="bg-surface rounded p-5 border border-neutral-800">
              <div class="flex items-center gap-2 mb-3">
                <Icon name="move" :size="16" class="text-blue-400" />
                <h3 class="text-sm font-medium text-white">Mobilidade</h3>
              </div>
              <ul class="space-y-2">
                <li v-for="(item, i) in structure.mobility" :key="i" class="text-sm text-neutral-400 flex items-start gap-2">
                  <span class="text-neutral-600 mt-1">•</span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>

            <div v-if="structure.drills && structure.drills.length" class="bg-surface rounded p-5 border border-neutral-800">
              <div class="flex items-center gap-2 mb-3">
                <Icon name="book-open" :size="16" class="text-green-400" />
                <h3 class="text-sm font-medium text-white">Educativos</h3>
              </div>
              <ul class="space-y-2">
                <li v-for="(item, i) in structure.drills" :key="i" class="text-sm text-neutral-400 flex items-start gap-2">
                  <span class="text-neutral-600 mt-1">•</span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>

            <div v-if="structure.activation" class="bg-surface rounded p-5 border border-neutral-800">
              <div class="flex items-center gap-2 mb-3">
                <Icon name="zap" :size="16" class="text-orange-400" />
                <h3 class="text-sm font-medium text-white">Ativação</h3>
              </div>
              <p class="text-sm text-neutral-400 leading-relaxed whitespace-pre-line">{{ structure.activation }}</p>
            </div>

            <div v-if="structure.main_part" class="bg-surface rounded p-5 border border-neutral-800">
              <div class="flex items-center gap-2 mb-3">
                <Icon name="star" :size="16" class="text-primary" />
                <h3 class="text-sm font-medium text-white">Parte Principal</h3>
              </div>
              <p class="text-sm text-neutral-400 leading-relaxed whitespace-pre-line">{{ structure.main_part }}</p>
            </div>

            <div v-if="structure.cooldown" class="bg-surface rounded p-5 border border-neutral-800">
              <div class="flex items-center gap-2 mb-3">
                <Icon name="sun" :size="16" class="text-blue-500" />
                <h3 class="text-sm font-medium text-white">Desaquecimento</h3>
              </div>
              <p class="text-sm text-neutral-400 leading-relaxed whitespace-pre-line">{{ structure.cooldown }}</p>
            </div>

            <div v-if="structure.attention_points && structure.attention_points.length" class="bg-surface rounded p-5 border border-neutral-800">
              <div class="flex items-center gap-2 mb-3">
                <Icon name="eye" :size="16" class="text-purple-400" />
                <h3 class="text-sm font-medium text-white">Pontos de Atenção</h3>
              </div>
              <ul class="space-y-2">
                <li v-for="(item, i) in structure.attention_points" :key="i" class="text-sm text-neutral-400 flex items-start gap-2">
                  <span class="text-neutral-600 mt-1">•</span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>

            <div v-if="structure.adaptation_criteria" class="bg-surface rounded p-5 border border-neutral-800">
              <div class="flex items-center gap-2 mb-3">
                <Icon name="settings" :size="16" class="text-yellow-400" />
                <h3 class="text-sm font-medium text-white">Critérios de Adaptação</h3>
              </div>
              <p class="text-sm text-neutral-400 leading-relaxed whitespace-pre-line">{{ structure.adaptation_criteria }}</p>
            </div>

            <div v-if="structure.coach_message" class="bg-primary/10 rounded p-5 border border-primary/20">
              <div class="flex items-center gap-2 mb-3">
                <Icon name="message-circle" :size="16" class="text-primary" />
                <h3 class="text-sm font-medium text-white">Mensagem do Treinador</h3>
              </div>
              <p class="text-sm text-neutral-300 italic leading-relaxed">{{ structure.coach_message }}</p>
            </div>
          </div>
        </template>

        <template v-else>
          <div v-if="workout.description" class="bg-surface rounded p-5 border border-neutral-800 mb-6">
            <p class="text-sm text-neutral-400">{{ workout.description }}</p>
          </div>
          <div v-if="parsedIntervals.length" class="bg-surface rounded p-5 border border-neutral-800 mb-6 space-y-2">
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
        </template>

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
          <div v-if="workout.feedback_effort" class="mt-3 bg-dark rounded p-3">
            <div class="text-neutral-500 text-sm">Esforço</div>
            <div class="text-white">{{ effortLabels[workout.feedback_effort] || workout.feedback_effort }}</div>
          </div>
          <div v-if="workout.feedback_notes" class="mt-3 bg-dark rounded p-3">
            <div class="text-neutral-500 text-sm">Observações</div>
            <div class="text-white text-sm">{{ workout.feedback_notes }}</div>
          </div>
        </div>

        <div v-if="aiFeedback" class="bg-surface rounded p-5 border border-neutral-800 mb-6">
          <div class="flex items-center gap-2 mb-4">
            <Icon name="zap" :size="18" class="text-primary" />
            <span class="text-sm font-medium text-white">Feedback do Treino</span>
          </div>
          <p class="text-sm text-neutral-300 mb-4">{{ aiFeedback.summary }}</p>
          <div v-if="aiFeedback.positive?.length" class="mb-3">
            <div class="text-xs font-medium text-green-500 mb-2">Pontos Positivos</div>
            <ul class="space-y-1">
              <li v-for="(item, i) in aiFeedback.positive" :key="i" class="text-sm text-neutral-400 flex items-start gap-2">
                <span class="text-green-500 mt-1">+</span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
          <div v-if="aiFeedback.negative?.length" class="mb-3">
            <div class="text-xs font-medium text-yellow-500 mb-2">Pontos de Atenção</div>
            <ul class="space-y-1">
              <li v-for="(item, i) in aiFeedback.negative" :key="i" class="text-sm text-neutral-400 flex items-start gap-2">
                <span class="text-yellow-500 mt-1">!</span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
          <div v-if="aiFeedback.tip" class="bg-dark rounded p-3 mt-3">
            <div class="text-xs font-medium text-primary mb-1">Dica</div>
            <p class="text-sm text-neutral-400">{{ aiFeedback.tip }}</p>
          </div>
          <button
            @click="router.push('/')"
            class="w-full mt-5 py-2.5 bg-primary hover:bg-primary-dark rounded font-medium transition-colors text-sm"
          >
            Voltar ao Dashboard
          </button>
        </div>

        <div v-if="generatingFeedback" class="bg-surface rounded p-8 border border-neutral-800 mb-6 text-center">
          <div class="w-12 h-12 mx-auto mb-4 relative">
            <div class="absolute inset-0 rounded-full border-2 border-primary/20"></div>
            <div class="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"></div>
            <Icon name="zap" :size="20" class="absolute inset-0 m-auto text-primary" />
          </div>
          <p class="text-sm text-neutral-400">Analisando seu treino...</p>
          <p class="text-xs text-neutral-600 mt-1">A IA está gerando seu feedback</p>
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
                <input v-model="manualData.distance" type="number" step="0.1" placeholder="5.0"
                  class="w-full bg-dark border border-neutral-800 rounded px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label class="block text-xs text-neutral-500 mb-1">Tempo (min)</label>
                <input v-model="manualData.duration" type="number" placeholder="45"
                  class="w-full bg-dark border border-neutral-800 rounded px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label class="block text-xs text-neutral-500 mb-1">Ritmo (min/km)</label>
                <input v-model="manualData.pace" type="text" placeholder="6:30"
                  class="w-full bg-dark border border-neutral-800 rounded px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label class="block text-xs text-neutral-500 mb-1">BPM médio</label>
                <input v-model="manualData.heartrate" type="number" placeholder="140"
                  class="w-full bg-dark border border-neutral-800 rounded px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label class="block text-xs text-neutral-500 mb-1">BPM máximo</label>
                <input v-model="manualData.maxHeartrate" type="number" placeholder="175"
                  class="w-full bg-dark border border-neutral-800 rounded px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label class="block text-xs text-neutral-500 mb-1">Cadência</label>
                <input v-model="manualData.cadence" type="number" placeholder="170"
                  class="w-full bg-dark border border-neutral-800 rounded px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label class="block text-xs text-neutral-500 mb-1">Elevação (m)</label>
                <input v-model="manualData.elevation" type="number" placeholder="50"
                  class="w-full bg-dark border border-neutral-800 rounded px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label class="block text-xs text-neutral-500 mb-1">Calorias</label>
                <input v-model="manualData.calories" type="number" placeholder="400"
                  class="w-full bg-dark border border-neutral-800 rounded px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-primary" />
              </div>
            </div>
          </div>

          <div class="bg-surface rounded p-5 border border-neutral-800">
            <h3 class="text-sm font-medium text-white mb-5">Como foi o treino?</h3>

            <div class="mb-6">
              <label class="block text-sm text-neutral-400 mb-3">Esforço percebido (1-5)</label>
              <div class="flex gap-1.5">
                <button
                  v-for="n in 5"
                  :key="n"
                  @click="feedback.effort = effortValues[n - 1]"
                  class="flex-1 h-9 rounded text-sm font-medium transition-all"
                  :class="feedback.effort === effortValues[n - 1]
                    ? 'bg-primary text-white'
                    : 'bg-dark text-neutral-500 hover:bg-dark/80'"
                >
                  {{ n }}
                </button>
              </div>
              <div class="flex justify-between text-xs text-neutral-600 mt-1">
                <span>Muito fácil</span>
                <span>Muito difícil</span>
              </div>
            </div>

            <div class="mb-6">
              <label class="block text-sm text-neutral-400 mb-3">Dor muscular (0-10)</label>
              <div class="flex gap-1.5">
                <button
                  v-for="n in 11"
                  :key="n - 1"
                  @click="feedback.pain = n - 1"
                  class="flex-1 h-9 rounded text-sm font-medium transition-all"
                  :class="feedback.pain === (n - 1)
                    ? 'bg-primary text-white'
                    : (n - 1) <= 3 ? 'bg-dark text-green-400 hover:bg-dark/80'
                    : (n - 1) <= 6 ? 'bg-dark text-yellow-400 hover:bg-dark/80'
                    : 'bg-dark text-red-400 hover:bg-dark/80'"
                >
                  {{ n - 1 }}
                </button>
              </div>
              <div class="flex justify-between text-xs text-neutral-600 mt-1">
                <span>Nenhuma</span>
                <span>Leve</span>
                <span>Moderada</span>
                <span>Intensa</span>
              </div>
            </div>

            <div class="space-y-4 mb-6">
              <div>
                <label class="block text-sm text-neutral-400 mb-2">Energia (0-10)</label>
                <div class="flex gap-1">
                  <button
                    v-for="n in 11"
                    :key="n - 1"
                    @click="feedback.energy = n - 1"
                    class="flex-1 h-8 rounded text-xs font-medium transition-all"
                    :class="feedback.energy === (n - 1) ? 'bg-primary text-white' : 'bg-dark text-neutral-500 hover:bg-dark/80'"
                  >
                    {{ n - 1 }}
                  </button>
                </div>
                <div class="flex justify-between text-xs text-neutral-600 mt-1">
                  <span>Baixa</span>
                  <span>Alta</span>
                </div>
              </div>
              <div>
                <label class="block text-sm text-neutral-400 mb-2">Sono (0-10)</label>
                <div class="flex gap-1">
                  <button
                    v-for="n in 11"
                    :key="n - 1"
                    @click="feedback.sleep = n - 1"
                    class="flex-1 h-8 rounded text-xs font-medium transition-all"
                    :class="feedback.sleep === (n - 1) ? 'bg-primary text-white' : 'bg-dark text-neutral-500 hover:bg-dark/80'"
                  >
                    {{ n - 1 }}
                  </button>
                </div>
                <div class="flex justify-between text-xs text-neutral-600 mt-1">
                  <span>Ruim</span>
                  <span>Ótimo</span>
                </div>
              </div>
              <div>
                <label class="block text-sm text-neutral-400 mb-2">Estresse (0-10)</label>
                <div class="flex gap-1">
                  <button
                    v-for="n in 11"
                    :key="n - 1"
                    @click="feedback.stress = n - 1"
                    class="flex-1 h-8 rounded text-xs font-medium transition-all"
                    :class="feedback.stress === (n - 1) ? 'bg-primary text-white' : 'bg-dark text-neutral-500 hover:bg-dark/80'"
                  >
                    {{ n - 1 }}
                  </button>
                </div>
                <div class="flex justify-between text-xs text-neutral-600 mt-1">
                  <span>Baixo</span>
                  <span>Alto</span>
                </div>
              </div>
            </div>

            <div class="mb-6">
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
              :disabled="!feedback.effort"
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

const effortValues = ['very_easy', 'easy', 'moderate', 'hard', 'very_hard']

const effortLabels = {
  very_easy: '😄 Muito fácil',
  easy: '🙂 Fácil',
  moderate: '😐 Normal',
  hard: '😓 Difícil',
  very_hard: '🥵 Muito difícil',
}

const feedback = ref({
  effort: null,
  pain: 0,
  energy: 0,
  sleep: 0,
  stress: 0,
  notes: '',
})

const manualData = ref({
  distance: '',
  duration: '',
  pace: '',
  heartrate: '',
  maxHeartrate: '',
  cadence: '',
  elevation: '',
  calories: '',
})

const selectedActivity = ref(null)
const aiFeedback = ref(null)
const generatingFeedback = ref(false)

const workout = computed(() =>
  workoutStore.workouts.find(w => w.id === route.params.id)
)

const structure = computed(() => {
  if (!workout.value?.structure) return null
  if (typeof workout.value.structure === 'string') {
    try { return JSON.parse(workout.value.structure) } catch { return null }
  }
  return workout.value.structure
})

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

async function completeWorkout() {
  if (!feedback.value.effort) return

  if (selectedActivity.value) {
    const a = selectedActivity.value
    const pace = a.moving_time > 0 && a.distance > 0 ? (a.moving_time * 1000 / a.distance) : null

    await workoutStore.saveWorkoutPerformance(workout.value.id, {
      distance: a.distance,
      duration: a.moving_time,
      pace: pace,
      heartrate: a.average_heartrate,
      maxHeartrate: a.max_heartrate,
      cadence: a.average_cadence,
      elevation: a.total_elevation_gain,
      calories: a.calories,
      movingTime: a.moving_time,
      elapsedTime: a.elapsed_time,
      splits: a.splits || null,
    })
  } else if (manualData.value.distance || manualData.value.duration) {
    const distance = manualData.value.distance ? parseFloat(manualData.value.distance) * 1000 : null
    const duration = manualData.value.duration ? parseInt(manualData.value.duration) * 60 : null
    let pace = null
    if (manualData.value.pace) {
      const parts = manualData.value.pace.split(':')
      if (parts.length === 2) {
        pace = parseInt(parts[0]) * 60 + parseInt(parts[1])
      }
    } else if (distance && duration) {
      pace = duration * 1000 / distance
    }

    await workoutStore.saveWorkoutPerformance(workout.value.id, {
      distance: distance,
      duration: duration,
      pace: pace,
      heartrate: manualData.value.heartrate ? parseFloat(manualData.value.heartrate) : null,
      maxHeartrate: manualData.value.maxHeartrate ? parseFloat(manualData.value.maxHeartrate) : null,
      cadence: manualData.value.cadence ? parseFloat(manualData.value.cadence) : null,
      elevation: manualData.value.elevation ? parseFloat(manualData.value.elevation) : null,
      calories: manualData.value.calories ? parseFloat(manualData.value.calories) : null,
      movingTime: duration,
      elapsedTime: duration,
      splits: null,
    })
  }

  await workoutStore.saveWorkoutFeedback(workout.value.id, {
    effort: feedback.value.effort,
    pain: feedback.value.pain,
    energy: feedback.value.energy,
    sleep: feedback.value.sleep,
    stress: feedback.value.stress,
    notes: feedback.value.notes || null,
  })

  await workoutStore.completeWorkout(workout.value.id, selectedActivity.value?.id || null)

  generatingFeedback.value = true
  try {
    const perfData = selectedActivity.value ? {
      distance: selectedActivity.value.distance,
      duration: selectedActivity.value.moving_time,
      pace: selectedActivity.value.moving_time > 0 && selectedActivity.value.distance > 0 ? (selectedActivity.value.moving_time * 1000 / selectedActivity.value.distance) : null,
      heartrate: selectedActivity.value.average_heartrate,
      maxHeartrate: selectedActivity.value.max_heartrate,
    } : manualData.value.distance || manualData.value.duration ? {
      distance: manualData.value.distance ? parseFloat(manualData.value.distance) * 1000 : null,
      duration: manualData.value.duration ? parseInt(manualData.value.duration) * 60 : null,
      pace: manualData.value.pace ? (() => {
        const parts = manualData.value.pace.split(':')
        return parts.length === 2 ? parseInt(parts[0]) * 60 + parseInt(parts[1]) : null
      })() : (distance && duration) ? (duration * 1000 / distance) : null,
      heartrate: manualData.value.heartrate ? parseFloat(manualData.value.heartrate) : null,
      maxHeartrate: manualData.value.maxHeartrate ? parseFloat(manualData.value.maxHeartrate) : null,
    } : null

    const res = await fetch('/api/workout-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workout: { name: workout.value.name, type: workout.value.type, duration: workout.value.duration },
        feedback: feedback.value,
        performance: perfData,
      }),
    })

    if (res.ok) {
      aiFeedback.value = await res.json()
    }
  } catch (e) {
    console.error('Erro ao gerar feedback:', e)
  } finally {
    generatingFeedback.value = false
  }
}

onMounted(async () => {
  await workoutStore.fetchWorkouts()
  await strava.checkConnection()
  if (strava.connected) {
    await strava.fetchActivities()
  }
})
</script>

<style scoped>
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
