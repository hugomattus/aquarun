export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'

  try {
    const { prompt, history = [], context } = req.body
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' })

    let systemPrompt = `Você é o AquaRun Coach, um assistente de IA especializado em treinos de corrida e natação.
Suas responsabilidades:
- Criar planos de treino personalizados
- Analisar performance do atleta
- Dar dicas de técnica para corrida e natação
- Ajustar treinos baseado no progresso
- Responder dúvidas sobre treinamento

Responda sempre em português brasileiro. Seja direto e prático.`

    if (context) {
      if (context.profile) {
        const p = context.profile
        systemPrompt += `\n\nDADOS DO ATLETA:
- Nome: ${p.full_name || 'Não informado'}
- Experiência: ${p.running_experience || 'Não informado'}
- Dias de corrida: ${(p.run_days || []).join(', ') || 'Não definido'}
- Dias de natação: ${(p.swim_days || []).join(', ') || 'Não definido'}`
      }

      if (context.currentWeekWorkouts?.length) {
        systemPrompt += `\n\nTREINOS DESTA SEMANA:`
        for (const w of context.currentWeekWorkouts) {
          systemPrompt += `\n- ${w.name} (${w.type === 'swim' ? 'Natação' : 'Corrida'}) - ${w.scheduled_date} - ${w.duration}min - Status: ${w.status === 'completed' ? 'Concluído' : 'Planejado'}`
          if (w.status === 'completed') {
            if (w.actual_distance) systemPrompt += ` | Distância: ${(w.actual_distance / 1000).toFixed(2)}km`
            if (w.actual_pace) {
              const min = Math.floor(1000 / w.actual_pace / 60)
              const sec = Math.floor((1000 / w.actual_pace) % 60)
              systemPrompt += ` | Ritmo: ${min}:${sec.toString().padStart(2, '0')}/km`
            }
            if (w.feedback_effort) systemPrompt += ` | Esforço: ${w.feedback_effort}`
          }
        }
      }

      if (context.recentActivities?.length) {
        systemPrompt += `\n\nATIVIDADES RECENTES DO STRAVA:`
        for (const a of context.recentActivities.slice(0, 5)) {
          const dist = a.distance >= 1000 ? `${(a.distance / 1000).toFixed(2)}km` : `${a.distance}m`
          const time = `${Math.floor(a.moving_time / 60)}min`
          systemPrompt += `\n- ${a.name} (${a.type === 'swim' ? 'Natação' : 'Corrida'}) - ${dist} - ${time}`
        }
      }

      if (context.weekStats) {
        const s = context.weekStats
        systemPrompt += `\n\nRESUMO DA SEMANA:
- Total de treinos: ${s.completed}/${s.total} concluídos
- Distância corrida: ${(s.runDistance / 1000).toFixed(2)}km
- Distância nadada: ${s.swimDistance}m
- Esforço médio: ${s.avgEffort || 'Não informado'}`
      }
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      })),
      { role: 'user', content: prompt },
    ]

    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return res.status(response.status).json({ error: err.error?.message || 'Groq API error' })
    }

    const data = await response.json()
    return res.status(200).json({ reply: data.choices[0].message.content })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
