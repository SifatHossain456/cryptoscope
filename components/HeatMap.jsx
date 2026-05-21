'use client'
import Link from 'next/link'
import { fmtPct } from '@/lib/format'

function heatColor(pct) {
  const clamped  = Math.max(-10, Math.min(10, pct ?? 0))
  const intensity = Math.abs(clamped) / 10
  if (clamped > 0) return `rgba(16,185,129,${.12 + intensity * .55})`
  if (clamped < 0) return `rgba(239,68,68,${.12 + intensity * .55})`
  return 'rgba(107,114,128,.15)'
}

function textColor(pct) {
  if (!pct) return 'var(--neu)'
  return pct > 0 ? 'var(--up)' : 'var(--dn)'
}

export default function HeatMap({ coins }) {
  if (!coins?.length) return null
  const top = coins.slice(0, 30)
  const total = top.reduce((s, c) => s + (c.market_cap ?? 0), 0)

  return (
    <div
      className="flex flex-wrap gap-1"
      role="grid"
      aria-label="Market cap heatmap"
    >
      {top.map(coin => {
        const share  = total > 0 ? (coin.market_cap ?? 0) / total : 0
        const pct    = coin.price_change_percentage_24h
        const minPx  = 52
        const size   = Math.max(minPx, Math.round(share * 900))

        return (
          <Link
            key={coin.id}
            href={`/coin/${coin.id}`}
            role="gridcell"
            aria-label={`${coin.name}: ${fmtPct(pct)}`}
            className="rounded-xl flex flex-col items-center justify-center gap-0.5 p-1 transition-all hover:scale-[1.04] hover:z-10 relative cursor-pointer"
            style={{
              width:      size,
              height:     Math.max(48, Math.round(size * .72)),
              background: heatColor(pct),
              border:     '1px solid rgba(255,255,255,.05)',
            }}
          >
            <span className="text-[10px] font-bold uppercase truncate w-full text-center" style={{ color: 'var(--t1)' }}>
              {coin.symbol}
            </span>
            <span className="text-[9px] font-semibold mono" style={{ color: textColor(pct) }}>
              {fmtPct(pct)}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
