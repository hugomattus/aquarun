export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { refresh_token } = req.body

    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' })
    }

    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.VITE_STRAVA_CLIENT_ID,
        client_secret: process.env.VITE_STRAVA_CLIENT_SECRET,
        refresh_token,
        grant_type: 'refresh_token',
      }),
    })

    const data = await response.json()

    if (data.errors) {
      return res.status(400).json({ error: data.message || 'Token refresh error' })
    }

    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
