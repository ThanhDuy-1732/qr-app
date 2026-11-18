export const AVATAR_COLORS = [
  '#7c3aed',
  '#2563eb',
  '#059669',
  '#d97706',
  '#dc2626',
  '#9333ea',
  '#0891b2',
  '#65a30d',
]

/** Two-letter avatar initial; anonymous or blank names fall back to "?". */
export function getInitial(name: string): string {
  const trimmed = (name ?? '').trim()
  if (!trimmed || trimmed === 'Ẩn danh') return '?'
  const words = trimmed.split(/\s+/)
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase()
  }
  return trimmed[0].toUpperCase()
}

/** Stable avatar color derived from the message id. */
export function getAvatarColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % AVATAR_COLORS.length
  }
  return AVATAR_COLORS[Math.abs(hash)]
}
