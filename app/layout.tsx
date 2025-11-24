import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import ThemeToggle from '@/components/ThemeToggle'
import ThemeScript from '@/components/ThemeScript'

const cairo = Cairo({ 
  subsets: ['latin', 'arabic'],
  weight: ['400', '600', '700']
})

export const metadata: Metadata = {
  title: 'Primuom - تطبيق ويب حديث',
  description: 'تطبيق ويب حديث وجميل جاهز للنشر على Vercel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={cairo.className}>
        {children}
        <ThemeToggle />
      </body>
    </html>
  )
}

