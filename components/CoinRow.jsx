'use client'
import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import Sparkline from './Sparkline'
import { fmtUsd, fmtPct, fmtNum, pctClass } from '@/lib/format'

export default function CoinRow({ coin, rank }) {
  const prevPrice = useRef(coin.current_price)
  const [flash, setFlash]   = useState('')

  useEffect(() => {
    if (coin.current_price !== prevPrice.current) {
      setFlash(coin.current_price > prevPrice.current ? 'flash-up' : 'flash-dn')
      const t = setTimeout(() => setFlash(''), 900)
      prevPrice.current = coin.current_price
      return () => clearTimeout(t)
    }
  }, [coin.current_price])

  const pct1h  = coin.price_change_percentage_1h_in_currency
  const pct24h = coin.price_change_percentage_24h_in_currency ?? coin.price_change_percentage_24h
  const pct7d  = coin.price_change_percentage_7d_in_currency
  const spark  = coin.sparkline_in_7d?.price ?? []
  const up7d   = spark.length > 1 ? spark[spark.length - 1] >= spark[0] : (pct7d ?? 0) >= 0

  return (
    <tr className={flash}>
      {/* Rank */}
      <td className="text-left">
        <div className="flex items-center gap-3">
          <span className="text-xs mono" style={{ color: 'var(--t3)', minWidth: 24 }}>{rank}</span>
          <Link href={`/coin/${coin.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            {coin.image && (
              <img src={coin.image} alt={coin.name} width={24} height={24} className="rounded-full" loading="lazy" />
            )}
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>{coin.name}</p>
              <p className="text-[10px] uppercase" style={{ color: 'var(--t3)' }}>{coin.symbol}</p>
            </div>
          </Link>
        </div>
      </td>

      {/* Price */}
      <td>
        <span className="mono font-semibold tabnum">{fmtUsd(coin.current_price, coin.current_price < 1 ? 4 : 2)}</span>
      </td>

      {/* 1h */}
      <td>
        <span className={`mono text-xs ${pctClass(pct1h)}`}>{fmtPct(pct1h)}</span>
      </td>

      {/* 24h */}
      <td>
        <span className={`mono text-xs font-semibold ${pctClass(pct24h)}`}>{fmtPct(pct24h)}</span>
      </td>

      {/* 7d */}
      <td>
        <span className={`mono text-xs ${pctClass(pct7d)}`}>{fmtPct(pct7d)}</span>
      </td>

      {/* Market cap */}
      <td>
        <span className="mono text-xs tabnum" style={{ color: 'var(--t2)' }}>{fmtUsd(coin.market_cap)}</span>
      </td>

      {/* Volume */}
      <td>
        <span className="mono text-xs tabnum" style={{ color: 'var(--t3)' }}>{fmtUsd(coin.total_volume)}</span>
      </td>

      {/* Sparkline */}
      <td>
        <Sparkline prices={spark} width={80} height={32} positive={up7d} />
      </td>
    </tr>
  )
}
