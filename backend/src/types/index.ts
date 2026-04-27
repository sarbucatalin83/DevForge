export type Track = 'javascript' | 'typescript' | 'react'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'senior'
export type ExerciseType =
  | 'fill-in-the-blank'
  | 'fix-a-bug'
  | 'implement-a-function'
  | 'refactor'
export type Verdict = 'pass' | 'fail' | 'skipped'

export type QuizItem = {
  id: string
  track: Track
  topic: string
  difficulty: Difficulty
  type: 'quiz'
  question: string
  answer: string
  explanation: string
}

export type CodingExercise = {
  id: string
  track: Track
  topic: string
  difficulty: Difficulty
  type: 'exercise'
  exerciseType: ExerciseType
  description: string
  files: { name: string; content: string }[]
  solution: { name: string; content: string }[]
}

export type ContentFilter = {
  track?: Track
  topic?: string
  difficulty?: Difficulty
  type?: 'quiz' | 'exercise'
}

export type ExecutorConfig = {
  image: string
  extension: string
  runCommand: string
  testCommand: string
  timeoutSeconds: number
  cpuLimit: string
  memoryLimit: string
}

export type ContentLoadResult = {
  items: (QuizItem | CodingExercise)[]
  skippedCount: number
}

export type ExecutionResult = {
  passed: boolean
  testOutput: string
  previewHtml: string | null
  timedOut: boolean
}
