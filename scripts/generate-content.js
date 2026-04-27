#!/usr/bin/env node
'use strict'

const Anthropic = require('@anthropic-ai/sdk')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const VALID_TRACKS = ['javascript', 'typescript', 'react']
const VALID_DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'senior']
const VALID_TYPES = ['quiz', 'exercise']
const VALID_EXERCISE_TYPES = ['fill-in-the-blank', 'fix-a-bug', 'implement-a-function', 'refactor']

function parseArgs(argv) {
  const result = {}
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue
    const key = argv[i].slice(2)
    const next = argv[i + 1]
    if (next && !next.startsWith('--')) {
      result[key] = next
      i++
    } else {
      result[key] = true
    }
  }
  return result
}

function isFileArray(v) {
  return (
    Array.isArray(v) &&
    v.every(
      (f) =>
        typeof f === 'object' &&
        f !== null &&
        typeof f.name === 'string' &&
        typeof f.content === 'string',
    )
  )
}

function validateAndNormalize(item, { track, topic, difficulty, type }) {
  if (typeof item !== 'object' || item === null) return null

  item.track = track
  item.topic = topic
  item.difficulty = difficulty
  item.type = type

  if (typeof item.id !== 'string' || !item.id.trim()) {
    item.id = crypto.randomBytes(4).toString('hex')
  }

  if (type === 'quiz') {
    if (
      typeof item.question !== 'string' || !item.question.trim() ||
      typeof item.answer !== 'string' || !item.answer.trim() ||
      typeof item.explanation !== 'string' || !item.explanation.trim()
    ) {
      return null
    }
    return {
      id: item.id,
      track: item.track,
      topic: item.topic,
      difficulty: item.difficulty,
      type: item.type,
      question: item.question,
      answer: item.answer,
      explanation: item.explanation,
    }
  }

  if (type === 'exercise') {
    if (!VALID_EXERCISE_TYPES.includes(item.exerciseType)) return null
    if (typeof item.description !== 'string' || !item.description.trim()) return null
    if (!isFileArray(item.files) || item.files.length === 0) return null
    if (!isFileArray(item.solution) || item.solution.length === 0) return null
    return {
      id: item.id,
      track: item.track,
      topic: item.topic,
      difficulty: item.difficulty,
      type: item.type,
      exerciseType: item.exerciseType,
      description: item.description,
      files: item.files,
      solution: item.solution,
    }
  }

  return null
}

async function generateItems(client, { track, topic, difficulty, type, count, exerciseType }) {
  const exerciseTypeInstruction =
    type === 'exercise'
      ? exerciseType && VALID_EXERCISE_TYPES.includes(exerciseType)
        ? `Exercise type: ${exerciseType}`
        : `Exercise type: choose the most appropriate from ${VALID_EXERCISE_TYPES.join(', ')}`
      : ''

  const quizSchema = JSON.stringify(
    {
      id: '8-char hex string',
      track: track,
      topic: topic,
      difficulty: difficulty,
      type: 'quiz',
      question: 'string — clear question about the topic',
      answer: 'string — comprehensive correct answer',
      explanation: 'string — why this answer is correct',
    },
    null,
    2,
  )

  const exerciseSchema = JSON.stringify(
    {
      id: '8-char hex string',
      track: track,
      topic: topic,
      difficulty: difficulty,
      type: 'exercise',
      exerciseType: 'one of: fill-in-the-blank | fix-a-bug | implement-a-function | refactor',
      description: 'string — task description for the learner',
      files: [{ name: 'filename.ext', content: 'starter code string' }],
      solution: [{ name: 'filename.ext', content: 'solution code string' }],
    },
    null,
    2,
  )

  const schema = type === 'quiz' ? quizSchema : exerciseSchema

  const systemPrompt =
    type === 'quiz'
      ? `You are an expert ${track} developer and educator creating quiz items for a local developer learning platform. Generate high-quality, accurate quiz questions that test real conceptual understanding of ${track}. Return ONLY valid JSON arrays — no markdown, no prose.`
      : `You are an expert ${track} developer and educator creating coding exercises for a local developer learning platform. Generate realistic exercises with working test files using Jest/Vitest syntax. Starter code should match the exercise type (partially complete, broken, unimplemented, or poorly structured). Return ONLY valid JSON arrays — no markdown, no prose.`

  const userPrompt = `Generate exactly ${count} ${type} item(s) for a developer learning platform.

Track: ${track}
Topic: ${topic}
Difficulty: ${difficulty}
${exerciseTypeInstruction}

Return a JSON array of exactly ${count} item(s). Each item MUST match this schema:
${schema}

Rules:
- id: generate a unique 8-character lowercase hex string per item
- track must be exactly "${track}"
- topic must be exactly "${topic}"
- difficulty must be exactly "${difficulty}"
- type must be exactly "${type}"
${
  type === 'quiz'
    ? '- question: specific, unambiguous question\n- answer: complete, accurate answer\n- explanation: educational rationale'
    : '- files array must include both the implementation file and a test file\n- solution array must include only the files that change from starter to correct\n- test file must be self-contained Jest/Vitest tests'
}

Return ONLY the JSON array. No markdown code fences, no additional text.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userPrompt }],
  })

  const block = response.content[0]
  if (!block || block.type !== 'text') {
    throw new Error('Unexpected response structure from Claude API')
  }

  let text = block.text.trim()

  // Strip markdown code fences if present
  const fenced = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/)
  if (fenced) text = fenced[1].trim()

  let items
  try {
    items = JSON.parse(text)
  } catch {
    throw new Error(
      `Claude API response could not be parsed as JSON.\nFirst 300 chars: ${text.slice(0, 300)}`,
    )
  }

  if (!Array.isArray(items)) {
    throw new Error('Claude API response was not a JSON array')
  }

  return items
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  const { track, topic, difficulty, type } = args
  const count = args.count ? parseInt(args.count, 10) : 5
  const replace = args.replace === true || args.replace === 'true'
  const exerciseType = typeof args.exerciseType === 'string' ? args.exerciseType : undefined

  // Validate args
  if (!track || !VALID_TRACKS.includes(track)) {
    console.error(`Error: --track must be one of: ${VALID_TRACKS.join(', ')}`)
    process.exit(1)
  }
  if (!topic || typeof topic !== 'string') {
    console.error('Error: --topic is required')
    process.exit(1)
  }
  if (!difficulty || !VALID_DIFFICULTIES.includes(difficulty)) {
    console.error(`Error: --difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`)
    process.exit(1)
  }
  if (!type || !VALID_TYPES.includes(type)) {
    console.error(`Error: --type must be one of: ${VALID_TYPES.join(', ')}`)
    process.exit(1)
  }
  if (isNaN(count) || count < 1) {
    console.error('Error: --count must be a positive integer')
    process.exit(1)
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is not set.')
    console.error('Remediation: set ANTHROPIC_API_KEY in your shell before running this script.')
    process.exit(1)
  }

  const client = new Anthropic.default({ apiKey })

  const outputDir = path.resolve(process.cwd(), 'content', track, topic, difficulty, type)
  fs.mkdirSync(outputDir, { recursive: true })

  console.log(
    `Generating ${count} ${type} item(s) — track: ${track}, topic: ${topic}, difficulty: ${difficulty}`,
  )

  let savedCount = 0

  try {
    const rawItems = await generateItems(client, {
      track,
      topic,
      difficulty,
      type,
      count,
      exerciseType,
    })

    for (const raw of rawItems) {
      const item = validateAndNormalize(raw, { track, topic, difficulty, type })
      if (!item) {
        console.warn('  [skip] Item failed validation')
        continue
      }

      // Avoid clobbering existing files unless --replace is set
      let filePath = path.join(outputDir, `${item.id}.json`)
      if (fs.existsSync(filePath) && !replace) {
        item.id = crypto.randomBytes(4).toString('hex')
        filePath = path.join(outputDir, `${item.id}.json`)
      }

      fs.writeFileSync(filePath, JSON.stringify(item, null, 2), 'utf-8')
      savedCount++
      console.log(`  [saved] ${path.relative(process.cwd(), filePath)}`)
    }

    console.log(`\nDone: ${savedCount}/${count} item(s) written to ${path.relative(process.cwd(), outputDir)}`)
  } catch (err) {
    console.error(`\nError: ${err instanceof Error ? err.message : String(err)}`)
    console.error(`Saved ${savedCount}/${count} item(s) before failure.`)
    process.exit(1)
  }
}

main()
