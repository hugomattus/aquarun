import express from 'express'
import { createServer as createViteServer } from 'vite'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '.env.local') })

const app = express()
app.use(express.json())

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

async function groqChat(messages) {
  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VITE_GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `Groq API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

const SYSTEM_PROMPT = `Você é o AquaRun Coach, um assistente de IA especializado em treinos de corrida e natação.
Suas responsabilidades:
- Criar planos de treino personalizados
- Analisar performance do atleta
- Dar dicas de técnica para corrida e natação
- Ajustar treinos baseado no progresso
- Responder dúvidas sobre treinamento

Responda sempre em português brasileiro. Seja direto e prático.`

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, history = [] } = req.body

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' })
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      })),
      { role: 'user', content: prompt },
    ]

    const reply = await groqChat(messages)
    return res.status(200).json({ reply })
  } catch (error) {
    console.error('Chat error:', error)
    return res.status(500).json({ error: error.message })
  }
})

// Workout plan endpoint
app.post('/api/workout-plan', async (req, res) => {
  try {
    const { profile, preferences } = req.body

    const prompt = `
Gere um plano de treino semanal personalizado para:
- Modalidades: Corrida e Natação
- Nível: ${profile?.level || 'iniciante'}
- Objetivo: ${preferences?.goal || 'condicionamento geral'}
- Dias disponíveis por semana: ${preferences?.daysPerWeek || 4}
- Tempo disponível por treino: ${preferences?.minutesPerSession || 45} minutos

Retorne APENAS o JSON, sem markdown ou código extra:
{
  "week": [
    {
      "day": "Segunda",
      "type": "run",
      "name": "Treino Fácil",
      "duration": 30,
      "intervals": [
        {"type": "warmup", "duration": 5, "description": "Aquecimento leve"},
        {"type": "main", "duration": 20, "description": "Corrida contínua ritmo leve"},
        {"type": "cooldown", "duration": 5, "description": "Volta à calma"}
      ]
    }
  ]
}

Inclua 4-5 dias de treino, alternando corrida e natação. Seja específico nas distâncias e ritmos.
`

    const text = await groqChat([{ role: 'user', content: prompt }])
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      return res.status(200).json(JSON.parse(jsonMatch[0]))
    }
    return res.status(500).json({ error: 'Não foi possível gerar o plano' })
  } catch (error) {
    console.error('Workout plan error:', error)
    return res.status(500).json({ error: error.message })
  }
})

// Strava OAuth token exchange
app.post('/api/strava', async (req, res) => {
  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({ error: 'Code is required' })
    }

    const clientId = process.env.VITE_STRAVA_CLIENT_ID
    const clientSecret = process.env.VITE_STRAVA_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return res.status(500).json({ error: 'Missing Strava credentials' })
    }

    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    })

    const data = await response.json()

    if (data.errors) {
      return res.status(400).json({ error: data.message || 'Strava auth error', details: data.errors })
    }

    return res.status(200).json(data)
  } catch (error) {
    console.error('Token exchange error:', error)
    return res.status(500).json({ error: error.message })
  }
})

// Strava refresh token
app.post('/api/strava/refresh', async (req, res) => {
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
    console.error('Token refresh error:', error)
    return res.status(500).json({ error: error.message })
  }
})

// Vite dev server
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa',
})

app.use(vite.middlewares)

const PORT = process.env.PORT || 5173
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
