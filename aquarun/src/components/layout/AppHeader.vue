<template>
  <header class="h-16 bg-surface/80 backdrop-blur-sm border-b border-neutral-800 flex items-center px-4 lg:px-8 sticky top-0 z-30">
    <button
      @click="$emit('toggleSidebar')"
      class="lg:hidden p-2 text-neutral-400 hover:text-white transition-colors"
    >
      <Icon name="menu" :size="20" />
    </button>
    <h1 class="text-lg font-medium text-white hidden sm:block ml-2">
      {{ pageTitle }}
    </h1>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Icon from '../Icon.vue'

defineEmits(['toggleSidebar'])

const route = useRoute()

const pageTitle = computed(() => {
  const titles = {
    '/': 'Início',
    '/my-workold': 'Meu Treino',
    '/programs': 'Programas de Treino',
    '/history': 'Histórico',
    '/coach': 'Coach IA',
    '/integrations': 'Integrações',
    '/profile': 'Perfil',
    '/settings': 'Configurações',
    '/help': 'Ajuda',
  }
  return titles[route.path] || 'AquaRun'
})
</script>
