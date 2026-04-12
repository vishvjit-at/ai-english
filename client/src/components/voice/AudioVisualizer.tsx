import { cn } from '@/lib/utils'

interface AudioVisualizerProps {
  isActive: boolean
  className?: string
}

export function AudioVisualizer({ isActive, className }: AudioVisualizerProps) {
  const bars = [2, 4, 3, 5, 4, 3, 5, 2, 4, 3]

  return (
    <div className={cn('flex items-center gap-[3px] h-5', className)}>
      {bars.map((height, i) => (
        <div
          key={i}
          className={cn(
            'w-[2.5px] rounded-full transition-all duration-300',
            isActive ? 'bg-primary-500' : 'bg-neutral-200'
          )}
          style={{
            height: isActive ? `${height * 3.5}px` : '3px',
            animation: isActive ? `wave ${0.4 + i * 0.06}s ease-in-out infinite alternate` : 'none',
          }}
        />
      ))}
    </div>
  )
}
