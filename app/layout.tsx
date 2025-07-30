// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css' // Assuming your global styles are here
import Navbar from '../components/Navbar' // Import your Navbar component
import { Providers } from './providers';
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Local Lambda App',
  description: 'Upload documents and process with Lambda/Bedrock',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar /> {/* Your Navbar component goes here */}
          <main className="container mx-auto p-4">
            {children} {/* This is where your page content will be rendered */}
          </main>
        </Providers>
      </body>
    </html>
  )
}
