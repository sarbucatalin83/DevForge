import { useQuery } from '@tanstack/react-query'
import { CoverageTable } from '@/components/coverage/CoverageTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorBanner } from '@/components/shared/ErrorBanner'
import type { Track, Difficulty } from '@/types/index'

const API_BASE = 'http://localhost:3001'

type CoverageEntry = {
  track: Track
  topic: string
  difficulty: Difficulty
  type: 'quiz' | 'exercise'
  count: number
}

async function fetchCoverage(): Promise<CoverageEntry[]> {
  const res = await fetch(`${API_BASE}/api/coverage`)
  if (!res.ok) throw new Error(`Coverage API error: ${res.status.toString()}`)
  return res.json() as Promise<CoverageEntry[]>
}

export default function CoveragePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['coverage'],
    queryFn: fetchCoverage,
    staleTime: 30_000,
  })

  const entries = data ?? []

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Content Coverage</h1>

      {error && (
        <ErrorBanner
          message="Failed to load coverage data."
          remediation="Make sure the backend is running on port 3001 and try refreshing the page."
        />
      )}

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading coverage…</p>
      )}

      {!isLoading && !error && entries.length === 0 && (
        <EmptyState
          title="No content yet"
          message="The content library is empty. Use the CLI tool to generate starter content, then refresh."
          cliCommand="node scripts/generate-content.js --track javascript --topic closures --difficulty beginner --type quiz --count 5"
        />
      )}

      {!isLoading && entries.length > 0 && (
        <div className="rounded-lg border">
          <div className="px-4 py-3 border-b">
            <p className="text-sm text-muted-foreground">
              {entries.length} combination{entries.length !== 1 ? 's' : ''} across{' '}
              {new Set(entries.map((e) => e.track)).size} track
              {new Set(entries.map((e) => e.track)).size !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="p-4">
            <CoverageTable entries={entries} />
          </div>
        </div>
      )}
    </div>
  )
}
