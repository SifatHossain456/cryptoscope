'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { fmtUsd, fmtPct, fmtNum, pctClass, pctBadge } from '@/lib/format'
import Sparkline from '@/components/Sparkline'

const RANGES = [
  { label: '1D',  days: 1   },
  { label: '7D',  days: 7   },
  { label: '30D', days: 30  },
  { label: '1Y',  days: 365 },
]

function PriceChart({ prices = [], positive }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || prices.length < 2) return
    const ctx  = canvas.getContext('2d')
    const dpr  = window.devicePixelRatio || 1
    const W    = canvas.offsetWidth
    const H    = canvas.offsetHeight
    canvas.width  = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    const min   = Math.min(...prices)
    const max   = Math.max(...prices)
    const range = max - min || 1
    const pad   = { left: 8, right: 8, top: 12, bottom: 8 }

    const x = i => pad.left + (i / (prices.length - 1)) * (W - pad.left - pad.right)
    const y = v => pad.top  + (1 - (v - min) / range) * (H - pad.top - pad.bottom)

    const color = positive ? '#10b981' : '#ef4444'
    const grad  = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, positive ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.3)')
    grad.addColorStop(1, 'transparent')

    // Fill
    ctx.beginPath()
    prices.forEach((p, i) => i === 0 ? ctx.moveTo(x(i), y(p)) : ctx.lineTo(x(i), y(p)))
    ctx.lineTo(x(prices.length - 1), H)
    ctx.lineTo(x(0), H)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()

    // Line
    ctx.beginPath()
    prices.forEach((p, i) => i === 0 ? ctx.moveTo(x(i), y(p)) : ctx.lineTo(x(i), y(p)))
    ctx.strokeStyle = color
    ctx.lineWidth   = 2
    ctx.lineJoin    = 'round'
    ctx.lineCap     = 'round'
    ctx.stroke()
  }, [prices, positive])

  return (
    <canvas
      ref={ref}
      style={{ width: '100%', height: '100%', display: 'block' }}
      aria-label="Price chart"
    />
  )
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
      <span className="text-xs" style={{ color: 'var(--t3)' }}>{label}</span>
      <span className="text-xs font-semibold mono" style={{ color: 'var(--t1)' }}>{value}</span>
    </div>
  )
}

export default function CoinPage({ params }) {
  const [id,      setId]      = useState(null)
  const [data,    setData]    = useState(null)
  const [range,   setRange]   = useState(7)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => { params.then(p => setId(p.id)) }, [params])

  const load = useCallback(async (coinId, days) => {
    if (!coinId) return
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/coin/${coinId}?days=${days}`)
      if (res.ok) setData(await res.json())
      else setError(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (id) load(id, range) }, [id, range, load])

  const coin  = data?.coin
  const chart = data?.chart

  const prices  = chart?.prices?.map(p => p[1]) ?? []
  const pct24h  = coin?.market_data?.price_change_percentage_24h
  const pct7d   = coin?.market_data?.price_change_percentage_7d
  const pct30d  = coin?.market_data?.price_change_percentage_30d
  const current = coin?.market_data?.current_price?.usd
  const positive = prices.length > 1 ? prices[prices.length - 1] >= prices[0] : (pct24h ?? 0) >= 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 fade-up">

      {/* Back */}
      <nav aria-label="Breadcrumb">
        <Link href="/markets" className="text-xs hover:opacity-70 transition-opacity" style={{ color: '#818cf8' }}>
          ← Markets
        </Link>
      </nav>

      {loading && !coin ? (
        <div className="space-y-4">
          <div className="h-16 skeleton rounded-2xl" />
          <div className="h-64 skeleton rounded-2xl" />
        </div>
      ) : coin ? (
        <>
          {/* Coin identity */}
          <header className="flex flex-wrap items-center gap-4">
            {coin.image?.large && (
              <img src={coin.image.large} alt={coin.name} width={56} height={56} className="rounded-full" />
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black" style={{ color: 'var(--t1)' }}>{coin.name}</h1>
                <span className="badge badge-neu">{coin.symbol?.toUpperCase()}</span>
                {coin.market_cap_rank && (
                  <span className="text-xs mono px-2 py-0.5 rounded" style={{ background: 'var(--border)', color: 'var(--t2)' }}>
                    #{coin.market_cap_rank}
                  </span>
                )}
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--t3)' }}>
                {coin.categories?.slice(0, 3).join(' · ')}
              </p>
            </div>

            <div className="ml-auto text-right">
              <p className="text-3xl font-black mono tabnum" style={{ color: 'var(--t1)' }}>
                {fmtUsd(current, current < 1 ? 6 : 2)}
              </p>
              {pct24h != null && (
                <span className={`badge ${pctBadge(pct24h)} mt-1`}>{fmtPct(pct24h)} 24h</span>
              )}
            </div>
          </header>

          {/* Chart */}
          <section aria-label="Price chart" className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold" style={{ color: 'var(--t1)' }}>Price Chart</h2>
              <div className="flex gap-1" role="group" aria-label="Chart time range">
                {RANGES.map(r => (
                  <button
                    key={r.days}
                    onClick={() => setRange(r.days)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: range === r.days ? '#6366f1' : 'var(--border)',
                      color:      range === r.days ? 'white'   : 'var(--t2)',
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ height: 240 }}>
              {loading
                ? <div className="h-full skeleton rounded-xl" />
                : <PriceChart prices={prices} positive={positive} />
              }
            </div>
          </section>

          {/* Stats + info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section aria-label="Market data" className="card p-5">
              <h2 className="text-sm font-bold mb-2" style={{ color: 'var(--t1)' }}>Market Data</h2>
              <StatRow label="Market Cap"        value={fmtUsd(coin.market_data?.market_cap?.usd)} />
              <StatRow label="24h Volume"        value={fmtUsd(coin.market_data?.total_volume?.usd)} />
              <StatRow label="Circulating Supply" value={`${fmtNum(Math.round(coin.market_data?.circulating_supply))} ${coin.symbol?.toUpperCase()}`} />
              <StatRow label="Total Supply"      value={coin.market_data?.total_supply ? `${fmtNum(Math.round(coin.market_data.total_supply))} ${coin.symbol?.toUpperCase()}` : '∞'} />
              <StatRow label="ATH"               value={fmtUsd(coin.market_data?.ath?.usd)} />
              <StatRow label="ATL"               value={fmtUsd(coin.market_data?.atl?.usd)} />
            </section>

            <section aria-label="Price change" className="card p-5">
              <h2 className="text-sm font-bold mb-2" style={{ color: 'var(--t1)' }}>Price Change</h2>
              <StatRow label="24h"  value={<span className={pctClass(pct24h)}>{fmtPct(pct24h)}</span>} />
              <StatRow label="7d"   value={<span className={pctClass(pct7d)}>{fmtPct(pct7d)}</span>} />
              <StatRow label="30d"  value={<span className={pctClass(pct30d)}>{fmtPct(pct30d)}</span>} />
              <StatRow label="1y"   value={<span className={pctClass(coin.market_data?.price_change_percentage_1y)}>{fmtPct(coin.market_data?.price_change_percentage_1y)}</span>} />
              <StatRow label="From ATH" value={<span className={pctClass(coin.market_data?.ath_change_percentage?.usd)}>{fmtPct(coin.market_data?.ath_change_percentage?.usd)}</span>} />
              {coin.links?.homepage?.[0] && (
                <div className="pt-3">
                  <a
                    href={coin.links.homepage[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs hover:opacity-70 transition-opacity"
                    style={{ color: '#818cf8' }}
                  >
                    Official Website →
                  </a>
                </div>
              )}
            </section>
          </div>

          {/* Description */}
          {coin.description?.en && (
            <section aria-label="About" className="card p-5">
              <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--t1)' }}>About {coin.name}</h2>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--t2)' }}>
                {coin.description.en.replace(/<[^>]+>/g, '').split('. ').slice(0, 5).join('. ') + '.'}
              </p>
            </section>
          )}
        </>
      ) : error ? (
        <div className="card p-12 text-center space-y-3">
          <p className="text-3xl">⚠️</p>
          <p className="font-bold" style={{ color: 'var(--t1)' }}>Failed to load coin data</p>
          <p className="text-xs" style={{ color: 'var(--t3)' }}>Check your connection or try again</p>
          <button
            onClick={() => load(id, range)}
            className="px-4 py-2 rounded-xl text-sm font-semibold mt-2"
            style={{ background: '#6366f1', color: 'white' }}
          >
            Retry
          </button>
        </div>
      ) : (
        <p style={{ color: 'var(--t3)' }}>Coin not found.</p>
      )}
    </div>
  )
}
