import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'

export const metadata: Metadata = {
  title: 'Synapse | Neural Layer for Health',
  description: 'AI-Audit Infrastructure for Decentralized Medical Financing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#030303] text-white selection:bg-violet-500/30 overflow-x-hidden min-h-screen font-sans">
        <Providers>
          <Navigation />
          {children}
          <Footer />
        </Providers>
      </body>




    </html>
  )
}
