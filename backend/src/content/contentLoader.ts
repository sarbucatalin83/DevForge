import fs from 'fs'
import path from 'path'
import type { QuizItem, CodingExercise, ContentFilter, Track, Difficulty } from '../types/index'

type ContentItem = QuizItem | CodingExercise

const TRACKS = new Set(['javascript', 'typescript', 'react'])
const DIFFICULTIES = new Set(['beginner', 'intermediate', 'advanced', 'senior'])
const EXERCISE_TYPES = new Set([
  'fill-in-the-blank',
  'fix-a-bug',
  'implement-a-function',
  'refactor',
])

function isFileArray(v: unknown): v is { name: string; content: string }[] {
  return (
    Array.isArray(v) &&
    v.every(
      (i) =>
        typeof i === 'object' &&
        i !== null &&
        typeof (i as Record<string, unknown>).name === 'string' &&
        typeof (i as Record<string, unknown>).content === 'string',
    )
  )
}

function validateItem(raw: unknown): ContentItem | null {
  if (typeof raw !== 'object' || raw === null) return null
  const obj = raw as Record<string, unknown>

  const { id, track, topic, difficulty, type } = obj
  if (
    typeof id !== 'string' ||
    typeof track !== 'string' ||
    typeof topic !== 'string' ||
    typeof difficulty !== 'string' ||
    typeof type !== 'string' ||
    !TRACKS.has(track) ||
    !DIFFICULTIES.has(difficulty)
  ) {
    return null
  }

  if (type === 'quiz') {
    if (
      typeof obj.question !== 'string' ||
      typeof obj.answer !== 'string' ||
      typeof obj.explanation !== 'string'
    ) {
      return null
    }
    return {
      id,
      track: track as Track,
      topic: topic as string,
      difficulty: difficulty as Difficulty,
      type: 'quiz',
      question: obj.question,
      answer: obj.answer,
      explanation: obj.explanation,
    } satisfies QuizItem
  }

  if (type === 'exercise') {
    const { exerciseType, description, files, solution } = obj
    if (
      typeof exerciseType !== 'string' ||
      !EXERCISE_TYPES.has(exerciseType) ||
      typeof description !== 'string' ||
      !isFileArray(files) ||
      !isFileArray(solution)
    ) {
      return null
    }
    return {
      id,
      track: track as Track,
      topic: topic as string,
      difficulty: difficulty as Difficulty,
      type: 'exercise',
      exerciseType: exerciseType as CodingExercise['exerciseType'],
      description,
      files,
      solution,
    } satisfies CodingExercise
  }

  return null
}

let cache: ContentItem[] | null = null

function startWatcher(): void {
  const contentDir = path.resolve(__dirname, '../../../content')
  try {
    fs.watch(contentDir, { recursive: true }, () => {
      cache = null
    })
  } catch {
    // fs.watch unavailable on this platform or content/ doesn't exist yet — silently skip
  }
}

startWatcher()

function loadAllItems(): ContentItem[] {
  const contentDir = path.resolve(__dirname, '../../../content')
  const items: ContentItem[] = []

  function walk(dir: string) {
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        try {
          const raw: unknown = JSON.parse(fs.readFileSync(fullPath, 'utf-8'))
          const item = validateItem(raw)
          if (item) items.push(item)
        } catch {
          // Malformed file — skip silently
        }
      }
    }
  }

  walk(contentDir)
  return items
}

function getCache(): ContentItem[] {
  if (!cache) cache = loadAllItems()
  return cache
}

export function invalidateCache(): void {
  cache = null
}

export function getItems(filter: ContentFilter): ContentItem[] {
  return getCache().filter((item) => {
    if (filter.track && item.track !== filter.track) return false
    if (filter.topic && item.topic !== filter.topic) return false
    if (filter.difficulty && item.difficulty !== filter.difficulty) return false
    if (filter.type && item.type !== filter.type) return false
    return true
  })
}

export function getItemById(id: string): ContentItem | undefined {
  return getCache().find((item) => item.id === id)
}
