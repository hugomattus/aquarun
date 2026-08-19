import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

export const config = { maxDuration: 60 }

function zonedNow(timeZone) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  }).formatToParts(new Date())
  const get = (t) => String(parts.find(p => p.type === t)?.value || '00').padStart(2, '0')
  const hour = get('hour') === '24' ? '00' : get('hour')
  const minute = get('minute')
  return {
    dateStr: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: parseInt(hour, 10) * 60 + parseInt(minute, 10),
  }
}

function minutesFromHHMM(str) {
  const [h, m] = String(str || '07:00').split(':').map(n => parseInt(n, 10))
  return (isNaN(h) ? 7 : h) * 60 + (isNaN(m) ? 0 : m)
}

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return res.status(500).json({ error: 'VAPID keys not configured' })
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
  )

  webpush.setVapidDetails(
    'mailto:aquarun@hugomattus.dev',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )

  try {
    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, keys, user_id, last_reminder_at, profiles(settings)')

    if (error) throw error

    let sent = 0
    let skipped = 0
    let failed = 0

    for (const sub of (subs || [])) {
      try {
        const settings = sub.profiles?.settings || {}
        const notif = settings.notifications || {}
        if (!notif.workoutReminder) { skipped++; continue }

        const tz = notif.timezone || 'America/Sao_Paulo'
        const now = zonedNow(tz)
        const reminder = minutesFromHHMM(notif.reminderTime)
        const diff = now.minutes - reminder
        if (diff < 0 || diff >= 60) { skipped++; continue }

        const last = sub.last_reminder_at ? new Date(sub.last_reminder_at).getTime() : 0
        if (Date.now() - last < 60 * 60 * 1000) { skipped++; continue }

        const { data: workouts } = await supabase
          .from('workouts')
          .select('id, name, type')
          .eq('user_id', sub.user_id)
          .eq('scheduled_date', now.dateStr)
          .eq('status', 'planned')

        if (!workouts || workouts.length === 0) { skipped++; continue }

        const workout = workouts[0]
        const typeLabel = workout.type === 'swim' ? 'Natação' : 'Corrida'

        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: sub.keys },
            JSON.stringify({
              title: `Treino de hoje: ${workout.name}`,
              body: `${typeLabel} programada para hoje. Bora?`,
              url: '/my-workout',
            })
          )
          sent++
          await supabase.from('push_subscriptions').update({ last_reminder_at: new Date().toISOString() }).eq('id', sub.id)
        } catch (err) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            await supabase.from('push_subscriptions').delete().eq('id', sub.id)
          }
          failed++
        }
      } catch (e) {
        failed++
      }
    }

    return res.status(200).json({ sent, skipped, failed })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}