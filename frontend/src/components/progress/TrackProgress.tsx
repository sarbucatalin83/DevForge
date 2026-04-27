import type { Track } from '@/types/index'

export type TopicStat = {
  topic: string
  attempted: number
  passed: number
  skipped: number
}

type TrackProgressProps = {
  track: Track
  topics: TopicStat[]
}

export function TrackProgress({ track, topics }: TrackProgressProps) {
  if (topics.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No attempts recorded for {track} yet.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Topic</th>
            <th className="text-right py-2 px-4 font-medium text-muted-foreground">Attempted</th>
            <th className="text-right py-2 px-4 font-medium text-muted-foreground">Passed</th>
            <th className="text-right py-2 px-4 font-medium text-muted-foreground">Skipped</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((row) => (
            <tr key={row.topic} className="border-b last:border-0">
              <td className="py-2 pr-4 font-mono">{row.topic}</td>
              <td className="text-right py-2 px-4">{row.attempted}</td>
              <td className="text-right py-2 px-4 text-green-600 dark:text-green-400">
                {row.passed}
              </td>
              <td className="text-right py-2 px-4 text-muted-foreground">{row.skipped}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
