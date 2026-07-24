import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { generateQuestionsForTopic, generateMixedQuestions, TOPICS } from '../utils/questionGenerator.js';
import { supabase } from '../utils/supabase.js';
import { useAuthStore } from './auth.js';

const STORAGE_KEY = 'cbmba-math-store';

function loadLocal() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

function saveLocal(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      topicProgress: state.topicProgress,
      history: state.history,
      mistakes: state.mistakes,
      totalStudyTime: state.totalStudyTime,
      difficultyStats: state.difficultyStats,
      answerLog: state.answerLog,
    }));
  } catch {}
}

export const usePracticeStore = defineStore('practice', () => {
  const saved = loadLocal();

  const topicProgress = ref(saved?.topicProgress || {});
  const history = ref(saved?.history || []);
  const mistakes = ref(saved?.mistakes || []);
  const totalStudyTime = ref(saved?.totalStudyTime || 0);
  const difficultyStats = ref(saved?.difficultyStats || {
    1: { total: 0, correct: 0 },
    2: { total: 0, correct: 0 },
    3: { total: 0, correct: 0 },
    4: { total: 0, correct: 0 },
    5: { total: 0, correct: 0 },
  });
  const answerLog = ref(saved?.answerLog || []);
  const currentQuestions = ref([]);
  const currentIndex = ref(0);
  const currentTopic = ref(null);
  const sessionCorrect = ref(0);
  const sessionWrong = ref(0);
  const sessionStartTime = ref(null);
  const isSessionActive = ref(false);

  const currentQuestion = computed(() => currentQuestions.value[currentIndex.value] || null);
  const sessionTotal = computed(() => sessionCorrect.value + sessionWrong.value);
  const sessionAccuracy = computed(() => sessionTotal.value > 0 ? Math.round((sessionCorrect.value / sessionTotal.value) * 100) : 0);
  const isSessionFinished = computed(() => currentIndex.value >= currentQuestions.value.length && currentQuestions.value.length > 0);

  function persistLocal() {
    saveLocal({
      topicProgress: topicProgress.value,
      history: history.value,
      mistakes: mistakes.value,
      totalStudyTime: totalStudyTime.value,
      difficultyStats: difficultyStats.value,
      answerLog: answerLog.value,
    });
  }

  function recalcDerived() {
    const dp = { 1: { total: 0, correct: 0 }, 2: { total: 0, correct: 0 }, 3: { total: 0, correct: 0 }, 4: { total: 0, correct: 0 }, 5: { total: 0, correct: 0 } };
    const tp = {};
    const ms = [];
    answerLog.value.forEach(e => {
      if (e.difficulty && dp[e.difficulty]) {
        dp[e.difficulty].total++;
        if (e.correct) dp[e.difficulty].correct++;
      }
      if (!tp[e.topic]) tp[e.topic] = { correct: 0, total: 0, level: 1, streak: 0 };
      tp[e.topic].total++;
      if (e.correct) {
        tp[e.topic].correct++;
        tp[e.topic].streak = (tp[e.topic].streak || 0) + 1;
        if (tp[e.topic].streak >= 3 && tp[e.topic].streak % 3 === 0) {
          tp[e.topic].level = Math.min((tp[e.topic].level || 1) + 1, 5);
        }
      } else {
        tp[e.topic].streak = 0;
      }
    });
    difficultyStats.value = dp;
    topicProgress.value = tp;
  }

  async function loadFromSupabase() {
    const auth = useAuthStore();
    if (!auth.user) return;
    const { data } = await supabase
      .from('answers')
      .select('topic, difficulty, correct, created_at')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: true });
    if (!data || data.length === 0) return;
    answerLog.value = data.map(r => ({
      timestamp: new Date(r.created_at).getTime(),
      topic: r.topic,
      difficulty: r.difficulty,
      correct: r.correct,
    }));
    recalcDerived();
    persistLocal();
  }

  async function syncAnswerToSupabase(entry) {
    const auth = useAuthStore();
    if (!auth.user) return;
    await supabase.from('answers').insert({
      user_id: auth.user.id,
      topic: entry.topic,
      difficulty: entry.difficulty,
      correct: entry.correct,
      created_at: new Date(entry.timestamp).toISOString(),
    });
  }

  function getTopicDifficulty(topicId) {
    const p = topicProgress.value[topicId];
    if (!p || p.total < 3) return 1;
    const accuracy = p.correct / p.total;
    if (accuracy >= 0.9 && p.total >= 5) return Math.min((p.level || 1) + 1, 5);
    if (accuracy < 0.5) return Math.max((p.level || 1) - 1, 1);
    return p.level || 1;
  }

  function startTopicSession(topicId, count = 10, difficulty = null) {
    const d = difficulty || getTopicDifficulty(topicId);
    currentQuestions.value = generateQuestionsForTopic(topicId, d, count);
    currentIndex.value = 0;
    currentTopic.value = topicId;
    sessionCorrect.value = 0;
    sessionWrong.value = 0;
    sessionStartTime.value = Date.now();
    isSessionActive.value = true;
  }

  function startMixedSession(count = 15, difficulty = null) {
    const weakTopics = TOPICS
      .filter(t => {
        const p = topicProgress.value[t.id];
        return !p || (p.correct / Math.max(p.total, 1)) < 0.7 || p.total < 5;
      })
      .map(t => t.id);
    const topicsToUse = weakTopics.length >= 3 ? weakTopics : TOPICS.map(t => t.id);
    currentQuestions.value = generateMixedQuestions(topicsToUse, difficulty || 2, count);
    currentIndex.value = 0;
    currentTopic.value = 'mixed';
    sessionCorrect.value = 0;
    sessionWrong.value = 0;
    sessionStartTime.value = Date.now();
    isSessionActive.value = true;
  }

  function answerQuestion(questionId, isCorrect) {
    const q = currentQuestions.value.find(q => q.id === questionId);
    if (!q) return;
    _processAnswer(q, isCorrect);
  }

  function answerBankQuestion(q, isCorrect) {
    _processAnswer(q, isCorrect);
  }

  function _processAnswer(q, isCorrect) {
    if (isCorrect) {
      sessionCorrect.value++;
    } else {
      sessionWrong.value++;
      mistakes.value.push({ ...q, timestamp: Date.now() });
      if (mistakes.value.length > 200) mistakes.value = mistakes.value.slice(-200);
    }
    const diff = q.difficulty;
    if (diff && difficultyStats.value[diff]) {
      difficultyStats.value[diff].total++;
      if (isCorrect) difficultyStats.value[diff].correct++;
    }
    const entry = {
      timestamp: Date.now(),
      topic: q.topic,
      difficulty: q.difficulty,
      correct: isCorrect,
    };
    answerLog.value.push(entry);
    if (answerLog.value.length > 5000) answerLog.value = answerLog.value.slice(-5000);
    const topicId = q.topic;
    if (!topicProgress.value[topicId]) {
      topicProgress.value[topicId] = { correct: 0, total: 0, level: 1, streak: 0 };
    }
    const tp = topicProgress.value[topicId];
    tp.total++;
    if (isCorrect) {
      tp.correct++;
      tp.streak = (tp.streak || 0) + 1;
      if (tp.streak >= 3 && tp.streak % 3 === 0) {
        tp.level = Math.min((tp.level || 1) + 1, 5);
      }
    } else {
      tp.streak = 0;
    }
    persistLocal();
    syncAnswerToSupabase(entry);
  }

  function nextQuestion() {
    currentIndex.value++;
  }

  function finishSession() {
    if (sessionStartTime.value) {
      totalStudyTime.value += Date.now() - sessionStartTime.value;
    }
    history.value.push({
      date: new Date().toISOString(),
      topic: currentTopic.value,
      total: sessionTotal.value,
      correct: sessionCorrect.value,
      wrong: sessionWrong.value,
      accuracy: sessionAccuracy.value,
    });
    if (history.value.length > 100) history.value = history.value.slice(-100);
    isSessionActive.value = false;
    persistLocal();
  }

  function reviewMistakes(count = 10) {
    const recent = mistakes.value.slice(-count);
    currentQuestions.value = recent.map((m, i) => ({ ...m, id: `review-${Date.now()}-${i}` }));
    currentIndex.value = 0;
    currentTopic.value = 'review';
    sessionCorrect.value = 0;
    sessionWrong.value = 0;
    sessionStartTime.value = Date.now();
    isSessionActive.value = true;
  }

  function clearMistakes() {
    mistakes.value = [];
    persistLocal();
  }

  function getOverallStats() {
    let totalCorrect = 0, totalQuestions = 0;
    Object.values(topicProgress.value).forEach(p => {
      totalCorrect += p.correct;
      totalQuestions += p.total;
    });
    return {
      totalQuestions,
      totalCorrect,
      totalWrong: totalQuestions - totalCorrect,
      accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
      totalSessions: history.value.length,
      totalStudyTime: totalStudyTime.value,
    };
  }

  function getFilteredStats(startDate, endDate) {
    const log = answerLog.value;
    const filtered = log.filter(entry => {
      if (startDate && entry.timestamp < startDate) return false;
      if (endDate && entry.timestamp > endDate) return false;
      return true;
    });
    const total = filtered.length;
    const correct = filtered.filter(e => e.correct).length;
    const diffStats = { 1: { total: 0, correct: 0 }, 2: { total: 0, correct: 0 }, 3: { total: 0, correct: 0 }, 4: { total: 0, correct: 0 }, 5: { total: 0, correct: 0 } };
    filtered.forEach(e => {
      if (e.difficulty && diffStats[e.difficulty]) {
        diffStats[e.difficulty].total++;
        if (e.correct) diffStats[e.difficulty].correct++;
      }
    });
    return {
      totalQuestions: total,
      totalCorrect: correct,
      totalWrong: total - correct,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      difficultyStats: diffStats,
    };
  }

  function getDifficultyStats() {
    const result = {};
    for (let i = 1; i <= 5; i++) {
      const s = difficultyStats.value[i] || { total: 0, correct: 0 };
      result[i] = {
        total: s.total,
        correct: s.correct,
        wrong: s.total - s.correct,
        accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
      };
    }
    return result;
  }

  function getTopicStats(topicId) {
    const p = topicProgress.value[topicId];
    return p ? { ...p, accuracy: p.total > 0 ? Math.round((p.correct / p.total) * 100) : 0 } : { correct: 0, total: 0, level: 1, streak: 0, accuracy: 0 };
  }

  return {
    topicProgress, history, mistakes, totalStudyTime, difficultyStats, answerLog,
    currentQuestions, currentIndex, currentTopic,
    sessionCorrect, sessionWrong, sessionTotal, sessionAccuracy,
    currentQuestion, isSessionActive, isSessionFinished,
    getTopicDifficulty, getTopicStats, getOverallStats, getDifficultyStats, getFilteredStats,
    startTopicSession, startMixedSession, answerQuestion, answerBankQuestion,
    nextQuestion, finishSession, reviewMistakes, clearMistakes,
    loadFromSupabase, persistLocal,
  };
});
