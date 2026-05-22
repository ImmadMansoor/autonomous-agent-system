import type { Metadata } from 'next'
import './globals.css'
import '../index.css'
import { ToastProvider } from '@/components/layout'
import { AuthProvider } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'MenuMind - Autonomous Cafe Agent',
  description: 'Autonomous agent platform for cafe menu and operations intelligence',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Doto:ROND,wght@0,100..900&family=Space+Grotesk:wght@300;400;500;700&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
