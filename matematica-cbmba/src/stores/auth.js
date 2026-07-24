import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '../utils/supabase.js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const profile = ref(null);
  const loading = ref(true);

  async function init() {
    const { data: { session } } = await supabase.auth.getSession();
    user.value = session?.user || null;
    if (user.value) {
      await fetchProfile();
      try {
        const { usePracticeStore } = await import('./practice.js');
        const practice = usePracticeStore();
        await practice.loadFromSupabase();
      } catch {}
    }
    loading.value = false;

    supabase.auth.onAuthStateChange(async (_event, session) => {
      user.value = session?.user || null;
      if (user.value) {
        await fetchProfile();
        try {
          const { usePracticeStore } = await import('./practice.js');
          const practice = usePracticeStore();
          await practice.loadFromSupabase();
        } catch {}
      } else {
        profile.value = null;
      }
    });
  }

  async function fetchProfile() {
    if (!user.value) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single();
    profile.value = data;
  }

  async function signUp(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        display_name: displayName,
      });
    }
    return data;
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    try {
      const { usePracticeStore } = await import('./practice.js');
      const practice = usePracticeStore();
      await practice.loadFromSupabase();
    } catch {}
    return data;
  }

  async function signOut() {
    await supabase.auth.signOut();
    user.value = null;
    profile.value = null;
  }

  return { user, profile, loading, init, signUp, signIn, signOut, fetchProfile };
});
