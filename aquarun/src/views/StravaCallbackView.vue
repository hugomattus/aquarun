<template>
  <div class="min-h-screen flex items-center justify-center bg-dark">
    <div class="text-center">
      <div v-if="loading" class="animate-pulse">
        <Icon name="loader" :size="48" class="mx-auto text-primary animate-spin" />
        <p class="mt-4 text-neutral-500">Conectando com Strava...</p>
      </div>
      <div v-else-if="error">
        <Icon name="x-circle" :size="48" class="mx-auto text-red-400" />
        <p class="mt-4 text-red-400">{{ error }}</p>
        <router-link to="/integrations" class="mt-4 inline-flex items-center gap-2 text-primary hover:underline">
          <Icon name="arrow-left" :size="16" />
          <span>Voltar</span>
        </router-link>
      </div>
      <div v-else>
        <Icon name="check-circle" :size="48" class="mx-auto text-green-400" />
        <p class="mt-4 text-green-400">Strava conectado!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStravaStore } from '../stores/strava'
import { useAuthStore } from '../stores/auth'
import { exchangeToken } from '../utils/strava'
import Icon from '../components/Icon.vue'

const router = useRouter()
const route = useRoute()
const strava = useStravaStore()
const auth = useAuthStore()

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  if (!auth.user) {
    error.value = 'Você precisa estar logado para conectar o Strava'
    loading.value = false
    return
  }

  const code = route.query.code

  if (!code) {
    error.value = 'Código de autorização não encontrado'
    loading.value = false
    return
  }

  try {
    const tokenData = await exchangeToken(code)

    if (tokenData.error || tokenData.errors) {
      error.value = tokenData.error || 'Erro ao autorizar com Strava'
      loading.value = false
      return
    }

    await strava.saveTokens(tokenData)
    await strava.fetchActivities()
    await strava.syncActivities()

    loading.value = false
    const isNewUser = !auth.profile?.onboarding_completed
    setTimeout(() => {
      router.push(isNewUser ? '/generating-plan' : '/integrations')
    }, 1500)
  } catch (e) {
    error.value = `Erro ao conectar: ${e.message}`
    loading.value = false
  }
})
</script>
