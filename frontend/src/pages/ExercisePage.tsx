import { useState, useMemo, useRef } from 'react'
import { useContent } from '@/hooks/useContent'
import { useProgress } from '@/hooks/useProgress'
import { useCodeExecution } from '@/hooks/useCodeExecution'
import { useFilterState } from '@/hooks/useFilterState'
import { buildExerciseSession } from '@/lib/session'
import { ExerciseEditor } from '@/components/exercise/ExerciseEditor'
import { OutputPreview } from '@/components/exercise/OutputPreview'
import { TestResultsPanel } from '@/components/exercise/TestResultsPanel'
import { FilterBar } from '@/components/shared/FilterBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorBanner } from '@/components/shared/ErrorBanner'
import { Button } from '@/components/ui/button'
import type { ContentFilter, CodingExercise } from '@/types/index'

export default function ExercisePage() {
  const { filter, setFilter } = useFilterState()
  const [sessionIndex, setSessionIndex] = useState(0)
  const [sessionSeed, setSessionSeed] = useState(0)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const currentFilesRef = useRef<{ name: string; content: string }[]>([])
  const activeFilter: ContentFilter = { ...filter, type: 'exercise' }
  const { items: allItems, isLoading, error } = useContent(activeFilter)
  const { recordVerdict } = useProgress()
  const { submit, result, isSubmitting, error: execError } = useCodeExecution()

  const exercises = useMemo(
    () =>
      buildExerciseSession(
        allItems.filter((i): i is CodingExercise => i.type === 'exercise'),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allItems, sessionSeed],
  )

  const availableTopics = useMemo(
    () => [...new Set(allItems.map((i) => i.topic))].sort(),
    [allItems],
  )

  const currentExercise = exercises[sessionIndex]
  const isComplete = !isLoading && exercises.length > 0 && sessionIndex >= exercises.length

  function handleFilterChange(f: ContentFilter) {
    setFilter({ ...f, type: undefined })
    setSessionIndex(0)
    setSessionSeed((n) => n + 1)
    setHasSubmitted(false)
  }

  function handleFilesChange(files: { name: string; content: string }[]) {
    currentFilesRef.current = files
  }

  function handleSubmit() {
    if (!currentExercise) return
    const files =
      currentFilesRef.current.length > 0
        ? currentFilesRef.current
        : currentExercise.files
    setHasSubmitted(true)
    submit(
      { exerciseId: currentExercise.id, files },
      {
        onSuccess: (res) => {
          if (!res.timedOut) {
            recordVerdict(currentExercise.id, res.passed ? 'pass' : 'fail')
          }
        },
      },
    )
  }

  function advance() {
    setSessionIndex((i) => i + 1)
    setHasSubmitted(false)
    currentFilesRef.current = []
  }

  function restartSession() {
    setSessionIndex(0)
    setSessionSeed((n) => n + 1)
    setHasSubmitted(false)
    currentFilesRef.current = []
  }

  const cliCommand = [
    'node scripts/generate-content.js',
    filter.track ? `--track ${filter.track}` : '',
    filter.topic ? `--topic ${filter.topic}` : '',
    filter.difficulty ? `--difficulty ${filter.difficulty}` : '',
    '--type exercise',
    '--count 3',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Coding Exercises</h1>

      <FilterBar
        filter={activeFilter}
        availableTopics={availableTopics}
        onFilterChange={handleFilterChange}
      />

      {error && (
        <ErrorBanner
          message="Failed to load exercises."
          remediation="Make sure the backend is running on port 3001 and try refreshing the page."
        />
      )}

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading exercises…</p>
      )}

      {!isLoading && !error && exercises.length === 0 && (
        <EmptyState
          title="No exercises found"
          message="There are no exercises matching the current filter. Generate some with the CLI command below, then refresh."
          cliCommand={cliCommand}
        />
      )}

      {!isLoading && isComplete && (
        <div className="flex flex-col items-center gap-4 rounded-lg border p-12 text-center">
          <h2 className="text-lg font-semibold">Session complete!</h2>
          <p className="text-sm text-muted-foreground">
            You've completed all {exercises.length} exercise
            {exercises.length !== 1 ? 's' : ''}.
          </p>
          <Button onClick={restartSession}>Start new session</Button>
        </div>
      )}

      {!isLoading && currentExercise && !isComplete && (
        <div className="flex flex-col gap-6">
          <p className="text-xs text-muted-foreground">
            Exercise {sessionIndex + 1} of {exercises.length}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <div className="rounded-lg border p-4">
                <span className="inline-block rounded bg-muted px-2 py-0.5 text-xs font-mono mb-2">
                  {currentExercise.exerciseType}
                </span>
                <p className="text-sm whitespace-pre-wrap">{currentExercise.description}</p>
              </div>

              <ExerciseEditor
                key={`${currentExercise.id}-${sessionSeed}`}
                initialFiles={currentExercise.files}
                onFilesChange={handleFilesChange}
              />

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="self-start"
              >
                {isSubmitting ? 'Running…' : 'Submit'}
              </Button>
            </div>

            <div className="flex flex-col gap-4">
              {execError && !isSubmitting && (
                <ErrorBanner
                  message={execError.message}
                  remediation="Make sure Docker is running and the backend is reachable on port 3001."
                />
              )}

              {hasSubmitted && result && result.timedOut && (
                <ErrorBanner
                  message="Time limit exceeded — your code ran too long."
                  remediation="Optimise your solution and resubmit. The time limit for this track is configured in executor-config.json."
                />
              )}

              {hasSubmitted && result && !result.timedOut && (
                <>
                  <TestResultsPanel
                    passed={result.passed}
                    testOutput={result.testOutput}
                    solution={result.solution}
                  />
                  <OutputPreview previewHtml={result.previewHtml} />
                </>
              )}

              {hasSubmitted && result && (
                <Button variant="outline" onClick={advance} className="self-start">
                  Next exercise
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
