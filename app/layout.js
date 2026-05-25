import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = {
  title: { default: 'CryptoScope — Live Crypto Dashboard', template: '%s — CryptoScope' },
  description: 'Live crypto market dashboard — prices, heatmap, Fear & Greed index, sparklines for 100+ coins.',
  keywords: ['crypto', 'cryptocurrency', 'bitcoin', 'ethereum', 'market dashboard', 'prices', 'DeFi'],
  openGraph: {
    title: 'CryptoScope — Live Crypto Dashboard',
    description: 'Live crypto market dashboard — prices, heatmap, Fear & Greed index, sparklines for 100+ coins.',
    type: 'website',
    siteName: 'CryptoScope',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoScope — Live Crypto Dashboard',
    description: 'Live crypto market dashboard — prices, heatmap, Fear & Greed index, sparklines for 100+ coins.',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
