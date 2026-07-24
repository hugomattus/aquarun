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
            <div class="relative">
              <input type="checkbox" v-model="notifications.workoutReminder" class="sr-only" />
              <div class="w-10 h-6 bg-neutral-700 rounded-full shadow-inner" :class="notifications.workoutReminder ? 'bg-primary' : ''"></div>
              <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" :class="notifications.workoutReminder ? 'translate-x-4' : ''"></div>
            </div>
          </label>
          <label class="flex items-center justify-between">
            <span class="text-sm text-neutral-400">Atualizações do Coach</span>
            <div class="relative">
              <input type="checkbox" v-model="notifications.coachUpdates" class="sr-only" />
              <div class="w-10 h-6 bg-neutral-700 rounded-full shadow-inner" :class="notifications.coachUpdates ? 'bg-primary' : ''"></div>
              <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" :class="notifications.coachUpdates ? 'translate-x-4' : ''"></div>
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
        <button class="text-sm text-red-400 hover:text-red-300 transition-colors">
          Excluir conta
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const notifications = reactive({
  workoutReminder: true,
  coachUpdates: true,
})

const selectedUnit = ref('km')
const units = [
  { label: 'Quilômetros', value: 'km' },
  { label: 'Milhas', value: 'mi' },
]
</script>
