type AnswerRevealProps = {
  learnerAnswer: string | null
  correctAnswer: string
  explanation: string
}

export function AnswerReveal({ learnerAnswer, correctAnswer, explanation }: AnswerRevealProps) {
  return (
    <div className="grid gap-4 rounded-lg border bg-muted/30 p-6 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Your Answer
        </h3>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {learnerAnswer ?? <span className="italic text-muted-foreground">No answer submitted</span>}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Correct Answer
        </h3>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{correctAnswer}</p>
        <h3 className="mt-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Explanation
        </h3>
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
          {explanation}
        </p>
      </div>
    </div>
  )
}
