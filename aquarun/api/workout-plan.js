import { callGroqJson } from './groq'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

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

    function calcZones(fcMax) {
      if (!fcMax || fcMax < 100 || fcMax > 230) return null
      return {
        z1: `${Math.round(fcMax * 0.50)}-${Math.round(fcMax * 0.60)} bpm (Recuperação)`,
        z2: `${Math.round(fcMax * 0.60)}-${Math.round(fcMax * 0.70)} bpm (Aeróbico base)`,
        z3: `${Math.round(fcMax * 0.70)}-${Math.round(fcMax * 0.80)} bpm (Aeróbico/limiar)`,
        z4: `${Math.round(fcMax * 0.80)}-${Math.round(fcMax * 0.90)} bpm (Limiar)`,
        z5: `${Math.round(fcMax * 0.90)}-${fcMax} bpm (VO2max)`,
      }
    }

    let raceInfo = ''
    if (profile.race_date) {
      const raceDate = new Date(profile.race_date)
      const weeksUntilRace = Math.max(1, Math.ceil((raceDate - Date.now()) / (7 * 24 * 60 * 60 * 1000)))
      raceInfo = `\n- DATA DA PROVA/META: ${profile.race_date} (${weeksUntilRace} semanas até a prova)
- IMPORTANTE: Monte um plano periodizado com ${weeksUntilRace} semanas. Semanas iniciais com volume menor, progredindo até um pico 1-2 semanas antes da prova, e depois uma semana de tapering na semana da prova.`
    }

    const systemPrompt = `Você é um treinador esportivo especializado em corrida de rua e natação (apenas crawl).
Sua função é criar treinos personalizados com nível equivalente ao de um treinador profissional, utilizando os dados do atleta (histórico, evolução, objetivos e disponibilidade).

NÃO gere apenas distância e pace. Cada treino deve ser completo, explicando exatamente o que o atleta deve fazer do início ao fim.

REGRAS FUNDAMENTAIS:
1. Respeite SEMPRE as limitações físicas do atleta (lesões, restrições)
2. Progrida a carga gradualmente (nunca mais de 10% por semana)
3. Alterne dias de corrida e natação em dias SEPARADOS
4. Nunca agendar dois treinos intensos de corrida em dias consecutivos
5. O treino longo deve ser no dia de corrida indicado
6. Seja ESPECÍFICO em distâncias, ritmos e tempos
7. Considere idade, peso, experiência e nível de atividade
8. Se há data de prova, faça periodização com tapering
9. Natação: APENAS crawl. Nunca gerar peito, costas, borboleta ou medley
10. NUNCA use zonas de FC (Z1, Z2, Z3...) como instrução ao atleta. Em vez disso, prescreva PACE ESPECÍFICO. Exemplo: "trote a 6:30/km", "tiros a 4:45/km", "aquecimento a 7:00/km"
11. O atleta é leigo e pode não saber o que são zonas. Use sempre pace como referência prática
12. Retorne APENAS JSON válido

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
  "weekLabel": "Semana 1",
  "summary": "Resumo da semana",
  "week": [
    {
      "day": "Segunda",
      "type": "run",
      "name": "Nome do treino",
      "duration": 60,
      "structure": {
        "objective": "Desenvolver resistência aeróbica base. 2-3 frases explicando por que existe, que adaptação fisiológica busca, como ajuda a evoluir.",
        "warmup": "10 minutos de trote\nPace entre 6:30 e 6:50/km\nRespiração confortável, sem pressa",
        "mobility": ["Mobilidade de tornozelo: 10 repetições cada lado, amplitude controlada", "Mobilidade de quadril: 10 círculos cada lado"],
        "drills": ["Skipping alto: 3x20 metros, joelho alto, braço oposto, postura ereta"],
        "activation": "4 acelerações de 80 metros\nRecuperação caminhando entre cada uma",
        "main_part": "6 x 800m\nPace-alvo: 5:00/km\nDescanso: 2 minutos trotando a 6:30/km\nFoque em manter ritmo constante, sem acelerar no final",
        "cooldown": "5-10 minutos de trote leve a 7:00/km\nAlongamento leve de quadril e panturrilha",
        "attention_points": ["Manter cadência entre 170-180spm", "Evitar acelerar no início das séries", "Manter o pace-alvo de 5:00/km em cada série"],
        "adaptation_criteria": "Se não conseguir manter 5:00/km, aumente para 5:15/km. Se não conseguir completar todas as séries, diminuir uma série.",
        "coach_message": "Hoje o foco não é velocidade, mas consistência. Faça cada quilômetro com controle. É esse tipo de treino que constrói desempenho nas próximas semanas."
      }
    }
  ]
}

IMPORTANTE sobre a estrutura:
- Cada treino DEVE ter todas as seções da structure (objective, warmup, main_part, cooldown, attention_points, adaptation_criteria, coach_message)
- As seções mobility, drills e activation são OPCIONAIS - inclua apenas quando fizer sentido para o tipo de treino
- O warmup e cooldown devem ser sempre incluídos
- O main_part deve ser extremamente detalhado com séries, repetições, distâncias, PACES ESPECÍFICOS (ex: 5:00/km, 6:30/km) e descanso
- NUNCA use "Zona 1", "Zona 2" etc nas instruções. Use sempre pace numérico
- O objective deve explicar o PROPÓSITO do treino em 2-3 frases
- Os attention_points devem ser orientações práticas durante o treino
- O adaptation_criteria deve explicar como adaptar se o atleta não conseguir cumprir
- O coach_message deve ser motivador e humano
- DURAÇÕES MÍNIMAS: treinos leves e regenerativos pelo menos 30min, moderados pelo menos 40min, longão pelo menos 60min, intervalado pelo menos 45min, natação pelo menos 30min

NUNCA inclua treinos de natação que não sejam crawl. Educativos de crawl permitidos: catch-up, crawl com um braço, polegar na coxa, pernada com prancha, respiração bilateral.`

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
- FC Máxima: ${profile.fc_max ? profile.fc_max + ' bpm' : 'não informado'}
- VO2max estimado: ${profile.vo2_max ? profile.vo2_max + ' ml/kg/min' : 'não informado'}
${profile.fc_max ? (() => { const z = calcZones(profile.fc_max); return z ? `\nZONAS DE FC (use como referência interna para entender intensidade, mas NÃO prescreva zonas nas instruções — use pace):
  Z1: ${z.z1}
  Z2: ${z.z2}
  Z3: ${z.z3}
  Z4: ${z.z4}
  Z5: ${z.z5}` : '' })() : ''}

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
- Objetivo corrida: ${profile.run_goal || 'não informado'}
- Tempo disponível por dia: 40 a 60 minutos (NÃO exceder 60min)
${raceInfo}

INSTRUÇÕES:
1. Cada dia de corrida deve ter UM treino COMPLETO com todas as seções da structure
2. Cada dia de natação deve ter UM treino COMPLETO com todas as seções da structure
3. Dias sem treino marcado: inclua um treino "rest" com duração 0 e type "rest"
4. O treino longo deve ser no dia especificado e ser o mais longo da semana
5. Nunca coloque dois treinos intensos de corrida (intervalado, tempo run, limiar) em dias consecutivos
6. Ajuste intensidades baseado no nível e experiência
7. Se tem lesão, evite movimentos que piorem a condição
8. Se tem data de prova, crie progressão adequada
9. Cada treino DEVE ter a seção structure completa com objective, warmup, main_part, cooldown, attention_points, adaptation_criteria, coach_message
10. Natação: APENAS crawl. Nunca gerar outros estilos
11. IMPORTANTE: NUNCA use termos como "Zona 1", "Zona 2" etc nas instruções. Prescreva sempre PACE ESPECÍFICO em min/km (ex: "aquecimento a 6:30/km", "tiros a 4:45/km", "trote a 7:00/km")
12. O atleta é leigo e precisa saber exatamente a que ritmo correr em cada parte do treino
13. DURAÇÕES MÍNIMAS: treino leve/regenerativo ≥ 30min, moderado ≥ 40min, longão ≥ 60min, intervalado ≥ 45min, natação ≥ 30min

Retorne APENAS o JSON, sem markdown, sem código, sem explicações extras.`

    const result = await callGroqJson({ system: systemPrompt, user: userPrompt, temperature: 0.6, maxTokens: 4000 })
    if (result.status !== 200) {
      return res.status(result.status).json({ error: result.error })
    }

    return res.status(200).json(result.data)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
