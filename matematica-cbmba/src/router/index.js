import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import PracticeView from '../views/PracticeView.vue';
import ReviewView from '../views/ReviewView.vue';
import BankView from '../views/BankView.vue';
import LoginView from '../views/LoginView.vue';
import CadastroView from '../views/CadastroView.vue';
import { useAuthStore } from '../stores/auth.js';

const routes = [
  { path: '/login', name: 'login', component: LoginView, meta: { guest: true } },
  { path: '/cadastro', name: 'cadastro', component: CadastroView, meta: { guest: true } },
  { path: '/', name: 'home', component: HomeView, meta: { auth: true } },
  { path: '/practice', name: 'practice', component: PracticeView, meta: { auth: true } },
  { path: '/review', name: 'review', component: ReviewView, meta: { auth: true } },
  { path: '/banco', name: 'bank', component: BankView, meta: { auth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  if (auth.loading) {
    await new Promise(resolve => {
      const unwatch = auth.$subscribe(() => {
        if (!auth.loading) { unwatch(); resolve(); }
      });
      setTimeout(resolve, 2000);
    });
  }

  if (to.meta.auth && !auth.user) return next('/login');
  if (to.meta.guest && auth.user) return next('/');
  next();
});

export default router;
