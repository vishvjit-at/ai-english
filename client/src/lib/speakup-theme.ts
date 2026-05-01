// SpeakUp design tokens — shared across redesigned pages.
// Light values use oklch; dark values are derived counterparts that
// the page components opt into via the `useDark()` hook.

import { useEffect, useState } from 'react'

export const SPK = {
  // Brand
  indigo:        'oklch(0.55 0.22 275)',
  indigoHover:   'oklch(0.48 0.22 275)',
  indigoLight:   'oklch(0.55 0.22 275 / 0.08)',
  indigoMid:     'oklch(0.55 0.22 275 / 0.15)',
  orange:        'oklch(0.70 0.18 30)',
  gradient:      'linear-gradient(135deg, oklch(0.55 0.22 275), oklch(0.70 0.18 30))',
  gradientDeep:  'linear-gradient(135deg, oklch(0.55 0.22 275), oklch(0.38 0.25 290))',

  // Semantic state colors
  green:  '#22c55e',
  red:    '#ef4444',
  yellow: '#eab308',

  // Light mode surfaces
  bg:           'oklch(0.985 0.005 275)',
  bgAlt:        'oklch(0.97 0.008 275)',
  surface:      '#fff',
  border:       'oklch(0.9 0.01 275)',
  borderLight:  'oklch(0.93 0.01 275)',
  heading:      'oklch(0.18 0.02 275)',
  body:         'oklch(0.45 0.02 275)',
  bodyLight:    'oklch(0.55 0.02 275)',

  // Dark mode surfaces
  darkBg:           '#0f1117',
  darkBgAlt:        '#161b27',
  darkSurface:      '#1a1f2e',
  darkBorder:       '#2a2f3e',
  darkBorderLight:  '#222840',
  darkHeading:      '#f0f4f8',
  darkBody:         '#a0aab8',
  darkBodyLight:    '#8892a4',

  // Type
  headingFont: "'Space Grotesk', sans-serif",
  bodyFont:    "'DM Sans', sans-serif",

  // Shape
  radius:      16,
  radiusSm:    10,
  shadow:      '0 2px 12px oklch(0.2 0.02 275 / 0.06)',
  shadowHover: '0 8px 30px oklch(0.55 0.22 275 / 0.1)',
}

/** Reactive dark-mode flag tied to `html[data-dark]`. */
export function useDark(): boolean {
  const read = () => typeof document !== 'undefined' && document.documentElement.dataset.dark === '1'
  const [dark, setDark] = useState(read)
  useEffect(() => {
    const el = document.documentElement
    const obs = new MutationObserver(() => setDark(read()))
    obs.observe(el, { attributes: true, attributeFilter: ['data-dark'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

/** Returns the active theme palette for the current mode. */
export function useTheme() {
  const dark = useDark()
  return {
    dark,
    bg:        dark ? SPK.darkBg          : SPK.bg,
    bgAlt:     dark ? SPK.darkBgAlt       : SPK.bgAlt,
    surface:   dark ? SPK.darkSurface     : SPK.surface,
    border:    dark ? SPK.darkBorder      : SPK.border,
    borderLight: dark ? SPK.darkBorderLight : SPK.borderLight,
    heading:   dark ? SPK.darkHeading     : SPK.heading,
    body:      dark ? SPK.darkBody        : SPK.body,
    bodyLight: dark ? SPK.darkBodyLight   : SPK.bodyLight,
    indigo:        SPK.indigo,
    indigoHover:   SPK.indigoHover,
    indigoLight:   dark ? 'oklch(0.55 0.22 275 / 0.18)' : SPK.indigoLight,
    indigoMid:     SPK.indigoMid,
    orange:        SPK.orange,
    gradient:      SPK.gradient,
    gradientDeep:  SPK.gradientDeep,
    green:  SPK.green, red: SPK.red, yellow: SPK.yellow,
    headingFont: SPK.headingFont, bodyFont: SPK.bodyFont,
    radius: SPK.radius, radiusSm: SPK.radiusSm,
    shadow:      dark ? '0 2px 12px rgba(0,0,0,0.4)'  : SPK.shadow,
    shadowHover: dark ? '0 8px 30px rgba(99,102,241,0.25)' : SPK.shadowHover,
  }
}

export type SpkTheme = ReturnType<typeof useTheme>
