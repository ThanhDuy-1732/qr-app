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
  title: 'Nơi chấp cánh ước mơ ✨',
  description:
    'Hãy viết ước mơ của bạn vào đây và chúng ta cùng nhau cầu nguyện cho giấc mơ của bạn thành hiện thực.',
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
