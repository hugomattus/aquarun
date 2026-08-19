<template>
  <div v-if="auth.loading" class="min-h-screen flex items-center justify-center bg-dark">
    <div class="text-center">
      <img src="./assets/Logo.png" alt="AquaRun" class="h-12 w-12 mx-auto rounded-xl object-contain mb-4 animate-pulse" />
      <div class="animate-pulse text-neutral-500">Carregando...</div>
    </div>
  </div>

  <div v-else-if="showLayout" class="min-h-screen flex bg-dark">
    <AppSidebar />
    <main class="flex-1 lg:ml-64">
      <AppHeader />
      <div class="p-4 lg:p-8 pb-24 md:pb-8">
        <router-view />
      </div>
    </main>
    <AppBottomNav />
  </div>

  <router-view v-else />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useWorkoutStore } from './stores/workouts'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppBottomNav from './components/layout/AppBottomNav.vue'
import AppHeader from './components/layout/AppHeader.vue'

const route = useRoute()
const auth = useAuthStore()
const workoutStore = useWorkoutStore()

const standaloneRoutes = ['/onboarding', '/strava-connect', '/generating-plan', '/login', '/reset-password']

const showLayout = computed(() => {
  if (!auth.user) return false
  if (!auth.profile?.onboarding_completed) return false
  if (standaloneRoutes.includes(route.path)) return false
  return true
})

onMounted(async () => {
  await auth.init()
  if (auth.user && auth.profile?.onboarding_completed) {
    await workoutStore.fetchWorkouts()
    await workoutStore.markMissedWorkouts()
    await workoutStore.syncCurrentWeek()
  }
})
</script>
