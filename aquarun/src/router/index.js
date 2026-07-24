import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { guest: true }
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: () => import('../views/OnboardingView.vue'),
    meta: { auth: true }
  },
  {
    path: '/strava-connect',
    name: 'StravaConnect',
    component: () => import('../views/StravaConnectView.vue'),
    meta: { auth: true, requiresOnboarding: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { auth: true, requiresOnboarding: true }
  },
  {
    path: '/my-workout',
    name: 'MyWorkout',
    component: () => import('../views/MyWorkoutView.vue'),
    meta: { auth: true, requiresOnboarding: true }
  },
  {
    path: '/workout/:id',
    name: 'WorkoutComplete',
    component: () => import('../views/WorkoutCompleteView.vue'),
    meta: { auth: true, requiresOnboarding: true }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/HistoryView.vue'),
    meta: { auth: true, requiresOnboarding: true }
  },
  {
    path: '/coach',
    name: 'Coach',
    component: () => import('../views/CoachView.vue'),
    meta: { auth: true, requiresOnboarding: true }
  },
  {
    path: '/integrations',
    name: 'Integrations',
    component: () => import('../views/IntegrationsView.vue'),
    meta: { auth: true, requiresOnboarding: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { auth: true, requiresOnboarding: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsView.vue'),
    meta: { auth: true, requiresOnboarding: true }
  },
  {
    path: '/help',
    name: 'Help',
    component: () => import('../views/HelpView.vue'),
    meta: { auth: true, requiresOnboarding: true }
  },
  {
    path: '/strava/callback',
    name: 'StravaCallback',
    component: () => import('../views/StravaCallbackView.vue'),
  },
  {
    path: '/generating-plan',
    name: 'GeneratingPlan',
    component: () => import('../views/GeneratingPlanView.vue'),
    meta: { auth: true, requiresOnboarding: true },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('../views/ResetPasswordView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

let authInitialized = false

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!authInitialized && auth.loading) {
    await new Promise(resolve => {
      const unwatch = auth.$subscribe(() => {
        if (!auth.loading) {
          unwatch()
          resolve()
        }
      })
      if (!auth.loading) {
        unwatch()
        resolve()
      }
    })
  }
  authInitialized = true

  if (to.meta.auth && !auth.user) {
    return '/login'
  } else if (to.meta.guest && auth.user) {
    return '/'
  }

  if (to.meta.requiresOnboarding && auth.user) {
    if (!auth.profile || !auth.profile.onboarding_completed) {
      return '/onboarding'
    }
  }

  if (to.name === 'Onboarding' && auth.profile?.onboarding_completed) {
    return '/'
  }
})

export default router
