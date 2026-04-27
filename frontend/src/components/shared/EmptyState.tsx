type EmptyStateProps = {
  title: string
  message: string
  cliCommand?: string
}

export function EmptyState({ title, message, cliCommand }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      {cliCommand && (
        <code className="rounded bg-muted px-3 py-2 text-sm font-mono text-foreground break-all">
          {cliCommand}
        </code>
      )}
    </div>
  )
}
