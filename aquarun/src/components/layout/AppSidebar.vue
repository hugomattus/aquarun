<template>
  <aside class="fixed left-0 top-0 h-full w-64 bg-surface border-r border-neutral-800 z-40 flex flex-col">
    <div class="p-6 border-b border-neutral-800">
      <router-link to="/" class="flex items-center gap-3">
        <img src="../../assets/Logo.png" alt="AquaRun" class="h-8 w-8 rounded object-contain" />
        <span class="text-xl font-medium text-white">
          AquaRun
        </span>
      </router-link>
    </div>

    <nav class="flex-1 p-4 space-y-1">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-4 py-3 rounded text-sm transition-colors"
        :class="$route.path === item.path
          ? 'bg-primary text-white'
          : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white'"
      >
        <Icon :name="item.icon" :size="20" />
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="p-4 border-t border-neutral-800">
      <div class="relative">
        <button
          @click="showMenu = !showMenu"
          class="flex items-center gap-3 px-4 py-3 rounded text-sm text-neutral-400 hover:bg-neutral-800/50 hover:text-white transition-colors w-full"
        >
          <div class="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-medium text-neutral-300 flex-shrink-0">
            {{ initials }}
          </div>
          <div class="flex-1 text-left min-w-0">
            <div class="text-white truncate">{{ userName }}</div>
            <div class="text-xs text-neutral-500 truncate">{{ auth.user?.email }}</div>
          </div>
          <Icon name="more-vertical" :size="16" />
        </button>

        <div
          v-if="showMenu"
          class="absolute bottom-full left-0 right-0 mb-2 bg-surface border border-neutral-800 rounded shadow-lg overflow-hidden"
        >
          <router-link
            to="/profile"
            @click="showMenu = false"
            class="flex items-center gap-3 px-4 py-3 text-sm text-neutral-400 hover:bg-neutral-800/50 hover:text-white transition-colors"
          >
            <Icon name="user" :size="16" />
            <span>Perfil</span>
          </router-link>
          <router-link
            to="/settings"
            @click="showMenu = false"
            class="flex items-center gap-3 px-4 py-3 text-sm text-neutral-400 hover:bg-neutral-800/50 hover:text-white transition-colors"
          >
            <Icon name="settings" :size="16" />
            <span>Configurações</span>
          </router-link>
          <router-link
            to="/help"
            @click="showMenu = false"
            class="flex items-center gap-3 px-4 py-3 text-sm text-neutral-400 hover:bg-neutral-800/50 hover:text-white transition-colors"
          >
            <Icon name="help-circle" :size="16" />
            <span>Ajuda</span>
          </router-link>
          <div class="border-t border-neutral-800"></div>
          <button
            @click="handleLogout"
            class="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors w-full"
          >
            <Icon name="log-out" :size="16" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import Icon from '../Icon.vue'

const router = useRouter()
const auth = useAuthStore()
const showMenu = ref(false)

const navItems = [
  { path: '/', icon: 'home', label: 'Início' },
  { path: '/my-workout', icon: 'award', label: 'Meu Treino' },
  { path: '/history', icon: 'clock', label: 'Histórico' },
  { path: '/coach', icon: 'message-circle', label: 'Coach IA' },
  { path: '/integrations', icon: 'link', label: 'Integrações' },
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

function handleClickOutside(e) {
  if (showMenu.value && !e.target.closest('.relative')) {
    showMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>
