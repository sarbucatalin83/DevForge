import { Router } from 'express'
import authMiddleware from './authMiddleware'
import { getItemById } from '../content/contentLoader'
import { executorConfig } from '../config/executorConfig'
import { execute } from '../executor/dockerExecutor'
import type { CodingExercise } from '../types/index'

const router = Router()

router.use(authMiddleware)

type SubmittedFile = { name: string; content: string }

function isFileArray(v: unknown): v is SubmittedFile[] {
  return (
    Array.isArray(v) &&
    v.every(
      (f) =>
        typeof f === 'object' &&
        f !== null &&
        typeof (f as Record<string, unknown>).name === 'string' &&
        typeof (f as Record<string, unknown>).content === 'string',
    )
  )
}

router.post('/', async (req, res, next) => {
  try {
    const { exerciseId, files } = req.body as Record<string, unknown>

    if (typeof exerciseId !== 'string' || !exerciseId) {
      res.status(400).json({
        error: 'Missing or invalid exerciseId.',
        remediation: 'Provide a valid exerciseId string in the request body.',
      })
      return
    }

    if (!isFileArray(files)) {
      res.status(400).json({
        error: 'Missing or invalid files array.',
        remediation: 'Provide a files array with { name: string; content: string } entries.',
      })
      return
    }

    const item = getItemById(exerciseId)
    if (!item || item.type !== 'exercise') {
      res.status(404).json({
        error: `Exercise "${exerciseId}" not found.`,
        remediation: 'Verify the exerciseId or regenerate content with generate-content.js.',
      })
      return
    }

    const exercise = item as CodingExercise
    const config = executorConfig[exercise.track]
    if (!config) {
      res.status(500).json({
        error: `No executor configuration found for track "${exercise.track}".`,
        remediation: 'Add an entry for this track to executor-config.json at the repository root.',
      })
      return
    }

    const result = await execute(exerciseId, files, config)

    const response = {
      passed: result.passed,
      testOutput: result.testOutput,
      previewHtml: result.previewHtml,
      timedOut: result.timedOut,
      ...(!result.passed && !result.timedOut ? { solution: exercise.solution } : {}),
    }

    res.json(response)
  } catch (err) {
    next(err)
  }
})

export default router
