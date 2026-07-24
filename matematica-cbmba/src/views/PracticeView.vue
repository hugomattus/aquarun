<template>
  <div class="practice-page">
    <div v-if="!store.isSessionActive" class="empty-state">
      <div class="empty-state-icon">?</div>
      <div class="empty-state-text">Nenhuma sessao ativa</div>
      <router-link to="/" class="btn btn-primary">Voltar ao Inicio</router-link>
    </div>

    <template v-else-if="store.isSessionFinished">
      <div class="card" style="text-align: center; padding: 48px;">
        <div style="font-size: 48px; margin-bottom: 16px;">
          {{ store.sessionAccuracy >= 70 ? '🎉' : store.sessionAccuracy >= 50 ? '💪' : '📚' }}
        </div>
        <h2 style="font-size: 24px; font-weight: 500; margin-bottom: 8px;">Sessao Finalizada!</h2>
        <p style="color: var(--text-secondary); margin-bottom: 24px;">
          {{ getResultMessage() }}
        </p>
        <div class="grid-3" style="max-width: 400px; margin: 0 auto 24px;">
          <div class="stat-card">
            <div class="stat-value" style="color: var(--success);">{{ store.sessionCorrect }}</div>
            <div class="stat-label">Acertos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color: var(--danger);">{{ store.sessionWrong }}</div>
            <div class="stat-label">Erros</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ store.sessionAccuracy }}%</div>
            <div class="stat-label">Aproveitamento</div>
          </div>
        </div>
        <div class="progress-bar-container" style="max-width: 400px; margin: 0 auto 24px;">
          <div
            class="progress-bar-fill"
            :class="store.sessionAccuracy >= 70 ? 'success' : 'danger'"
            :style="{ width: store.sessionAccuracy + '%' }"
          ></div>
        </div>
        <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
          <router-link to="/" class="btn btn-primary">Voltar ao Inicio</router-link>
          <router-link to="/topic" class="btn btn-outline">Escolher Outro Tema</router-link>
          <button @click="retrySession" class="btn btn-success">Tentar Novamente</button>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="card">
        <div class="session-header">
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
          <div class="timer">{{ elapsedTime }}</div>
        </div>

        <div class="progress-bar-container">
          <div
            class="progress-bar-fill"
            :style="{ width: ((currentIndex + 1) / store.currentQuestions.length * 100) + '%' }"
          ></div>
        </div>
      </div>

      <div v-if="currentQuestion" class="card question-card">
        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">
          <span class="tag tag-category">{{ getTopicName(currentQuestion.topic) }}</span>
          <span style="margin-left: 8px;">Nivel {{ currentQuestion.difficulty }}</span>
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
            {{ currentIndex + 1 < store.currentQuestions.length ? 'Proxima Questao' : 'Ver Resultado' }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePracticeStore } from '../stores/practice.js';
import { TOPICS } from '../utils/questionGenerator.js';

const store = usePracticeStore();
const router = useRouter();

const answered = ref(false);
const selectedOption = ref(null);
const currentIndex = computed(() => store.currentIndex);
const currentQuestion = computed(() => store.currentQuestion);

const elapsedSeconds = ref(0);
let timerInterval = null;

onMounted(() => {
  if (!store.isSessionActive) {
    router.push('/');
    return;
  }
  timerInterval = setInterval(() => {
    elapsedSeconds.value++;
  }, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

const elapsedTime = computed(() => {
  const mins = Math.floor(elapsedSeconds.value / 60);
  const secs = elapsedSeconds.value % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
});

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

function getTopicName(id) {
  if (id === 'mixed') return 'Misto';
  if (id === 'review') return 'Revisao';
  return TOPICS.find(t => t.id === id)?.name || id;
}

function getResultMessage() {
  const acc = store.sessionAccuracy;
  if (acc >= 90) return 'Excelente! Voce esta muito bem preparado!';
  if (acc >= 70) return 'Bom trabalho! Continue praticando para melhorar ainda mais.';
  if (acc >= 50) return 'Razoavel, mas ha espaco para melhoria. Tente novamente!';
  return 'Continue estudando! A pratica leva a perfeicao.';
}

function retrySession() {
  if (store.currentTopic === 'mixed') {
    store.startMixedSession(store.currentQuestions.length);
  } else if (store.currentTopic === 'review') {
    store.reviewMistakes(store.currentQuestions.length);
  } else {
    store.startTopicSession(store.currentTopic, store.currentQuestions.length);
  }
  answered.value = false;
  selectedOption.value = null;
  elapsedSeconds.value = 0;
}
</script>
