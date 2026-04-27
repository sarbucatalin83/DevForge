import { useMutation } from '@tanstack/react-query'
import type { ExecutionResult } from '@/types/index'

const API_BASE = 'http://localhost:3001'

type SubmitPayload = {
  exerciseId: string
  files: { name: string; content: string }[]
}

async function postExecute(payload: SubmitPayload): Promise<ExecutionResult> {
  const res = await fetch(`${API_BASE}/api/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>
    throw new Error(
      typeof body.error === 'string'
        ? body.error
        : `Execution API error: ${res.status.toString()}`,
    )
  }
  return res.json() as Promise<ExecutionResult>
}

export function useCodeExecution() {
  const mutation = useMutation({ mutationFn: postExecute })

  return {
    submit: mutation.mutate,
    result: mutation.data ?? null,
    isSubmitting: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error : null,
  }
}
