<template>
  <div>
    <h1 class="page-title">Banco de Questoes</h1>

    <div v-if="currentView === 'filters'" class="bank-filters-view">

      <div class="bank-filter-pills">
        <button
          v-for="pill in statusPills"
          :key="pill.id"
          class="bank-pill"
          :class="{ active: selectedStatus === pill.id }"
          @click="selectedStatus = pill.id"
        >
          <svg v-if="selectedStatus === pill.id" class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          {{ pill.label }}
        </button>
      </div>

      <div class="bank-filter-row">
        <div class="bank-search">
          <svg class="icon icon-inside" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Buscar por palavra-chave..."
          >
        </div>
      </div>

      <div class="bank-filter-row bank-selects">
        <div class="bank-select-group">
          <label class="bank-select-label">
            <svg class="icon icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            Assunto
          </label>
          <div class="multi-select" ref="topicSelectRef">
            <button class="multi-select-trigger" @click="toggleDropdown('topic')">
              <span class="multi-select-value">{{ topicLabel }}</span>
              <svg class="icon icon-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div v-if="openDropdown === 'topic'" class="multi-select-dropdown">
              <label class="multi-select-option">
                <input type="checkbox" :checked="selectedTopics.length === 0" @change="clearTopics">
                <span class="multi-select-check"></span>
                <span>Todos</span>
              </label>
              <div v-for="cat in categories" :key="cat" class="multi-select-group">
                <div class="multi-select-group-label">{{ cat }}</div>
                <label v-for="topic in getTopicsByCategory(cat)" :key="topic.id" class="multi-select-option">
                  <input type="checkbox" :value="topic.id" v-model="selectedTopics">
                  <span class="multi-select-check"></span>
                  <span>{{ topic.name }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="bank-select-group">
          <label class="bank-select-label">
            <svg class="icon icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            Nivel
          </label>
          <div class="multi-select" ref="nivelSelectRef">
            <button class="multi-select-trigger" @click="toggleDropdown('nivel')">
              <span class="multi-select-value">{{ nivelLabel }}</span>
              <svg class="icon icon-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div v-if="openDropdown === 'nivel'" class="multi-select-dropdown">
              <label class="multi-select-option">
                <input type="checkbox" :checked="selectedNiveis.length === 0" @change="clearNiveis">
                <span class="multi-select-check"></span>
                <span>Todos</span>
              </label>
              <label v-for="(label, key) in NIVEL_LABELS" :key="key" class="multi-select-option">
                <input type="checkbox" :value="key" v-model="selectedNiveis">
                <span class="multi-select-check"></span>
                <span>{{ label }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="bank-select-group">
          <label class="bank-select-label">
            <svg class="icon icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Dificuldade
          </label>
          <div class="multi-select" ref="diffSelectRef">
            <button class="multi-select-trigger" @click="toggleDropdown('diff')">
              <span class="multi-select-value">{{ diffLabel }}</span>
              <svg class="icon icon-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div v-if="openDropdown === 'diff'" class="multi-select-dropdown">
              <label class="multi-select-option">
                <input type="checkbox" :checked="selectedDifficulties.length === 0" @change="clearDiffs">
                <span class="multi-select-check"></span>
                <span>Todas</span>
              </label>
              <label v-for="(label, level) in DIFFICULTY_LABELS" :key="level" class="multi-select-option">
                <input type="checkbox" :value="Number(level)" v-model="selectedDifficulties">
                <span class="multi-select-check"></span>
                <span>Nivel {{ level }} - {{ label }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="bank-select-group">
          <label class="bank-select-label">
            <svg class="icon icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
            Modalidade
          </label>
          <select class="bank-select" v-model="selectedModalidade">
            <option value="">Todas</option>
            <option v-for="(label, key) in MODALIDADE_LABELS" :key="key" :value="key">{{ label }}</option>
          </select>
        </div>
      </div>

      <div v-if="activeFilterTags.length > 0" class="bank-active-filters">
        <span class="active-filters-label">Filtros aplicados:</span>
        <span
          v-for="tag in activeFilterTags"
          :key="tag.key"
          class="active-filter-tag"
        >
          {{ tag.label }}
          <button class="tag-remove" @click="tag.remove">
            <svg class="icon icon-xxs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </span>
        <button class="btn-clear-tags" @click="clearAllFilters">Limpar tudo</button>
      </div>

      <div class="bank-filter-actions">
        <button class="btn btn-primary btn-search" @click="applyAndShow" :disabled="isLoading">
          {{ isLoading ? 'Carregando...' : 'Buscar Questoes' }}
        </button>
      </div>

    </div>

    <div v-else class="bank-questions-view">
      <div class="bank-topbar">
        <div class="bank-topbar-left">
          <button class="btn btn-ghost btn-back" @click="currentView = 'filters'">
            <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7M19 12H5"/></svg>
            Voltar
          </button>
          <span class="bank-result-count">{{ filteredQuestions.length }} questoes encontradas</span>
          <span v-if="sourceLabel" class="bank-source-label">{{ sourceLabel }}</span>
        </div>
        <div class="bank-topbar-right">
          <select class="bank-sort-select" v-model="sortBy">
            <option value="default">Padrao</option>
            <option value="difficulty-asc">Dificuldade &#8593;</option>
            <option value="difficulty-desc">Dificuldade &#8595;</option>
            <option value="topic">Assunto</option>
          </select>
        </div>
      </div>

      <div v-if="filteredQuestions.length === 0" class="empty-state">
        <div class="empty-state-icon">?</div>
        <div class="empty-state-text">Nenhuma questao encontrada com os filtros selecionados.</div>
        <button class="btn btn-primary" @click="currentView = 'filters'">Voltar aos Filtros</button>
      </div>

      <div v-else class="bank-questions">
        <div v-for="(q, idx) in sortedQuestions" :key="q.id" class="bank-question-card">
          <div class="bank-question-header">
            <span class="tag tag-category">{{ getTopicName(q.topic) }}</span>
            <span class="topic-level" :class="'level-' + q.difficulty">
              {{ DIFFICULTY_LABELS[q.difficulty] }}
            </span>
            <span class="tag tag-nivel">{{ NIVEL_LABELS[q.nivel] }}</span>
            <span class="bank-question-number">Q{{ idx + 1 }}</span>
          </div>

          <div class="bank-question-text">{{ q.question }}</div>

          <div class="bank-options">
            <button
              v-for="(option, oi) in q.options"
              :key="oi"
              class="bank-option-btn"
              :class="{
                selected: answeredMap[q.id] && selectedMap[q.id] === option,
                correct: answeredMap[q.id] && option === q.answer,
                wrong: answeredMap[q.id] && selectedMap[q.id] === option && option !== q.answer,
              }"
              :disabled="answeredMap[q.id]"
              @click="selectOption(q, option)"
            >
              <span class="bank-option-letter">{{ optionLetters[oi] }}</span>
              <span class="bank-option-text">{{ option }}</span>
              <span v-if="answeredMap[q.id] && option === q.answer" class="bank-option-icon">&#10003;</span>
              <span v-if="answeredMap[q.id] && selectedMap[q.id] === option && option !== q.answer" class="bank-option-icon bank-option-x">&#10007;</span>
            </button>
          </div>

          <div v-if="answeredMap[q.id]" class="bank-question-feedback" :class="selectedMap[q.id] === q.answer ? 'correct' : 'wrong'">
            {{ selectedMap[q.id] === q.answer ? 'Correto!' : 'Incorreto.' }}
            <span v-if="selectedMap[q.id] !== q.answer"> Resposta: {{ q.answer }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { TOPICS, DIFFICULTY_LABELS, NIVEL_LABELS, MODALIDADE_LABELS, generateQuestionsForTopic } from '../utils/questionGenerator.js';
import { usePracticeStore } from '../stores/practice.js';
import { supabase } from '../utils/supabase.js';

const store = usePracticeStore();

const currentView = ref('filters');
const openDropdown = ref(null);

const selectedStatus = ref('todas');
const searchQuery = ref('');
const selectedTopics = ref([]);
const selectedNiveis = ref([]);
const selectedDifficulties = ref([]);
const selectedModalidade = ref('');
const sortBy = ref('default');

const generatedQuestions = ref([]);
const answeredMap = ref({});
const selectedMap = ref({});
const isLoading = ref(false);
const sourceLabel = ref('');

const topicSelectRef = ref(null);
const nivelSelectRef = ref(null);
const diffSelectRef = ref(null);

const optionLetters = ['A', 'B', 'C', 'D', 'E'];

const statusPills = [
  { id: 'todas', label: 'Todas' },
  { id: 'nao-resolvidas', label: 'Nao resolvidas' },
  { id: 'resolvidas', label: 'Resolvidas' },
  { id: 'acertei', label: 'Acertei' },
  { id: 'errei', label: 'Errei' },
];

const categories = computed(() => [...new Set(TOPICS.map(t => t.category))]);

function getTopicsByCategory(cat) {
  return TOPICS.filter(t => t.category === cat);
}

function getTopicName(id) {
  return TOPICS.find(t => t.id === id)?.name || id;
}

const topicLabel = computed(() => {
  if (selectedTopics.value.length === 0) return 'Todos';
  if (selectedTopics.value.length === TOPICS.length) return 'Todos';
  if (selectedTopics.value.length === 1) return getTopicName(selectedTopics.value[0]);
  return `${selectedTopics.value.length} selecionados`;
});

const nivelLabel = computed(() => {
  if (selectedNiveis.value.length === 0) return 'Todos';
  if (selectedNiveis.value.length === Object.keys(NIVEL_LABELS).length) return 'Todos';
  if (selectedNiveis.value.length === 1) return NIVEL_LABELS[selectedNiveis.value[0]];
  return `${selectedNiveis.value.length} selecionados`;
});

const diffLabel = computed(() => {
  if (selectedDifficulties.value.length === 0) return 'Todas';
  if (selectedDifficulties.value.length === Object.keys(DIFFICULTY_LABELS).length) return 'Todas';
  if (selectedDifficulties.value.length === 1) return `Nivel ${selectedDifficulties.value[0]}`;
  return `${selectedDifficulties.value.length} selecionados`;
});

function toggleDropdown(name) {
  openDropdown.value = openDropdown.value === name ? null : name;
}

function clearTopics() {
  selectedTopics.value = [];
}

function clearNiveis() {
  selectedNiveis.value = [];
}

function clearDiffs() {
  selectedDifficulties.value = [];
}

function handleClickOutside(e) {
  if (openDropdown.value === null) return;
  const refs = { topic: topicSelectRef, nivel: nivelSelectRef, diff: diffSelectRef };
  const ref = refs[openDropdown.value];
  if (ref.value && !ref.value.contains(e.target)) {
    openDropdown.value = null;
  }
}

const activeFilterTags = computed(() => {
  const tags = [];
  selectedTopics.value.forEach(id => {
    const t = TOPICS.find(tp => tp.id === id);
    tags.push({ key: `topic-${id}`, label: t ? t.name : id, remove: () => { selectedTopics.value = selectedTopics.value.filter(x => x !== id); } });
  });
  selectedNiveis.value.forEach(key => {
    tags.push({ key: `nivel-${key}`, label: NIVEL_LABELS[key], remove: () => { selectedNiveis.value = selectedNiveis.value.filter(x => x !== key); } });
  });
  selectedDifficulties.value.forEach(level => {
    tags.push({ key: `diff-${level}`, label: `Nivel ${level}`, remove: () => { selectedDifficulties.value = selectedDifficulties.value.filter(x => x !== level); } });
  });
  if (selectedModalidade.value) {
    tags.push({ key: 'modalidade', label: MODALIDADE_LABELS[selectedModalidade.value], remove: () => { selectedModalidade.value = ''; } });
  }
  if (searchQuery.value.trim()) {
    tags.push({ key: 'search', label: `"${searchQuery.value}"`, remove: () => { searchQuery.value = ''; } });
  }
  return tags;
});

function clearAllFilters() {
  selectedTopics.value = [];
  selectedNiveis.value = [];
  selectedDifficulties.value = [];
  selectedModalidade.value = '';
  searchQuery.value = '';
}

function getTopicAnswerStatus(topicId) {
  const log = store.answerLog;
  const entries = log.filter(e => e.topic === topicId);
  if (entries.length === 0) return 'nao-resolvida';
  const correctCount = entries.filter(e => e.correct).length;
  return correctCount / entries.length >= 0.5 ? 'acertei' : 'errei';
}

const filteredQuestions = computed(() => {
  let qs = generatedQuestions.value;

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    qs = qs.filter(item => item.question.toLowerCase().includes(q) || getTopicName(item.topic).toLowerCase().includes(q));
  }

  if (selectedTopics.value.length > 0) {
    qs = qs.filter(item => selectedTopics.value.includes(item.topic));
  }

  if (selectedNiveis.value.length > 0) {
    qs = qs.filter(item => selectedNiveis.value.includes(item.nivel));
  }

  if (selectedDifficulties.value.length > 0) {
    qs = qs.filter(item => selectedDifficulties.value.includes(item.difficulty));
  }

  if (selectedModalidade.value) {
    qs = qs.filter(item => item.modalidade === selectedModalidade.value);
  }

  if (selectedStatus.value !== 'todas') {
    qs = qs.filter(item => {
      const status = getTopicAnswerStatus(item.topic);
      if (selectedStatus.value === 'nao-resolvidas') return status === 'nao-resolvida';
      if (selectedStatus.value === 'resolvidas') return status !== 'nao-resolvida';
      return status === selectedStatus.value;
    });
  }

  return qs;
});

const sortedQuestions = computed(() => {
  const q = [...filteredQuestions.value];
  if (sortBy.value === 'difficulty-asc') q.sort((a, b) => a.difficulty - b.difficulty);
  else if (sortBy.value === 'difficulty-desc') q.sort((a, b) => b.difficulty - a.difficulty);
  else if (sortBy.value === 'topic') q.sort((a, b) => a.topic.localeCompare(b.topic));
  return q;
});

async function loadFromSupabase() {
  isLoading.value = true;
  sourceLabel.value = '';

  const topics = selectedTopics.value.length > 0 ? selectedTopics.value : TOPICS.map(t => t.id);
  const diffs = selectedDifficulties.value.length > 0 ? selectedDifficulties.value : [1, 2, 3, 4, 5];

  let query = supabase.from('question_bank').select('*');
  query = query.in('topic', topics);
  query = query.in('difficulty', diffs);

  if (selectedNiveis.value.length > 0) {
    query = query.in('nivel', selectedNiveis.value);
  }

  const { data, error } = await query.limit(500);

  if (!error && data && data.length > 0) {
    generatedQuestions.value = data.map(q => ({
      ...q,
      id: q.id,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    }));
    sourceLabel.value = `Banco de questoes (${data.length} questoes)`;
    isLoading.value = false;
    return true;
  }

  isLoading.value = false;
  return false;
}

function generateProcedural() {
  const topics = selectedTopics.value.length > 0 ? selectedTopics.value : TOPICS.map(t => t.id);
  const diffs = selectedDifficulties.value.length > 0 ? selectedDifficulties.value : [1, 2, 3, 4, 5];
  const result = [];
  for (const topic of topics) {
    for (const diff of diffs) {
      try {
        const qs = generateQuestionsForTopic(topic, diff, 2);
        result.push(...qs);
      } catch (e) {
        console.error(`Error generating ${topic} diff ${diff}:`, e);
      }
    }
  }
  generatedQuestions.value = result;
  sourceLabel.value = `Gerador procedural (${result.length} questoes)`;
}

async function generateAll() {
  isLoading.value = true;
  answeredMap.value = {};
  selectedMap.value = {};

  const loaded = await loadFromSupabase();
  if (!loaded) {
    generateProcedural();
  }

  isLoading.value = false;
}

function applyAndShow() {
  generateAll();
  currentView.value = 'questions';
}

function selectOption(q, option) {
  if (answeredMap.value[q.id]) return;
  answeredMap.value[q.id] = true;
  selectedMap.value[q.id] = option;
  store.answerBankQuestion(q, option === q.answer);
}

onMounted(() => {
  generateAll();
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
