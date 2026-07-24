<template>
  <div id="app">
    <template v-if="!isAuthPage">
      <aside class="sidebar">
        <div class="sidebar-brand">Matematica CBMBA</div>
        <nav class="sidebar-nav">
          <router-link to="/" class="sidebar-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Inicio
          </router-link>
          <router-link to="/banco" class="sidebar-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            Banco de Questoes
          </router-link>
          <router-link to="/review" class="sidebar-link" v-if="store.mistakes.length > 0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Revisar Erros
            <span class="sidebar-badge">{{ store.mistakes.length }}</span>
          </router-link>
        </nav>

        <div class="sidebar-bottom">
          <div class="sidebar-user" @click.stop="showMenu = !showMenu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span class="sidebar-user-name">{{ userName }}</span>
            <button class="sidebar-dots" @click.stop="showMenu = !showMenu">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
            </button>
          </div>
          <div v-if="showMenu" class="sidebar-menu">
            <button class="sidebar-menu-item" @click="handleLogout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sair
            </button>
          </div>
        </div>
      </aside>
    </template>
    <main :class="isAuthPage ? 'main-content-no-sidebar' : 'main-content'">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePracticeStore } from './stores/practice.js';
import { useAuthStore } from './stores/auth.js';

const store = usePracticeStore();
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const isAuthPage = computed(() => route.meta.guest);
const userName = computed(() => auth.profile?.display_name || auth.user?.email || '');
const showMenu = ref(false);

function handleClickOutside() {
  showMenu.value = false;
}

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));

async function handleLogout() {
  showMenu.value = false;
  await auth.signOut();
  router.push('/login');
}
</script>
