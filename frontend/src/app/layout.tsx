import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from 'next-themes'

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'MealMind',
  description: '予算と体型から逆算して、今日の食事を決めてくれるAI栄養士',
  icons: {
    icon: '/icon-1.jpg',
    shortcut: '/icon-1.jpg',
    apple: '/icon-1.jpg',
  },
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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="mx-auto min-h-screen max-w-107.5 bg-background shadow">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
