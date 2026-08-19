<template>
  <div class="space-y-8 max-w-2xl">
    <div>
      <h1 class="text-2xl font-medium text-white">Configurações</h1>
      <p class="text-neutral-500 mt-1">Personalize sua experiência</p>
    </div>

    <div class="bg-surface rounded p-6 border border-neutral-800 space-y-6">
      <div>
        <h3 class="font-medium text-white mb-4">Notificações</h3>
        <div class="space-y-3">
          <label class="flex items-center justify-between">
            <span class="text-sm text-neutral-400">Lembretes de treino</span>
            <div class="relative" @click="notifications.workoutReminder = !notifications.workoutReminder">
              <div class="w-10 h-6 bg-neutral-700 rounded-full shadow-inner cursor-pointer" :class="notifications.workoutReminder ? 'bg-primary' : ''"></div>
              <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform cursor-pointer" :class="notifications.workoutReminder ? 'translate-x-4' : ''"></div>
            </div>
          </label>
          <label class="flex items-center justify-between">
            <span class="text-sm text-neutral-400">Atualizações do Coach</span>
            <div class="relative" @click="notifications.coachUpdates = !notifications.coachUpdates">
              <div class="w-10 h-6 bg-neutral-700 rounded-full shadow-inner cursor-pointer" :class="notifications.coachUpdates ? 'bg-primary' : ''"></div>
              <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform cursor-pointer" :class="notifications.coachUpdates ? 'translate-x-4' : ''"></div>
            </div>
          </label>
        </div>
      </div>

      <div class="border-t border-neutral-800 pt-6">
        <h3 class="font-medium text-white mb-4">Unidades</h3>
        <div class="flex gap-2">
          <button
            v-for="unit in units"
            :key="unit.value"
            @click="selectedUnit = unit.value"
            class="px-4 py-2 rounded text-sm transition-colors"
            :class="selectedUnit === unit.value
              ? 'bg-primary text-white'
              : 'bg-dark text-neutral-400 hover:bg-neutral-800'"
          >
            {{ unit.label }}
          </button>
        </div>
      </div>

      <div class="border-t border-neutral-800 pt-6">
        <h3 class="font-medium text-white mb-4">Conta</h3>
        <button
          @click="confirmDelete = true"
          class="text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          Excluir minha conta
        </button>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="save"
          :disabled="saving"
          class="px-4 py-2 rounded bg-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {{ saving ? 'Salvando...' : 'Salvar' }}
        </button>
        <span v-if="savedMsg" class="text-xs text-green-400">Configurações salvas!</span>
      </div>
    </div>

    <div v-if="confirmDelete" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/70" @click="confirmDelete = false"></div>
      <div class="relative bg-surface border border-neutral-800 rounded-lg p-6 max-w-sm w-full space-y-4">
        <h3 class="font-medium text-white">Excluir conta?</h3>
        <p class="text-sm text-neutral-400">
          Isso remove permanentemente todos os seus treinos, atividades e dados de perfil.
          Essa ação não pode ser desfeita.
        </p>
        <div class="flex justify-end gap-3">
          <button
            @click="confirmDelete = false"
            class="px-4 py-2 rounded text-sm text-neutral-300 hover:bg-neutral-800"
          >
            Cancelar
          </button>
          <button
            @click="deleteData"
            :disabled="deleting"
            class="px-4 py-2 rounded text-sm font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
          >
            {{ deleting ? 'Excluindo...' : 'Excluir tudo' }}
          </button>
        </div>
        <p v-if="deleteError" class="text-xs text-red-400">{{ deleteError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../utils/supabase'
import { setUnitSystem } from '../utils/formatters'

const auth = useAuthStore()
const router = useRouter()

const notifications = reactive({
  workoutReminder: true,
  coachUpdates: true,
})

const selectedUnit = ref('km')
const units = [
  { label: 'Quilômetros', value: 'km' },
  { label: 'Milhas', value: 'mi' },
]

const saving = ref(false)
const savedMsg = ref(false)
const confirmDelete = ref(false)
const deleting = ref(false)
const deleteError = ref('')

onMounted(() => {
  const settings = auth.profile?.settings || {}
  notifications.workoutReminder = settings.notifications?.workoutReminder ?? true
  notifications.coachUpdates = settings.notifications?.coachUpdates ?? true
  selectedUnit.value = settings.units === 'mi' ? 'mi' : 'km'
  setUnitSystem(selectedUnit.value)
})

async function save() {
  saving.value = true
  try {
    const settings = {
      ...(auth.profile?.settings || {}),
      notifications: { ...notifications },
      units: selectedUnit.value,
    }
    const { error } = await supabase
      .from('profiles')
      .update({ settings })
      .eq('id', auth.user.id)
    if (error) throw error
    setUnitSystem(selectedUnit.value)
    savedMsg.value = true
    setTimeout(() => (savedMsg.value = false), 2000)
  } finally {
    saving.value = false
  }
}

async function deleteData() {
  deleting.value = true
  deleteError.value = ''
  const { error } = await supabase.rpc('delete_my_data')
  if (error) {
    deleteError.value = 'Não foi possível excluir os dados. Tente novamente.'
    deleting.value = false
    return
  }
  await supabase.auth.signOut()
  router.push('/login')
}
</script>