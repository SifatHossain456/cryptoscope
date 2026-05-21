'use client'
import Link from 'next/link'
import { fmtUsd, fmtPct } from '@/lib/format'

export default function TickerTape({ coins = [] }) {
  if (!coins.length) return null
  const items = [...coins, ...coins]   // duplicate for infinite scroll

  return (
    <div
      className="ticker-wrap border-b py-1.5"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
      aria-label="Live price ticker"
    >
      <div className="ticker-track gap-8">
        {items.map((coin, i) => {
          const pct = coin.price_change_percentage_24h_in_currency ?? coin.price_change_percentage_24h
          const up  = (pct ?? 0) >= 0
          return (
            <Link
              key={`${coin.id}-${i}`}
              href={`/coin/${coin.id}`}
              className="inline-flex items-center gap-2 px-2 hover:opacity-70 transition-opacity shrink-0"
            >
              {coin.image && <img src={coin.image} alt="" width={14} height={14} className="rounded-full" />}
              <span className="text-[11px] font-semibold uppercase" style={{ color: 'var(--t2)' }}>{coin.symbol}</span>
              <span className="text-[11px] mono" style={{ color: 'var(--t1)' }}>{fmtUsd(coin.current_price, coin.current_price < 1 ? 4 : 2)}</span>
              <span className="text-[10px] mono" style={{ color: up ? 'var(--up)' : 'var(--dn)' }}>{fmtPct(pct)}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
