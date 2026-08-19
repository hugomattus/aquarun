import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const env = {}
try {
  const raw = readFileSync(resolve('.env.local'), 'utf8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch (e) {
  console.error('.env.local não encontrado')
  process.exit(1)
}

const clientId = env.VITE_STRAVA_CLIENT_ID
const clientSecret = env.VITE_STRAVA_CLIENT_SECRET
const callbackUrl = process.env.STRAVA_CALLBACK_URL || 'https://aquarun.vercel.app/api/strava-webhook'
const verifyToken = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN || 'aquarun-verify'

if (!clientId || !clientSecret) {
  console.error('VITE_STRAVA_CLIENT_ID e VITE_STRAVA_CLIENT_SECRET são obrigatórios no .env.local')
  process.exit(1)
}

const body = new URLSearchParams({
  client_id: clientId,
  client_secret: clientSecret,
  callback_url: callbackUrl,
  verify_token: verifyToken,
})

const res = await fetch('https://www.strava.com/api/v3/push_subscriptions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body,
})

const data = await res.json()
console.log(JSON.stringify(data, null, 2))

if (data.id) {
  console.log(`\nWebhook registrado! id: ${data.id}`)
  console.log(`Verify token usado: ${verifyToken}`)
  console.log('Adicione STRAVA_WEBHOOK_VERIFY_TOKEN=' + verifyToken + ' nas env vars do Vercel.')
}