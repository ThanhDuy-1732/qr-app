import Image from 'next/image'
import { getMessages } from '@/app/lib/messages'
import MessageForm from '@/app/components/MessageForm'
import MessageList from '@/app/components/MessageList'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const messages = await getMessages()

  return (
    <main className="main-layout">
      {/* Hero / Header */}
      <header className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <h1 className="hero-title">
          <span className="hero-emoji">✨</span>
          Nơi chấp cánh ước mơ
        </h1>
        <p className="hero-subtitle">
          Hãy viết ước mơ của bạn vào đây và chúng ta cùng nhau cầu nguyện cho giấc mơ của bạn thành hiện thực 🙏
        </p>
      </header>

      <div className="content-grid">
        {/* QR Code Section */}
        <section className="qr-section" aria-labelledby="qr-heading">
          <h2 id="qr-heading" className="section-title">
            📱 Quét QR để ủng hộ
          </h2>

          <div className="qr-pair">
            {/* MoMo */}
            <div className="qr-card">
              <div className="qr-image-wrapper">
                <Image
                  src="/qr-momo.jpg"
                  alt="Mã QR MoMo nhận tiền"
                  width={240}
                  height={240}
                  priority
                  className="qr-image"
                />
              </div>
              <span className="qr-method-badge qr-method--momo">
                📱 MoMo
              </span>
            </div>

            {/* VietQR / Ngân hàng */}
            <div className="qr-card">
              <div className="qr-image-wrapper">
                <Image
                  src="/qr-vietqr.jpg"
                  alt="Mã QR VietQR ngân hàng nhận tiền"
                  width={240}
                  height={240}
                  priority
                  className="qr-image"
                />
              </div>
              <span className="qr-method-badge qr-method--bank">
                🏦 Ngân hàng
              </span>
            </div>
          </div>

          <p className="qr-hint">
            Mở MoMo hoặc app ngân hàng → Quét mã → Chuyển khoản
          </p>
          <div className="qr-badge">
            <span>✅</span> Hỗ trợ tất cả ngân hàng Việt Nam
          </div>
        </section>


        {/* Form Section */}
        <section className="form-section" aria-labelledby="form-heading">
          <h2 id="form-heading" className="sr-only">Gửi lời nhắn</h2>
          <MessageForm />
        </section>
      </div>

      {/* Message Wall */}
      <section className="wall-section" aria-labelledby="wall-heading">
        <h2 id="wall-heading" className="wall-title">
          🗣️ Mọi người nói gì
          <span className="wall-count">{messages.length}</span>
        </h2>
        <MessageList messages={messages} />
      </section>
    </main>
  )
}
