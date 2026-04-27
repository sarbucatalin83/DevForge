import express from 'express'
import cors from 'cors'
import type { ErrorRequestHandler } from 'express'
import authMiddleware from './api/authMiddleware'
import contentRouter from './api/content'

const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use(authMiddleware)

app.use('/api/content', contentRouter)
// app.use('/api/execute', executeRouter)
// app.use('/api/coverage', coverageRouter)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const message =
    err instanceof Error ? err.message : 'An unexpected error occurred'
  res.status(500).json({
    error: message,
    remediation: 'Check the server logs for details and restart the backend if the problem persists.',
  })
}
app.use(errorHandler)

export default app
