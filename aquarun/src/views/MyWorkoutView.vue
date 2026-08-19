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
              v-else-if="workout.status === 'missed'"
              class="text-xs text-neutral-500"
            >
              Não feito
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
            <div class="flex items-center gap-1">
              <div v-if="selectedWorkout.status === 'completed' && !editingWorkout" class="relative">
                <button @click="showMenu = !showMenu" class="p-1 hover:bg-dark rounded transition-colors">
                  <Icon name="more-vertical" :size="18" class="text-neutral-500" />
                </button>
                <div v-if="showMenu" class="absolute right-0 top-full mt-1 bg-dark border border-neutral-700 rounded shadow-lg z-10 min-w-[120px]">
                  <button @click="startEdit" class="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-surface-light flex items-center gap-2">
                    <Icon name="edit-2" :size="14" /> Editar
                  </button>
                </div>
              </div>
              <button @click="closeWorkoutModal" class="p-1 hover:bg-dark rounded transition-colors">
                <Icon name="x" :size="18" class="text-neutral-500" />
              </button>
            </div>
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
            <div v-if="editingWorkout" class="bg-dark rounded p-3 space-y-3">
              <div class="text-xs font-medium text-neutral-400">Performance</div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs text-neutral-500 mb-1">Distância ({{ selectedWorkout?.type === 'swim' ? 'm' : 'km' }})</label>
                  <input v-model="editForm.distance" type="number" :step="selectedWorkout?.type === 'swim' ? 1 : 0.1" :placeholder="selectedWorkout?.type === 'swim' ? '1500' : '5.0'"
                    class="w-full bg-surface border border-neutral-800 rounded px-2 py-1.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-0 focus:border-primary" />
                </div>
                <div>
                  <label class="block text-xs text-neutral-500 mb-1">Tempo (min:seg)</label>
                  <input v-model="editForm.duration" type="text" placeholder="45:30"
                    class="w-full bg-surface border border-neutral-800 rounded px-2 py-1.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-0 focus:border-primary" />
                </div>
                <div>
                  <label class="block text-xs text-neutral-500 mb-1">Ritmo (min:seg/{{ selectedWorkout?.type === 'swim' ? '100m' : 'km' }})</label>
                  <input v-model="editForm.pace" type="text" :placeholder="selectedWorkout?.type === 'swim' ? '2:10' : '5:30'"
                    class="w-full bg-surface border border-neutral-800 rounded px-2 py-1.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-0 focus:border-primary" />
                </div>
                <div>
                  <label class="block text-xs text-neutral-500 mb-1">BPM médio</label>
                  <input v-model="editForm.heartrate" type="number" placeholder="140"
                    class="w-full bg-surface border border-neutral-800 rounded px-2 py-1.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-0 focus:border-primary" />
                </div>
                <div v-if="selectedWorkout?.type === 'swim'">
                  <label class="block text-xs text-neutral-500 mb-1">SWOLF</label>
                  <input v-model="editForm.swolf" type="number" placeholder="45"
                    class="w-full bg-surface border border-neutral-800 rounded px-2 py-1.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-0 focus:border-primary" />
                </div>
                <div v-if="selectedWorkout?.type === 'swim'">
                  <label class="block text-xs text-neutral-500 mb-1">Braçadas totais</label>
                  <input v-model="editForm.strokes" type="number" placeholder="600"
                    class="w-full bg-surface border border-neutral-800 rounded px-2 py-1.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-0 focus:border-primary" />
                </div>
              </div>
            </div>
            <div v-else-if="selectedWorkout.actual_distance || selectedWorkout.actual_duration || selectedWorkout.actual_heartrate" class="bg-dark rounded p-3">
              <div class="text-xs font-medium text-neutral-400 mb-2">Performance</div>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div v-if="selectedWorkout.actual_distance">
                  <span class="text-neutral-500">Distância:</span>
                  <span class="text-white ml-1">{{ formatDistance(selectedWorkout.actual_distance) }}</span>
                </div>
                <div v-if="selectedWorkout.actual_duration">
                  <span class="text-neutral-500">Tempo:</span>
                  <span class="text-white ml-1">{{ Math.floor(selectedWorkout.actual_duration / 60) }}min {{ selectedWorkout.actual_duration % 60 }}s</span>
                </div>
                <div v-if="selectedWorkout.actual_pace">
                  <span class="text-neutral-500">Ritmo:</span>
                  <span class="text-white ml-1">{{ formatPace(selectedWorkout.actual_pace, selectedWorkout.type) }}</span>
                </div>
                <div v-if="selectedWorkout.actual_heartrate">
                  <span class="text-neutral-500">BPM:</span>
                  <span class="text-white ml-1">{{ Math.round(selectedWorkout.actual_heartrate) }}</span>
                </div>
                <div v-if="selectedWorkout.type === 'swim' && selectedWorkout.actual_swolf">
                  <span class="text-neutral-500">SWOLF:</span>
                  <span class="text-white ml-1">{{ Math.round(selectedWorkout.actual_swolf) }}</span>
                </div>
                <div v-if="selectedWorkout.type === 'swim' && selectedWorkout.actual_strokes">
                  <span class="text-neutral-500">Braçadas:</span>
                  <span class="text-white ml-1">{{ selectedWorkout.actual_strokes }}</span>
                </div>
              </div>
            </div>

            <!-- Feedback do Atleta -->
            <div v-if="editingWorkout" class="bg-dark rounded p-3 space-y-3">
              <div class="text-xs font-medium text-neutral-400">Seu Feedback</div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs text-neutral-500 mb-1">Esforço</label>
                  <select v-model="editForm.effort"
                    class="w-full bg-surface border border-neutral-800 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-0 focus:border-primary">
                    <option value="">Selecione</option>
                    <option value="very_easy">Muito fácil</option>
                    <option value="easy">Fácil</option>
                    <option value="moderate">Normal</option>
                    <option value="hard">Difícil</option>
                    <option value="very_hard">Muito difícil</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-neutral-500 mb-1">Energia (0-10)</label>
                  <input v-model="editForm.energy" type="number" min="0" max="10" placeholder="5"
                    class="w-full bg-surface border border-neutral-800 rounded px-2 py-1.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-0 focus:border-primary" />
                </div>
                <div>
                  <label class="block text-xs text-neutral-500 mb-1">Sono (0-10)</label>
                  <input v-model="editForm.sleep" type="number" min="0" max="10" placeholder="5"
                    class="w-full bg-surface border border-neutral-800 rounded px-2 py-1.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-0 focus:border-primary" />
                </div>
                <div>
                  <label class="block text-xs text-neutral-500 mb-1">Estresse (0-10)</label>
                  <input v-model="editForm.stress" type="number" min="0" max="10" placeholder="5"
                    class="w-full bg-surface border border-neutral-800 rounded px-2 py-1.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-0 focus:border-primary" />
                </div>
                <div>
                  <label class="block text-xs text-neutral-500 mb-1">Dor (0-10)</label>
                  <input v-model="editForm.pain" type="number" min="0" max="10" placeholder="0"
                    class="w-full bg-surface border border-neutral-800 rounded px-2 py-1.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-0 focus:border-primary" />
                </div>
              </div>
              <div>
                <label class="block text-xs text-neutral-500 mb-1">Observações</label>
                <input v-model="editForm.notes" type="text" placeholder="Alguma observação..."
                  class="w-full bg-surface border border-neutral-800 rounded px-2 py-1.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-0 focus:border-primary" />
              </div>
            </div>
            <div v-else-if="selectedWorkout.feedback_effort || selectedWorkout.feedback_energy || selectedWorkout.feedback_notes" class="bg-dark rounded p-3">
              <div class="text-xs font-medium text-neutral-400 mb-2">Seu Feedback</div>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div v-if="selectedWorkout.feedback_effort">
                  <span class="text-neutral-500">Esforço:</span>
                  <span class="text-white ml-1">{{ effortLabel(selectedWorkout.feedback_effort) }}</span>
                </div>
                <div v-if="selectedWorkout.feedback_energy">
                  <span class="text-neutral-500">Energia:</span>
                  <span class="text-white ml-1">{{ selectedWorkout.feedback_energy }}/10</span>
                </div>
                <div v-if="selectedWorkout.feedback_sleep">
                  <span class="text-neutral-500">Sono:</span>
                  <span class="text-white ml-1">{{ selectedWorkout.feedback_sleep }}/10</span>
                </div>
                <div v-if="selectedWorkout.feedback_stress">
                  <span class="text-neutral-500">Estresse:</span>
                  <span class="text-white ml-1">{{ selectedWorkout.feedback_stress }}/10</span>
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

            <!-- Botões Editar/Salvar -->
            <div v-if="editingWorkout" class="flex gap-2">
              <button
                @click="cancelEdit"
                class="flex-1 py-2.5 bg-dark hover:bg-dark/80 rounded text-sm font-medium transition-colors text-neutral-400 border border-neutral-800"
              >
                Cancelar
              </button>
              <button
                @click="saveEdit"
                :disabled="savingEdit"
                class="flex-1 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-50 rounded text-sm font-medium transition-colors"
              >
                {{ savingEdit ? 'Salvando...' : 'Salvar' }}
              </button>
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
const showMenu = ref(false)
const editingWorkout = ref(false)
const savingEdit = ref(false)
const editForm = ref({})

const currentWeek = computed(() => auth.profile?.current_week || 0)

const hasOnboardingData = computed(() => {
  const p = auth.profile
  return p?.run_days?.length > 0 || p?.swim_days?.length > 0
})

const weekWorkouts = computed(() => {
  const week = currentWeek.value
  if (!week) return []
  return workoutStore.workouts
    .filter(w => w.week_number === week)
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

function formatPace(pace, type) {
  if (!pace) return ''
  const min = Math.floor(pace / 60)
  const sec = Math.floor(pace % 60)
  const unit = type === 'swim' ? '/100m' : '/km'
  return `${min}:${sec.toString().padStart(2, '0')}${unit}`
}

function openWorkoutModal(workout) {
  selectedWorkout.value = workout
  aiFeedback.value = null
  showMenu.value = false
  editingWorkout.value = false
}

function closeWorkoutModal() {
  selectedWorkout.value = null
  aiFeedback.value = null
  showMenu.value = false
  editingWorkout.value = false
}

function formatDurationInput(seconds) {
  if (!seconds) return ''
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return sec > 0 ? `${min}:${sec.toString().padStart(2, '0')}` : `${min}`
}

function parseDurationInput(str) {
  if (!str) return null
  const parts = str.split(':')
  if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1])
  return parseInt(parts[0]) * 60
}

function formatPaceInput(pace) {
  if (!pace) return ''
  const min = Math.floor(pace / 60)
  const sec = Math.floor(pace % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

function parsePaceInput(str) {
  if (!str) return null
  const parts = str.split(':')
  if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1])
  return parseInt(parts[0]) * 60
}

function startEdit() {
  const w = selectedWorkout.value
  const isSwim = w.type === 'swim'
  editForm.value = {
    distance: w.actual_distance ? (isSwim ? Math.round(w.actual_distance) : (w.actual_distance / 1000).toFixed(1)) : '',
    duration: formatDurationInput(w.actual_duration),
    pace: formatPaceInput(w.actual_pace),
    heartrate: w.actual_heartrate ? Math.round(w.actual_heartrate) : '',
    strokes: w.actual_strokes || '',
    swolf: w.actual_swolf || '',
    effort: w.feedback_effort || '',
    energy: w.feedback_energy || '',
    sleep: w.feedback_sleep || '',
    stress: w.feedback_stress || '',
    pain: w.feedback_pain ?? '',
    notes: w.feedback_notes || '',
  }
  editingWorkout.value = true
  showMenu.value = false
}

function cancelEdit() {
  editingWorkout.value = false
  editForm.value = {}
}

async function saveEdit() {
  savingEdit.value = true
  try {
    const w = selectedWorkout.value
    const isSwim = w.type === 'swim'
    const distance = editForm.value.distance ? (isSwim ? parseFloat(editForm.value.distance) : parseFloat(editForm.value.distance) * 1000) : null
    const duration = parseDurationInput(editForm.value.duration)
    let pace = parsePaceInput(editForm.value.pace)
    if (!pace && distance && duration) pace = isSwim ? (duration * 100 / distance) : (duration * 1000 / distance)

    await workoutStore.saveWorkoutPerformance(w.id, {
      distance,
      duration,
      pace,
      heartrate: editForm.value.heartrate ? parseFloat(editForm.value.heartrate) : null,
      maxHeartrate: null,
      cadence: null,
      elevation: null,
      calories: null,
      strokes: w.type === 'swim' && editForm.value.strokes ? parseInt(editForm.value.strokes) : null,
      swolf: w.type === 'swim' && editForm.value.swolf ? parseInt(editForm.value.swolf) : null,
      movingTime: duration,
      elapsedTime: duration,
      splits: null,
    })

    await workoutStore.saveWorkoutFeedback(w.id, {
      effort: editForm.value.effort || null,
      pain: editForm.value.pain !== '' ? parseInt(editForm.value.pain) : null,
      energy: editForm.value.energy ? parseInt(editForm.value.energy) : null,
      sleep: editForm.value.sleep ? parseInt(editForm.value.sleep) : null,
      stress: editForm.value.stress ? parseInt(editForm.value.stress) : null,
      notes: editForm.value.notes || null,
    })

    await workoutStore.fetchWorkouts()

    const updated = workoutStore.workouts.find(wo => wo.id === w.id)
    if (updated) selectedWorkout.value = updated

    editingWorkout.value = false
  } catch (e) {
    console.error('Erro ao salvar:', e)
  } finally {
    savingEdit.value = false
  }
}

async function requestFeedback() {
  loadingFeedback.value = true
  try {
    const w = selectedWorkout.value
    const currentWeek = auth.profile?.current_week || 1
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
          elevation: w.actual_elevation || null,
          cadence: w.actual_cadence || null,
        },
        profile: workoutStore.getEnrichedProfile(auth.profile),
        recentWorkouts: workoutStore.getRecentWorkouts(w.type, 8),
        weekStats: (() => {
          const ws = workoutStore.getWeekStats(currentWeek)
          return {
            total: ws.total,
            completed: ws.completed,
            runDistance: ws.runDistance,
            swimDistance: ws.swimDistance,
            avgEffort: ws.avgEffort || null,
            avgPain: ws.avgPain || null,
            avgEnergy: ws.avgEnergy || null,
            avgSleep: ws.avgSleep || null,
            avgStress: ws.avgStress || null,
            totalElevation: ws.totalElevation || 0,
            avgHeartrate: ws.avgHeartrate || null,
            avgMaxHeartrate: ws.avgMaxHeartrate || null,
          }
        })(),
        trends: workoutStore.getTrends(currentWeek),
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
        profile: workoutStore.getEnrichedProfile(auth.profile),
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
          avg_max_heartrate: weekStats.avgMaxHeartrate,
          total_elevation: weekStats.totalElevation,
          avg_cadence: weekStats.avgCadence,
          avg_run_pace: weekStats.avgRunPace,
          avg_swim_pace: weekStats.avgSwimPace,
          avg_swolf: weekStats.avgSwolf,
          total_strokes: weekStats.totalStrokes,
          pain_report: weekStats.painReports.join('; ') || null,
        },
        previousWeeks: workoutStore.getPreviousWeeks(currentWeek.value, 3).map(ws => ({
          total_workouts: ws.total,
          completed_workouts: ws.completed,
          total_run_distance: ws.runDistance,
          avg_run_pace: ws.avgRunPace,
          avg_effort: ws.avgEffort,
          avg_pain: ws.avgPain,
        })),
        trends: workoutStore.getTrends(currentWeek.value),
        recentWorkouts: workoutStore.getRecentWorkouts(null, 12),
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

    const nextWeekNumber = currentWeek.value + 1
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
