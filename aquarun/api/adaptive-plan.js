export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'

  try {
    const { profile, previousWeek, weekNumber } = req.body

    if (!profile || !previousWeek) {
      return res.status(400).json({ error: 'Perfil e dados da semana anterior são obrigatórios' })
    }

    const age = profile.birth_date
      ? Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null

    const hasSwimming = profile.swimming_experience && profile.swimming_experience !== 'never'

    const daysOfWeek = {
      sunday: 'Domingo', monday: 'Segunda', tuesday: 'Terça',
      wednesday: 'Quarta', thursday: 'Quinta', friday: 'Sexta', saturday: 'Sábado',
    }
    const runDaysLabels = (profile.run_days || []).map(d => daysOfWeek[d] || d).join(', ')
    const swimDaysLabels = (profile.swim_days || []).map(d => daysOfWeek[d] || d).join(', ')
    const allDaysLabels = (profile.training_weekdays || []).map(d => daysOfWeek[d] || d).join(', ')
    const longRunLabel = daysOfWeek[profile.long_run_day] || profile.long_run_day || 'não definido'

    let raceInfo = ''
    if (profile.race_date) {
      const raceDate = new Date(profile.race_date)
      const weeksUntilRace = Math.max(1, Math.ceil((raceDate - Date.now()) / (7 * 24 * 60 * 60 * 1000)))
      raceInfo = `\n- DATA DA PROVA/META: ${profile.race_date} (${weeksUntilRace} semanas até a prova)`
    }

    const pw = previousWeek
    const avgExhaustion = pw.avg_exhaustion || 0
    const completedPct = pw.total_workouts > 0 ? (pw.completed_workouts / pw.total_workouts) * 100 : 0
    const hasPain = pw.pain_report && pw.pain_report.length > 0

    const systemPrompt = `Você é um treinador profissional de natação e corrida. Sua tarefa é criar a PRÓXIMA SEMANA de treinos baseado na evolução real do atleta na semana anterior.

REGRAS FUNDAMENTAIS:
1. Analise os dados da semana anterior (performance real + feedback)
2. Se cansaço médio > 7, REDUZA o volume na próxima semana
3. Se cansaço médio < 4, POSSA aumentar volume ou intensidade
4. Se completou < 70% dos treinos, mantenha volume similar
5. Se há relato de dores, EVITE movimentos que piorem
6. Progrida no máximo 10% por semana
7. Inclua aquecimento e volta à calma em TODOS os treinos
8. Seja ESPECÍFICO em distâncias, ritmos e tempos
9. Retorne APENAS JSON válido

ESTRUTURA DO JSON RETORNADO:
{
  "weekLabel": "Semana X",
  "summary": "Resumo da análise e o que mudou",
  "adjustments": "O que foi ajustado baseado na evolução",
  "week": [
    {
      "day": "Segunda",
      "type": "run",
      "name": "Nome do treino",
      "description": "Descrição geral do treino",
      "duration": 45,
      "intervals": [
        {"type": "warmup", "duration": 10, "description": "Aquecimento"},
        {"type": "main", "duration": 25, "description": "Corrida contínua"},
        {"type": "cooldown", "duration": 10, "description": "Volta à calma"}
      ]
    }
  ]
}

Tipos de treino corrida: recovery, easy, tempo, intervals, long, fartlek
Tipos de treino natação: drill, endurance, intervals, technique
Tipos de intervalo: warmup, main, cooldown, rest, repetition`

    const userPrompt = `CRIE A SEMANA ${weekNumber} DE TREINOS COM BASE NA EVOLUÇÃO:

DADOS DO ATLETA:
- Nome: ${profile.full_name || 'Atleta'}
- Idade: ${age ? age + ' anos' : 'não informado'}
- Peso: ${profile.weight ? profile.weight + ' kg' : 'não informado'}
- Experiência corrida: ${profile.running_experience || 'não informado'}
- Nível atividade: ${profile.activity_level || 'não informado'}
- Ritmo confortável: ${profile.comfortable_pace || 'não informado'}
- Ritmo-alvo: ${profile.target_run_pace || 'não informado'}
- Distância-alvo: ${profile.target_run_distance || 'não informado'}
${hasSwimming ? `- Experiência natação: ${profile.swimming_experience}
- Estilo principal: ${profile.main_stroke || 'não informado'}
- Ritmo 100m: ${profile.swim_pace || 'não informado'}
- Ritmo-alvo 100m: ${profile.target_swim_pace || 'não informado'}` : ''}
- Dias corrida: ${runDaysLabels || 'não definido'}
${hasSwimming ? `- Dias natação: ${swimDaysLabels || 'não definido'}` : ''}
- Dia do longão: ${longRunLabel}${raceInfo}

PERFORMANCE DA SEMANA ANTERIOR:
- Total de treinos: ${pw.total_workouts || 0}
- Treinos completos: ${pw.completed_workouts || 0}
- Treinos pulados: ${pw.skipped_workouts || 0}
- Distância corrida total: ${pw.total_run_distance ? (pw.total_run_distance / 1000).toFixed(2) + ' km' : '0 km'}
- Distância nadada total: ${pw.total_swim_distance ? (pw.total_swim_distance / 1000).toFixed(2) + ' km' : '0 km'}
- Tempo total correndo: ${pw.total_run_time ? Math.round(pw.total_run_time / 60) + ' min' : '0 min'}
- Tempo total nadando: ${pw.total_swim_time ? Math.round(pw.total_swim_time / 60) + ' min' : '0 min'}
- Cansaço médio (1-10): ${avgExhaustion.toFixed(1)}
- BPM médio corrida: ${pw.avg_heartrate ? Math.round(pw.avg_heartrate) : 'não informado'}
- Relato de dores: ${hasPain ? pw.pain_report : 'nenhum'}

ANÁLISE NECESSÁRIA:
1. O atleta está superando o plano? (cansaço baixo + performance acima do esperado)
2. O atleta está tendo dificuldade? (cansaço alto + não completou tudo)
3. Há sinais de risco de lesão? (dores + cansaço alto)
4. A progressão está adequada?

INSTRUÇÕES:
1. Ajuste a próxima semana baseado nessa análise
2. Se cansaço > 7: reduza volume 10-15%
3. Se cansaço < 4: aumente volume ou intensidade 5-10%
4. Se há dores: exclua exercícios que piorem a condição
5. Mantenha os mesmos dias de treino
6. O treino longo continua no mesmo dia
7. Seja específico em distâncias e ritmos

Retorne APENAS o JSON, sem markdown, sem código.`

    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.6,
        max_tokens: 3000,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return res.status(response.status).json({ error: err.error?.message || 'Groq API error' })
    }

    const data = await response.json()
    const text = data.choices[0].message.content

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const plan = JSON.parse(jsonMatch[0])
      return res.status(200).json(plan)
    }

    return res.status(500).json({ error: 'Não foi possível gerar o plano' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
