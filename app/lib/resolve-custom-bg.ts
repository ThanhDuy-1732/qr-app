export type Theme = 'dark' | 'light'

const BASE: Record<Theme, [number, number, number]> = {
  dark: [4, 5, 13],
  light: [246, 241, 255],
}

function parseHex(color: string): [number, number, number] | null {
  const value = color.trim()
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) return null
  if (value.length === 4) {
    return [
      parseInt(value[1] + value[1], 16),
      parseInt(value[2] + value[2], 16),
      parseInt(value[3] + value[3], 16),
    ]
  }
  return [
    parseInt(value.slice(1, 3), 16),
    parseInt(value.slice(3, 5), 16),
    parseInt(value.slice(5, 7), 16),
  ]
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (value: number) => {
    const srgb = value / 255
    return srgb <= 0.04045
      ? srgb / 12.92
      : Math.pow((srgb + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/**
 * Keeps a custom page background readable against the theme's text palette.
 * Colours already close to the theme's base pass through unchanged; anything
 * extreme (white in dark mode, black in light mode) is muted 88% toward the
 * base so `--text-1`/`--text-2` keep their contrast.
 */
export function resolveCustomBg(theme: Theme, color: string): string {
  const rgb = parseHex(color)
  if (!rgb) return color

  const luminance = relativeLuminance(rgb)
  const safe =
    theme === 'dark' ? luminance <= 0.03 : luminance >= 0.86

  if (safe) return color.toLowerCase()

  const base = BASE[theme]
  const mixed = rgb.map((channel, index) =>
    Math.round(channel * 0.12 + base[index] * 0.88)
  )

  return `#${mixed.map((value) => value.toString(16).padStart(2, '0')).join('')}`
}
