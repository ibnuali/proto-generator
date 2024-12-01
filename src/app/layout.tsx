import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Proto File Generator',
  description: 'Generate proto files easily',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Proto File Generator</h1>
          {children}
        </div>
      </body>
    </html>
  )
}