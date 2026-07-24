export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'

  try {
    const { prompt, history = [] } = req.body
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' })

    const systemPrompt = `Você é o AquaRun Coach, um assistente de IA especializado em treinos de corrida e natação.
Suas responsabilidades:
- Criar planos de treino personalizados
- Analisar performance do atleta
- Dar dicas de técnica para corrida e natação
- Ajustar treinos baseado no progresso
- Responder dúvidas sobre treinamento

Responda sempre em português brasileiro. Seja direto e prático.`

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
