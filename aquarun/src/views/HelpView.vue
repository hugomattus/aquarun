<template>
  <div class="space-y-8 max-w-2xl">
    <div>
      <h1 class="text-2xl font-medium text-white">Ajuda</h1>
      <p class="text-neutral-500 mt-1">Tire suas dúvidas sobre o AquaRun</p>
    </div>

    <div class="space-y-4">
      <div
        v-for="(faq, index) in faqs"
        :key="index"
        class="bg-surface rounded border border-neutral-800"
      >
        <button
          @click="toggle(index)"
          class="w-full flex items-center justify-between p-5 text-left"
        >
          <span class="font-medium text-white">{{ faq.question }}</span>
          <Icon
            :name="openIndex === index ? 'chevron-up' : 'chevron-down'"
            :size="20"
            class="text-neutral-500 flex-shrink-0 ml-4"
          />
        </button>
        <div v-if="openIndex === index" class="px-5 pb-5 text-sm text-neutral-400 leading-relaxed">
          {{ faq.answer }}
        </div>
      </div>
    </div>

    <div class="bg-surface rounded p-6 border border-neutral-800">
      <h3 class="font-medium text-white mb-2">Ainda precisa de ajuda?</h3>
      <p class="text-sm text-neutral-500 mb-4">
        Entre em contato conosco para obter suporte.
      </p>
      <a
        href="mailto:suporte@aquarun.app"
        class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark rounded text-sm font-medium transition-colors"
      >
        <Icon name="mail" :size="16" />
        <span>Enviar email</span>
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Icon from '../components/Icon.vue'

const openIndex = ref(null)

const faqs = [
  {
    question: 'Como conectar minha conta do Strava?',
    answer: 'Vá em Integrações e clique em "Conectar" ao lado do Strava. Você será redirecionado para autorizar o acesso. Após autorizar, suas atividades serão sincronizadas automaticamente.',
  },
  {
    question: 'Como gerar um plano de treino?',
    answer: 'Acesse Meu Treino e clique em "Gerar Meu Plano". O AquaRun pede seu nível, objetivo e disponibilidade e cria um plano semanal de corrida e natação ajustado a cada semana.',
  },
  {
    question: 'Como registrar um treino concluído?',
    answer: 'No Meu Treino, abra o treino do dia e clique em "Concluir". Você pode registrar os dados manualmente ou selecionar uma atividade sincronizada do Strava, além de avaliar esforço, sono, energia e estresse.',
  },
  {
    question: 'Posso usar o app offline?',
    answer: 'O AquaRun é um app web e precisa de conexão com a internet para funcionar, incluindo o acesso aos seus planos de treino.',
  },
  {
    question: 'Como alterar minha senha?',
    answer: 'Clique em "Esqueceu sua senha?" na tela de login para receber um email de redefinição. Siga as instruções no email para criar uma nova senha.',
  },
  {
    question: 'Meus dados estão seguros?',
    answer: 'Sim. Utilizamos Supabase com Row Level Security (RLS) para garantir que apenas você tenha acesso aos seus dados. Nenhuma informação é compartilhada com terceiros.',
  },
]

function toggle(index) {
  openIndex.value = openIndex.value === index ? null : index
}
</script>
