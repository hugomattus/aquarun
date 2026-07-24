<template>
  <div class="review-page">
    <h1 class="page-title">Revisar Erros</h1>
    <div v-if="store.mistakes.length === 0 && !store.isSessionActive" class="empty-state">
      <div class="empty-state-icon">✅</div>
      <div class="empty-state-text">Nenhum erro para revisar!</div>
      <router-link to="/" class="btn btn-primary">Voltar ao Inicio</router-link>
    </div>

    <template v-else-if="store.isSessionActive">
      <div class="card">
        <div class="session-header">
          <h2 style="font-size: 18px; font-weight: 500;">Revisao de Erros</h2>
          <div class="session-progress">
            <div class="session-stat">
              <div class="session-stat-value" style="color: var(--success);">{{ store.sessionCorrect }}</div>
              <div class="session-stat-label">Acertos</div>
            </div>
            <div class="session-stat">
              <div class="session-stat-value" style="color: var(--danger);">{{ store.sessionWrong }}</div>
              <div class="session-stat-label">Erros</div>
            </div>
            <div class="session-stat">
              <div class="session-stat-value">{{ currentIndex + 1 }}/{{ store.currentQuestions.length }}</div>
              <div class="session-stat-label">Questao</div>
            </div>
          </div>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" :style="{ width: ((currentIndex + 1) / store.currentQuestions.length * 100) + '%' }"></div>
        </div>
      </div>

      <div v-if="currentQuestion" class="card question-card">
        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">
          <span class="tag tag-category">{{ getTopicName(currentQuestion.topic) }}</span>
          <span style="margin-left: 8px;">Revisao</span>
        </div>
        <div class="question-text">{{ currentQuestion.question }}</div>
        <div class="options-grid">
          <button
            v-for="(option, i) in currentQuestion.options"
            :key="i"
            class="option-btn"
            :class="{
              correct: answered && option === currentQuestion.answer,
              wrong: answered && selectedOption === option && option !== currentQuestion.answer,
            }"
            :disabled="answered"
            @click="selectAnswer(option)"
          >
            {{ option }}
          </button>
        </div>
        <div v-if="answered" class="feedback" :class="selectedOption === currentQuestion.answer ? 'correct' : 'wrong'">
          {{ selectedOption === currentQuestion.answer ? 'Correto!' : `Incorreto. Resposta: ${currentQuestion.answer}` }}
        </div>
        <div v-if="answered" style="margin-top: 24px;">
          <button @click="goNext" class="btn btn-primary btn-lg">
            {{ currentIndex + 1 < store.currentQuestions.length ? 'Proxima' : 'Ver Resultado' }}
          </button>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="card">
        <h2 style="font-size: 20px; font-weight: 500; margin-bottom: 8px;">Revisao de Erros</h2>
        <p style="color: var(--text-secondary); margin-bottom: 8px;">
          Voce tem {{ store.mistakes.length }} erro(s) para revisar. Resolva novamente para fixar o conteudo.
        </p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button @click="startReview(10)" class="btn btn-primary" :disabled="store.mistakes.length === 0">
            Revisar Ultimos 10
          </button>
          <button @click="startReview(store.mistakes.length)" class="btn btn-outline" :disabled="store.mistakes.length === 0">
            Revisar Todos ({{ store.mistakes.length }})
          </button>
          <button @click="clearAll" class="btn btn-danger btn-sm">
            Limpar Erros
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Erros Registrados</div>
        <div v-for="(mistake, i) in reversedMistakes" :key="i" class="mistake-item">
          <div class="mistake-question">{{ mistake.question }}</div>
          <div class="mistake-answer">
            Resposta correta: <strong>{{ mistake.answer }}</strong>
            <span style="margin-left: 8px;">| {{ getTopicName(mistake.topic) }}</span>
            <span style="margin-left: 8px;">{{ formatMistakeDate(mistake.timestamp) }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { usePracticeStore } from '../stores/practice.js';
import { TOPICS } from '../utils/questionGenerator.js';

const store = usePracticeStore();
const answered = ref(false);
const selectedOption = ref(null);
const currentIndex = computed(() => store.currentIndex);
const currentQuestion = computed(() => store.currentQuestion);

const reversedMistakes = computed(() => [...store.mistakes].reverse());

function getTopicName(id) {
  if (id === 'mixed') return 'Misto';
  if (id === 'review') return 'Revisao';
  return TOPICS.find(t => t.id === id)?.name || id;
}

function formatMistakeDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function selectAnswer(option) {
  if (answered.value) return;
  answered.value = true;
  selectedOption.value = option;
  store.answerQuestion(currentQuestion.value.id, option === currentQuestion.value.answer);
}

function goNext() {
  answered.value = false;
  selectedOption.value = null;
  store.nextQuestion();
  if (store.isSessionFinished) {
    store.finishSession();
  }
}

function startReview(count) {
  store.reviewMistakes(count);
  answered.value = false;
  selectedOption.value = null;
}

function clearAll() {
  store.clearMistakes();
}
</script>
