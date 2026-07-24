<template>
  <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-neutral-800 z-50 safe-area-bottom">
    <div class="flex items-center justify-around h-16">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors"
        :class="$route.path === item.path ? 'text-primary' : 'text-neutral-500'"
      >
        <Icon :name="item.icon" :size="20" />
        <span class="text-[10px]">{{ item.label }}</span>
      </router-link>
      <button
        @click="showMenu = true"
        class="flex flex-col items-center justify-center gap-1 flex-1 h-full text-neutral-500 transition-colors"
      >
        <Icon name="more-horizontal" :size="20" />
        <span class="text-[10px]">Mais</span>
      </button>
    </div>
  </nav>

  <Teleport to="body">
    <div v-if="showMenu" class="fixed inset-0 z-[100] md:hidden" @click.self="showMenu = false">
      <div class="absolute inset-0 bg-black/60" @click="showMenu = false" />
      <div class="absolute bottom-0 left-0 right-0 bg-surface rounded-t-2xl border-t border-neutral-800 p-4 pb-8 safe-area-bottom">
        <div class="w-10 h-1 bg-neutral-700 rounded-full mx-auto mb-4" />
        <div class="flex items-center gap-3 px-4 py-3 mb-2 bg-dark rounded-lg">
          <div class="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-medium text-neutral-300">
            {{ initials }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-white truncate">{{ userName }}</div>
            <div class="text-xs text-neutral-500 truncate">{{ auth.user?.email }}</div>
          </div>
        </div>
        <div class="space-y-1">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            @click="showMenu = false"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-neutral-400 hover:bg-neutral-800/50 hover:text-white transition-colors"
          >
            <Icon :name="item.icon" :size="18" />
            <span>{{ item.label }}</span>
          </router-link>
          <button
            @click="handleLogout"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors w-full"
          >
            <Icon name="log-out" :size="18" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import Icon from '../Icon.vue'

const router = useRouter()
const auth = useAuthStore()
const showMenu = ref(false)

const navItems = [
  { path: '/', icon: 'home', label: 'Início' },
  { path: '/my-workout', icon: 'award', label: 'Treino' },
  { path: '/coach', icon: 'message-circle', label: 'Coach' },
  { path: '/history', icon: 'clock', label: 'Histórico' },
]

const menuItems = [
  { path: '/integrations', icon: 'link', label: 'Integrações' },
  { path: '/profile', icon: 'user', label: 'Perfil' },
  { path: '/settings', icon: 'settings', label: 'Configurações' },
  { path: '/help', icon: 'help-circle', label: 'Ajuda' },
]

const initials = computed(() => {
  const email = auth.user?.email || ''
  return email.substring(0, 2).toUpperCase()
})

const userName = computed(() => {
  return auth.profile?.full_name || auth.user?.email?.split('@')[0] || 'Usuário'
})

async function handleLogout() {
  showMenu.value = false
  await auth.signOut()
  router.push('/login')
}
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
