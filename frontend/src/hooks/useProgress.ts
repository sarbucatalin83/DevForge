import { useState, useCallback } from 'react'
import { progressRepository, recordVerdict as doRecord } from '@/lib/progressRepository'
import type { Track, Verdict, ProgressRecord } from '@/types/index'

export function useProgress() {
  const [tick, setTick] = useState(0)
  const invalidate = useCallback(() => setTick((n) => n + 1), [])

  const getRecord = useCallback(
    (itemId: string): ProgressRecord | null => {
      void tick
      return progressRepository.get(itemId)
    },
    [tick],
  )

  const recordVerdictFn = useCallback(
    (itemId: string, verdict: Verdict) => {
      doRecord(progressRepository, itemId, verdict)
      invalidate()
    },
    [invalidate],
  )

  const getAllRecords = useCallback((): ProgressRecord[] => {
    void tick
    return progressRepository.getAll()
  }, [tick])

  const resetTrack = useCallback(
    (track: Track, items: { id: string; track: Track }[]) => {
      progressRepository.resetTrack(track, items)
      invalidate()
    },
    [invalidate],
  )

  const resetAll = useCallback(() => {
    progressRepository.resetAll()
    invalidate()
  }, [invalidate])

  return { getRecord, recordVerdict: recordVerdictFn, getAllRecords, resetTrack, resetAll }
}
