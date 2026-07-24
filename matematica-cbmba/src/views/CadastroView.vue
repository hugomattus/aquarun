<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">Matematica CBMBA</div>
      <h2 class="auth-title">Criar conta</h2>
      <p class="auth-subtitle">Comece a estudar para o concurso</p>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="auth-field">
          <label class="auth-label">Nome</label>
          <input type="text" v-model="displayName" class="auth-input" placeholder="Seu nome" required />
        </div>
        <div class="auth-field">
          <label class="auth-label">Email</label>
          <input type="email" v-model="email" class="auth-input" placeholder="seu@email.com" required />
        </div>
        <div class="auth-field">
          <label class="auth-label">Senha</label>
          <input type="password" v-model="password" class="auth-input" placeholder="Minimo 6 caracteres" minlength="6" required />
        </div>
        <div class="auth-field">
          <label class="auth-label">Confirmar senha</label>
          <input type="password" v-model="confirmPassword" class="auth-input" placeholder="Repita a senha" required />
        </div>

        <div v-if="errorMsg" class="auth-error">{{ errorMsg }}</div>
        <div v-if="successMsg" class="auth-success">{{ successMsg }}</div>

        <button type="submit" class="btn btn-primary btn-lg auth-btn" :disabled="submitting">
          {{ submitting ? 'Criando...' : 'Criar conta' }}
        </button>
      </form>

      <div class="auth-footer">
        Ja tem conta?
        <router-link to="/login" class="auth-link">Fazer login</router-link>
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

const displayName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMsg = ref('');
const successMsg = ref('');
const submitting = ref(false);

async function handleRegister() {
  errorMsg.value = '';
  successMsg.value = '';

  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'As senhas nao coincidem';
    return;
  }

  submitting.value = true;
  try {
    await auth.signUp(email.value, password.value, displayName.value);
    successMsg.value = 'Conta criada! Verifique seu email para confirmar.';
    setTimeout(() => router.push('/login'), 2000);
  } catch (e) {
    if (e.message.includes('already registered')) {
      errorMsg.value = 'Este email ja esta cadastrado';
    } else if (e.message.includes('valid email')) {
      errorMsg.value = 'Email invalido';
    } else {
      errorMsg.value = 'Erro ao criar conta. Tente novamente.';
    }
  } finally {
    submitting.value = false;
  }
}
</script>
