# AquaRun 🏊‍♂️🏃

Assessoria inteligente para corrida e natação, movida por IA.

## Tech Stack

- **Frontend**: Vue 3 + Vite + Tailwind CSS
- **Backend**: Supabase (Auth + Database)
- **IA**: Groq (LLaMA)
- **Integração**: Strava API
- **Deploy**: Vercel

## Setup

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Copie `.env.example` para `.env.local` e preencha:
```bash
cp .env.example .env.local
```

### 3. Configurar Supabase
1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute o SQL em `supabase/schema.sql` no SQL Editor (é idempotente, pode rodar quantas vezes precisar)
3. Copie a URL e chave anônima para o `.env.local`

### 4. Configurar Strava API
1. Acesse [strava.com/settings/api](https://www.strava.com/settings/api)
2. Crie uma aplicação
3. Configure o callback URL: `http://localhost:5173/strava/callback`
4. Copie Client ID e Client Secret para o `.env.local` (variáveis `VITE_STRAVA_*`, usadas também pelos endpoints serverless)

### 5. Configurar a IA (Groq)
1. Acesse [console.groq.com](https://console.groq.com)
2. Gere uma API key
3. Copie `VITE_GROQ_API_KEY` para o `.env.local` (e `GROQ_API_KEY` no painel da Vercel)

### 6. Rodar
```bash
npm run dev
```

## Deploy (Vercel)

```bash
npm i -g vercel
vercel
```

Os endpoints de IA e Strava ficam em `api/*.js` e são servidos no local pelo próprio `server.js`, então o comportamento é igual em dev e produção.

## Estrutura

```
src/
├── components/layout/    # Header, Sidebar
├── views/               # Páginas
├── stores/              # State management (Pinia)
└── utils/               # Strava, IA, Formatters
```