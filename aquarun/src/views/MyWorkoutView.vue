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
        <div
          v-for="workout in weekWorkouts"
          :key="workout.id"
          @click="workout.status === 'planned' ? $router.push(`/workout/${workout.id}`) : workout.status === 'completed' ? openWorkoutModal(workout) : null"
          class="flex items-center gap-4 p-4 rounded bg-surface border border-neutral-800 transition-colors"
          :class="workout.status === 'planned' ? 'hover:bg-surface-light cursor-pointer' : workout.status === 'completed' ? 'hover:bg-surface-light cursor-pointer' : ''"
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
        </div>
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

    <!-- Modal Detalhes do Treino -->
    <Teleport to="body">
      <div
        v-if="selectedWorkout"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="closeWorkoutModal"
      >
        <div class="bg-surface w-full sm:max-w-md sm:rounded-lg rounded-t-lg max-h-[85vh] overflow-y-auto border border-neutral-800">
          <div class="sticky top-0 bg-surface border-b border-neutral-800 p-4 flex items-center justify-between">
            <div>
              <h3 class="font-medium text-white">{{ selectedWorkout.name }}</h3>
              <p class="text-xs text-neutral-500">{{ formatDate(selectedWorkout.scheduled_date) }}</p>
            </div>
            <button @click="closeWorkoutModal" class="p-1 hover:bg-dark rounded transition-colors">
              <Icon name="x" :size="18" class="text-neutral-500" />
            </button>
          </div>

          <div class="p-4 space-y-4">
            <!-- Estrutura do Treino -->
            <div v-if="parsedStructure" class="space-y-2">
              <div v-if="parsedStructure.objective" class="bg-dark rounded p-3">
                <div class="text-xs font-medium text-neutral-400 mb-1">Objetivo</div>
                <p class="text-sm text-neutral-300">{{ parsedStructure.objective }}</p>
              </div>
              <div v-if="parsedStructure.warmup" class="bg-dark rounded p-3">
                <div class="text-xs font-medium text-yellow-500 mb-1">Aquecimento</div>
                <p class="text-sm text-neutral-400 whitespace-pre-line">{{ parsedStructure.warmup }}</p>
              </div>
              <div v-if="parsedStructure.main_part" class="bg-dark rounded p-3">
                <div class="text-xs font-medium text-primary mb-1">Parte Principal</div>
                <p class="text-sm text-neutral-400 whitespace-pre-line">{{ parsedStructure.main_part }}</p>
              </div>
              <div v-if="parsedStructure.cooldown" class="bg-dark rounded p-3">
                <div class="text-xs font-medium text-blue-400 mb-1">Desaquecimento</div>
                <p class="text-sm text-neutral-400 whitespace-pre-line">{{ parsedStructure.cooldown }}</p>
              </div>
              <div v-if="parsedStructure.drills?.length" class="bg-dark rounded p-3">
                <div class="text-xs font-medium text-green-400 mb-1">Educativos</div>
                <ul class="space-y-1">
                  <li v-for="(drill, i) in parsedStructure.drills" :key="i" class="text-sm text-neutral-400 flex items-start gap-2">
                    <span class="text-neutral-600">•</span><span>{{ drill }}</span>
                  </li>
                </ul>
              </div>
              <div v-if="parsedStructure.attention_points?.length" class="bg-dark rounded p-3">
                <div class="text-xs font-medium text-purple-400 mb-1">Pontos de Atenção</div>
                <ul class="space-y-1">
                  <li v-for="(point, i) in parsedStructure.attention_points" :key="i" class="text-sm text-neutral-400 flex items-start gap-2">
                    <span class="text-neutral-600">•</span><span>{{ point }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Performance -->
            <div v-if="selectedWorkout.actual_distance || selectedWorkout.actual_duration || selectedWorkout.actual_heartrate" class="bg-dark rounded p-3">
              <div class="text-xs font-medium text-neutral-400 mb-2">Performance</div>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div v-if="selectedWorkout.actual_distance">
                  <span class="text-neutral-500">Distância:</span>
                  <span class="text-white ml-1">{{ formatDistance(selectedWorkout.actual_distance) }}</span>
                </div>
                <div v-if="selectedWorkout.actual_duration">
                  <span class="text-neutral-500">Tempo:</span>
                  <span class="text-white ml-1">{{ Math.floor(selectedWorkout.actual_duration / 60) }}min</span>
                </div>
                <div v-if="selectedWorkout.actual_pace">
                  <span class="text-neutral-500">Ritmo:</span>
                  <span class="text-white ml-1">{{ formatPace(selectedWorkout.actual_pace) }}</span>
                </div>
                <div v-if="selectedWorkout.actual_heartrate">
                  <span class="text-neutral-500">BPM:</span>
                  <span class="text-white ml-1">{{ Math.round(selectedWorkout.actual_heartrate) }}</span>
                </div>
              </div>
            </div>

            <!-- Feedback do Atleta -->
            <div v-if="selectedWorkout.feedback_effort || selectedWorkout.feedback_energy || selectedWorkout.feedback_notes" class="bg-dark rounded p-3">
              <div class="text-xs font-medium text-neutral-400 mb-2">Seu Feedback</div>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div v-if="selectedWorkout.feedback_effort">
                  <span class="text-neutral-500">Esforço:</span>
                  <span class="text-white ml-1">{{ effortLabel(selectedWorkout.feedback_effort) }}</span>
                </div>
                <div v-if="selectedWorkout.feedback_energy">
                  <span class="text-neutral-500">Energia:</span>
                  <span class="text-white ml-1">{{ selectedWorkout.feedback_energy }}/5</span>
                </div>
                <div v-if="selectedWorkout.feedback_sleep">
                  <span class="text-neutral-500">Sono:</span>
                  <span class="text-white ml-1">{{ selectedWorkout.feedback_sleep }}/5</span>
                </div>
                <div v-if="selectedWorkout.feedback_stress">
                  <span class="text-neutral-500">Estresse:</span>
                  <span class="text-white ml-1">{{ selectedWorkout.feedback_stress }}/5</span>
                </div>
                <div v-if="selectedWorkout.feedback_pain">
                  <span class="text-neutral-500">Dor:</span>
                  <span class="text-white ml-1">{{ selectedWorkout.feedback_pain }}/10</span>
                </div>
              </div>
              <div v-if="selectedWorkout.feedback_notes" class="mt-2 text-sm">
                <span class="text-neutral-500">Obs:</span>
                <span class="text-neutral-300 ml-1">{{ selectedWorkout.feedback_notes }}</span>
              </div>
            </div>

            <!-- AI Feedback -->
            <div v-if="aiFeedback" class="bg-dark rounded p-3 border border-primary/20">
              <div class="flex items-center gap-2 mb-2">
                <Icon name="message-circle" :size="14" class="text-primary" />
                <span class="text-xs font-medium text-primary">Feedback IA</span>
              </div>
              <p class="text-sm text-neutral-300 mb-2">{{ aiFeedback.summary }}</p>
              <div v-if="aiFeedback.positive?.length" class="mb-2">
                <div class="text-xs text-green-400 mb-1">Pontos positivos</div>
                <ul class="space-y-0.5">
                  <li v-for="(p, i) in aiFeedback.positive" :key="i" class="text-xs text-neutral-400 flex items-start gap-1">
                    <span class="text-green-500">+</span> {{ p }}
                  </li>
                </ul>
              </div>
              <div v-if="aiFeedback.negative?.length && aiFeedback.negative[0]" class="mb-2">
                <div class="text-xs text-yellow-400 mb-1">A melhorar</div>
                <ul class="space-y-0.5">
                  <li v-for="(n, i) in aiFeedback.negative" :key="i" class="text-xs text-neutral-400 flex items-start gap-1">
                    <span class="text-yellow-500">!</span> {{ n }}
                  </li>
                </ul>
              </div>
              <div v-if="aiFeedback.tip" class="bg-surface rounded p-2 mt-2">
                <div class="text-xs text-primary mb-1">Dica</div>
                <p class="text-xs text-neutral-400">{{ aiFeedback.tip }}</p>
              </div>
            </div>

            <!-- Botão Pedir Feedback -->
            <button
              v-if="selectedWorkout.status === 'completed' && !aiFeedback"
              @click="requestFeedback"
              :disabled="loadingFeedback"
              class="w-full py-2.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded text-sm font-medium transition-colors text-primary"
            >
              <span v-if="loadingFeedback" class="flex items-center justify-center gap-2">
                <span class="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                Gerando feedback...
              </span>
              <span v-else class="flex items-center justify-center gap-2">
                <Icon name="message-circle" :size="14" />
                Pedir Feedback IA
              </span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
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
const selectedWorkout = ref(null)
const aiFeedback = ref(null)
const loadingFeedback = ref(false)

const currentWeek = computed(() => auth.profile?.current_week || 0)

const hasOnboardingData = computed(() => {
  const p = auth.profile
  return p?.run_days?.length > 0 || p?.swim_days?.length > 0
})

const weekWorkouts = computed(() => {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const sunday = new Date(now)
  sunday.setDate(now.getDate() + (7 - dayOfWeek) % 7)
  sunday.setHours(23, 59, 59, 999)

  const todayStr = now.toLocaleDateString('sv-SE')
  const sundayStr = sunday.toLocaleDateString('sv-SE')

  return workoutStore.workouts
    .filter(w => w.scheduled_date >= todayStr && w.scheduled_date <= sundayStr)
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

const parsedStructure = computed(() => {
  if (!selectedWorkout.value?.structure) return null
  const s = selectedWorkout.value.structure
  return typeof s === 'string' ? (() => { try { return JSON.parse(s) } catch { return null } })() : s
})

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatPace(pace) {
  if (!pace) return ''
  const min = Math.floor(pace / 60)
  const sec = Math.floor(pace % 60)
  return `${min}:${sec.toString().padStart(2, '0')}/km`
}

function openWorkoutModal(workout) {
  selectedWorkout.value = workout
  aiFeedback.value = null
}

function closeWorkoutModal() {
  selectedWorkout.value = null
  aiFeedback.value = null
}

async function requestFeedback() {
  loadingFeedback.value = true
  try {
    const w = selectedWorkout.value
    const res = await fetch('/api/workout-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workout: { name: w.name, type: w.type, duration: w.duration },
        feedback: {
          effort: w.feedback_effort || null,
          energy: w.feedback_energy || null,
          sleep: w.feedback_sleep || null,
          stress: w.feedback_stress || null,
          pain: w.feedback_pain || null,
          notes: w.feedback_notes || null,
        },
        performance: {
          distance: w.actual_distance || null,
          duration: w.actual_duration || null,
          pace: w.actual_pace || null,
          heartrate: w.actual_heartrate || null,
          maxHeartrate: w.actual_max_heartrate || null,
        },
      }),
    })
    if (res.ok) {
      aiFeedback.value = await res.json()
    }
  } catch (e) {
    console.error('Erro ao gerar feedback:', e)
  } finally {
    loadingFeedback.value = false
  }
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
