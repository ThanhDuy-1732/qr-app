const WHITE_SPARK_CHANCE = 0.22

/** A hot white spark reads well at night, but vanishes on the light theme. */
export function sparkColor(
  colors: readonly string[],
  light: boolean,
  whiteRoll: number,
  colorRoll: number
): string {
  if (!light && whiteRoll < WHITE_SPARK_CHANCE) return '#ffffff'
  return colors[Math.floor(colorRoll * colors.length)]
}

export function sparkHeadColor(color: string, light: boolean): string {
  return light ? color : '#ffffff'
}

export function flashCoreColor(
  rgb: readonly [number, number, number],
  light: boolean
): string {
  return light
    ? `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.9)`
    : '#ffffff'
}
