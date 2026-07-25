export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { workout, feedback, performance } = req.body

    const perfLines = []
    if (performance?.distance) perfLines.push(`Distância: ${(performance.distance / 1000).toFixed(2)} km`)
    if (performance?.duration) perfLines.push(`Tempo: ${Math.floor(performance.duration / 60)}min ${performance.duration % 60}s`)
    if (performance?.pace) {
      const min = Math.floor(performance.pace / 60)
      const sec = Math.floor(performance.pace % 60)
      perfLines.push(`Ritmo: ${min}:${sec.toString().padStart(2, '0')}/km`)
    }
    if (performance?.heartrate) perfLines.push(`BPM médio: ${Math.round(performance.heartrate)}`)
    if (performance?.maxHeartrate) perfLines.push(`BPM máx: ${Math.round(performance.maxHeartrate)}`)

    const effortMap = { very_easy: 1, easy: 2, moderate: 3, hard: 4, very_hard: 5 }
    const effortNum = effortMap[feedback.effort] || 3
    const effortLabel = { very_easy: 'Muito fácil', easy: 'Fácil', moderate: 'Normal', hard: 'Difícil', very_hard: 'Muito difícil' }

    const prompt = `Analise este treino e dê um feedback direto e motivador em português brasileiro.

TREINO: ${workout.name} (${workout.type === 'swim' ? 'Natação' : 'Corrida'})
Duração planejada: ${workout.duration}min

DADOS DO TREINO:
${perfLines.length ? perfLines.join('\n') : 'Sem dados de performance'}

FEEDBACK DO ATLETA:
- Esforço percebido: ${effortLabel[feedback.effort] || 'Não informado'} (${effortNum}/5)
- Energia: ${feedback.energy || 'Não informado'}/5
- Sono: ${feedback.sleep || 'Não informado'}/5
- Estresse: ${feedback.stress || 'Não informado'}/5
- Dor muscular: ${feedback.pain || 0}/10
${feedback.notes ? `- Observações: ${feedback.notes}` : ''}

Responda EXATAMENTE neste formato JSON (sem markdown, sem \`\`\`):
{
  "summary": "Resumo em 1 frase do treino",
  "positive": ["ponto positivo 1", "ponto positivo 2"],
  "negative": ["ponto negativo 1 ou vazio se não tiver"],
  "tip": "Uma dica prática para o próximo treino"
}

Regras:
- Seja direto e honesto
- Máximo 3 pontos positivos e 2 negativos
- A dica deve ser prática e aplicável
- Se não houver dados de performance, analise apenas o feedback subjetivo
- Responda APENAS o JSON, nada mais`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
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
        summary: content.slice(0, 200),
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
