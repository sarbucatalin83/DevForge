import fs from 'fs'
import path from 'path'
import type { ExecutorConfig } from '../types/index'

const REQUIRED_FIELDS: (keyof ExecutorConfig)[] = [
  'image',
  'extension',
  'runCommand',
  'testCommand',
  'timeoutSeconds',
  'cpuLimit',
  'memoryLimit',
]

function isValidEntry(value: unknown): value is ExecutorConfig {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  for (const field of REQUIRED_FIELDS) {
    if (obj[field] === undefined) return false
  }
  return (
    typeof obj.image === 'string' &&
    typeof obj.extension === 'string' &&
    typeof obj.runCommand === 'string' &&
    typeof obj.testCommand === 'string' &&
    typeof obj.timeoutSeconds === 'number' &&
    typeof obj.cpuLimit === 'string' &&
    typeof obj.memoryLimit === 'string'
  )
}

function loadExecutorConfig(): Record<string, ExecutorConfig> {
  const configPath = path.resolve(__dirname, '../../../executor-config.json')
  let raw: string
  try {
    raw = fs.readFileSync(configPath, 'utf-8')
  } catch {
    throw new Error(
      `Cannot read executor-config.json at ${configPath}. ` +
        'Remediation: ensure executor-config.json exists at the repository root.',
    )
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw) as unknown
  } catch {
    throw new Error(
      'executor-config.json is not valid JSON. ' +
        'Remediation: validate the file with a JSON linter and fix any syntax errors.',
    )
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error(
      'executor-config.json must be a JSON object. ' +
        'Remediation: check the root structure of executor-config.json.',
    )
  }

  const configs: Record<string, ExecutorConfig> = {}
  for (const [track, entry] of Object.entries(parsed as Record<string, unknown>)) {
    if (!isValidEntry(entry)) {
      throw new Error(
        `executor-config.json entry for "${track}" is missing required fields ` +
          `(${REQUIRED_FIELDS.join(', ')}). ` +
          'Remediation: add all required fields to the entry for this track.',
      )
    }
    configs[track] = entry
  }

  return configs
}

export const executorConfig = loadExecutorConfig()
