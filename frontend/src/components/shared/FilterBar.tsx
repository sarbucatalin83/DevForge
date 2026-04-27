import type { ContentFilter, Track, Difficulty } from '@/types/index'

const TRACKS: Track[] = ['javascript', 'typescript', 'react']
const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced', 'senior']

type FilterBarProps = {
  filter: ContentFilter
  availableTopics: string[]
  onFilterChange: (filter: ContentFilter) => void
}

export function FilterBar({ filter, availableTopics, onFilterChange }: FilterBarProps) {
  const set = <K extends keyof ContentFilter>(key: K, value: ContentFilter[K]) =>
    onFilterChange({ ...filter, [key]: value || undefined })

  return (
    <div className="flex flex-wrap gap-3">
      <select
        aria-label="Track"
        value={filter.track ?? ''}
        onChange={(e) => set('track', (e.target.value as Track) || undefined)}
        className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
      >
        <option value="">All tracks</option>
        {TRACKS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <select
        aria-label="Topic"
        value={filter.topic ?? ''}
        onChange={(e) => set('topic', e.target.value || undefined)}
        className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
      >
        <option value="">All topics</option>
        {availableTopics.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <select
        aria-label="Difficulty"
        value={filter.difficulty ?? ''}
        onChange={(e) => set('difficulty', (e.target.value as Difficulty) || undefined)}
        className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
      >
        <option value="">All difficulties</option>
        {DIFFICULTIES.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select
        aria-label="Type"
        value={filter.type ?? ''}
        onChange={(e) =>
          set('type', (e.target.value as 'quiz' | 'exercise') || undefined)
        }
        className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
      >
        <option value="">All types</option>
        <option value="quiz">Quiz</option>
        <option value="exercise">Exercise</option>
      </select>
    </div>
  )
}
