import type { Track, Verdict, ProgressRecord } from '@/types/index'

export type ProgressRepository = {
  get: (itemId: string) => ProgressRecord | null
  set: (record: ProgressRecord) => void
  getAll: () => ProgressRecord[]
  resetTrack: (track: Track, items: { id: string; track: Track }[]) => void
  resetAll: () => void
}

const KEY_PREFIX = 'devlearn_progress_'

function toKey(itemId: string): string {
  return `${KEY_PREFIX}${itemId}`
}

function parseRecord(raw: string): ProgressRecord | null {
  try {
    return JSON.parse(raw) as ProgressRecord
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.warn('devlearn: discarding corrupted progress record (invalid JSON)')
    }
    return null
  }
}

class LocalStorageProgressRepository implements ProgressRepository {
  get(itemId: string): ProgressRecord | null {
    try {
      const raw = localStorage.getItem(toKey(itemId))
      if (!raw) return null
      const record = parseRecord(raw)
      if (!record) {
        localStorage.removeItem(toKey(itemId))
        return null
      }
      return record
    } catch {
      return null
    }
  }

  set(record: ProgressRecord): void {
    try {
      localStorage.setItem(toKey(record.itemId), JSON.stringify(record))
    } catch {
      // Storage full or unavailable — silently ignore
    }
  }

  getAll(): ProgressRecord[] {
    const records: ProgressRecord[] = []
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (!key?.startsWith(KEY_PREFIX)) continue
        const raw = localStorage.getItem(key)
        if (!raw) continue
        const record = parseRecord(raw)
        if (record) records.push(record)
        else localStorage.removeItem(key)
      }
    } catch {
      // localStorage unavailable — return what we have
    }
    return records
  }

  resetTrack(track: Track, items: { id: string; track: Track }[]): void {
    const ids = new Set(items.filter((it) => it.track === track).map((it) => it.id))
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (!key?.startsWith(KEY_PREFIX)) continue
        const itemId = key.slice(KEY_PREFIX.length)
        if (ids.has(itemId)) localStorage.removeItem(key)
      }
    } catch {
      // Silently ignore
    }
  }

  resetAll(): void {
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(KEY_PREFIX)) keysToRemove.push(key)
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key))
    } catch {
      // Silently ignore
    }
  }
}

export const recordVerdict = (
  repo: ProgressRepository,
  itemId: string,
  verdict: Verdict,
): void => {
  const existing = repo.get(itemId)
  repo.set({
    itemId,
    verdict,
    attemptCount: (existing?.attemptCount ?? 0) + 1,
    lastAttemptedAt: new Date().toISOString(),
  })
}

export const progressRepository: ProgressRepository = new LocalStorageProgressRepository()
