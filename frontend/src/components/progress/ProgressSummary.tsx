import type { Track } from '@/types/index'

type TrackStat = { attempted: number; passed: number; skipped: number }

type ProgressSummaryProps = {
  statsByTrack: Partial<Record<Track, TrackStat>>
}

const TRACKS: Track[] = ['javascript', 'typescript', 'react']

const TRACK_LABELS: Record<Track, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  react: 'React',
}

export function ProgressSummary({ statsByTrack }: ProgressSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {TRACKS.map((track) => {
        const stat = statsByTrack[track] ?? { attempted: 0, passed: 0, skipped: 0 }
        const failed = stat.attempted - stat.passed - stat.skipped
        return (
          <div key={track} className="rounded-lg border p-4 flex flex-col gap-3">
            <h3 className="text-sm font-semibold">{TRACK_LABELS[track]}</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold">{stat.attempted}</p>
                <p className="text-xs text-muted-foreground">Attempted</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stat.passed}</p>
                <p className="text-xs text-muted-foreground">Passed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{Math.max(0, failed)}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
            {stat.skipped > 0 && (
              <p className="text-xs text-muted-foreground text-center">{stat.skipped} skipped</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
