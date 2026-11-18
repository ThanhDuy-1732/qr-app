import { Message } from '@/app/lib/messages'
import { getAvatarColor, getDisplayName, getInitial } from '@/app/lib/avatar'

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

interface MessageListProps {
  messages: Message[]
}

export default function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="wall-empty">
        <span className="wall-empty-star" aria-hidden="true">
          ✦
        </span>
        <p>Bầu trời đang chờ ngôi sao đầu tiên.</p>
      </div>
    )
  }

  return (
    <ul className="wish-grid" aria-label="Danh sách lời nhắn">
      {messages.map((msg, index) => {
        const name = getDisplayName(msg.author)
        return (
          <li
            key={msg.id}
            className="wish-card"
            style={{ '--i': Math.min(index, 5) } as React.CSSProperties}
          >
            <div
              className="wish-avatar"
              style={{ background: getAvatarColor(msg.id) }}
              aria-hidden="true"
            >
              {getInitial(name)}
            </div>
            <div className="wish-body">
              <div className="wish-meta">
                <b className="wish-name">{name}</b>
                <time
                  className="wish-time"
                  dateTime={msg.createdAt}
                  suppressHydrationWarning
                >
                  {formatDate(msg.createdAt)}
                </time>
              </div>
              <p className="wish-text">{msg.text}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
