<template>
  <div class="min-h-screen flex items-center justify-center bg-dark p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <img src="../assets/Logo.png" alt="AquaRun" class="h-16 w-16 mx-auto rounded object-contain mb-4" />
        <h1 class="text-3xl font-medium text-white">
          AquaRun
        </h1>
        <p class="text-neutral-500 mt-2">Quase lá!</p>
      </div>

      <div class="bg-surface rounded p-8 border border-neutral-800">
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded bg-orange-500/10 mb-4">
            <Icon name="activity" :size="32" class="text-orange-500" />
          </div>
          <h2 class="text-xl font-medium text-white">Conectar com Strava?</h2>
          <p class="text-sm text-neutral-500 mt-2">
            Sincronize automaticamente suas atividades de corrida e natação.
          </p>
        </div>

        <div class="space-y-3 mb-6">
          <div class="flex items-center gap-3 text-sm text-neutral-400">
            <Icon name="check" :size="16" class="text-green-400 flex-shrink-0" />
            <span>Importe atividades automaticamente</span>
          </div>
          <div class="flex items-center gap-3 text-sm text-neutral-400">
            <Icon name="check" :size="16" class="text-green-400 flex-shrink-0" />
            <span>Dados de pace, distância e ritmo cardíaco</span>
          </div>
          <div class="flex items-center gap-3 text-sm text-neutral-400">
            <Icon name="check" :size="16" class="text-green-400 flex-shrink-0" />
            <span>Sem necessidade de registro manual</span>
          </div>
        </div>

        <div class="space-y-3">
          <button
            @click="connectStrava"
            class="w-full py-3 bg-orange-500 hover:bg-orange-600 rounded font-medium transition-colors text-white flex items-center justify-center gap-2"
          >
            <Icon name="activity" :size="18" />
            <span>Conectar com Strava</span>
          </button>

          <button
            @click="skip"
            class="w-full py-3 bg-surface hover:bg-surface-light rounded transition-colors text-neutral-400 text-sm"
          >
            Pular por agora
          </button>
        </div>

        <p class="text-xs text-neutral-600 text-center mt-4">
          Você pode conectar depois em Integrações
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { getStravaAuthUrl } from '../utils/strava'
import Icon from '../components/Icon.vue'

const router = useRouter()

function connectStrava() {
  window.location.href = getStravaAuthUrl()
}

function skip() {
  router.push('/generating-plan')
}
</script>
