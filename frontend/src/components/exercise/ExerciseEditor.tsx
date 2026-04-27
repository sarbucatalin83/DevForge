import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'

type FileEntry = { name: string; content: string }

type ExerciseEditorProps = {
  initialFiles: FileEntry[]
  onFilesChange: (files: FileEntry[]) => void
}

export function ExerciseEditor({ initialFiles, onFilesChange }: ExerciseEditorProps) {
  const [files, setFiles] = useState<FileEntry[]>(initialFiles)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleChange = useCallback(
    (value: string | undefined) => {
      const updated = files.map((f, i) =>
        i === activeIndex ? { ...f, content: value ?? '' } : f,
      )
      setFiles(updated)
      onFilesChange(updated)
    },
    [files, activeIndex, onFilesChange],
  )

  const activeFile = files[activeIndex]
  const language = getLanguage(activeFile?.name ?? '')

  return (
    <div className="flex flex-col rounded-md border overflow-hidden">
      <div className="flex border-b bg-muted overflow-x-auto">
        {files.map((file, i) => (
          <button
            key={file.name}
            onClick={() => setActiveIndex(i)}
            className={`px-4 py-2 text-sm font-mono whitespace-nowrap border-r transition-colors ${
              i === activeIndex
                ? 'bg-background text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {file.name}
          </button>
        ))}
      </div>
      <Editor
        height="400px"
        language={language}
        value={activeFile?.content ?? ''}
        onChange={handleChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          tabSize: 2,
        }}
      />
    </div>
  )
}

function getLanguage(filename: string): string {
  if (filename.endsWith('.tsx') || filename.endsWith('.ts')) return 'typescript'
  if (filename.endsWith('.jsx') || filename.endsWith('.js')) return 'javascript'
  if (filename.endsWith('.css')) return 'css'
  if (filename.endsWith('.json')) return 'json'
  if (filename.endsWith('.html')) return 'html'
  return 'plaintext'
}
