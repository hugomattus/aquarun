import { createClient } from '@supabase/supabase-js'

export const config = { maxDuration: 60 }

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

const CLIENT_ID = process.env.VITE_STRAVA_CLIENT_ID
const CLIENT_SECRET = process.env.VITE_STRAVA_CLIENT_SECRET

async function getStravaAccessToken(athleteId) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, strava_tokens')
    .eq('strava_athlete_id', athleteId)
    .maybeSingle()

  if (!profile?.strava_tokens) return { userId: null, token: null }

  let tokens = profile.strava_tokens

  if (tokens.expires_at * 1000 < Date.now() + 60000 && CLIENT_ID && CLIENT_SECRET) {
    const res = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: tokens.refresh_token,
      }),
    })
    const data = await res.json()
    if (data.access_token) {
      tokens = data
      await supabase.from('profiles').update({
        strava_tokens: {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at,
        },
      }).eq('id', profile.id)
    }
  }

  return { userId: profile.id, token: tokens.access_token }
}

async function fetchActivity(token, id) {
  const res = await fetch(`https://www.strava.com/api/v3/activities/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.ok ? res.json() : null
}

async function upsertActivity(activity, userId) {
  const type = activity.type === 'Swim' || activity.type === 'OpenWaterSwim' ? 'swim' : 'run'

  const payload = {
    user_id: userId,
    strava_id: activity.id,
    type,
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
    calories: activity.calories,
    splits: activity.splits || {},
  }

  const { data: existing } = await supabase
    .from('activities')
    .select('id')
    .eq('strava_id', activity.id)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    await supabase.from('activities').update(payload).eq('id', existing.id)
  } else {
    await supabase.from('activities').insert(payload)
  }

  return { activity, userId, type }
}

async function autoCompleteWorkout({ activity, userId, type }) {
  const localDate = new Date(activity.start_date)
  const dateStr = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`

  const { data: workout } = await supabase
    .from('workouts')
    .select('id')
    .eq('user_id', userId)
    .eq('type', type)
    .eq('scheduled_date', dateStr)
    .eq('status', 'planned')
    .maybeSingle()

  if (!workout) return

  await supabase.from('workouts').update({
    status: 'completed',
    completed_activity_id: activity.id,
    actual_distance: activity.distance,
    actual_duration: activity.moving_time || activity.elapsed_time,
    actual_heartrate: activity.average_heartrate,
    actual_max_heartrate: activity.max_heartrate,
    actual_cadence: activity.average_cadence,
    actual_elevation: activity.total_elevation_gain,
    actual_calories: activity.calories,
    actual_elapsed_time: activity.elapsed_time,
    actual_moving_time: activity.moving_time,
    actual_pace: activity.average_speed > 0 ? 1000 / (activity.average_speed) : null,
    splits: activity.splits || null,
  }).eq('id', workout.id)
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const mode = req.query?.['hub.mode']
    const token = req.query?.['hub.verify_token']
    const challenge = req.query?.['hub.challenge']

    if (mode === 'subscribe' && token === process.env.STRAVA_WEBHOOK_VERIFY_TOKEN) {
      return res.status(200).json({ 'hub.challenge': challenge })
    }
    return res.status(403).json({ error: 'Invalid verification' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const events = Array.isArray(req.body) ? req.body : [req.body]

    for (const event of events) {
      if (event.object_type !== 'activity') continue

      if (event.aspect_type === 'delete') {
        await supabase.from('activities').delete().eq('strava_id', event.object_id)
        continue
      }

      if (event.aspect_type !== 'create' && event.aspect_type !== 'update') continue

      const { userId, token } = await getStravaAccessToken(event.owner_id)
      if (!userId || !token) continue

      const activity = await fetchActivity(token, event.object_id)
      if (!activity) continue

      const result = await upsertActivity(activity, userId)
      await autoCompleteWorkout(result)
    }

    return res.status(200).json({ ok: true })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}