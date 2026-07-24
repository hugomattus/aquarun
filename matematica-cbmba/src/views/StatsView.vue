<template>
  <div class="stats-page">
    <div class="card">
      <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Estatisticas Gerais</h2>
      <div class="grid-3">
        <div class="stat-card">
          <div class="stat-value">{{ stats.totalQuestions }}</div>
          <div class="stat-label">Total de Questoes</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" :style="{ color: stats.accuracy >= 70 ? 'var(--success)' : 'var(--danger)' }">
            {{ stats.accuracy }}%
          </div>
          <div class="stat-label">Taxa de Acerto</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.totalSessions }}</div>
          <div class="stat-label">Sessoes Realizadas</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Desempenho por Tema</div>
        <div class="progress-bar-container" style="margin-bottom: 16px;">
        <div class="progress-bar-fill" :style="{ width: overallProgress + '%' }"></div>
      </div>
        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">
        Progresso: {{ topicsWithStats.filter(t => t.accuracy >= 70).length }}/{{ topicsWithStats.length }} temas com 70%+ de acerto
      </div>

      <div v-for="topic in topicsWithStats" :key="topic.id" class="topic-stats-row">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--border);">
          <div style="display: flex; align-items: center; gap: 16px;">
            <span style="font-size: 20px; font-weight: 700; color: var(--primary); width: 32px;">{{ topic.icon }}</span>
            <div>
              <div style="font-weight: 600; font-size: 14px;">{{ topic.name }}</div>
              <div style="font-size: 12px; color: var(--text-secondary);">{{ topic.total }} questoes resolvidas</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            <span class="tag" :class="'level-' + topic.level">Nivel {{ topic.level }}</span>
            <div style="width: 128px;">
              <div class="progress-bar-container">
                <div
                  class="progress-bar-fill"
                  :class="topic.accuracy >= 70 ? 'success' : topic.accuracy > 0 ? 'danger' : ''"
                  :style="{ width: topic.accuracy + '%' }"
                ></div>
              </div>
            </div>
            <span :style="{ color: topic.accuracy >= 70 ? 'var(--success)' : 'var(--danger)', fontWeight: 600, minWidth: '40px', textAlign: 'right' }">
              {{ topic.accuracy }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="card" v-if="store.history.length > 0">
      <div class="card-title">Historico de Sessoes</div>
      <div v-for="(session, i) in reversedHistory" :key="i" class="mistake-item">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span class="mistake-question">{{ getTopicName(session.topic) }}</span>
            <span style="margin-left: 8px; font-size: 12px; color: var(--text-secondary);">
              {{ formatDate(session.date) }}
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span :style="{ color: session.accuracy >= 70 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }">
              {{ session.accuracy }}%
            </span>
            <span style="font-size: 12px; color: var(--text-secondary);">
              {{ session.correct }}/{{ session.total }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePracticeStore } from '../stores/practice.js';
import { TOPICS } from '../utils/questionGenerator.js';

const store = usePracticeStore();

const stats = computed(() => store.getOverallStats());

const topicsWithStats = computed(() => {
  return TOPICS
    .map(t => ({
      ...t,
      ...store.getTopicStats(t.id),
      level: store.getTopicDifficulty(t.id),
    }))
    .sort((a, b) => b.total - a.total);
});

const overallProgress = computed(() => {
  const total = topicsWithStats.value.length;
  const good = topicsWithStats.value.filter(t => t.accuracy >= 70).length;
  return total > 0 ? Math.round((good / total) * 100) : 0;
});

const reversedHistory = computed(() => [...store.history].reverse());

function getTopicName(id) {
  if (id === 'mixed') return 'Pratica Misturada';
  if (id === 'review') return 'Revisao de Erros';
  return TOPICS.find(t => t.id === id)?.name || id;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}
</script>
