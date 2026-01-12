import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'MealMind',
  description: '予算と体型から逆算して、今日の食事を決めてくれるAI栄養士',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body
        className={` ${geist.variable} bg-[#f5f5f7] text-[#1d1d1f] antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  )
}
