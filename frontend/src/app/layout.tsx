import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { PWAInstaller } from '@/components/PWAInstaller'

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'MealMind',
  description: '予算と体型から逆算して、今日の食事を決めてくれるAI栄養士',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MealMind',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    shortcut: '/icons/icon-192x192.png',
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geist.variable} text-foreground antialiased bg-[#F5F5F7] dark:bg-[#1E1E1E]`}
      >
        <PWAInstaller />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="mx-auto min-h-screen max-w-107.5 bg-background shadow">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
