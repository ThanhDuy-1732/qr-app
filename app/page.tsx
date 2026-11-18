import Image from 'next/image'
import { getMessages } from '@/app/lib/messages'
import MessageForm from '@/app/components/MessageForm'
import MessageList from '@/app/components/MessageList'
import Reveal from '@/app/components/Reveal'
import CountUp from '@/app/components/CountUp'
import SkyCta from '@/app/components/SkyCta'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const messages = await getMessages()

  return (
    <main className="page">
      <a className="skip-link" href="#wish-form">
        Bỏ qua đến lời nhắn
      </a>

      {/* Hero */}
      <header className="sky-hero">
        <div className="hero-top">
          <span className="hero-mark" aria-hidden="true">
            ✦
          </span>
          <span className="hero-count">
            <CountUp value={messages.length} /> ngôi sao đang sáng
          </span>
        </div>

        <div className="hero-copy">
          <p className="hero-kicker">Gửi một điều bạn mong</p>
          <h1 className="hero-title">
            Nơi chấp cánh
            <br />
            <em>ước mơ</em>
          </h1>
          <p className="hero-sub">
            Mỗi lời nhắn là một ngôi sao. Viết điều bạn đang mong, cả bầu trời sẽ
            cùng cầu nguyện.
          </p>
          <div className="hero-actions">
            <a className="btn btn--primary" href="#wish-form">
              Viết ước mơ của bạn <span aria-hidden="true">↗</span>
            </a>
            <SkyCta className="btn btn--ghost" href="#wish-wall">
              Xem bầu trời
            </SkyCta>
          </div>
        </div>

        <a
          className="hero-scroll"
          href="#wish-form"
          aria-label="Cuộn xuống phần gửi lời nhắn"
        />
      </header>

      {/* Wish form + support */}
      <section
        id="wish-form"
        className="wish-panel"
        aria-label="Gửi lời nhắn và ủng hộ"
      >
        <Reveal className="form-slot">
          <MessageForm />
        </Reveal>

        <Reveal className="support-card" delay={90}>
          <h2 className="panel-title">Ủng hộ giấc mơ</h2>
          <p className="panel-sub">
            Mở MoMo hoặc app ngân hàng → quét mã → chuyển khoản.
          </p>

          <div className="qr-grid">
            <div className="qr-tile">
              <Image
                src="/qr-momo.jpg"
                alt="Mã QR MoMo nhận tiền"
                width={580}
                height={649}
                className="qr-image"
                sizes="(max-width: 440px) 280px, (max-width: 860px) 40vw, 200px"
              />
              <span className="qr-label">MoMo</span>
            </div>
            <div className="qr-tile">
              <Image
                src="/qr-vietqr.jpg"
                alt="Mã QR VietQR ngân hàng nhận tiền"
                width={626}
                height={723}
                className="qr-image"
                sizes="(max-width: 440px) 280px, (max-width: 860px) 40vw, 200px"
              />
              <span className="qr-label">VietQR</span>
            </div>
          </div>

          <p className="support-badge">✅ Hỗ trợ tất cả ngân hàng Việt Nam</p>
        </Reveal>
      </section>

      {/* Wish wall */}
      <section id="wish-wall" className="sky-wall" aria-labelledby="wall-heading">
        <Reveal className="wall-head">
          <h2 id="wall-heading" className="wall-heading" tabIndex={-1}>
            Bầu trời hôm nay
          </h2>
          <span className="wall-badge">
            <CountUp value={messages.length} /> ngôi sao
          </span>
        </Reveal>

        <Reveal className="wall-reveal" delay={80}>
          <MessageList messages={messages} />
        </Reveal>
      </section>

      <footer className="page-footer">
        <span>✦ Mỗi lời nhắn là một ngôi sao.</span>
        <span>{new Date().getFullYear()}</span>
      </footer>
    </main>
  )
}
