import { Router } from 'express'
import authMiddleware from './authMiddleware'
import { getItems } from '../content/contentLoader'
import type { Track, Difficulty } from '../types/index'

const router = Router()

router.use(authMiddleware)

type CoverageEntry = {
  track: Track
  topic: string
  difficulty: Difficulty
  type: 'quiz' | 'exercise'
  count: number
}

router.get('/', (_req, res) => {
  const allItems = getItems({})
  const counts = new Map<string, CoverageEntry>()

  for (const item of allItems) {
    const key = `${item.track}|${item.topic}|${item.difficulty}|${item.type}`
    const existing = counts.get(key)
    if (existing) {
      existing.count += 1
    } else {
      counts.set(key, {
        track: item.track,
        topic: item.topic,
        difficulty: item.difficulty as Difficulty,
        type: item.type as 'quiz' | 'exercise',
        count: 1,
      })
    }
  }

  const result = [...counts.values()].sort((a, b) => {
    if (a.track !== b.track) return a.track.localeCompare(b.track)
    if (a.topic !== b.topic) return a.topic.localeCompare(b.topic)
    const diffOrder = ['beginner', 'intermediate', 'advanced', 'senior']
    return diffOrder.indexOf(a.difficulty) - diffOrder.indexOf(b.difficulty)
  })

  res.json(result)
})

export default router
