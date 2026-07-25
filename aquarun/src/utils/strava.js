import { supabase } from './supabase'

const STRAVA_CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID
const STRAVA_REDIRECT_URI = import.meta.env.VITE_STRAVA_REDIRECT_URI

export const stravaConfig = {
  clientId: STRAVA_CLIENT_ID,
  redirectUri: STRAVA_REDIRECT_URI,
  authorizeUrl: 'https://www.strava.com/oauth/authorize',
  apiUrl: 'https://www.strava.com/api/v3',
}

export function getStravaAuthUrl() {
  const params = new URLSearchParams({
    client_id: stravaConfig.clientId,
    redirect_uri: stravaConfig.redirectUri,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,activity:read_all',
  })
  return `${stravaConfig.authorizeUrl}?${params.toString()}`
}

export async function exchangeToken(code) {
  const baseUrl = import.meta.env.DEV
    ? 'http://localhost:5173'
    : window.location.origin

  const response = await fetch(`${baseUrl}/api/strava`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })

  if (!response.ok) {
    throw new Error('Erro ao autorizar com Strava')
  }

  return response.json()
}

export async function refreshToken(refreshTokenValue) {
  const baseUrl = import.meta.env.DEV
    ? 'http://localhost:5173'
    : window.location.origin

  const response = await fetch(`${baseUrl}/api/strava-refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshTokenValue }),
  })

  if (!response.ok) {
    throw new Error('Erro ao renovar token do Strava')
  }

  return response.json()
}

export async function getStravaActivities(accessToken, page = 1, perPage = 30) {
  const response = await fetch(
    `${stravaConfig.apiUrl}/athlete/activities?page=${page}&per_page=${perPage}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  return response.json()
}

export async function getStravaAthlete(accessToken) {
  const response = await fetch(`${stravaConfig.apiUrl}/athlete`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return response.json()
}
