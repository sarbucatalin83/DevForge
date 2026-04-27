import { useState } from 'react'
import { X } from 'lucide-react'

type ErrorBannerProps = {
  message: string
  remediation: string
}

export function ErrorBanner({ message, remediation }: ErrorBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div
      role="alert"
      className="relative flex flex-col gap-1 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 pr-10 text-sm"
    >
      <button
        type="button"
        aria-label="Dismiss error"
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-2 rounded p-1 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="font-medium text-destructive">{message}</p>
      <p className="text-muted-foreground">{remediation}</p>
    </div>
  )
}
