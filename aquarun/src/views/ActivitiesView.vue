<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-medium text-white">Atividades</h1>
        <p class="text-neutral-500 mt-1">Histórico de corridas e natações</p>
      </div>
      <button
        v-if="strava.connected"
        @click="syncAll"
        :disabled="syncing"
        class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark rounded text-sm font-medium transition-colors disabled:opacity-50"
      >
        <Icon name="refresh-cw" :size="16" :class="syncing ? 'animate-spin' : ''" />
        <span>{{ syncing ? 'Sincronizando...' : 'Sincronizar Strava' }}</span>
      </button>
    </div>

    <div class="flex gap-2">
      <button
        v-for="filter in filters"
        :key="filter.value"
        @click="activeFilter = filter.value"
        class="flex items-center gap-2 px-4 py-2 rounded text-sm transition-colors"
        :class="activeFilter === filter.value
          ? 'bg-primary text-white'
          : 'bg-surface text-neutral-400 hover:bg-surface-light'"
      >
        <Icon :name="filter.icon" :size="16" />
        <span>{{ filter.label }}</span>
      </button>
    </div>

    <div v-if="!strava.connected" class="bg-surface rounded p-12 border border-neutral-800 text-center">
      <Icon name="link" :size="48" class="mx-auto text-neutral-600 mb-4" />
      <h3 class="text-xl font-medium text-white mt-4">Conecte o Strava</h3>
      <p class="text-neutral-500 mt-2 max-w-md mx-auto">
        Para ver suas atividades, conecte sua conta do Strava.
      </p>
      <button
        @click="connectStrava"
        class="mt-6 flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark rounded font-medium transition-colors mx-auto"
      >
        <Icon name="link" :size="18" />
        <span>Conectar Strava</span>
      </button>
    </div>

    <div v-else-if="filteredActivities.length === 0" class="bg-surface rounded p-12 border border-neutral-800 text-center">
      <Icon name="list" :size="48" class="mx-auto text-neutral-600 mb-4" />
      <h3 class="text-xl font-medium text-white mt-4">Nenhuma atividade encontrada</h3>
      <p class="text-neutral-500 mt-2">
        {{ strava.loading ? 'Carregando atividades...' : 'Atividades aparecerão aqui após sincronizar com o Strava' }}
      </p>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="activity in filteredActivities"
        :key="activity.id"
        class="bg-surface rounded p-5 border border-neutral-800 flex items-center gap-5 hover:border-neutral-700 transition-colors"
      >
        <div
          class="w-12 h-12 rounded flex items-center justify-center flex-shrink-0"
          :class="activity.type === 'swim' ? 'bg-neutral-800' : 'bg-primary/10'"
        >
          <Icon :name="activity.type === 'swim' ? 'droplet' : 'activity'" :size="24" :class="activity.type === 'swim' ? 'text-neutral-400' : 'text-primary'" />
        </div>

        <div class="flex-1 min-w-0">
          <div class="font-medium text-white">{{ activity.name }}</div>
          <div class="text-sm text-neutral-500 mt-1">
            {{ formatDate(activity.start_date) }}
          </div>
        </div>

        <div class="hidden sm:flex gap-6 text-sm">
          <div class="text-center">
            <div class="font-medium text-white">{{ formatDistance(activity.distance) }}</div>
            <div class="text-neutral-600 text-xs">Distância</div>
          </div>
          <div class="text-center">
            <div class="font-medium text-white">{{ formatDuration(activity.moving_time) }}</div>
            <div class="text-neutral-600 text-xs">Tempo</div>
          </div>
          <div class="text-center">
            <div class="font-medium text-white">{{ formatPace(activity.average_speed) }}</div>
            <div class="text-neutral-600 text-xs">Ritmo</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStravaStore } from '../stores/strava'
import { formatDistance, formatDuration, formatPace, formatDate } from '../utils/formatters'
import { getStravaAuthUrl } from '../utils/strava'
import Icon from '../components/Icon.vue'

const strava = useStravaStore()
const syncing = ref(false)
const activeFilter = ref('all')

const filters = [
  { label: 'Todas', value: 'all', icon: 'layers' },
  { label: 'Corrida', value: 'run', icon: 'activity' },
  { label: 'Natação', value: 'swim', icon: 'droplet' },
]

const filteredActivities = computed(() => {
  if (activeFilter.value === 'all') return strava.activities
  if (activeFilter.value === 'run') return strava.runActivities
  return strava.swimActivities
})

function connectStrava() {
  window.location.href = getStravaAuthUrl()
}

async function syncAll() {
  syncing.value = true
  await strava.fetchActivities()
  await strava.syncActivities()
  syncing.value = false
}

onMounted(async () => {
  await strava.checkConnection()
  if (strava.connected) {
    await strava.fetchActivities()
  }
})
</script>
