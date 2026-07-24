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
        <!-- Forgot Password Mode -->
        <template v-if="mode === 'forgot'">
          <h2 class="text-xl font-medium text-white mb-1">Recuperar senha</h2>
          <p class="text-sm text-neutral-500 mb-6">Informe seu email para receber o link de redefinição.</p>

          <form @submit.prevent="handleForgotPassword" class="space-y-4">
            <div>
              <input
                v-model="resetEmail"
                type="email"
                required
                class="w-full px-4 py-3 bg-dark rounded border border-neutral-800 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all text-sm text-white placeholder-neutral-600"
                placeholder="Email"
              />
            </div>

            <div v-if="error" class="text-red-400 text-sm bg-red-500/10 p-3 rounded border border-red-500/20">
              {{ error }}
            </div>

            <div v-if="success" class="text-green-400 text-sm bg-green-500/10 p-3 rounded border border-green-500/20">
              {{ success }}
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-3 bg-primary hover:bg-primary-dark rounded font-medium transition-colors disabled:opacity-50 text-sm"
            >
              {{ loading ? 'Enviando...' : 'Enviar link de redefinição' }}
            </button>
          </form>

          <div class="mt-6 text-center text-sm text-neutral-500">
            Lembrou a senha?
            <button
              @click="mode = 'login'"
              class="text-primary hover:underline ml-1"
            >
              Voltar ao login
            </button>
          </div>
        </template>

        <!-- Login / Register Mode -->
        <template v-else>
          <h2 class="text-xl font-medium text-white mb-1">Bem-vindo ao AquaRun</h2>
          <p class="text-sm text-neutral-500 mb-6">Sua assessoria inteligente continua aqui.</p>

          <div class="flex bg-dark rounded p-1 mb-6">
            <button
              @click="mode = 'login'"
              class="flex-1 py-2 text-sm font-medium rounded transition-colors"
              :class="mode === 'login' ? 'bg-surface text-white shadow-sm' : 'text-neutral-500 hover:text-white'"
            >
              Entrar
            </button>
            <button
              @click="mode = 'register'"
              class="flex-1 py-2 text-sm font-medium rounded transition-colors"
              :class="mode === 'register' ? 'bg-surface text-white shadow-sm' : 'text-neutral-500 hover:text-white'"
            >
              Cadastrar
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <input
                v-model="email"
                type="email"
                required
                class="w-full px-4 py-3 bg-dark rounded border border-neutral-800 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all text-sm text-white placeholder-neutral-600"
                placeholder="Email"
              />
            </div>

            <div>
              <input
                v-model="password"
                type="password"
                required
                :minlength="mode === 'register' ? 6 : undefined"
                class="w-full px-4 py-3 bg-dark rounded border border-neutral-800 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all text-sm text-white placeholder-neutral-600"
                placeholder="Senha"
              />
            </div>

            <div v-if="mode === 'login'" class="flex justify-end">
              <button
                type="button"
                @click="mode = 'forgot'"
                class="text-xs text-neutral-500 hover:text-primary transition-colors"
              >
                Esqueceu sua senha?
              </button>
            </div>

            <div v-if="error" class="text-red-400 text-sm bg-red-500/10 p-3 rounded border border-red-500/20">
              {{ error }}
            </div>

            <div v-if="success" class="text-green-400 text-sm bg-green-500/10 p-3 rounded border border-green-500/20">
              {{ success }}
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-3 bg-primary hover:bg-primary-dark rounded font-medium transition-colors disabled:opacity-50 text-sm"
            >
              {{ loading ? 'Carregando...' : (mode === 'login' ? 'Entrar' : 'Criar conta') }}
            </button>
          </form>

          <div class="mt-6 text-center text-sm text-neutral-500">
            {{ mode === 'login' ? 'Não tem conta?' : 'Já tem conta?' }}
            <button
              @click="mode = mode === 'login' ? 'register' : 'login'"
              class="text-primary hover:underline ml-1"
            >
              {{ mode === 'login' ? 'Cadastre-se' : 'Entrar' }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const mode = ref('login')
const email = ref('')
const password = ref('')
const resetEmail = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

watch(mode, () => {
  error.value = ''
  success.value = ''
})

async function handleSubmit() {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    if (mode.value === 'login') {
      await auth.signIn(email.value, password.value)
      router.push('/')
    } else {
      await auth.signUp(email.value, password.value)
      success.value = 'Conta criada!'
      setTimeout(() => router.push('/onboarding'), 1000)
    }
  } catch (e) {
    error.value = e.message || 'Erro ao processar'
  } finally {
    loading.value = false
  }
}

async function handleForgotPassword() {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    await auth.resetPassword(resetEmail.value)
    success.value = 'Email enviado! Verifique sua caixa de entrada.'
  } catch (e) {
    error.value = e.message || 'Erro ao enviar email'
  } finally {
    loading.value = false
  }
}
</script>
