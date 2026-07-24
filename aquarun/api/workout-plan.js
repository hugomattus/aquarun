export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'

  try {
    const { profile } = req.body

    if (!profile) {
      return res.status(400).json({ error: 'Perfil do usuário é obrigatório' })
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
      raceInfo = `
- DATA DA PROVA/META: ${profile.race_date} (${weeksUntilRace} semanas até a prova)
- IMPORTANTE: Monte um plano periodizado com ${weeksUntilRace} semanas. Semanas iniciais com volume menor, progredindo até um pico 1-2 semanas antes da prova, e depois uma semana de tapering (redução) na semana da prova.`
    }

    const systemPrompt = `Você é um treinador profissional de natação e corrida, especializado em treinamento personalizado. Seu objetivo é criar planos de treino semanais detalhados, seguros e eficazes.

REGRAS FUNDAMENTAIS:
1. Respeite SEMPRE as limitações físicas do atleta (lesões, restrições)
2. Progrida a carga gradualmente (nunca mais de 10% por semana)
3. Alterne dias de corrida e natação em dias SEPARADOS
4. Inclua aquecimento e volta à calma em TODOS os treinos
5. O treino longo deve ser no dia de corrida indicado
6. Seja ESPECÍFICO em distâncias, ritmos e tempos
7. Considere idade, peso, experiência e nível de atividade
8. Se há data de prova, faça periodização com tapering
9. Natação: foque no estilo principal do atleta
10. Retorne APENAS JSON válido, sem texto extra

ESTRUTURA DO JSON RETORNADO:
{
  "weekLabel": "Semana 1 de X",
  "summary": "Resumo breve do que esperar esta semana",
  "week": [
    {
      "day": "Segunda",
      "type": "run",
      "name": "Nome do treino",
      "description": "Descrição geral do treino",
      "duration": 45,
      "intervals": [
        {"type": "warmup", "duration": 10, "description": "Aquecimento com caminhada e mobilidade"},
        {"type": "main", "duration": 25, "description": "Corrida contínua a 6:30/km"},
        {"type": "cooldown", "duration": 10, "description": "Volta à calma e alongamento"}
      ]
    }
  ]
}

Tipos de intervalo: "warmup", "main", "cooldown", "rest", "repetition"
Tipos de treino: "run", "swim", "rest"

IMPORTANTE sobre os tipos de treino de corrida:
- recovery: recuperação ativa, ritmo bem leve
- easy: corrida fácil e confortável
- tempo: ritmo moderado-alternado
- intervals: tiros com descanso
- long: treino longo (no dia指定ado)
- fartlek: variação de ritmo livre

IMPORTANTE sobre natação:
- drill: exercícios técnicos
- endurance: distância contínua
- intervals: séries com descanso
- technique: foco em técnica`

    const userPrompt = `CRIE O PLANO DE TREINO SEMANAL PARA ESTE ATLETA:

DADOS PESSOAIS:
- Nome: ${profile.full_name || 'Atleta'}
- Idade: ${age ? age + ' anos' : 'não informado'}
- Gênero: ${profile.gender === 'male' ? 'Masculino' : profile.gender === 'female' ? 'Feminino' : 'Outro'}
- Peso: ${profile.weight ? profile.weight + ' kg' : 'não informado'}
- Altura: ${profile.height ? profile.height + ' cm' : 'não informado'}

EXPERIÊNCIA E NÍVEL:
- Experiência com corrida: ${profile.running_experience || 'não informado'}
- Nível de atividade: ${profile.activity_level || 'não informado'}
- Distância sem parar atual: ${profile.max_distance || 'não informado'}
- Ritmo atual: ${profile.comfortable_pace || 'não informado'}
- Ritmo-alvo: ${profile.target_run_pace || 'não informado'}
- Distância-alvo corrida: ${profile.target_run_distance || 'não informado'}

NATAÇÃO${hasSwimming ? ' (PRATICA)' : ' (NÃO PRATICA)'}:
${hasSwimming ? `- Experiência: ${profile.swimming_experience}
- Frequência: ${profile.swimming_frequency || 'não informado'}
- Estilo principal: ${profile.main_stroke || 'não informado'}
- Distância sem parar: ${profile.swim_distance || 'não informado'}
- Tempo por 100m: ${profile.swim_pace || 'não informado'}
- Objetivo natação: ${profile.swim_goal || 'não informado'}
- Acesso a piscina: ${profile.has_pool_access ? 'Sim' : 'Não'}
- Águas abertas: ${profile.open_water_experience ? 'Sim' : 'Não'}
- Tempo-alvo por 100m: ${profile.target_swim_pace || 'não informado'}
- Distância-alvo natação: ${profile.target_swim_distance || 'não informado'}` : '- Não pratica natação. NÃO inclua treinos de natação.'}

SAÚDE E LIMITAÇÕES:
- Lesões atuais: ${profile.current_injuries || 'nenhuma'}
- Histórico de lesões: ${profile.injury_history || 'nenhum'}
- Medicamentos/doenças: ${profile.medications || 'nenhum'}

AGENDAMENTO:
- Dias por semana: ${profile.training_days_per_week}
- Dias selecionados: ${allDaysLabels}
- Dias de corrida: ${runDaysLabels || 'não definido'}
${hasSwimming ? `- Dias de natação: ${swimDaysLabels || 'não definido'}` : ''}
- Dia do longão: ${longRunLabel}
- Objetivo corrida: ${profile.run_goal || 'não informado'}${raceInfo}

INSTRUÇÕES:
1. Cada dia de corrida deve ter UM treino com aquecimento, parte principal e volta à calma
2. Cada dia de natação deve ter UM treino com aquecimento, drills, parte principal e volta à calma
3. Dias sem treino marcado: inclua um treino "rest" com duração 0
4. O treino longo deve ser no dia especificado e ser o mais longo da semana
5. Ajuste intensidades baseado no nível e experiência
6. Se tem lesão, evite movimentos que piorem a condição
7. Se tem data de prova, crie progressão adequada

Retorne APENAS o JSON, sem markdown, sem código, sem explicações extras.`

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
