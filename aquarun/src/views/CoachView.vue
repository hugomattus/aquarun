<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-medium text-white">Coach IA</h1>
        <p class="text-neutral-500 mt-1">Seu assistente de treinos pessoal</p>
      </div>
      <button
        @click="clearChat"
        class="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-light rounded text-sm transition-colors text-neutral-400"
      >
        <Icon name="trash-2" :size="16" />
        <span>Limpar</span>
      </button>
    </div>

    <div class="bg-surface rounded border border-neutral-800 flex flex-col" style="height: calc(100vh - 220px)">
      <div ref="chatContainer" class="flex-1 overflow-y-auto p-6 space-y-4">
        <div v-if="messages.length === 0" class="text-center py-12">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded bg-primary/10 mb-4">
            <Icon name="cpu" :size="32" class="text-primary" />
          </div>
          <h3 class="text-xl font-medium text-white mt-4">Olá! Sou o AquaRun Coach</h3>
          <p class="text-neutral-500 mt-2 max-w-md mx-auto">
            Posso ajudar com treinos de corrida e natação. Pergunte sobre técnicas,
            planos de treino, ou peça para analisar seu desempenho.
          </p>
          <div class="flex flex-wrap gap-2 justify-center mt-6">
            <button
              v-for="suggestion in suggestions"
              :key="suggestion"
              @click="sendMessage(suggestion)"
              class="px-4 py-2 bg-dark hover:bg-surface-light rounded text-sm text-neutral-300 transition-colors border border-neutral-800"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>

        <div
          v-for="(msg, i) in messages"
          :key="i"
          class="flex gap-3"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            v-if="msg.role === 'assistant'"
            class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
          >
            <Icon name="cpu" :size="16" class="text-primary" />
          </div>
          <div
            class="max-w-[75%] rounded px-4 py-3 text-sm leading-relaxed"
            :class="msg.role === 'user'
              ? 'bg-primary text-white rounded-br'
              : 'bg-dark text-neutral-200 rounded-bl border border-neutral-800'"
          >
            <div v-html="formatMessage(msg.content)"></div>
          </div>
        </div>

        <div v-if="loading" class="flex gap-3">
          <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon name="cpu" :size="16" class="text-primary" />
          </div>
          <div class="bg-dark rounded rounded-bl px-4 py-3 border border-neutral-800">
            <div class="flex gap-1">
              <div class="w-2 h-2 bg-neutral-500 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 border-t border-neutral-800">
        <form @submit.prevent="handleSend" class="flex gap-3">
          <input
            v-model="input"
            type="text"
            placeholder="Pergunte sobre treinos, técnicas, planos..."
            class="flex-1 px-4 py-3 bg-dark rounded border border-neutral-800 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all text-sm text-white placeholder-neutral-600"
            :disabled="loading"
          />
          <button
            type="submit"
            :disabled="!input.trim() || loading"
            class="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark rounded font-medium transition-colors disabled:opacity-50"
          >
            <Icon name="send" :size="16" />
            <span class="hidden sm:inline">Enviar</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { getAIResponse } from '../utils/gemini'
import Icon from '../components/Icon.vue'

const chatContainer = ref(null)
const input = ref('')
const messages = ref([])
const loading = ref(false)

const suggestions = [
  'Crie um plano de treino semanal para iniciante',
  'Qual a melhor técnica de nado para iniciantes?',
  'Como melhorar meu pace na corrida?',
  'Dicas para evitar lesões na natação',
]

async function sendMessage(text) {
  const userMsg = text || input.value.trim()
  if (!userMsg) return

  messages.value.push({ role: 'user', content: userMsg })
  input.value = ''
  loading.value = true

  await nextTick()
  scrollToBottom()

  try {
    const history = messages.value.slice(0, -1)
    const response = await getAIResponse(userMsg, history)
    messages.value.push({ role: 'assistant', content: response })
  } catch (e) {
    messages.value.push({
      role: 'assistant',
      content: 'Desculpe, tive um erro ao processar sua mensagem. Tente novamente.',
    })
  } finally {
    loading.value = false
    await nextTick()
    scrollToBottom()
  }
}

function handleSend() {
  sendMessage()
}

function clearChat() {
  messages.value = []
}

function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}
</script>
