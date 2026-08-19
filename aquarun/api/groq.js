const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'

export function extractContent(content) {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content.map(part => (part && typeof part === 'object' ? part.text || '' : String(part))).join('')
  }
  return String(content || '')
}

export function extractJson(text) {
  const cleaned = text.replace(/```json|```/g, '')
  const match = cleaned.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    return JSON.parse(match[0])
  } catch {
    return null
  }
}

export async function callGroqJson({ system, user, temperature = 0.6, maxTokens = 4000 }) {
  let lastError = null

  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return { status: response.status, error: err.error?.message || 'Groq API error' }
    }

    const data = await response.json()
    const text = extractContent(data.choices[0].message.content)
    const parsed = extractJson(text)
    if (parsed) return { status: 200, data: parsed }

    lastError = { status: 500, error: 'A IA não retornou um plano válido. Tente novamente.' }
  }

  return lastError
}