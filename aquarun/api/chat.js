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

    let systemPrompt = `Você é o AquaRun Coach, um treinador esportivo pessoal especializado em corrida de rua e natação (crawl).
Seu conhecimento inclui treinamento periodizado, fisiologia do exercício, prevenção de lesões, recuperação e nutrição esportiva.

Suas responsabilidades:
- Criar e ajustar planos de treino personalizados
- Analisar performance com dados reais e subjetivos
- Identificar padrões de melhoria, estagnação ou risco
- Dar dicas técnicas específicas para corrida e natação
- Ajustar treinos baseado em evolução, sono, estresse e dor
- Orientar sobre recuperação, aquecimento e alongamento
- Responder dúvidas sobre treinamento com embasamento

Responda sempre em português brasileiro. Seja direto, prático e motivador como um treinador pessoal de verdade.`

    if (context) {
      if (context.profile) {
        const p = context.profile
        const age = p.birth_date
          ? Math.floor((Date.now() - new Date(p.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : null
        systemPrompt += `\n\nPERFIL COMPLETO DO ATLETA:
- Nome: ${p.full_name || 'Não informado'}
- Idade: ${age ? age + ' anos' : 'não informado'}
- Peso: ${p.weight ? p.weight + ' kg' : 'não informado'}
- Altura: ${p.height ? p.height + ' cm' : 'não informado'}
- Experiência corrida: ${p.running_experience || 'Não informado'}
- Nível atividade: ${p.activity_level || 'Não informado'}
- Ritmo confortável: ${p.comfortable_pace || 'Não informado'}
- Ritmo-alvo: ${p.target_run_pace || 'Não informado'}
- Distância-alvo: ${p.target_run_distance || 'Não informado'}
- Dias de corrida: ${(p.run_days || []).join(', ') || 'Não definido'}
- Dias de natação: ${(p.swim_days || []).join(', ') || 'Não definido'}
- Lesões atuais: ${p.current_injuries || 'nenhuma'}
- Histórico de lesões: ${p.injury_history || 'nenhum'}
- Medicamentos: ${p.medications || 'nenhum'}`
      }

      if (context.currentWeekWorkouts?.length) {
        const today = context.today || new Date().toLocaleDateString('sv-SE')
        systemPrompt += `\n\nHOJE É DIA: ${today} (fuso horário do atleta)`
        systemPrompt += `\n\nTREINOS DESTA SEMANA:`
        for (const w of context.currentWeekWorkouts) {
          const isToday = w.scheduled_date === today
          const dayLabel = isToday ? ' (HOJE)' : ''
          systemPrompt += `\n- ${w.name} (${w.type === 'swim' ? 'Natação' : 'Corrida'}) - ${w.scheduled_date}${dayLabel} - ${w.duration}min - Status: ${w.status === 'completed' ? 'Concluído' : w.status === 'skipped' ? 'Pulado' : 'Planejado'}`
          if (w.status === 'completed') {
            if (w.actual_distance) systemPrompt += ` | Distância: ${(w.actual_distance / 1000).toFixed(2)}km`
            if (w.actual_duration) systemPrompt += ` | Tempo: ${Math.floor(w.actual_duration / 60)}min${w.actual_duration % 60 ? ' ' + (w.actual_duration % 60) + 's' : ''}`
            if (w.actual_pace) {
              const min = Math.floor(w.actual_pace / 60)
              const sec = Math.floor(w.actual_pace % 60)
              systemPrompt += ` | Ritmo: ${min}:${sec.toString().padStart(2, '0')}/km`
            }
            if (w.actual_heartrate) systemPrompt += ` | BPM: ${Math.round(w.actual_heartrate)}`
            const effortMap = { very_easy: 'Muito fácil', easy: 'Fácil', moderate: 'Normal', hard: 'Difícil', very_hard: 'Muito difícil' }
            if (w.feedback_effort) systemPrompt += ` | Esforço: ${effortMap[w.feedback_effort] || w.feedback_effort}`
            if (w.feedback_energy) systemPrompt += ` | Energia: ${w.feedback_energy}/5`
            if (w.feedback_sleep) systemPrompt += ` | Sono: ${w.feedback_sleep}/5`
            if (w.feedback_stress) systemPrompt += ` | Estresse: ${w.feedback_stress}/5`
            if (w.feedback_pain) systemPrompt += ` | Dor: ${w.feedback_pain}/10`
            if (w.feedback_notes) systemPrompt += ` | Obs: ${w.feedback_notes}`
          }
        }
      }

      if (context.recentActivities?.length) {
        systemPrompt += `\n\nATIVIDADES RECENTES DO STRAVA (últimas 5):`
        for (const a of context.recentActivities) {
          const dist = a.distance >= 1000 ? `${(a.distance / 1000).toFixed(2)}km` : `${a.distance}m`
          const time = `${Math.floor(a.moving_time / 60)}min`
          const pace = a.moving_time > 0 && a.distance > 0 ? (() => {
            const p = (a.moving_time * 1000 / a.distance)
            return `${Math.floor(p / 60)}:${Math.floor(p % 60).toString().padStart(2, '0')}/km`
          })() : ''
          const hr = a.average_heartrate ? ` | BPM: ${Math.round(a.average_heartrate)}` : ''
          systemPrompt += `\n- ${a.name} (${a.type === 'swim' ? 'Natação' : 'Corrida'}) - ${dist} - ${time} - ${pace}${hr}`
        }
      }

      if (context.weekStats) {
        const s = context.weekStats
        systemPrompt += `\n\nRESUMO DA SEMANA:
- Total de treinos: ${s.completed}/${s.total} concluídos
- Distância corrida: ${s.runDistance ? (s.runDistance / 1000).toFixed(2) + 'km' : '0km'}
- Distância nadada: ${s.swimDistance ? (s.swimDistance / 1000).toFixed(2) + 'km' : '0km'}
- Esforço médio: ${s.avgEffort || 'Não informado'}
- Dor média: ${s.avgPain || 0}/10
- Energia média: ${s.avgEnergy || 0}/5
- Sono médio: ${s.avgSleep || 0}/5
- Estresse médio: ${s.avgStress || 0}/5`
      }

      if (context.trends) {
        const t = context.trends
        systemPrompt += `\n\nTENDÊNCIAS E EVOLUÇÃO:`
        if (t.paceTrend) systemPrompt += `\n- Ritmo: ${t.paceTrend}`
        if (t.distanceTrend) systemPrompt += `\n- Distância semanal: ${t.distanceTrend}`
        if (t.effortTrend) systemPrompt += `\n- Esforço percebido: ${t.effortTrend}`
        if (t.painTrend) systemPrompt += `\n- Dor: ${t.painTrend}`
        if (t.bestPace30d) systemPrompt += `\n- Melhor ritmo 30 dias: ${t.bestPace30d}`
        if (t.totalDistance30d) systemPrompt += `\n- Distância total 30 dias: ${t.totalDistance30d}`
        if (t.totalWorkouts30d) systemPrompt += `\n- Treinos nos últimos 30 dias: ${t.totalWorkouts30d}`
        if (t.recoveryPatterns) systemPrompt += `\n- Padrões de recuperação: ${t.recoveryPatterns}`
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
