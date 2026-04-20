import type { ReactNode } from 'react'

const RADII = { full: '9999px', '2xl': '1rem', xl: '0.75rem', lg: '0.5rem' }

interface MaskButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  /** Tailwind padding + font classes applied to the button, e.g. "px-7 py-3.5 text-sm font-bold" */
  className?: string
  /** Background color of the button. Defaults to var(--sem-primary-600) */
  fillColor?: string
  /** Text color on the button. Defaults to white */
  fillTextColor?: string
  /** Border-radius of the button. Defaults to 'full' */
  rounded?: 'full' | '2xl' | 'xl' | 'lg'
  /** Stretch button to full width of its container */
  fullWidth?: boolean
  /** Tailwind classes applied to the outer wrapper div */
  wrapperClassName?: string
}

export function MaskButton({
  children,
  onClick,
  disabled,
  type = 'button',
  className = '',
  fillColor,
  fillTextColor = 'white',
  rounded = 'full',
  fullWidth = false,
  wrapperClassName = '',
}: MaskButtonProps) {
  const fill = fillColor ?? 'var(--sem-primary-600)'
  const radius = RADII[rounded]

  return (
    <div
      className={`mask-btn-wrap${wrapperClassName ? ` ${wrapperClassName}` : ''}${disabled ? ' opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
      style={{
        borderRadius: radius,
        ...(fullWidth ? { display: 'block', width: '100%' } : {}),
      }}
    >
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`mask-btn-fill ${className}`}
        style={{ background: fill, borderRadius: radius, color: fillTextColor }}
      >
        {children}
      </button>
    </div>
  )
}
