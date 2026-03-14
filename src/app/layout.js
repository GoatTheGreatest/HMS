import './globals.css'
import { Inter } from 'next/font/google'
import ThemeProvider from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Healthcare Service Platform',
  description: 'Production-quality platform connecting patients with healthcare professionals',
}

export default function RootLayout({ children }) {
  // In a real app, we'd get the role from auth session
  // For now, we'll default to 'patient' or use a search param for testing
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <ThemeProvider role="patient">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
