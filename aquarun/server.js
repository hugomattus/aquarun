import express from 'express'
import { createServer as createViteServer } from 'vite'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import workoutPlan from './api/workout-plan.js'
import adaptivePlan from './api/adaptive-plan.js'
import chatHandler from './api/chat.js'
import workoutFeedback from './api/workout-feedback.js'
import stravaHandler from './api/strava.js'
import stravaRefreshHandler from './api/strava-refresh.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '.env.local') })

const app = express()
app.use(express.json())

// Mesmos endpoints e handlers usados em produção (Vercel serverless).
// Isso garante comportamento idêntico entre dev e produção.
const routes = [
  ['/api/chat', chatHandler],
  ['/api/workout-plan', workoutPlan],
  ['/api/adaptive-plan', adaptivePlan],
  ['/api/workout-feedback', workoutFeedback],
  ['/api/strava', stravaHandler],
  ['/api/strava/refresh', stravaRefreshHandler],
]

for (const [path, handler] of routes) {
  app.post(path, (req, res) => handler(req, res))
}

// Vite dev server
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa',
})

app.use(vite.middlewares)

const PORT = process.env.PORT || 5173
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})