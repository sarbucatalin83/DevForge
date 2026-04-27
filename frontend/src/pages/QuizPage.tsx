import { useState, useMemo } from 'react'
import { useContent } from '@/hooks/useContent'
import { useProgress } from '@/hooks/useProgress'
import { buildQuizSession } from '@/lib/session'
import { QuizCard } from '@/components/quiz/QuizCard'
import { AnswerReveal } from '@/components/quiz/AnswerReveal'
import { SelfAssessButtons } from '@/components/quiz/SelfAssessButtons'
import { FilterBar } from '@/components/shared/FilterBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorBanner } from '@/components/shared/ErrorBanner'
import { Button } from '@/components/ui/button'
import type { ContentFilter, QuizItem, Verdict } from '@/types/index'

type CardState =
  | { phase: 'answering' }
  | { phase: 'revealed'; learnerAnswer: string | null }
  | { phase: 'assessed'; verdict: Verdict; learnerAnswer: string | null }

export default function QuizPage() {
  const [filter, setFilter] = useState<ContentFilter>({ type: 'quiz' })
  const [sessionIndex, setSessionIndex] = useState(0)
  const [sessionSeed, setSessionSeed] = useState(0)
  const [cardState, setCardState] = useState<CardState>({ phase: 'answering' })

  const { items: allItems, isLoading, error } = useContent(filter)
  const { recordVerdict } = useProgress()

  const quizItems = useMemo(
    () => buildQuizSession(allItems.filter((i): i is QuizItem => i.type === 'quiz')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allItems, sessionSeed],
  )

  const availableTopics = useMemo(
    () => [...new Set(allItems.map((i) => i.topic))].sort(),
    [allItems],
  )

  const currentItem = quizItems[sessionIndex]
  const isComplete = !isLoading && quizItems.length > 0 && sessionIndex >= quizItems.length

  function handleFilterChange(f: ContentFilter) {
    setFilter({ ...f, type: 'quiz' })
    setSessionIndex(0)
    setSessionSeed((n) => n + 1)
    setCardState({ phase: 'answering' })
  }

  function handleSubmit(answer: string) {
    setCardState({ phase: 'revealed', learnerAnswer: answer })
  }

  function handleShowAnswer() {
    if (!currentItem) return
    recordVerdict(currentItem.id, 'skipped')
    setCardState({ phase: 'revealed', learnerAnswer: null })
  }

  function handleAssess(verdict: Verdict) {
    if (!currentItem) return
    recordVerdict(currentItem.id, verdict)
    setCardState((s) => ({
      phase: 'assessed',
      verdict,
      learnerAnswer: s.phase === 'revealed' ? s.learnerAnswer : null,
    }))
  }

  function advance() {
    setSessionIndex((i) => i + 1)
    setCardState({ phase: 'answering' })
  }

  function restartSession() {
    setSessionIndex(0)
    setSessionSeed((n) => n + 1)
    setCardState({ phase: 'answering' })
  }

  const cliCommand = [
    'node scripts/generate-content.js',
    filter.track ? `--track ${filter.track}` : '',
    filter.topic ? `--topic ${filter.topic}` : '',
    filter.difficulty ? `--difficulty ${filter.difficulty}` : '',
    '--type quiz',
    '--count 5',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Quiz</h1>

      <FilterBar
        filter={filter}
        availableTopics={availableTopics}
        onFilterChange={handleFilterChange}
      />

      {error && (
        <ErrorBanner
          message="Failed to load quiz content."
          remediation="Make sure the backend is running on port 3001 and try refreshing the page."
        />
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Loading questions…</p>}

      {!isLoading && !error && quizItems.length === 0 && (
        <EmptyState
          title="No quiz questions found"
          message="There are no quiz questions matching the current filter. Generate some with the CLI command below, then refresh."
          cliCommand={cliCommand}
        />
      )}

      {!isLoading && isComplete && (
        <div className="flex flex-col items-center gap-4 rounded-lg border p-12 text-center">
          <h2 className="text-lg font-semibold">Session complete!</h2>
          <p className="text-sm text-muted-foreground">
            You've gone through all {quizItems.length} question{quizItems.length !== 1 ? 's' : ''}.
          </p>
          <Button onClick={restartSession}>Start new session</Button>
        </div>
      )}

      {!isLoading && currentItem && !isComplete && (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-muted-foreground">
            Question {sessionIndex + 1} of {quizItems.length}
          </p>

          <QuizCard
            question={currentItem.question}
            onSubmit={handleSubmit}
            onShowAnswer={handleShowAnswer}
            submitted={cardState.phase !== 'answering'}
          />

          {(cardState.phase === 'revealed' || cardState.phase === 'assessed') && (
            <AnswerReveal
              learnerAnswer={cardState.learnerAnswer}
              correctAnswer={currentItem.answer}
              explanation={currentItem.explanation}
            />
          )}

          <div className="flex items-center gap-3">
            {cardState.phase === 'revealed' && (
              <SelfAssessButtons onAssess={handleAssess} visible />
            )}

            {cardState.phase === 'assessed' && (
              <>
                <span className={`text-sm font-medium ${cardState.verdict === 'pass' ? 'text-green-600' : 'text-destructive'}`}>
                  {cardState.verdict === 'pass' ? 'Marked as correct' : 'Marked as incorrect'}
                </span>
                <Button variant="outline" onClick={advance}>
                  Next
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
