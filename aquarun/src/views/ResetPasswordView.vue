<template>
  <div class="min-h-screen flex items-center justify-center bg-dark p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <img src="../assets/Logo.png" alt="AquaRun" class="h-16 w-16 mx-auto rounded-2xl object-contain mb-4" />
        <h1 class="text-3xl font-medium text-white">
          AquaRun
        </h1>
        <p class="text-neutral-500 mt-2">Seu melhor. Todos os dias.</p>
      </div>

      <div class="bg-surface rounded p-8 border border-neutral-800">
        <template v-if="!success">
          <h2 class="text-xl font-medium text-white mb-1">Nova senha</h2>
          <p class="text-sm text-neutral-500 mb-6">Digite sua nova senha abaixo.</p>

          <form @submit.prevent="handleResetPassword" class="space-y-4">
            <div>
              <input
                v-model="newPassword"
                type="password"
                required
                minlength="6"
                class="w-full px-4 py-3 bg-dark rounded border border-neutral-800 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all text-sm text-white placeholder-neutral-600"
                placeholder="Nova senha"
              />
            </div>

            <div>
              <input
                v-model="confirmPassword"
                type="password"
                required
                minlength="6"
                class="w-full px-4 py-3 bg-dark rounded border border-neutral-800 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all text-sm text-white placeholder-neutral-600"
                placeholder="Confirmar senha"
              />
            </div>

            <div v-if="error" class="text-red-400 text-sm bg-red-500/10 p-3 rounded border border-red-500/20">
              {{ error }}
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-3 bg-primary hover:bg-primary-dark rounded font-medium transition-colors disabled:opacity-50 text-sm"
            >
              {{ loading ? 'Salvando...' : 'Salvar nova senha' }}
            </button>
          </form>
        </template>

        <template v-else>
          <div class="text-center py-4">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
              <svg class="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="text-xl font-medium text-white">Senha atualizada!</h3>
            <p class="text-neutral-500 mt-2">Redirecionando para o login...</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref(false)
const loading = ref(false)

onMounted(() => {
  const hash = route.hash
  if (!hash || !hash.includes('access_token')) {
    router.replace('/login')
  }
})

async function handleResetPassword() {
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'As senhas não coincidem.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await auth.updatePassword(newPassword.value)
    success.value = true
    setTimeout(() => router.push('/login'), 2000)
  } catch (e) {
    error.value = e.message || 'Erro ao atualizar senha'
  } finally {
    loading.value = false
  }
}
</script>
