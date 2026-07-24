<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">Matematica CBMBA</div>
      <h2 class="auth-title">Entrar</h2>
      <p class="auth-subtitle">Acesse sua conta para continuar</p>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="auth-field">
          <label class="auth-label">Email</label>
          <input type="email" v-model="email" class="auth-input" placeholder="seu@email.com" required />
        </div>
        <div class="auth-field">
          <label class="auth-label">Senha</label>
          <input type="password" v-model="password" class="auth-input" placeholder="Sua senha" required />
        </div>

        <div v-if="errorMsg" class="auth-error">{{ errorMsg }}</div>

        <button type="submit" class="btn btn-primary btn-lg auth-btn" :disabled="submitting">
          {{ submitting ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <div class="auth-footer">
        Nao tem conta?
        <router-link to="/cadastro" class="auth-link">Criar conta</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const router = useRouter();
const auth = useAuthStore();

const email = ref('');
const password = ref('');
const errorMsg = ref('');
const submitting = ref(false);

async function handleLogin() {
  errorMsg.value = '';
  submitting.value = true;
  try {
    await auth.signIn(email.value, password.value);
    router.push('/');
  } catch (e) {
    errorMsg.value = e.message === 'Invalid login credentials'
      ? 'Email ou senha incorretos'
      : 'Erro ao fazer login. Tente novamente.';
  } finally {
    submitting.value = false;
  }
}
</script>
