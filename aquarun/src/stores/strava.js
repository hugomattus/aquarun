import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../utils/supabase'
import { useAuthStore } from './auth'
import { refreshToken } from '../utils/strava'

export const useStravaStore = defineStore('strava', () => {
  const auth = useAuthStore()
  const connected = ref(false)
  const athlete = ref(null)
  const activities = ref([])
  const loading = ref(false)

  const swimActivities = computed(() =>
    activities.value.filter(a => a.type === 'Swim' || a.type === 'OpenWaterSwim')
  )
  const runActivities = computed(() =>
    activities.value.filter(a => a.type === 'Run' || a.type === 'TrailRun')
  )

  async function checkConnection() {
    if (!auth.profile) {
      await auth.fetchProfile()
    }
    if (!auth.profile?.strava_tokens) return
    connected.value = true
    athlete.value = auth.profile.strava_athlete
  }

  async function saveTokens(tokenData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').upsert({
      id: user.id,
      strava_athlete_id: tokenData.athlete.id,
      strava_athlete: tokenData.athlete,
      strava_tokens: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_at,
      },
    })

    await auth.fetchProfile()

    connected.value = true
    athlete.value = tokenData.athlete
  }

  async function refreshAccessToken() {
    if (!auth.profile?.strava_tokens?.refresh_token) return null

    try {
      const data = await refreshToken(auth.profile.strava_tokens.refresh_token)

      if (data.access_token) {
        await supabase.from('profiles').update({
          strava_tokens: {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: data.expires_at,
          },
        }).eq('id', auth.user.id)

        return data.access_token
      }
      return null
    } catch (e) {
      console.error('Erro ao renovar token:', e)
      return null
    }
  }

  async function fetchActivities() {
    if (!auth.profile?.strava_tokens) {
      await auth.fetchProfile()
    }
    if (!auth.profile?.strava_tokens) return

    loading.value = true

    let accessToken = auth.profile.strava_tokens.access_token

    if (auth.profile.strava_tokens.expires_at * 1000 < Date.now()) {
      accessToken = await refreshAccessToken()
    }

    if (!accessToken) {
      loading.value = false
      return
    }

    try {
      const response = await fetch(
        'https://www.strava.com/api/v3/athlete/activities?per_page=50',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (response.ok) {
        activities.value = await response.json()
      }
    } catch (e) {
      console.error('Erro ao buscar atividades:', e)
    } finally {
      loading.value = false
    }
  }

  async function syncActivities() {
    if (!auth.profile?.strava_tokens) return

    for (const activity of activities.value) {
      const activityType = activity.type === 'Swim' || activity.type === 'OpenWaterSwim' ? 'swim' : 'run'

      const { data: existing } = await supabase
        .from('activities')
        .select('id')
        .eq('strava_id', activity.id)
        .eq('user_id', auth.user.id)
        .maybeSingle()

      const payload = {
        user_id: auth.user.id,
        strava_id: activity.id,
        type: activityType,
        name: activity.name,
        distance: activity.distance,
        moving_time: activity.moving_time,
        elapsed_time: activity.elapsed_time,
        start_date: activity.start_date,
        average_heartrate: activity.average_heartrate,
        max_heartrate: activity.max_heartrate,
        average_speed: activity.average_speed,
        average_cadence: activity.average_cadence,
        total_elevation_gain: activity.total_elevation_gain,
      }

      if (existing) {
        await supabase.from('activities').update(payload).eq('id', existing.id)
      } else {
        await supabase.from('activities').insert(payload)
      }
    }
  }

  return {
    connected, athlete, activities, loading,
    swimActivities, runActivities,
    checkConnection, saveTokens, fetchActivities, syncActivities
  }
})
