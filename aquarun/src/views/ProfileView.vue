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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const fullName = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const initials = computed(() => {
  const email = auth.user?.email || ''
  return email.substring(0, 2).toUpperCase()
})

const userName = computed(() => {
  return auth.profile?.full_name || auth.user?.email?.split('@')[0] || 'Usuário'
})

onMounted(() => {
  fullName.value = auth.profile?.full_name || ''
})

async function updateProfile() {
  loading.value = true
  error.value = ''
  success.value = false

  try {
    const { error: err } = await auth.supabase
      .from('profiles')
      .upsert({ id: auth.user.id, full_name: fullName.value })

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
</script>
