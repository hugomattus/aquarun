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
            <div class="relative" @click="handleWorkoutReminderToggle">
              <div class="w-10 h-6 bg-neutral-700 rounded-full shadow-inner cursor-pointer" :class="notifications.workoutReminder ? 'bg-primary' : ''"></div>
              <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform cursor-pointer" :class="notifications.workoutReminder ? 'translate-x-4' : ''"></div>
            </div>
          </label>
          <div v-if="notifications.workoutReminder" class="flex items-center justify-between gap-4">
            <span class="text-sm text-neutral-400">Horário do lembrete</span>
            <select
              v-model="reminderTime"
              class="bg-dark border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
            >
              <option v-for="t in timeOptions" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <p v-if="pushStatusMsg" class="text-xs text-yellow-500">{{ pushStatusMsg }}</p>
          <p v-else-if="notifications.workoutReminder" class="text-xs text-neutral-600">
            Você receberá um lembrete no celular nos dias de treino.
          </p>
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
import { enablePush, disablePush, pushSupported } from '../utils/push'

const auth = useAuthStore()
const router = useRouter()

const notifications = reactive({
  workoutReminder: true,
  coachUpdates: true,
})

const reminderTime = ref('07:00')
const pushStatusMsg = ref('')
const timeOptions = [
  '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
]

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
  reminderTime.value = settings.notifications?.reminderTime || '07:00'
  selectedUnit.value = settings.units === 'mi' ? 'mi' : 'km'
  setUnitSystem(selectedUnit.value)
  if (!pushSupported()) {
    pushStatusMsg.value = 'Notificações não suportadas neste navegador. Instale o app pelo celular (Chrome no Android ou Safari no iPhone).'
  }
})

async function handleWorkoutReminderToggle() {
  const togglingOn = !notifications.workoutReminder
  notifications.workoutReminder = togglingOn
  pushStatusMsg.value = ''

  if (togglingOn) {
    if (!pushSupported()) {
      pushStatusMsg.value = 'Notificações não suportadas neste navegador. Instale o app pelo celular.'
      return
    }
    const res = await enablePush(auth.user.id)
    if (!res.ok) {
      if (res.reason === 'denied') {
        pushStatusMsg.value = 'Permissão bloqueada no navegador. Ative em Configurações do navegador e tente de novo.'
      } else if (res.reason === 'missing-key') {
        pushStatusMsg.value = 'Notificações não configuradas ainda. Tente novamente em instantes.'
      } else {
        pushStatusMsg.value = 'Não foi possível ativar as notificações. Tente novamente.'
      }
    }
  } else {
    await disablePush()
    await supabase.from('push_subscriptions').delete().eq('user_id', auth.user.id)
  }
}

async function save() {
  saving.value = true
  try {
    const settings = {
      ...(auth.profile?.settings || {}),
      notifications: {
        ...notifications,
        reminderTime: reminderTime.value,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
      },
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