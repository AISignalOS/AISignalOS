import express from 'express'
import cors from 'cors'
import projectsRouter from './routes/projects.js'
import auditsRouter from './routes/audits.js'
import experimentsRouter from './routes/experiments.js'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

app.use('/api/projects', projectsRouter)
app.use('/api/audits', auditsRouter)
app.use('/api/experiments', experimentsRouter)

app.listen(PORT, () => {
  console.log(`\n🚀 AISolutionsOS Performance Autoresearch Server`)
  console.log(`   API: http://localhost:${PORT}/api`)
  console.log(`   Health: http://localhost:${PORT}/api/health\n`)
})

export default app
