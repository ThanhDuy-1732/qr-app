import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/app/components/ThemeProvider'
import ThemeControls from '@/app/components/ThemeControls'

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ủng hộ tôi — QR nhận tiền & Lời nhắn',
  description:
    'Quét mã QR để ủng hộ và để lại lời nhắn cho tôi. Cảm ơn sự hỗ trợ của bạn!',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // required for env(safe-area-inset-*) on iPhone notch / Dynamic Island
}

/** Inline script chạy trước React để tránh flash of wrong theme (FOUC) */
const antiFlashScript = `(function(){try{
  var t=localStorage.getItem('theme')||'dark';
  var b=localStorage.getItem('customBg');
  document.documentElement.setAttribute('data-theme',t);
  if(b)document.documentElement.style.setProperty('--custom-bg',b);
}catch(e){}})();`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={inter.variable} suppressHydrationWarning>
      {/* suppressHydrationWarning needed because anti-FOUC script mutates html attrs */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: antiFlashScript }} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <ThemeControls />
        </ThemeProvider>
      </body>
    </html>
  )
}
