<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-2xl font-medium text-white">Integrações</h1>
      <p class="text-neutral-500 mt-1">Conecte seus apps e serviços favoritos</p>
    </div>

    <div class="space-y-4">
      <div class="bg-surface rounded p-6 border border-neutral-800">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded flex items-center justify-center bg-orange-500/10">
              <Icon name="activity" :size="24" class="text-orange-500" />
            </div>
            <div>
              <h3 class="font-medium text-white">Strava</h3>
              <p class="text-sm text-neutral-500">Sincronize suas atividades automaticamente</p>
            </div>
          </div>
          <div v-if="strava.connected" class="flex items-center gap-2">
            <div class="w-2 h-2 bg-green-400 rounded-full"></div>
            <span class="text-sm text-green-400">Conectado</span>
          </div>
          <button
            v-else
            @click="connectStrava"
            class="px-4 py-2 bg-primary hover:bg-primary-dark rounded text-sm font-medium transition-colors"
          >
            Conectar
          </button>
        </div>
      </div>

      <div class="bg-surface rounded p-6 border border-neutral-800 opacity-50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded flex items-center justify-center bg-blue-500/10">
              <Icon name="watch" :size="24" class="text-blue-400" />
            </div>
            <div>
              <h3 class="font-medium text-white">Garmin Connect</h3>
              <p class="text-sm text-neutral-500">Em breve</p>
            </div>
          </div>
          <span class="px-3 py-1 bg-neutral-800 text-neutral-500 rounded text-sm">
            Em breve
          </span>
        </div>
      </div>

      <div class="bg-surface rounded p-6 border border-neutral-800 opacity-50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded flex items-center justify-center bg-green-500/10">
              <Icon name="smartphone" :size="24" class="text-green-400" />
            </div>
            <div>
              <h3 class="font-medium text-white">Apple Health</h3>
              <p class="text-sm text-neutral-500">Em breve</p>
            </div>
          </div>
          <span class="px-3 py-1 bg-neutral-800 text-neutral-500 rounded text-sm">
            Em breve
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useStravaStore } from '../stores/strava'
import { getStravaAuthUrl } from '../utils/strava'
import Icon from '../components/Icon.vue'

const strava = useStravaStore()

function connectStrava() {
  window.location.href = getStravaAuthUrl()
}

onMounted(() => strava.checkConnection())
</script>
