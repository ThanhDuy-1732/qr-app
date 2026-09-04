import { Message } from '@/app/lib/messages'

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function getInitial(name: string): string {
  const trimmed = name.trim()
  if (!trimmed || trimmed === 'Ẩn danh') return '?'
  // Get first character of each word, max 2
  const words = trimmed.split(/\s+/)
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase()
  }
  return trimmed[0].toUpperCase()
}

const AVATAR_COLORS = [
  '#7c3aed', '#2563eb', '#059669', '#d97706',
  '#dc2626', '#9333ea', '#0891b2', '#65a30d',
]

function getAvatarColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % AVATAR_COLORS.length
  }
  return AVATAR_COLORS[Math.abs(hash)]
}

interface MessageListProps {
  messages: Message[]
}

export default function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">🌟</span>
        <p>Chưa có lời nhắn nào. Hãy là người đầu tiên!</p>
      </div>
    )
  }

  return (
    <ul className="message-list" aria-label="Danh sách lời nhắn">
      {messages.map((msg, index) => (
        <li
          key={msg.id}
          className="message-item"
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <div
            className="message-avatar"
            style={{ background: getAvatarColor(msg.id) }}
            aria-hidden="true"
          >
            {getInitial(msg.name)}
          </div>
          <div className="message-body">
            <div className="message-header">
              <span className="message-author">{msg.name || 'Ẩn danh'}</span>
              <time
                className="message-time"
                dateTime={msg.timestamp}
                suppressHydrationWarning
              >
                {formatDate(msg.timestamp)}
              </time>
            </div>
            <p className="message-text">{msg.message}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
