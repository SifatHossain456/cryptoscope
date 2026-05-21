export default function Footer() {
  return (
    <footer className="border-t mt-16" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: 'linear-gradient(135deg,#6366f1,#10b981)' }}>◈</div>
            <span className="font-black text-sm">CryptoScope</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--t3)' }}>Data via CoinGecko · Updates every 90s</p>
        </div>
        <p className="text-[10px]" style={{ color: 'var(--t4)' }}>
          Prices are indicative only · Not financial advice
        </p>
      </div>
    </footer>
  )
}
