import { useState, useMemo } from 'react'
import { useContent } from '@/hooks/useContent'
import { useProgress } from '@/hooks/useProgress'
import { ProgressSummary } from '@/components/progress/ProgressSummary'
import { TrackProgress } from '@/components/progress/TrackProgress'
import type { TopicStat } from '@/components/progress/TrackProgress'
import { ResetConfirmDialog } from '@/components/progress/ResetConfirmDialog'
import { Button } from '@/components/ui/button'
import { ErrorBanner } from '@/components/shared/ErrorBanner'
import type { Track, QuizItem, CodingExercise } from '@/types/index'

type ResetScope = Track | 'all'

const TRACKS: Track[] = ['javascript', 'typescript', 'react']
const TRACK_LABELS: Record<Track, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  react: 'React',
}

export default function ProgressPage() {
  const [dialogScope, setDialogScope] = useState<ResetScope | null>(null)

  const { items: allContent, isLoading: contentLoading, error: contentError } = useContent({})
  const { getAllRecords, resetTrack, resetAll } = useProgress()

  const records = getAllRecords()

  const contentById = useMemo(() => {
    const map = new Map<string, { track: Track; topic: string }>()
    for (const item of allContent) {
      map.set(item.id, { track: item.track, topic: item.topic })
    }
    return map
  }, [allContent])

  const statsByTrack = useMemo(() => {
    const stats: Partial<Record<Track, { attempted: number; passed: number; skipped: number }>> = {}
    for (const record of records) {
      const meta = contentById.get(record.itemId)
      if (!meta) continue
      const s = stats[meta.track] ?? { attempted: 0, passed: 0, skipped: 0 }
      s.attempted += 1
      if (record.verdict === 'pass') s.passed += 1
      if (record.verdict === 'skipped') s.skipped += 1
      stats[meta.track] = s
    }
    return stats
  }, [records, contentById])

  const statsByTrackTopic = useMemo(() => {
    const byTrack: Partial<Record<Track, Map<string, TopicStat>>> = {}
    for (const record of records) {
      const meta = contentById.get(record.itemId)
      if (!meta) continue
      if (!byTrack[meta.track]) byTrack[meta.track] = new Map()
      const topicMap = byTrack[meta.track]!
      const existing = topicMap.get(meta.topic) ?? { topic: meta.topic, attempted: 0, passed: 0, skipped: 0 }
      existing.attempted += 1
      if (record.verdict === 'pass') existing.passed += 1
      if (record.verdict === 'skipped') existing.skipped += 1
      topicMap.set(meta.topic, existing)
    }
    const result: Partial<Record<Track, TopicStat[]>> = {}
    for (const track of TRACKS) {
      const topicMap = byTrack[track]
      result[track] = topicMap
        ? [...topicMap.values()].sort((a, b) => a.topic.localeCompare(b.topic))
        : []
    }
    return result
  }, [records, contentById])

  const contentItems = useMemo(
    () =>
      (allContent as (QuizItem | CodingExercise)[]).map((i) => ({ id: i.id, track: i.track })),
    [allContent],
  )

  function handleConfirmReset() {
    if (!dialogScope) return
    if (dialogScope === 'all') {
      resetAll()
    } else {
      resetTrack(dialogScope, contentItems)
    }
    setDialogScope(null)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Progress</h1>
        <Button variant="destructive" size="sm" onClick={() => setDialogScope('all')}>
          Reset all
        </Button>
      </div>

      {contentError && (
        <ErrorBanner
          message="Failed to load content for progress view."
          remediation="Make sure the backend is running on port 3001 and try refreshing."
        />
      )}

      {contentLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <ProgressSummary statsByTrack={statsByTrack} />
      )}

      {TRACKS.map((track) => (
        <section key={track} className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold">{TRACK_LABELS[track]}</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogScope(track)}
            >
              Reset {TRACK_LABELS[track]}
            </Button>
          </div>
          <div className="rounded-lg border p-4">
            <TrackProgress
              track={track}
              topics={statsByTrackTopic[track] ?? []}
            />
          </div>
        </section>
      ))}

      {dialogScope !== null && (
        <ResetConfirmDialog
          scope={dialogScope}
          open={dialogScope !== null}
          onOpenChange={(open) => { if (!open) setDialogScope(null) }}
          onConfirm={handleConfirmReset}
        />
      )}
    </div>
  )
}
