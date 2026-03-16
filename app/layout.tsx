import type { Metadata, Viewport } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import ConditionalChatbot from '@/components/conditional-chatbot'

// Patch JSON.parse at module level so the v0 sandbox Analytics injection
// calling JSON.parse("pageview") does not crash the app during SSR or CSR
if (typeof globalThis !== 'undefined') {
  const _origParse = globalThis.JSON.parse.bind(globalThis.JSON)
  globalThis.JSON.parse = function safeJsonParse(text: string, reviver?: Parameters<typeof JSON.parse>[1]) {
    try {
      return _origParse(text, reviver)
    } catch (e) {
      if (typeof text === 'string' && text.includes('pageview')) return {}
      throw e
    }
  }
}

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Chittamma Ruchulu | Authentic Andhra-Telangana Traditional Foods',
  description:
    'Experience authentic Andhra-Telangana flavors crafted with traditional recipes passed down through generations. Handmade pickles, sweets, snacks, podis & gift packs delivered to your doorstep.',
  keywords: ['Telugu food', 'Andhra pickles', 'traditional sweets', 'Indian snacks', 'Chittamma Ruchulu'],
  openGraph: {
    title: 'Chittamma Ruchulu | Taste the Heritage',
    description: "From Chittamma's Kitchen to Yours. Authentic Andhra-Telangana traditional foods.",
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#a0522d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <head />
      <body className="antialiased font-sans">
        {children}
        <ConditionalChatbot />
        <Script id="razorpay-checkout" src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}
