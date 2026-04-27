import { useQuery } from '@tanstack/react-query'
import type { ContentFilter, QuizItem, CodingExercise } from '@/types/index'

const API_BASE = 'http://localhost:3001'

async function fetchContent(filter: ContentFilter): Promise<(QuizItem | CodingExercise)[]> {
  const params = new URLSearchParams()
  if (filter.track) params.set('track', filter.track)
  if (filter.topic) params.set('topic', filter.topic)
  if (filter.difficulty) params.set('difficulty', filter.difficulty)
  if (filter.type) params.set('type', filter.type)

  const res = await fetch(`${API_BASE}/api/content?${params.toString()}`)
  if (!res.ok) throw new Error(`Content API error: ${res.status.toString()}`)
  return res.json() as Promise<(QuizItem | CodingExercise)[]>
}

export function useContent(filter: ContentFilter) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['content', filter],
    queryFn: () => fetchContent(filter),
    staleTime: 60_000,
  })

  return {
    items: data ?? [],
    isLoading,
    error: error instanceof Error ? error : null,
  }
}
