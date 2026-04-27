import { useState } from 'react'
import { Button } from '@/components/ui/button'

type QuizCardProps = {
  question: string
  onSubmit: (answer: string) => void
  onShowAnswer: () => void
  submitted: boolean
}

export function QuizCard({ question, onSubmit, onShowAnswer, submitted }: QuizCardProps) {
  const [answer, setAnswer] = useState('')

  function handleSubmit() {
    if (answer.trim()) onSubmit(answer.trim())
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-6">
      <p className="text-base font-medium leading-relaxed">{question}</p>
      <textarea
        aria-label="Your answer"
        className="min-h-[120px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        placeholder="Type your answer here…"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={submitted}
      />
      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={submitted || !answer.trim()}>
          Submit
        </Button>
        <Button variant="outline" onClick={onShowAnswer} disabled={submitted}>
          Show Answer
        </Button>
      </div>
    </div>
  )
}
