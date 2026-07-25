export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'

  try {
    const { profile, previousWeek, previousWeeks, trends, weekNumber } = req.body

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
    const longRunLabel = daysOfWeek[profile.long_run_day] || profile.long_run_day || 'não definido'

    let raceInfo = ''
    if (profile.race_date) {
      const raceDate = new Date(profile.race_date)
      const weeksUntilRace = Math.max(1, Math.ceil((raceDate - Date.now()) / (7 * 24 * 60 * 60 * 1000)))
      raceInfo = `\n- DATA DA PROVA/META: ${profile.race_date} (${weeksUntilRace} semanas até a prova)`
    }

    const pw = previousWeek
    const completedPct = pw.total_workouts > 0 ? (pw.completed_workouts / pw.total_workouts) * 100 : 0

    const systemPrompt = `Você é um treinador esportivo especializado em corrida de rua e natação (apenas crawl).
Sua função é criar treinos personalizados com nível equivalente ao de um treinador profissional, utilizando os dados do atleta (histórico, evolução, objetivos e disponibilidade).

NÃO gere apenas distância e pace. Cada treino deve ser completo, explicando exatamente o que o atleta deve fazer do início ao fim.

REGRAS FUNDAMENTAIS:
1. Analise TODOS os dados da semana anterior (performance + subjetivo)
2. Nunca agendar dois treinos intensos de corrida em dias consecutivos
3. Nunca mais de 10% de aumento de volume por semana
4. Se esforço percebido > 4 (difícil/muito difícil), REDUZA volume 10-15%
5. Se esforço percebido < 2 (muito fácil/fácil), PODE aumentar volume ou intensidade 5-10%
6. Se completou < 70% dos treinos, mantenha volume similar
7. Se dor muscular > 5, EVITE movimentos que piorem e reduza intensidade
8. Se energia < 4, reduza carga
9. Se sono < 4, considere semana mais leve
10. Se estresse > 7, treinos mais leves e técnicos
11. Respeite lesões e limitações do atleta
12. Natação: APENAS crawl. Nunca gerar peito, costas, borboleta ou medley
13. Retorne APENAS JSON válido

TIPOS DE TREINO CORRIDA:
- regenerativo: recuperação ativa, ritmo bem leve
- leve: corrida fácil e confortável
- moderado: ritmo moderado, conversa difícil
- intervalado: tiros com descanso
- fartlek: variação de ritmo livre
- tempo run: ritmo constante moderado-alto
- limiar: ritmo de limiar anaeróbico
- subida: treino em subida
- longão: treino longo (no dia especificado)
- progressivo: começa leve e vai acelerando
- prova simulada: simula condição de prova

TIPOS DE TREINO NATAÇÃO (apenas crawl):
- técnica: foco em técnica com educativos
- resistência: distância contínua
- intervalado: séries com descanso
- velocidade: séries curtas e rápidas

ESTRUTURA OBRIGÓRIA DO JSON RETORNADO:
{
  "weekLabel": "Semana X",
  "summary": "Resumo da semana",
  "adjustments": "O que foi ajustado baseado na evolução",
  "week": [
    {
      "day": "Segunda",
      "type": "run",
      "name": "Nome do treino",
      "duration": 45,
      "structure": {
        "objective": "Desenvolver resistência aeróbica base. 2-3 frases explicando por que existe, que adaptação fisiológica busca, como ajuda a evoluir.",
        "warmup": "10 minutos de trote\nPace entre 6:30 e 6:50/km\nZona 1-2\nRespiração confortável",
        "mobility": ["Mobilidade de tornozelo: 10 repetições cada lado", "Mobilidade de quadril: 10 círculos cada lado"],
        "drills": ["Skipping alto: 3x20 metros, joelho alto, braço oposto, postura ereta"],
        "activation": "4 acelerações de 80 metros\nRecuperação caminhando",
        "main_part": "6 x 800m\nPace: 4:55-5:00/km\nZona 3-4\nDescanso: 2 minutos trotando",
        "cooldown": "5-10 minutos de trote leve\nAlongamento leve",
        "attention_points": ["Manter cadência entre 170-180spm", "Evitar acelerar no início", "Controlar FC"],
        "adaptation_criteria": "Se FC ultrapassar Zona 5, reduzir ritmo em 5s/km. Se não conseguir completar, diminuir uma série.",
        "coach_message": "Hoje o foco é consistência. Faça cada quilômetro com controle."
      }
    }
  ]
}

IMPORTANTE sobre a estrutura:
- Cada treino DEVE ter todas as seções da structure
- mobility, drills e activation são OPCIONAIS - inclua apenas quando fizer sentido
- warmup e cooldown sempre incluídos
- main_part extremamente detalhado
- objective explica o PROPÓSITO em 2-3 frases
- attention_points são orientações práticas
- adaptation_criteria explica como adaptar
- coach_message é motivador e humano

NUNCA inclua treinos de natação que não sejam crawl.`

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
- Volume semanal total: ${pw.weekly_volume ? pw.weekly_volume.toFixed(1) + ' km' : 'não informado'}
- Carga semanal: ${pw.weekly_load ? pw.weekly_load.toFixed(1) : 'não informado'}
- BPM médio corrida: ${pw.avg_heartrate ? Math.round(pw.avg_heartrate) : 'não informado'}
- Ritmo médio corrida: ${pw.avg_run_pace ? (1000 / pw.avg_run_pace / 60).toFixed(0) + ':' + Math.round((1000 / pw.avg_run_pace % 60)).toString().padStart(2, '0') + '/km' : 'não informado'}
${hasSwimming ? `- Ritmo médio natação/100m: ${pw.avg_swim_pace ? (pw.avg_swim_pace * 100).toFixed(0) + 's' : 'não informado'}` : ''}

FEEDBACK SUBJETIVO DO ATLETA:
- Esforço percebido médio: ${pw.avg_effort ? pw.avg_effort.toFixed(1) + '/5' : 'não informado'}
  (1=muito fácil, 2=fácil, 3=normal, 4=difícil, 5=muito difícil)
- Dor muscular média: ${pw.avg_pain !== undefined ? pw.avg_pain.toFixed(1) + '/10' : 'não informado'}
- Energia média: ${pw.avg_energy !== undefined ? pw.avg_energy.toFixed(1) + '/10' : 'não informado'}
- Qualidade do sono média: ${pw.avg_sleep !== undefined ? pw.avg_sleep.toFixed(1) + '/10' : 'não informado'}
- Estresse médio: ${pw.avg_stress !== undefined ? pw.avg_stress.toFixed(1) + '/10' : 'não informado'}
- Relato de dores: ${pw.pain_report && pw.pain_report.length > 0 ? pw.pain_report : 'nenhum'}

${previousWeeks?.length ? `TENDÊNCIA DAS ÚLTIMAS SEMANAS:
${previousWeeks.map((w, i) => `- Semana ${i + 1}: ${w.completed_workouts}/${w.total_workouts} treinos | Corrida: ${w.total_run_distance ? (w.total_run_distance / 1000).toFixed(1) + 'km' : '0km'} | Ritmo médio: ${w.avg_run_pace ? (1000 / w.avg_run_pace / 60).toFixed(0) + ':' + Math.round((1000 / w.avg_run_pace % 60)).toString().padStart(2, '0') + '/km' : '-'} | Esforço: ${w.avg_effort ? w.avg_effort.toFixed(1) : '-'} | Dor: ${w.avg_pain ? w.avg_pain.toFixed(1) : '-'}`).join('\n')}` : ''}

${trends ? `EVOLUÇÃO GERAL:
${trends.paceTrend ? `- Ritmo: ${trends.paceTrend}` : ''}
${trends.distanceTrend ? `- Distância: ${trends.distanceTrend}` : ''}
${trends.effortTrend ? `- Esforço: ${trends.effortTrend}` : ''}
${trends.painTrend ? `- Dor: ${trends.painTrend}` : ''}
${trends.bestPace30d ? `- Melhor ritmo 30 dias: ${trends.bestPace30d}` : ''}
${trends.totalDistance30d ? `- Distância total 30 dias: ${trends.totalDistance30d}` : ''}` : ''}

ANÁLISE NECESSÁRIA:
1. O atleta está superando o plano? (esforço baixo + performance acima)
2. O atleta está tendo dificuldade? (esforço alto + não completou tudo)
3. Há sinais de risco de lesão? (dor alta + estresse alto + sono ruim)
4. A recuperação está adequada? (energia alta + sono bom = boa recuperação)
5. A progressão está adequada?

INSTRUÇÕES:
1. Ajuste a próxima semana baseado nessa análise completa
2. Esforço > 4: reduza volume 10-15%
3. Esforço < 2: aumente volume ou intensidade 5-10%
4. Dor > 5: exclua exercícios que piorem, reduza intensidade
5. Energia < 4: reduza carga
6. Sono < 4: semana mais leve
7. Estresse > 7: treinos leves e técnicos
8. Mantenha os mesmos dias de treino
9. O treino longo continua no mesmo dia
10. Nunca coloque dois treinos intensos consecutivos
11. Cada treino DEVE ter a seção structure completa
12. Natação: APENAS crawl

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
        max_tokens: 4000,
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
