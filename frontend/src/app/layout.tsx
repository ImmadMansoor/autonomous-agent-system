import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/layout'
import { AuthProvider } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'MenuMind - Operations Dashboard',
  description: 'AI-powered cafe management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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
