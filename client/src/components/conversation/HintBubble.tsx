import { Lightbulb, X } from 'lucide-react'

interface HintBubbleProps {
  hint: string
  onDismiss: () => void
  onUseHint: (text: string) => void
}

export function HintBubble({ hint, onDismiss, onUseHint }: HintBubbleProps) {
  return (
    <div className="px-5 pb-2 animate-fade-in-up">
      <div className="flex items-start gap-2.5 bg-accent-50 border border-accent-100 rounded-xl px-3.5 py-2.5">
        <Lightbulb className="w-4 h-4 text-accent-500 shrink-0 mt-0.5" />
        <button
          onClick={() => onUseHint(hint)}
          className="flex-1 text-left text-sm text-neutral-600 font-body leading-relaxed hover:text-primary-600 transition-colors cursor-pointer"
        >
          {hint}
        </button>
        <button
          onClick={onDismiss}
          className="w-5 h-5 flex items-center justify-center text-neutral-300 hover:text-neutral-500 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
