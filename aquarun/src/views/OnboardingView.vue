<template>
  <div class="min-h-screen flex items-center justify-center bg-dark p-4">
    <div class="w-full max-w-2xl lg:max-w-3xl">
      <div class="text-center mb-6 lg:mb-8">
        <img src="../assets/Logo.png" alt="AquaRun" class="h-14 w-14 lg:h-16 lg:w-16 mx-auto rounded object-contain mb-3" />
        <h1 class="text-2xl lg:text-3xl font-medium text-white">AquaRun</h1>
        <p class="text-neutral-500 mt-1 text-sm lg:text-base">Vamos conhecer você melhor</p>
      </div>

      <div class="bg-surface rounded p-6 lg:p-8 border border-neutral-800">
        <div class="flex items-center justify-between mb-5">
          <span class="text-sm text-neutral-500">Etapa {{ step }} de {{ totalSteps }}</span>
          <div class="flex gap-1">
            <div
              v-for="i in totalSteps"
              :key="i"
              class="h-1 rounded-full transition-all"
              :class="i <= step ? 'bg-primary w-5' : 'bg-neutral-700 w-3'"
            ></div>
          </div>
        </div>

        <!-- Etapa 1: Você -->
        <form v-if="step === 1" @submit.prevent="nextStep" class="space-y-4">
          <div>
            <label class="field-label">Nome completo</label>
            <input v-model="form.fullName" type="text" required class="input-field" placeholder="Seu nome" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="field-label">Data de nascimento</label>
              <input
                :value="formatDateDisplay(form.birthDate)"
                @input="e => form.birthDate = parseDateInput(e.target.value)"
                type="text" required maxlength="10" class="input-field" placeholder="DD/MM/AAAA"
              />
              <p v-if="age" class="text-xs text-neutral-600 mt-1">{{ age }} anos</p>
            </div>
            <div>
              <label class="field-label">Gênero</label>
              <select v-model="form.gender" required class="select-field">
                <option value="" disabled>Selecione</option>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
                <option value="other">Outro</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="field-label">Peso (kg)</label>
              <input v-model.number="form.weight" type="number" required min="30" max="250" step="0.1" class="input-field" placeholder="70" />
            </div>
            <div>
              <label class="field-label">Altura (cm)</label>
              <input v-model.number="form.height" type="number" required min="100" max="250" class="input-field" placeholder="175" />
            </div>
          </div>

          <button type="submit" :disabled="!canProceed1" class="btn-primary btn-full mt-2">Próximo</button>
        </form>

        <!-- Etapa 2: Corrida -->
        <form v-if="step === 2" @submit.prevent="nextStep" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="field-label">Experiência com corrida</label>
              <select v-model="form.runningExperience" required class="select-field">
                <option value="" disabled>Selecione</option>
                <option value="never">Nunca corri</option>
                <option value="beginner">Iniciante</option>
                <option value="intermediate">Intermediário</option>
                <option value="advanced">Avançado</option>
              </select>
            </div>
            <div>
              <label class="field-label">Objetivo com corrida</label>
              <select v-model="form.runGoal" required class="select-field">
                <option value="" disabled>Selecione</option>
                <option v-for="option in runGoalOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="field-label">Nível de atividade</label>
            <div class="grid grid-cols-2 gap-2">
              <button v-for="option in activityOptions" :key="option.value" type="button"
                @click="form.activityLevel = option.value"
                class="p-2.5 rounded text-left text-sm transition-colors border"
                :class="form.activityLevel === option.value ? 'bg-primary border-primary text-white' : 'bg-dark border-neutral-800 hover:border-neutral-700 text-neutral-500'">
                <div class="font-medium text-white">{{ option.label }}</div>
                <div class="text-xs mt-0.5" :class="form.activityLevel === option.value ? 'text-white/70' : 'text-neutral-500'">{{ option.description }}</div>
              </button>
            </div>
          </div>

          <div>
            <button type="button" @click="showRunDetails = !showRunDetails"
              class="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
              <span class="optional-icon">?</span>
              <span>{{ showRunDetails ? 'Ocultar detalhes' : 'Já sei meu pace e distância' }}</span>
              <svg class="w-3 h-3 transition-transform" :class="showRunDetails ? 'rotate-180' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div v-if="showRunDetails" class="grid grid-cols-2 gap-3 mt-2">
              <div>
                <label class="field-label">Distância sem parar</label>
                <input v-model="form.maxDistance" type="text" class="input-field" placeholder="Ex: 5km" />
              </div>
              <div>
                <label class="field-label">Ritmo (min/km)</label>
                <input v-model="form.comfortablePace" type="text" class="input-field" placeholder="Ex: 6:30" />
              </div>
            </div>
          </div>

          <div class="nav-buttons">
            <button type="button" @click="step--" class="btn-secondary">Voltar</button>
            <button type="submit" :disabled="!canProceed2" class="btn-primary">Próximo</button>
          </div>
        </form>

        <!-- Etapa 3: Natação -->
        <form v-if="step === 3" @submit.prevent="nextStep" class="space-y-4">
          <div>
            <label class="field-label">Você pratica natação?</label>
            <select v-model="form.swimmingExperience" required class="select-field">
              <option value="" disabled>Selecione</option>
              <option value="never">Não nado</option>
              <option value="beginner">Iniciante</option>
              <option value="intermediate">Intermediário</option>
              <option value="advanced">Avançado</option>
            </select>
          </div>

          <template v-if="form.swimmingExperience && form.swimmingExperience !== 'never'">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="field-label">Objetivo com natação</label>
                <select v-model="form.swimGoal" required class="select-field">
                  <option value="" disabled>Selecione</option>
                  <option v-for="option in swimGoalOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
              </div>
              <div>
                <label class="field-label">Frequência</label>
                <select v-model="form.swimmingFrequency" required class="select-field">
                  <option value="" disabled>Selecione</option>
                  <option value="rarely">Raramente</option>
                  <option value="1-2x">1-2x/sem</option>
                  <option value="3-4x">3-4x/sem</option>
                  <option value="5x_plus">5x+/sem</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="field-label">Principal nado</label>
                <select v-model="form.mainStroke" required class="select-field">
                  <option value="" disabled>Selecione</option>
                  <option value="freestyle">Crawl</option>
                  <option value="backstroke">Costas</option>
                  <option value="breaststroke">Peito</option>
                  <option value="butterfly">Borboleta</option>
                  <option value="mixed">Misto</option>
                </select>
              </div>
              <div>
                <label class="field-label">Acesso a piscina</label>
                <select v-model="form.hasPoolAccess" required class="select-field">
                  <option value="" disabled>Selecione</option>
                  <option :value="true">Sim</option>
                  <option :value="false">Não</option>
                </select>
              </div>
            </div>

            <div>
              <button type="button" @click="showSwimDetails = !showSwimDetails"
                class="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
                <span class="optional-icon">?</span>
                <span>{{ showSwimDetails ? 'Ocultar detalhes' : 'Já sei meu pace e distância de nado' }}</span>
                <svg class="w-3 h-3 transition-transform" :class="showSwimDetails ? 'rotate-180' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <div v-if="showSwimDetails" class="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <label class="field-label">Distância sem parar</label>
                  <input v-model="form.swimDistance" type="text" class="input-field" placeholder="Ex: 200m" />
                </div>
                <div>
                  <label class="field-label">Tempo por 100m</label>
                  <input v-model="form.swimPace" type="text" class="input-field" placeholder="Ex: 2:00" />
                </div>
              </div>
            </div>

            <div>
              <label class="field-label">Águas abertas</label>
              <select v-model="form.openWaterExperience" required class="select-field">
                <option value="" disabled>Selecione</option>
                <option :value="true">Já nadei</option>
                <option :value="false">Nunca nadei</option>
              </select>
            </div>
          </template>

          <div v-if="form.swimmingExperience === 'never'" class="bg-dark rounded p-4 border border-neutral-800 text-center">
            <p class="text-neutral-500 text-sm">Sem problemas! Você pode adicionar natação depois.</p>
          </div>

          <div class="nav-buttons">
            <button type="button" @click="step--" class="btn-secondary">Voltar</button>
            <button type="submit" :disabled="!canProceed3" class="btn-primary">Próximo</button>
          </div>
        </form>

        <!-- Etapa 4: Saúde -->
        <form v-if="step === 4" @submit.prevent="nextStep" class="space-y-4">
          <div>
            <label class="field-label">Lesões ou limitações atuais</label>
            <textarea v-model="form.currentInjuries" rows="2" class="input-field resize-none"
              placeholder="Ex: Dor no joelho, tendinite... (ou deixe vazio)"></textarea>
          </div>

          <div>
            <label class="field-label">Histórico de lesões</label>
            <textarea v-model="form.injuryHistory" rows="2" class="input-field resize-none"
              placeholder="Ex: Fratura no pé em 2022... (ou deixe vazio)"></textarea>
          </div>

          <div>
            <label class="field-label">Medicamentos ou doenças crônicas</label>
            <textarea v-model="form.medications" rows="2" class="input-field resize-none"
              placeholder="Ex: Losartana, hipertensão... (ou deixe vazio)"></textarea>
          </div>

          <div>
            <label class="field-label">FC Máxima (bpm)</label>
            <input v-model.number="form.fcMax" type="number" min="100" max="230" class="input-field"
              placeholder="Ex: 185 (se não souber, deixe vazio)" />
            <p class="text-xs text-neutral-600 mt-1">Usado para calcular zonas de treino. Se não souber, deixe vazio — vamos estimar com base nos dados do Strava.</p>
          </div>

          <div class="nav-buttons">
            <button type="button" @click="step--" class="btn-secondary">Voltar</button>
            <button type="submit" class="btn-primary">Próximo</button>
          </div>
        </form>

        <!-- Etapa 5: Planejamento da Semana -->
        <form v-if="step === 5" @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="field-label">Dias/semana para treinar</label>
            <div class="flex gap-1">
              <button v-for="d in 6" :key="d" type="button"
                @click="form.trainingDaysPerWeek = d; limitWeekdays()"
                class="flex-1 py-2 rounded text-sm transition-colors border"
                :class="form.trainingDaysPerWeek === d ? 'bg-primary border-primary text-white' : 'bg-dark border-neutral-800 text-neutral-500 hover:border-neutral-700'">
                {{ d }}
              </button>
            </div>
          </div>

          <div>
            <label class="field-label">Dias da semana</label>
            <p class="text-xs text-neutral-600 mb-2">Selecione {{ form.trainingDaysPerWeek }} dia{{ form.trainingDaysPerWeek > 1 ? 's' : '' }}</p>
            <div class="flex flex-wrap gap-2">
              <button v-for="day in weekdays" :key="day.value" type="button"
                @click="toggleWeekday(day.value)"
                class="px-3 py-2 rounded text-sm transition-colors border"
                :class="form.trainingWeekdays.includes(day.value) ? 'bg-primary border-primary text-white' : 'bg-dark border-neutral-800 text-neutral-500 hover:border-neutral-700'">
                {{ day.label }}
              </button>
            </div>
            <p v-if="form.trainingWeekdays.length > form.trainingDaysPerWeek" class="text-xs text-primary mt-1">
              Máximo de {{ form.trainingDaysPerWeek }} dia{{ form.trainingDaysPerWeek > 1 ? 's' : '' }}
            </p>
          </div>

          <!-- Dias de corrida -->
          <div v-if="form.trainingWeekdays.length > 0">
            <label class="field-label">Dias de corrida</label>
            <div class="flex flex-wrap gap-2">
              <button v-for="day in selectedWeekdayObjects" :key="'run-'+day.value" type="button"
                @click="toggleRunDay(day.value)"
                :disabled="form.swimDays.includes(day.value)"
                class="px-3 py-2 rounded text-sm transition-colors border"
                :class="form.swimDays.includes(day.value)
                  ? 'border-neutral-800 cursor-not-allowed'
                  : form.runDays.includes(day.value) ? 'border-primary' : 'border-neutral-800'"
                :style="form.swimDays.includes(day.value)
                  ? 'background-color: #101011; color: #262628'
                  : form.runDays.includes(day.value)
                    ? 'background-color: #F94101; color: #fff'
                    : 'background-color: #101011; color: #525252'">
                {{ day.label }}
              </button>
            </div>
          </div>

          <!-- Dias de natação -->
          <div v-if="form.trainingWeekdays.length > 0 && hasSwimming">
            <label class="field-label">Dias de natação</label>
            <p class="text-xs text-neutral-600 mb-2">Só aparecem os dias que não são de corrida</p>
            <div class="flex flex-wrap gap-2">
              <button v-for="day in availableSwimDays" :key="'swim-'+day.value" type="button"
                @click="toggleSwimDay(day.value)"
                class="px-3 py-2 rounded text-sm transition-colors border"
                :class="form.swimDays.includes(day.value) ? 'border-primary' : 'border-neutral-800'"
                :style="form.swimDays.includes(day.value)
                  ? 'background-color: #F94101; color: #fff'
                  : 'background-color: #101011; color: #525252'">
                {{ day.label }}
              </button>
            </div>
            <p v-if="availableSwimDays.length === 0" class="text-xs text-neutral-600 mt-1">
              Selecione mais dias da semana para ter dias de natação
            </p>
          </div>

          <!-- Metas de corrida -->
          <div class="bg-dark rounded p-4 border border-neutral-800 space-y-3">
            <div class="flex items-center gap-2 mb-1">
              <div class="w-2 h-2 rounded-full bg-primary"></div>
              <span class="field-label mb-0">Corrida</span>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="field-label">Ritmo atual (min/km)</label>
                <input v-model="form.comfortablePace" type="text" class="input-field" placeholder="Ex: 6:30" />
              </div>
              <div>
                <label class="field-label">Distância sem parar</label>
                <input v-model="form.maxDistance" type="text" class="input-field" placeholder="Ex: 5km" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="field-label">Ritmo-alvo (min/km)</label>
                <input v-model="form.targetRunPace" type="text" class="input-field" placeholder="Ex: 5:45" />
              </div>
              <div>
                <label class="field-label">Distância-alvo</label>
                <input v-model="form.targetRunDistance" type="text" class="input-field" placeholder="Ex: 10km" />
              </div>
            </div>
            <div>
              <label class="field-label">Dia do longão</label>
              <select v-model="form.longRunDay" class="select-field">
                <option value="" disabled>Selecione</option>
                <option v-for="day in availableLongRunDays" :key="day.value" :value="day.value">{{ day.label }}</option>
              </select>
            </div>
          </div>

          <!-- Metas de natação -->
          <div v-if="hasSwimming" class="bg-dark rounded p-4 border border-neutral-800 space-y-3">
            <div class="flex items-center gap-2 mb-1">
              <div class="w-2 h-2 rounded-full" style="background-color: #9CA3AF"></div>
              <span class="field-label mb-0">Natação</span>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="field-label">Tempo atual por 100m</label>
                <input v-model="form.swimPace" type="text" class="input-field" placeholder="Ex: 2:10" />
              </div>
              <div>
                <label class="field-label">Distância sem parar</label>
                <input v-model="form.swimDistance" type="text" class="input-field" placeholder="Ex: 200m" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="field-label">Tempo-alvo por 100m</label>
                <input v-model="form.targetSwimPace" type="text" class="input-field" placeholder="Ex: 1:50" />
              </div>
              <div>
                <label class="field-label">Distância-alvo</label>
                <input v-model="form.targetSwimDistance" type="text" class="input-field" placeholder="Ex: 500m" />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="field-label">Data de início</label>
              <input
                :value="formatDateDisplay(form.startDate)"
                @input="e => form.startDate = parseDateInput(e.target.value)"
                type="text" required maxlength="10" class="input-field" placeholder="DD/MM/AAAA"
              />
            </div>
            <div>
              <label class="field-label">Data da prova ou meta (opcional)</label>
              <input
                :value="formatDateDisplay(form.raceDate)"
                @input="e => form.raceDate = parseDateInput(e.target.value)"
                type="text" maxlength="10" class="input-field" placeholder="DD/MM/AAAA"
              />
            </div>
          </div>

          <div v-if="error" class="text-red-400 text-sm bg-red-500/10 p-3 rounded border border-red-500/20">{{ error }}</div>

          <div class="nav-buttons">
            <button type="button" @click="step--" class="btn-secondary">Voltar</button>
            <button type="submit" :disabled="loading || !canProceed5" class="btn-primary">
              {{ loading ? 'Salvando...' : 'Finalizar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const step = ref(1)
const loading = ref(false)
const error = ref('')
const showRunDetails = ref(false)
const showSwimDetails = ref(false)

const form = ref({
  fullName: '',
  birthDate: '',
  gender: '',
  weight: null,
  height: null,
  runningExperience: '',
  trainingDaysPerWeek: 3,
  activityLevel: '',
  maxDistance: '',
  comfortablePace: '',
  targetRunPace: '',
  targetRunDistance: '',
  targetSwimPace: '',
  targetSwimDistance: '',
  runDays: [],
  swimDays: [],
  currentInjuries: '',
  injuryHistory: '',
  medications: '',
  fcMax: null,
  swimmingExperience: '',
  swimmingFrequency: '',
  mainStroke: '',
  swimDistance: '',
  swimPace: '',
  hasPoolAccess: false,
  openWaterExperience: false,
  openWaterDistance: '',
  runGoal: '',
  swimGoal: '',
  mainGoal: '',
  customGoal: '',
  raceDate: '',
  trainingWeekdays: [],
  longRunDay: '',
  startDate: '',
})

const activityOptions = [
  { label: 'Sedentário', value: 'sedentary', description: 'Foco em completar a distância' },
  { label: 'Treino Leve', value: 'light', description: 'Corrida confortável, dá pra conversar' },
  { label: 'Treino Moderado', value: 'moderate', description: 'Corrida firme, termina suado' },
  { label: 'Treino Intenso', value: 'intense', description: 'Alta intensidade, tiros e subidas' },
]

const runGoalOptions = [
  { label: 'Perder peso', value: 'lose_weight' },
  { label: 'Melhorar condicionamento', value: 'improve_fitness' },
  { label: 'Correr 5km', value: '5km' },
  { label: 'Correr 10km', value: '10km' },
  { label: 'Meia maratona (21km)', value: 'half_marathon' },
  { label: 'Maratona (42km)', value: 'marathon' },
  { label: 'Prova de trail', value: 'trail' },
  { label: 'Outro', value: 'other' },
]

const swimGoalOptions = [
  { label: 'Aprender a nadar', value: 'learn' },
  { label: 'Melhorar técnica', value: 'technique' },
  { label: 'Aumentar distância', value: 'distance' },
  { label: 'Nadar mais rápido', value: 'speed' },
  { label: 'Preparar para águas abertas', value: 'open_water' },
  { label: 'Natação como exercício', value: 'fitness' },
  { label: 'Outro', value: 'other' },
]

const weekdays = [
  { label: 'Dom', value: 'sunday' },
  { label: 'Seg', value: 'monday' },
  { label: 'Ter', value: 'tuesday' },
  { label: 'Qua', value: 'wednesday' },
  { label: 'Qui', value: 'thursday' },
  { label: 'Sex', value: 'friday' },
  { label: 'Sáb', value: 'saturday' },
]

watch(() => step.value, (s) => {
  if (s === 5 && hasSwimming.value && form.value.runDays.length === 0) {
    form.value.runDays = [...form.value.trainingWeekdays]
  }
})

const totalSteps = computed(() => 5)

function formatDateDisplay(dateStr) {
  if (!dateStr) return ''
  return dateStr
}

function parseDateInput(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length === 0) return ''
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

function dateToISO(displayValue) {
  if (!displayValue) return ''
  const digits = displayValue.replace(/\D/g, '')
  if (digits.length !== 8) return ''
  return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`
}

const age = computed(() => {
  if (!form.value.birthDate) return null
  const isoDate = dateToISO(form.value.birthDate)
  if (!isoDate) return null
  const birth = new Date(isoDate)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years--
  return years
})

const canProceed1 = computed(() => {
  return form.value.fullName && form.value.birthDate && form.value.gender && form.value.weight && form.value.height
})

const canProceed2 = computed(() => {
  return form.value.runningExperience && form.value.activityLevel && form.value.runGoal
})

const canProceed3 = computed(() => {
  if (!form.value.swimmingExperience) return false
  if (form.value.swimmingExperience === 'never') return true
  return form.value.swimGoal && form.value.swimmingFrequency && form.value.mainStroke
})

const canProceed5 = computed(() => {
  const validWeekdays = form.value.trainingWeekdays.length === form.value.trainingDaysPerWeek
  const hasLongRun = form.value.longRunDay
  const hasStart = form.value.startDate
  const hasRunDays = form.value.runDays.length > 0
  const hasSwimDays = hasSwimming.value ? form.value.swimDays.length > 0 : true
  return validWeekdays && hasLongRun && hasStart && hasRunDays && hasSwimDays
})

const availableLongRunDays = computed(() => {
  return weekdays.filter(d => form.value.runDays.includes(d.value))
})

const hasSwimming = computed(() => {
  return form.value.swimmingExperience && form.value.swimmingExperience !== 'never'
})

const selectedWeekdayObjects = computed(() => {
  return weekdays.filter(d => form.value.trainingWeekdays.includes(d.value))
})

const availableSwimDays = computed(() => {
  return selectedWeekdayObjects.value.filter(d => !form.value.runDays.includes(d.value))
})

function toggleRunDay(day) {
  const idx = form.value.runDays.indexOf(day)
  if (idx !== -1) {
    form.value.runDays.splice(idx, 1)
  } else {
    form.value.runDays.push(day)
  }
}

function toggleSwimDay(day) {
  const idx = form.value.swimDays.indexOf(day)
  if (idx !== -1) {
    form.value.swimDays.splice(idx, 1)
  } else {
    form.value.swimDays.push(day)
  }
}

function initRunDays() {
  if (hasSwimming.value && form.value.runDays.length === 0) {
    form.value.runDays = [...form.value.trainingWeekdays]
  }
}

function toggleWeekday(day) {
  const idx = form.value.trainingWeekdays.indexOf(day)
  if (idx !== -1) {
    form.value.trainingWeekdays.splice(idx, 1)
  } else if (form.value.trainingWeekdays.length < form.value.trainingDaysPerWeek) {
    form.value.trainingWeekdays.push(day)
  }
}

function limitWeekdays() {
  while (form.value.trainingWeekdays.length > form.value.trainingDaysPerWeek) {
    form.value.trainingWeekdays.pop()
  }
  if (form.value.longRunDay && !form.value.trainingWeekdays.includes(form.value.longRunDay)) {
    form.value.longRunDay = ''
  }
}

function nextStep() {
  step.value++
}

async function handleSubmit() {
  if (step.value !== 5) return
  loading.value = true
  error.value = ''

  try {
    await auth.updateProfile({
      full_name: form.value.fullName,
      birth_date: dateToISO(form.value.birthDate),
      gender: form.value.gender,
      weight: form.value.weight,
      height: form.value.height,
      running_experience: form.value.runningExperience,
      training_days_per_week: form.value.trainingDaysPerWeek,
      activity_level: form.value.activityLevel,
      max_distance: form.value.maxDistance,
      comfortable_pace: form.value.comfortablePace,
      target_run_pace: form.value.targetRunPace || null,
      target_run_distance: form.value.targetRunDistance || null,
      target_swim_pace: form.value.targetSwimPace || null,
      target_swim_distance: form.value.targetSwimDistance || null,
      run_days: form.value.runDays,
      swim_days: form.value.swimDays,
      current_injuries: form.value.currentInjuries || null,
      injury_history: form.value.injuryHistory || null,
      medications: form.value.medications || null,
      fc_max: form.value.fcMax || null,
      chronic_diseases: null,
      physical_limitations: null,
      swimming_experience: form.value.swimmingExperience,
      swimming_frequency: form.value.swimmingFrequency || null,
      main_stroke: form.value.mainStroke || null,
      swim_distance: form.value.swimDistance || null,
      swim_pace: form.value.swimPace || null,
      has_pool_access: form.value.hasPoolAccess,
      open_water_experience: form.value.openWaterExperience,
      open_water_distance: form.value.openWaterDistance || null,
      run_goal: form.value.runGoal,
      swim_goal: form.value.swimGoal || null,
      main_goal: form.value.runGoal,
      custom_goal: form.value.customGoal,
      race_date: dateToISO(form.value.raceDate) || null,
      training_weekdays: form.value.trainingWeekdays,
      long_run_day: form.value.longRunDay,
      start_date: dateToISO(form.value.startDate),
      onboarding_completed: true,
    })

    await auth.fetchProfile()
    router.push('/generating-plan')
  } catch (e) {
    error.value = e.message || 'Erro ao salvar'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.field-label {
  display: block;
  font-size: 0.875rem;
  color: #737373;
  margin-bottom: 0.25rem;
}

.input-field {
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: #101011;
  border-radius: 0.25rem;
  border: 1px solid #262628;
  font-size: 0.875rem;
  color: #fff;
  transition: all 0.15s;
  outline: none;
}
.input-field:focus {
  border-color: #F94101;
  box-shadow: 0 0 0 1px rgba(249, 65, 1, 0.3);
}
.input-field::placeholder {
  color: #525252;
}
.input-field::-webkit-inner-spin-button,
.input-field::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.input-field[type='number'] {
  -moz-appearance: textfield;
}

.select-field {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  background-color: #101011;
  border-radius: 0.25rem;
  border: 1px solid #262628;
  font-size: 0.875rem;
  color: #fff;
  transition: all 0.15s;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
}
.select-field:focus {
  border-color: #F94101;
  box-shadow: 0 0 0 1px rgba(249, 65, 1, 0.3);
}
.select-field option {
  background-color: #1A1A1C;
  color: #fff;
}
.select-field:focus option {
  background-color: #262628;
}

.btn-primary {
  flex: 1;
  padding: 0.625rem 1rem;
  background-color: #F94101;
  color: #fff;
  border-radius: 0.25rem;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: background-color 0.15s;
  border: none;
  cursor: pointer;
}
.btn-primary:hover {
  background-color: #D63601;
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-primary.btn-full {
  width: 100%;
  flex: none;
}

.btn-secondary {
  flex: 1;
  padding: 0.625rem 1rem;
  background-color: #1A1A1C;
  color: #737373;
  border-radius: 0.25rem;
  font-size: 0.8125rem;
  transition: all 0.15s;
  border: none;
  cursor: pointer;
}
.btn-secondary:hover {
  background-color: #262628;
}

.nav-buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.optional-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: #262628;
  color: #737373;
  font-size: 0.625rem;
  font-weight: 500;
  flex-shrink: 0;
}

.resize-none {
  resize: none;
}
</style>
