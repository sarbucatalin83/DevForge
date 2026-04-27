import { Router } from 'express'
import { getItems, getItemById } from '../content/contentLoader'
import authMiddleware from './authMiddleware'
import type { ContentFilter, Track, Difficulty } from '../types/index'

const router = Router()

router.use(authMiddleware)

router.get('/', (req, res) => {
  const { track, topic, difficulty, type } = req.query
  const filter: ContentFilter = {}
  if (typeof track === 'string' && track) filter.track = track as Track
  if (typeof topic === 'string' && topic) filter.topic = topic
  if (typeof difficulty === 'string' && difficulty) filter.difficulty = difficulty as Difficulty
  if (type === 'quiz' || type === 'exercise') filter.type = type
  res.json(getItems(filter))
})

router.get('/:id', (req, res) => {
  const item = getItemById(req.params.id)
  if (!item) {
    res.status(404).json({
      error: 'Content item not found.',
      remediation: 'Verify the item ID or regenerate content with generate-content.js.',
    })
    return
  }
  res.json(item)
})

export default router
