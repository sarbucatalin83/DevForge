import type { QuizItem, CodingExercise, Difficulty } from '@/types/index'

const DIFFICULTY_ORDER: Record<Difficulty, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
  senior: 3,
}

export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

export function buildQuizSession(items: QuizItem[]): QuizItem[] {
  return shuffleArray(items)
}

export function buildExerciseSession(items: CodingExercise[]): CodingExercise[] {
  const byTier = new Map<number, CodingExercise[]>()
  for (const item of items) {
    const tier = DIFFICULTY_ORDER[item.difficulty]
    const bucket = byTier.get(tier) ?? []
    bucket.push(item)
    byTier.set(tier, bucket)
  }
  const result: CodingExercise[] = []
  for (const tier of [0, 1, 2, 3]) {
    const bucket = byTier.get(tier)
    if (bucket) result.push(...shuffleArray(bucket))
  }
  return result
}
