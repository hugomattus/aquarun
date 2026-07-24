<template>
  <header class="h-14 md:h-16 bg-surface/80 backdrop-blur-sm border-b border-neutral-800 flex items-center px-4 lg:px-8 sticky top-0 z-30">
    <h1 class="text-lg font-medium text-white">
      {{ pageTitle }}
    </h1>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageTitle = computed(() => {
  const titles = {
    '/': 'Início',
    '/my-workout': 'Meu Treino',
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
