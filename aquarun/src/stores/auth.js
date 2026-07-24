import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../utils/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(true)

  async function init() {
    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user || null
    if (user.value) await fetchProfile()
    loading.value = false

    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user || null
      if (user.value) fetchProfile()
      else profile.value = null
    })
  }

  async function fetchProfile() {
    if (!user.value) return
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .maybeSingle()
    if (error) {
      console.warn('fetchProfile:', error.message)
      profile.value = null
      return
    }
    profile.value = data
  }

  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data.user) {
      user.value = data.user
      await new Promise(r => setTimeout(r, 500))
      await fetchProfile()
    }
    return data
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    user.value = data.user
    await fetchProfile()
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }

  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  async function updateProfile(data) {
    if (!profile.value) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: user.value.id, ...data })
      if (insertError) throw insertError
    } else {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.value.id)
      if (updateError) throw updateError
    }
  }

  return { user, profile, loading, init, signUp, signIn, signOut, fetchProfile, resetPassword, updatePassword, updateProfile }
})
