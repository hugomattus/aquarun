export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { workout, feedback, performance, profile, recentWorkouts, weekStats, trends } = req.body

    const effortMap = { very_easy: 1, easy: 2, moderate: 3, hard: 4, very_hard: 5 }
    const effortNum = effortMap[feedback.effort] || 3
    const effortLabel = { very_easy: 'Muito fácil', easy: 'Fácil', moderate: 'Normal', hard: 'Difícil', very_hard: 'Muito difícil' }

    let systemPrompt = `Você é o AquaRun Coach, um treinador esportivo pessoal especializado em corrida e natação (crawl).
Analise este treino e dê um feedback profundo, motivador e técnico em português brasileiro.

REGRAS:
- Seja direto e honesto, como um treinador pessoal
- Use os dados históricos para comparar com treinos anteriores
- Identifique padrões (melhoria, estagnação, risco de lesão)
- Dê dicas práticas e específicas, não genéricas
- Máximo 3 pontos positivos e 2 negativos
- A dica deve ser aplicável no próximo treino`

    if (profile) {
      const age = profile.birth_date
        ? Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null
      systemPrompt += `\n\nPERFIL DO ATLETA:
- Nome: ${profile.full_name || 'Atleta'}
- Idade: ${age ? age + ' anos' : 'não informado'}
- Peso: ${profile.weight ? profile.weight + ' kg' : 'não informado'}
- Altura: ${profile.height ? profile.height + ' cm' : 'não informado'}
- Experiência: ${profile.running_experience || 'não informado'}
- Ritmo confortável: ${profile.comfortable_pace || 'não informado'}
- Ritmo-alvo: ${profile.target_run_pace || 'não informado'}
- Lesões atuais: ${profile.current_injuries || 'nenhuma'}
- Histórico de lesões: ${profile.injury_history || 'nenhum'}`
    }

    let perfLines = []
    if (performance?.distance) perfLines.push(`Distância: ${(performance.distance / 1000).toFixed(2)} km`)
    if (performance?.duration) perfLines.push(`Tempo: ${Math.floor(performance.duration / 60)}min ${performance.duration % 60}s`)
    if (performance?.pace) {
      const min = Math.floor(performance.pace / 60)
      const sec = Math.floor(performance.pace % 60)
      perfLines.push(`Ritmo: ${min}:${sec.toString().padStart(2, '0')}/km`)
    }
    if (performance?.heartrate) perfLines.push(`BPM médio: ${Math.round(performance.heartrate)}`)
    if (performance?.maxHeartrate) perfLines.push(`BPM máx: ${Math.round(performance.maxHeartrate)}`)

    systemPrompt += `\n\nTREINO ATUAL:
- Nome: ${workout.name} (${workout.type === 'swim' ? 'Natação' : 'Corrida'})
- Duração planejada: ${workout.duration}min
- Dados reais:
${perfLines.length ? perfLines.map(l => `  ${l}`).join('\n') : '  Sem dados de performance'}

FEEDBACK DO ATLETA:
- Esforço percebido: ${effortLabel[feedback.effort] || 'Não informado'} (${effortNum}/5)
- Energia: ${feedback.energy || 'Não informado'}/5
- Sono: ${feedback.sleep || 'Não informado'}/5
- Estresse: ${feedback.stress || 'Não informado'}/5
- Dor muscular: ${feedback.pain || 0}/10
${feedback.notes ? `- Observações: ${feedback.notes}` : ''}`

    if (recentWorkouts?.length) {
      systemPrompt += `\n\nHISTÓRICO DE TREINOS RECENTES (mesmo tipo):`
      for (const rw of recentWorkouts.slice(0, 8)) {
        const rwPace = rw.actual_pace ? `${Math.floor(rw.actual_pace / 60)}:${Math.floor(rw.actual_pace % 60).toString().padStart(2, '0')}/km` : 'sem ritmo'
        const rwDist = rw.actual_distance ? `${(rw.actual_distance / 1000).toFixed(2)}km` : 'sem distância'
        const rwEffort = effortLabel[rw.feedback_effort] || '-'
        systemPrompt += `\n- ${rw.name} (${rw.scheduled_date}) | ${rwDist} | ${rwPace} | Esforço: ${rwEffort} | Dor: ${rw.feedback_pain || 0}/10`
      }
    }

    if (weekStats) {
      systemPrompt += `\n\nRESUMO DA SEMANA ATUAL:
- Treinos: ${weekStats.completed}/${weekStats.total} concluídos
- Distância corrida: ${weekStats.runDistance ? (weekStats.runDistance / 1000).toFixed(2) + 'km' : '0km'}
- Distância nadada: ${weekStats.swimDistance ? (weekStats.swimDistance / 1000).toFixed(2) + 'km' : '0km'}
- Esforço médio: ${weekStats.avgEffort || 'não informado'}
- Dor média: ${weekStats.avgPain || 0}/10
- Energia média: ${weekStats.avgEnergy || 0}/5
- Sono médio: ${weekStats.avgSleep || 0}/5
- Estresse médio: ${weekStats.avgStress || 0}/5`
    }

    if (trends) {
      systemPrompt += `\n\nTENDÊNCIAS (últimas semanas):`
      if (trends.paceTrend) systemPrompt += `\n- Ritmo: ${trends.paceTrend}`
      if (trends.distanceTrend) systemPrompt += `\n- Distância: ${trends.distanceTrend}`
      if (trends.effortTrend) systemPrompt += `\n- Esforço percebido: ${trends.effortTrend}`
      if (trends.painTrend) systemPrompt += `\n- Dor: ${trends.painTrend}`
      if (trends.bestPace30d) systemPrompt += `\n- Melhor ritmo 30 dias: ${trends.bestPace30d}`
      if (trends.totalDistance30d) systemPrompt += `\n- Distância total 30 dias: ${trends.totalDistance30d}`
    }

    systemPrompt += `\n\nResponda EXATAMENTE neste formato JSON (sem markdown, sem \`\`\`):
{
  "summary": "Resumo em 1-2 frases do treino, comparando com histórico quando disponível",
  "positive": ["ponto positivo 1 com base nos dados", "ponto positivo 2"],
  "negative": ["ponto negativo ou vazio se não tiver"],
  "tip": "Dica prática e específica para o próximo treino, baseada nos padrões identificados"
}`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: systemPrompt }],
        temperature: 0.7,
        max_tokens: 800,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return res.status(response.status).json({ error: err.error?.message || 'Groq API error' })
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      parsed = {
        summary: content.slice(0, 300),
        positive: ['Treino concluído com sucesso'],
        negative: [],
        tip: 'Continue mantendo a consistência nos treinos',
      }
    }

    return res.status(200).json(parsed)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
