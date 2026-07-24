<template>
  <div class="topic-page">
    <div class="card">
      <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Escolha um Tema</h2>
      <div class="progress-bar-container" style="margin-bottom: 8px;">
        <div class="progress-bar-fill" :style="{ width: overallProgress + '%' }"></div>
      </div>
      <div style="font-size: 12px; color: var(--text-secondary);">
        Progresso geral: {{ overallProgress }}% dos temas com 70%+ de acerto
      </div>
    </div>

    <div v-for="category in categories" :key="category" style="margin-bottom: 16px;">
      <h3 style="font-size: 16px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; padding-left: 0;">
        {{ category }}
      </h3>
      <div class="grid-2">
        <div
          v-for="topic in getTopicsByCategory(category)"
          :key="topic.id"
          class="card topic-card"
          @click="openConfig(topic)"
        >
          <div class="topic-icon">{{ topic.icon }}</div>
          <div class="topic-name">{{ topic.name }}</div>
          <div class="topic-category">
            <span class="tag tag-category">Nivel sugerido: {{ topic.level }}</span>
          </div>
          <div class="progress-bar-container" style="margin-top: 8px;">
            <div
              class="progress-bar-fill"
              :class="topic.accuracy >= 70 ? 'success' : topic.accuracy > 0 ? 'danger' : ''"
              :style="{ width: topic.accuracy + '%' }"
            ></div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; color: var(--text-secondary);">
            <span>{{ topic.accuracy }}% acerto</span>
            <span>{{ topic.total }} questoes</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showConfig" class="modal-overlay" @click.self="showConfig = false">
      <div class="card modal-card">
        <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">{{ selectedTopic?.name }}</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 24px;">
          Configure sua sessao de pratica
        </p>

        <div style="margin-bottom: 24px;">
          <label style="font-size: 14px; font-weight: 600; display: block; margin-bottom: 8px;">Dificuldade</label>
          <div class="difficulty-options">
            <button
              v-for="d in difficulties"
              :key="d.value"
              class="difficulty-btn"
              :class="{ active: selectedDifficulty === d.value }"
              @click="selectedDifficulty = d.value"
            >
              <span class="difficulty-level">{{ d.value }}</span>
              <span class="difficulty-label">{{ d.label }}</span>
            </button>
          </div>
          <div class="progress-bar-container" style="margin-top: 8px;">
            <div class="progress-bar-fill" :style="{ width: (selectedDifficulty / 5 * 100) + '%' }"></div>
          </div>
        </div>

        <div style="margin-bottom: 24px;">
          <label style="font-size: 14px; font-weight: 600; display: block; margin-bottom: 8px;">Quantidade de questoes</label>
          <div class="count-options">
            <button
              v-for="c in countOptions"
              :key="c"
              class="count-btn"
              :class="{ active: selectedCount === c }"
              @click="selectedCount = c"
            >
              {{ c }}
            </button>
          </div>
        </div>

        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button class="btn btn-ghost" @click="showConfig = false">Cancelar</button>
          <button class="btn btn-primary btn-lg" @click="startPractice">
            Iniciar ({{ selectedCount }} questoes)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePracticeStore } from '../stores/practice.js';
import { TOPICS, DIFFICULTY_LABELS } from '../utils/questionGenerator.js';

const store = usePracticeStore();
const router = useRouter();

const showConfig = ref(false);
const selectedTopic = ref(null);
const selectedDifficulty = ref(1);
const selectedCount = ref(10);

const difficulties = [
  { value: 1, label: 'Facil' },
  { value: 2, label: 'Medio' },
  { value: 3, label: 'Intermediario' },
  { value: 4, label: 'Dificil' },
  { value: 5, label: 'Avancado' },
];

const countOptions = [5, 10, 15, 20, 30];

const topics = computed(() => {
  return TOPICS.map(t => ({
    ...t,
    ...store.getTopicStats(t.id),
    level: store.getTopicDifficulty(t.id),
  }));
});

const categories = computed(() => [...new Set(topics.value.map(t => t.category))]);

const overallProgress = computed(() => {
  const total = topics.value.length;
  const good = topics.value.filter(t => t.accuracy >= 70).length;
  return total > 0 ? Math.round((good / total) * 100) : 0;
});

function getTopicsByCategory(category) {
  return topics.value.filter(t => t.category === category);
}

function openConfig(topic) {
  selectedTopic.value = topic;
  selectedDifficulty.value = topic.level;
  selectedCount.value = 10;
  showConfig.value = true;
}

function startPractice() {
  store.startTopicSession(selectedTopic.value.id, selectedCount.value, selectedDifficulty.value);
  router.push('/practice');
}
</script>
