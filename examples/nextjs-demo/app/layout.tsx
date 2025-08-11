import type { Metadata } from 'next'
import AsciiProvider from '../../packages/swiss-ascii-kit/react/AsciiProvider'
import '../../packages/swiss-ascii-kit/css/tokens.css'
import '../../packages/swiss-ascii-kit/css/utilities.css'
import '../../packages/swiss-ascii-kit/css/ascii-mode.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Swiss ASCII Demo',
  description: 'Demonstration of Swiss International Style with ASCII mode toggle',
  keywords: ['swiss design', 'ascii', 'typography', 'accessibility'],
  authors: [{ name: 'ASCII Vibe Codex' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AsciiProvider defaultAscii={false} persistKey="swiss-demo-ascii">
          <div className="content">
            {children}
          </div>
        </AsciiProvider>
      </body>
    </html>
  )
}