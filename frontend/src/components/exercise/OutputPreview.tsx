type OutputPreviewProps = {
  previewHtml: string | null
}

export function OutputPreview({ previewHtml }: OutputPreviewProps) {
  if (previewHtml === null) return null

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">Preview</h3>
      <iframe
        sandbox="allow-scripts"
        srcDoc={previewHtml}
        className="w-full rounded-md border bg-white"
        style={{ height: '240px' }}
        title="Exercise output preview"
      />
    </div>
  )
}
