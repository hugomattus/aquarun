<template>
  <div class="min-h-screen flex items-center justify-center bg-dark p-4">
    <div class="w-full max-w-md text-center">
      <div class="mb-8">
        <img src="../assets/Logo.png" alt="AquaRun" class="h-16 w-16 mx-auto rounded object-contain mb-4" />
        <h1 class="text-3xl font-medium text-white">AquaRun</h1>
      </div>

      <div class="bg-surface rounded p-8 border border-neutral-800">
        <div class="relative w-24 h-24 mx-auto mb-6">
          <svg class="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" fill="none" stroke="#262628" stroke-width="8" />
            <circle
              cx="48" cy="48" r="40"
              fill="none"
              stroke="#F94101"
              stroke-width="8"
              stroke-linecap="round"
              :stroke-dasharray="251.2"
              :stroke-dashoffset="251.2 - (251.2 * progress) / 100"
              class="transition-all duration-700 ease-out"
            />
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-lg font-medium text-white">{{ Math.round(progress) }}%</span>
          </div>
        </div>

        <div class="min-h-[60px] flex flex-col items-center justify-center">
          <transition name="fade" mode="out-in">
            <p :key="currentMessage" class="text-sm text-neutral-400 transition-opacity">
              {{ currentMessage }}
            </p>
          </transition>
        </div>

        <div v-if="error" class="mt-4">
          <p class="text-sm text-red-400 bg-red-500/10 p-3 rounded border border-red-500/20">
            {{ error }}
          </p>
          <button
            @click="generatePlan"
            class="mt-4 px-6 py-2 bg-primary hover:bg-primary-dark rounded font-medium transition-colors text-sm"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useWorkoutStore } from '../stores/workouts'

const router = useRouter()
const auth = useAuthStore()
const workoutStore = useWorkoutStore()

const progress = ref(0)
const error = ref('')
const currentMessage = ref('')

const messages = [
  { progress: 5, msg: 'Analisando seu perfil...' },
  { progress: 12, msg: 'Verificando seus objetivos de corrida...' },
  { progress: 18, msg: 'Verificando seus objetivos de natação...' },
  { progress: 24, msg: 'Analisando suas lesões e limitações...' },
  { progress: 30, msg: 'Verificando seus dias disponíveis...' },
  { progress: 36, msg: 'Calculando volume semanal ideal...' },
  { progress: 42, msg: 'Definindo intensidade dos treinos...' },
  { progress: 50, msg: 'Montando treinos de corrida...' },
  { progress: 58, msg: 'Montando treinos de natação...' },
  { progress: 65, msg: 'Equilibrando carga e descanso...' },
  { progress: 72, msg: 'Ajustando para seu nível atual...' },
  { progress: 80, msg: 'Criando seu plano personalizado...' },
  { progress: 88, msg: 'Quase pronto!' },
  { progress: 95, msg: 'Finalizando...' },
  { progress: 100, msg: 'Seu treino está pronto!' },
]

let phaseIndex = 0
let messageTimer
let progressTimer

function setPhase(idx) {
  if (idx < messages.length) {
    currentMessage.value = messages[idx].msg
    progress.value = messages[idx].progress
  }
}

async function generatePlan() {
  error.value = ''
  progress.value = 0
  phaseIndex = 0
  currentMessage.value = messages[0].msg

  const interval = 2200

  messageTimer = setInterval(() => {
    phaseIndex++
    if (phaseIndex < messages.length) {
      setPhase(phaseIndex)
    }
  }, interval)

  progressTimer = setInterval(() => {
    const nextMsg = messages.find(m => m.progress > progress.value)
    if (nextMsg && progress.value < nextMsg.progress - 2) {
      progress.value += 0.5
    }
  }, 100)

  try {
    const response = await fetch('/api/workout-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: auth.profile }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error || 'Erro ao gerar plano')
    }

    const plan = await response.json()

    clearInterval(messageTimer)
    clearInterval(progressTimer)

    progress.value = 100
    currentMessage.value = 'Seu treino está pronto!'

    const startDate = auth.profile.start_date
      ? new Date(auth.profile.start_date + 'T00:00:00')
      : new Date()

    const dayNameToIndex = {
      domingo: 0, sunday: 0,
      segunda: 1, monday: 1,
      terça: 2, tuesday: 2,
      quarta: 3, wednesday: 3,
      quinta: 4, thursday: 4,
      sexta: 5, friday: 5,
      sábado: 6, saturday: 6,
    }

    const indexToDayName = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

    const startDayOfWeek = startDate.getDay()
    const runDays = (auth.profile.run_days || []).map(d => dayNameToIndex[d]).filter(d => d !== undefined)
    const swimDays = (auth.profile.swim_days || []).map(d => dayNameToIndex[d]).filter(d => d !== undefined)

    const week = plan.week || []

    for (const workout of week) {
      const targetDayIdx = dayNameToIndex[workout.day.toLowerCase()]
      if (targetDayIdx === undefined) continue
      if (workout.type === 'rest') continue

      let daysUntil = (targetDayIdx - startDayOfWeek + 7) % 7
      if (daysUntil === 0) daysUntil = 7

      const scheduledDate = new Date(startDate)
      scheduledDate.setDate(scheduledDate.getDate() + daysUntil)

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
        scheduled_date: scheduledDate.toISOString().split('T')[0],
        duration: workout.duration,
        intervals: JSON.stringify(workout.intervals || []),
        week_number: 1,
      })
    }

    await auth.updateProfile({ current_week: 1 })

    setTimeout(() => {
      router.push('/')
    }, 1500)
  } catch (e) {
    clearInterval(messageTimer)
    clearInterval(progressTimer)
    error.value = e.message || 'Erro ao gerar plano de treino'
  }
}

onMounted(() => {
  generatePlan()
})

onUnmounted(() => {
  clearInterval(messageTimer)
  clearInterval(progressTimer)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
