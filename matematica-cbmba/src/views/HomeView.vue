<template>
  <div class="home">
    <h1 class="page-title">Inicio</h1>
    <div class="home-grid">
      <div class="home-left">
        <div class="card">
          <div class="date-filter-bar">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              class="date-tab"
              :class="{ active: selectedTab === tab.key }"
              @click="selectTab(tab.key)"
            >
              {{ tab.label }}
            </button>
            <button class="date-tab date-tab-icon" :class="{ active: showCalendarModal }" @click="openCalendar" title="Selecionar periodo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </button>
            <span v-if="showCalendarBadge" class="calendar-badge">{{ calendarStartDisplay }} - {{ calendarEndDisplay }}</span>
          </div>

          <div class="home-hero">
            <div class="home-chart-section">
              <div class="donut-wrapper">
                <svg class="donut-chart" viewBox="0 0 140 140">
                  <circle class="donut-ring" cx="70" cy="70" r="60" />
                  <circle class="donut-segment donut-wrong" cx="70" cy="70" r="60" :stroke-dasharray="wrongDash" :stroke-dashoffset="0" />
                  <circle class="donut-segment donut-correct" cx="70" cy="70" r="60" :stroke-dasharray="correctDash" :stroke-dashoffset="correctOffset" />
                  <text x="70" y="66" class="donut-number">{{ stats.totalQuestions }}</text>
                  <text x="70" y="82" class="donut-label">questoes</text>
                </svg>
                <div class="donut-pill" :class="stats.accuracy >= 70 ? 'pill-success' : stats.accuracy > 0 ? 'pill-danger' : 'pill-neutral'">
                  {{ stats.accuracy }}% de acerto
                </div>
              </div>

              <div class="home-difficulty-list">
                <div class="difficulty-row" v-for="d in difficultyData" :key="d.level">
                  <div class="difficulty-row-left">
                    <span class="difficulty-name">{{ d.label }}</span>
                  </div>
                  <div class="difficulty-row-right">
                    <span class="difficulty-count">{{ d.total }}</span>
                    <div class="difficulty-bar">
                      <div class="difficulty-bar-fill" :style="{ width: d.total > 0 ? Math.round((d.correct / Math.max(d.total, 1)) * 100) + '%' : '0%' }"></div>
                    </div>
                    <span class="difficulty-pct">{{ d.total > 0 ? d.accuracy + '%' : '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="weakTopics.length > 0">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h2 style="font-size: 18px; font-weight: 500;">Temas para Melhorar</h2>
            <router-link to="/banco" class="btn btn-sm btn-ghost">Ver todos</router-link>
          </div>
          <div class="grid-2">
            <div v-for="t in weakTopics" :key="t.id" class="card topic-card">
              <div class="topic-icon">{{ t.icon }}</div>
              <div class="topic-name">{{ t.name }}</div>
              <div class="topic-category">{{ t.category }}</div>
              <div class="progress-bar-container" style="margin-top: 8px;">
                <div class="progress-bar-fill danger" :style="{ width: t.accuracy + '%' }"></div>
              </div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">
                {{ t.accuracy }}% de acerto
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="home-right">
        <div class="card topic-stats-card">
          <div class="topic-stats-header">Desempenho por Assunto</div>
          <div v-if="topicStatsList.length === 0" class="topic-stats-empty">
            Nenhuma questao respondida ainda
          </div>
          <div v-else class="topic-stats-list">
            <div v-for="t in topicStatsList" :key="t.id" class="topic-stat-row">
              <div class="topic-stat-name">{{ t.icon }} {{ t.name }}</div>
              <div class="topic-stat-bars">
                <div class="topic-stat-bar-wrap">
                  <div class="topic-stat-bar correct" :style="{ width: t.accuracy + '%' }"></div>
                  <div class="topic-stat-bar wrong" :style="{ width: (100 - t.accuracy) + '%' }"></div>
                </div>
                <div class="topic-stat-labels">
                  <span class="topic-stat-pct correct">{{ t.accuracy }}% acerto</span>
                  <span class="topic-stat-pct wrong">{{ 100 - t.accuracy }}% erro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCalendarModal" class="modal-overlay" @click.self="closeCalendar">
      <div class="calendar-modal-wrap">
        <div class="calendar-modal">
          <div class="cal-main">
            <div class="cal-header">
              <button class="cal-nav-btn" @click="prevMonth">&lsaquo;</button>
              <div class="cal-month-label">{{ monthLabel }}</div>
              <button class="cal-nav-btn" @click="nextMonth">&rsaquo;</button>
            </div>
            <div class="cal-weekdays">
              <span v-for="d in weekdays" :key="d" class="cal-weekday">{{ d }}</span>
            </div>
            <div class="cal-grid">
              <span v-for="(cell, i) in calendarCells" :key="i" class="cal-day" :class="cellClasses(cell)" @click="handleDayClick(cell)"><span class="cal-day-num">{{ cell.day || '' }}</span></span>
            </div>
            <div class="cal-selection-info">
              <template v-if="tempStart && tempEnd">
                <span class="cal-sel-date">{{ fmtShort(tempStart) }}</span>
                <span class="cal-sel-sep">&mdash;</span>
                <span class="cal-sel-date">{{ fmtShort(tempEnd) }}</span>
              </template>
              <template v-else-if="tempStart">
                <span class="cal-sel-date">{{ fmtShort(tempStart) }}</span>
                <span class="cal-sel-hint">Selecione a data final</span>
              </template>
              <template v-else>
                <span class="cal-sel-hint">Selecione a data inicial</span>
              </template>
            </div>
            <div class="cal-footer">
              <button class="btn btn-ghost" @click="closeCalendar">Cancelar</button>
              <button class="btn btn-primary" @click="applyCalendar" :disabled="!tempStart || !tempEnd">Aplicar</button>
            </div>
          </div>
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

const tabs = [
  { key: 'today', label: 'Hoje' },
  { key: '7d', label: 'Ultimos 7 dias' },
  { key: '30d', label: 'Ultimos 30 dias' },
  { key: 'all', label: 'Desde o Inicio' },
];

const selectedTab = ref('all');
const calendarStart = ref('');
const calendarEnd = ref('');
const showCalendarModal = ref(false);

const showCalendarBadge = computed(() => calendarStart.value && calendarEnd.value && selectedTab.value === 'calendar');

function formatDateShort(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

const calendarStartDisplay = computed(() => formatDateShort(calendarStart.value));
const calendarEndDisplay = computed(() => formatDateShort(calendarEnd.value));

function selectTab(key) {
  selectedTab.value = key;
}

const weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
const monthNames = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const viewMonth = ref(new Date().getMonth());
const viewYear = ref(new Date().getFullYear());
const tempStart = ref('');
const tempEnd = ref('');

const monthLabel = computed(() => `${monthNames[viewMonth.value]} ${viewYear.value}`);

function openCalendar() {
  tempStart.value = calendarStart.value;
  tempEnd.value = calendarEnd.value;
  if (calendarStart.value) {
    const d = new Date(calendarStart.value + 'T00:00:00');
    viewMonth.value = d.getMonth();
    viewYear.value = d.getFullYear();
  } else {
    const now = new Date();
    viewMonth.value = now.getMonth();
    viewYear.value = now.getFullYear();
  }
  showCalendarModal.value = true;
}

function closeCalendar() {
  showCalendarModal.value = false;
}

function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11;
    viewYear.value--;
  } else {
    viewMonth.value--;
  }
}

function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0;
    viewYear.value++;
  } else {
    viewMonth.value++;
  }
}

const calendarCells = computed(() => {
  const first = new Date(viewYear.value, viewMonth.value, 1);
  let startDay = first.getDay();
  startDay = startDay === 0 ? 6 : startDay - 1;
  const daysInMonth = new Date(viewYear.value, viewMonth.value + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push({ day: 0, date: '' });
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(viewMonth.value + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    cells.push({ day: d, date: `${viewYear.value}-${mm}-${dd}` });
  }
  return cells;
});

function toMs(dateStr) {
  return dateStr ? new Date(dateStr + 'T00:00:00').getTime() : 0;
}

function cellClasses(cell) {
  if (!cell.date) return { 'cal-day-empty': true };
  const ms = toMs(cell.date);
  const s = toMs(tempStart.value);
  const e = toMs(tempEnd.value);
  const isStart = cell.date === tempStart.value;
  const isEnd = cell.date === tempEnd.value;
  const inRange = s && e && ms > s && ms < e;
  const isToday = cell.date === todayStr.value;
  return {
    'cal-day-empty': !cell.day,
    'cal-day-today': isToday,
    'cal-day-start': isStart,
    'cal-day-end': isEnd,
    'cal-day-range': inRange,
    'cal-day-selectable': cell.day && !isStart && !isEnd,
  };
}

const todayStr = computed(() => {
  const n = new Date();
  const mm = String(n.getMonth() + 1).padStart(2, '0');
  const dd = String(n.getDate()).padStart(2, '0');
  return `${n.getFullYear()}-${mm}-${dd}`;
});

function handleDayClick(cell) {
  if (!cell.date) return;
  if (!tempStart.value || (tempStart.value && tempEnd.value)) {
    tempStart.value = cell.date;
    tempEnd.value = '';
  } else {
    if (toMs(cell.date) < toMs(tempStart.value)) {
      tempEnd.value = tempStart.value;
      tempStart.value = cell.date;
    } else {
      tempEnd.value = cell.date;
    }
  }
}

function toDateStr(d) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function fmtShort(d) {
  return formatDateShort(d);
}

function applyCalendar() {
  if (tempStart.value && tempEnd.value) {
    calendarStart.value = tempStart.value;
    calendarEnd.value = tempEnd.value;
    selectedTab.value = 'calendar';
    showCalendarModal.value = false;
  }
}

const dateRange = computed(() => {
  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  switch (selectedTab.value) {
    case 'today':
      return { start: todayStart.getTime(), end: now };
    case '7d':
      return { start: now - 7 * 24 * 60 * 60 * 1000, end: now };
    case '30d':
      return { start: now - 30 * 24 * 60 * 60 * 1000, end: now };
    case 'calendar': {
      const s = calendarStart.value ? new Date(calendarStart.value + 'T00:00:00').getTime() : null;
      const e = calendarEnd.value ? new Date(calendarEnd.value + 'T23:59:59').getTime() : null;
      return { start: s, end: e || now };
    }
    default:
      return { start: null, end: null };
  }
});

const stats = computed(() => {
  const { start, end } = dateRange.value;
  if (selectedTab.value === 'all' && start === null && end === null) {
    return store.getOverallStats();
  }
  return store.getFilteredStats(start, end);
});

const CIRCUMFERENCE = 2 * Math.PI * 60;

const correctPct = computed(() => stats.value.totalQuestions > 0 ? stats.value.totalCorrect / stats.value.totalQuestions : 0);
const wrongPct = computed(() => stats.value.totalQuestions > 0 ? stats.value.totalWrong / stats.value.totalQuestions : 0);

const correctDash = computed(() => `${CIRCUMFERENCE * correctPct.value} ${CIRCUMFERENCE}`);
const wrongDash = computed(() => `${CIRCUMFERENCE * wrongPct.value} ${CIRCUMFERENCE}`);
const correctOffset = computed(() => CIRCUMFERENCE * (1 - correctPct.value) + CIRCUMFERENCE * wrongPct.value);

const difficultyData = computed(() => {
  const { start, end } = dateRange.value;
  let diffStats;
  if (selectedTab.value === 'all' && start === null && end === null) {
    diffStats = store.getDifficultyStats();
  } else {
    const filtered = store.getFilteredStats(start, end);
    diffStats = {};
    for (let i = 1; i <= 5; i++) {
      const s = filtered.difficultyStats[i] || { total: 0, correct: 0 };
      diffStats[i] = { ...s, wrong: s.total - s.correct, accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0 };
    }
  }
  return [1, 2, 3, 4, 5].map(level => ({
    level,
    label: DIFFICULTY_LABELS[level],
    ...diffStats[level],
  }));
});

const weakTopics = computed(() => {
  return TOPICS
    .map(t => ({ ...t, ...store.getTopicStats(t.id) }))
    .filter(t => t.total > 0 && t.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 4);
});

const topicStatsList = computed(() => {
  const { start, end } = dateRange.value;
  const log = store.answerLog || [];
  const filtered = log.filter(entry => {
    if (start && entry.timestamp < start) return false;
    if (end && entry.timestamp > end) return false;
    return true;
  });
  const map = {};
  filtered.forEach(e => {
    if (!map[e.topic]) map[e.topic] = { correct: 0, total: 0 };
    map[e.topic].total++;
    if (e.correct) map[e.topic].correct++;
  });
  return TOPICS
    .filter(t => map[t.id] && map[t.id].total > 0)
    .map(t => {
      const s = map[t.id];
      return {
        ...t,
        total: s.total,
        correct: s.correct,
        accuracy: Math.round((s.correct / s.total) * 100),
      };
    })
    .sort((a, b) => b.total - a.total);
});
</script>
