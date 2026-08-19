const baseUrl = import.meta.env.DEV
  ? 'http://localhost:5173'
  : window.location.origin

export async function getAIResponse(prompt, history = [], context = null) {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, history, context }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || `Erro na API: ${response.status}`)
  }

  const data = await response.json()
  return data.reply
}

export async function generateWorkoutPlan(profile, preferences) {
  const response = await fetch(`${baseUrl}/api/workout-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, preferences }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || `Erro ao gerar plano: ${response.status}`)
  }

  return response.json()
}
