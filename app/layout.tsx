import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/app/components/ThemeProvider'
import ThemeControls from '@/app/components/ThemeControls'
import SkyBackdrop from '@/app/components/SkyBackdrop'
import TapFireworks from '@/app/components/TapFireworks'

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-space',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-fraunces',
  display: 'swap',
  style: ['normal', 'italic'],
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
  var br=localStorage.getItem('customBgResolved')||b;
  var m=localStorage.getItem('reduceMotion');
  var reduce=m==='true'||(m===null&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  document.documentElement.setAttribute('data-theme',t);
  document.documentElement.setAttribute('data-motion',reduce?'reduced':'off');
  if(br)document.documentElement.style.setProperty('--custom-bg',br);
}catch(e){}})();`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${spaceGrotesk.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      {/* suppressHydrationWarning needed because anti-FOUC script mutates html attrs */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: antiFlashScript }} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <SkyBackdrop />
          <TapFireworks />
          {children}
          <ThemeControls />
        </ThemeProvider>
      </body>
    </html>
  )
}
