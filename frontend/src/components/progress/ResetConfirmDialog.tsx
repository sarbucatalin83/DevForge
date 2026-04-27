import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Track } from '@/types/index'

type ResetConfirmDialogProps = {
  scope: Track | 'all'
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

const SCOPE_LABELS: Record<Track | 'all', string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  react: 'React',
  all: 'all tracks',
}

export function ResetConfirmDialog({
  scope,
  open,
  onOpenChange,
  onConfirm,
}: ResetConfirmDialogProps) {
  function handleConfirm() {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset progress?</DialogTitle>
          <DialogDescription>
            This will permanently delete all progress records for{' '}
            <strong>{SCOPE_LABELS[scope]}</strong>. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Reset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
