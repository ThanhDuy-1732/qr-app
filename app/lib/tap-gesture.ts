export const TAP_MAX_DISTANCE = 12
export const TAP_MAX_DURATION = 800

export interface TapPoint {
  x: number
  y: number
  at: number
}

/**
 * A tap is a pointer press that barely moved and ended quickly. Anything else
 * (a drag, a scroll, a long press) is the visitor doing something else.
 */
export function isTapGesture(start: TapPoint, end: TapPoint): boolean {
  const distance = Math.hypot(end.x - start.x, end.y - start.y)
  return (
    distance <= TAP_MAX_DISTANCE && end.at - start.at <= TAP_MAX_DURATION
  )
}
