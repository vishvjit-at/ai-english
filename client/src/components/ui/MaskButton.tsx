import type { ReactNode } from 'react'

const RADII = { full: '9999px', '2xl': '1rem', xl: '0.75rem', lg: '0.5rem' }

interface MaskButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  /** Tailwind padding + font classes applied to the fill layer, e.g. "px-7 py-3.5 text-sm font-bold" */
  className?: string
  /** Background color of the fill (solid button state). Defaults to var(--sem-primary-600) */
  fillColor?: string
  /** Text color shown when fill is wiped away. Defaults to fillColor */
  labelColor?: string
  /** Text color on the fill button itself. Defaults to white */
  fillTextColor?: string
  /** Border-radius of the button. Defaults to 'full' */
  rounded?: 'full' | '2xl' | 'xl' | 'lg'
  /** Stretch button to full width of its container */
  fullWidth?: boolean
  /** Tailwind classes applied to the outer wrapper div (e.g. "mt-2 mb-4") */
  wrapperClassName?: string
}

export function MaskButton({
  children,
  onClick,
  disabled,
  type = 'button',
  className = '',
  fillColor,
  labelColor,
  fillTextColor = 'white',
  rounded = 'full',
  fullWidth = false,
  wrapperClassName = '',
}: MaskButtonProps) {
  const fill = fillColor ?? 'var(--sem-primary-600)'
  const label = labelColor ?? fill
  const radius = RADII[rounded]

  return (
    <div
      className={`mask-btn-wrap${wrapperClassName ? ` ${wrapperClassName}` : ''}${disabled ? ' opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
      style={{
        borderRadius: radius,
        border: `1.5px solid ${fill}`,
        ...(fullWidth ? { display: 'block', width: '100%' } : {}),
      }}
    >
      <span
        className="mask-btn-label"
        style={{ color: label }}
      >
        {children}
      </span>
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
