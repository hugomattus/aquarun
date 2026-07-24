# AquaRun 🏊‍♂️🏃

Assessoria inteligente para corrida e natação, movida por IA.

## Tech Stack

- **Frontend**: Vue 3 + Vite + Tailwind CSS
- **Backend**: Supabase (Auth + Database)
- **IA**: Google Gemini
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
2. Execute o SQL em `supabase/setup.sql` no SQL Editor
3. Copie a URL e chave anônima para o `.env.local`

### 4. Configurar Strava API
1. Acesse [strava.com/settings/api](https://www.strava.com/settings/api)
2. Crie uma aplicação
3. Configure o callback URL: `http://localhost:5173/strava/callback`
4. Copie Client ID e Client Secret para o `.env.local`

### 5. Configurar Google Gemini
1. Acesse [aistudio.google.com](https://aistudio.google.com)
2. Gere uma API key
3. Copie para o `.env.local`

### 6. Rodar
```bash
npm run dev
```

## Deploy (Vercel)

```bash
npm i -g vercel
vercel
```

## Estrutura

```
src/
├── components/layout/    # Header, Sidebar
├── views/               # Páginas
├── stores/              # State management (Pinia)
├── utils/               # Strava, Gemini, Formatters
└── composables/         # Composables reutilizáveis
```
