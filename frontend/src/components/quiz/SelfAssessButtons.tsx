import { Button } from '@/components/ui/button'
import type { Verdict } from '@/types/index'

type SelfAssessButtonsProps = {
  onAssess: (verdict: Verdict) => void
  visible: boolean
}

export function SelfAssessButtons({ onAssess, visible }: SelfAssessButtonsProps) {
  if (!visible) return null

  return (
    <div className="flex gap-3">
      <Button onClick={() => onAssess('pass')} className="bg-green-600 hover:bg-green-700 text-white">
        I got it
      </Button>
      <Button variant="outline" onClick={() => onAssess('fail')} className="border-destructive text-destructive hover:bg-destructive/10">
        I missed it
      </Button>
    </div>
  )
}
