type FileEntry = { name: string; content: string }

type TestResultsPanelProps = {
  passed: boolean
  testOutput: string
  solution?: FileEntry[]
}

export function TestResultsPanel({ passed, testOutput, solution }: TestResultsPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
            passed
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {passed ? '✓ Tests passed' : '✗ Tests failed'}
        </span>
      </div>

      {testOutput && (
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold">Test output</h3>
          <pre className="overflow-auto rounded-md bg-muted p-3 text-xs font-mono whitespace-pre-wrap max-h-48">
            {testOutput}
          </pre>
        </div>
      )}

      {!passed && solution && solution.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Reference solution</h3>
          {solution.map((file) => (
            <div key={file.name} className="flex flex-col gap-1">
              <span className="text-xs font-mono text-muted-foreground">{file.name}</span>
              <pre className="overflow-auto rounded-md bg-muted p-3 text-xs font-mono whitespace-pre-wrap max-h-64">
                {file.content}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
