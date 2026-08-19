<template>
  <div class="space-y-8 max-w-2xl">
    <div>
      <h1 class="text-2xl font-medium text-white">Perfil</h1>
      <p class="text-neutral-500 mt-1">Gerencie suas informações pessoais</p>
    </div>

    <div class="bg-surface rounded p-6 border border-neutral-800">
      <div class="flex items-center gap-4 mb-6">
        <div class="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center text-xl font-medium text-neutral-300">
          {{ initials }}
        </div>
        <div>
          <h3 class="font-medium text-white">{{ userName }}</h3>
          <p class="text-sm text-neutral-500">{{ auth.user?.email }}</p>
        </div>
      </div>

      <form @submit.prevent="updateProfile" class="space-y-4">
        <div>
          <label class="block text-sm text-neutral-500 mb-1">Nome completo</label>
          <input
            v-model="fullName"
            type="text"
            class="w-full px-4 py-3 bg-dark rounded border border-neutral-800 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all text-sm text-white placeholder-neutral-600"
            placeholder="Seu nome"
          />
        </div>

        <div>
          <label class="block text-sm text-neutral-500 mb-1">Email</label>
          <input
            :value="auth.user?.email"
            type="email"
            disabled
            class="w-full px-4 py-3 bg-dark rounded border border-neutral-800 text-neutral-500 text-sm cursor-not-allowed"
          />
        </div>

        <div>
          <label class="block text-sm text-neutral-500 mb-1">FC Máxima (bpm)</label>
          <input
            v-model.number="fcMax"
            type="number"
            min="100"
            max="230"
            class="w-full px-4 py-3 bg-dark rounded border border-neutral-800 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all text-sm text-white placeholder-neutral-600"
            placeholder="Ex: 185"
          />
          <p class="text-xs text-neutral-600 mt-1">Usado para calibrar a intensidade dos seus treinos. Se não souber, deixe vazio.</p>
        </div>

        <div v-if="success" class="text-green-400 text-sm bg-green-500/10 p-3 rounded border border-green-500/20">
          Perfil atualizado com sucesso!
        </div>

        <div v-if="error" class="text-red-400 text-sm bg-red-500/10 p-3 rounded border border-red-500/20">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="px-6 py-3 bg-primary hover:bg-primary-dark rounded font-medium transition-colors disabled:opacity-50 text-sm"
        >
          {{ loading ? 'Salvando...' : 'Salvar alterações' }}
        </button>
      </form>
    </div>

    <div class="bg-surface rounded p-6 border border-neutral-800">
      <h3 class="font-medium text-white mb-2">Plano de Treino</h3>
      <p class="text-sm text-neutral-500 mb-4">
        Apague o plano atual para gerar um novo do zero. Os treinos concluídos serão removidos.
      </p>
      <button
        @click="confirmDelete = true"
        class="px-4 py-2 rounded text-sm text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
      >
        Apagar plano atual
      </button>
      <div v-if="planDeleted" class="mt-4 text-green-400 text-sm bg-green-500/10 p-3 rounded border border-green-500/20">
        Plano apagado! Agora você pode gerar um novo.
      </div>
      <router-link
        v-if="planDeleted"
        to="/generating-plan"
        class="mt-3 inline-block px-4 py-2 rounded bg-primary text-white text-sm font-medium hover:opacity-90"
      >
        Gerar novo plano
      </router-link>
    </div>

    <div v-if="confirmDelete" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/70" @click="confirmDelete = false"></div>
      <div class="relative bg-surface border border-neutral-800 rounded-lg p-6 max-w-sm w-full space-y-4">
        <h3 class="font-medium text-white">Apagar plano de treino?</h3>
        <p class="text-sm text-neutral-400">
          Todos os treinos do plano serão removidos, incluindo os concluídos e seus registros.
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
            @click="deletePlan"
            :disabled="deletingPlan"
            class="px-4 py-2 rounded text-sm font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
          >
            {{ deletingPlan ? 'Apagando...' : 'Apagar tudo' }}
          </button>
        </div>
        <p v-if="deleteError" class="text-xs text-red-400">{{ deleteError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useWorkoutStore } from '../stores/workouts'
import { supabase } from '../utils/supabase'

const auth = useAuthStore()
const workoutStore = useWorkoutStore()
const fullName = ref('')
const fcMax = ref(null)
const loading = ref(false)
const error = ref('')
const success = ref(false)
const confirmDelete = ref(false)
const deletingPlan = ref(false)
const deleteError = ref('')
const planDeleted = ref(false)

const initials = computed(() => {
  const email = auth.user?.email || ''
  return email.substring(0, 2).toUpperCase()
})

const userName = computed(() => {
  return auth.profile?.full_name || auth.user?.email?.split('@')[0] || 'Usuário'
})

onMounted(() => {
  fullName.value = auth.profile?.full_name || ''
  fcMax.value = auth.profile?.fc_max || null
})

async function updateProfile() {
  loading.value = true
  error.value = ''
  success.value = false

  try {
    const { error: err } = await supabase
      .from('profiles')
      .upsert({ id: auth.user.id, full_name: fullName.value, fc_max: fcMax.value || null })

    if (err) throw err
    await auth.fetchProfile()
    success.value = true
    setTimeout(() => success.value = false, 3000)
  } catch (e) {
    error.value = e.message || 'Erro ao atualizar perfil'
  } finally {
    loading.value = false
  }
}

async function deletePlan() {
  deletingPlan.value = true
  deleteError.value = ''
  try {
    const { error: err } = await supabase
      .from('workouts')
      .delete()
      .eq('user_id', auth.user.id)
    if (err) throw err

    const { error: err2 } = await supabase
      .from('week_logs')
      .delete()
      .eq('user_id', auth.user.id)
    if (err2) throw err2

    await auth.updateProfile({ current_week: 0 })
    await workoutStore.fetchWorkouts()
    confirmDelete.value = false
    planDeleted.value = true
  } catch (e) {
    deleteError.value = e.message || 'Erro ao apagar plano'
  } finally {
    deletingPlan.value = false
  }
}
</script>
