'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import GlobalStats  from '@/components/GlobalStats'
import HeatMap      from '@/components/HeatMap'
import FearGreed    from '@/components/FearGreed'
import CoinRow      from '@/components/CoinRow'
import TickerTape   from '@/components/TickerTape'
import Sparkline    from '@/components/Sparkline'
import { fmtUsd, fmtPct, pctClass } from '@/lib/format'

const REFRESH_MS = 90_000

function SectionHeader({ title, href, label = 'View all' }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-bold" style={{ color: 'var(--t1)' }}>{title}</h2>
      {href && (
        <Link href={href} className="text-xs font-semibold transition-colors hover:opacity-70" style={{ color: '#818cf8' }}>
          {label} →
        </Link>
      )}
    </div>
  )
}

function TopMoverCard({ coin }) {
  const pct  = coin.price_change_percentage_24h_in_currency ?? coin.price_change_percentage_24h
  const up   = (pct ?? 0) >= 0
  const spark = coin.sparkline_in_7d?.price ?? []

  return (
    <Link
      href={`/coin/${coin.id}`}
      className="card p-4 flex flex-col gap-3 hover:scale-[1.02] transition-transform"
    >
      <div className="flex items-center gap-2">
        {coin.image && <img src={coin.image} alt={coin.name} width={28} height={28} className="rounded-full" />}
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--t1)' }}>{coin.symbol?.toUpperCase()}</p>
          <p className="text-[10px]" style={{ color: 'var(--t3)' }}>{coin.name}</p>
        </div>
        <span className={`ml-auto badge ${up ? 'badge-up' : 'badge-dn'}`}>{fmtPct(pct)}</span>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-base font-black mono tabnum" style={{ color: 'var(--t1)' }}>
          {fmtUsd(coin.current_price, coin.current_price < 1 ? 4 : 2)}
        </p>
        <Sparkline prices={spark} width={72} height={28} positive={up} />
      </div>
    </Link>
  )
}

function TrendingItem({ item, rank }) {
  const pct = item.data?.price_change_percentage_24h?.usd
  return (
    <Link
      href={`/coin/${item.id}`}
      className="flex items-center gap-3 py-2.5 px-1 rounded-xl hover:bg-white/[.03] transition-colors group"
    >
      <span className="text-xs mono w-5 text-right shrink-0" style={{ color: 'var(--t4)' }}>{rank}</span>
      {item.thumb && <img src={item.thumb} alt={item.name} width={24} height={24} className="rounded-full" />}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--t1)' }}>{item.name}</p>
        <p className="text-[10px] uppercase" style={{ color: 'var(--t3)' }}>{item.symbol}</p>
      </div>
      {pct != null && (
        <span className={`text-xs mono font-semibold ${pctClass(pct)}`}>{fmtPct(pct)}</span>
      )}
      <span className="text-[10px]" style={{ color: 'var(--t4)' }}>#{item.market_cap_rank}</span>
    </Link>
  )
}

export default function DashboardPage() {
  const [coins,     setCoins]     = useState([])
  const [global,    setGlobal]    = useState(null)
  const [fearGreed, setFearGreed] = useState(null)
  const [trending,  setTrending]  = useState([])
  const [loading,   setLoading]   = useState(true)

  const load = useCallback(async () => {
    const [coinsRes, globalRes, trendRes] = await Promise.allSettled([
      fetch('/api/coins?perPage=20').then(r => r.json()),
      fetch('/api/global').then(r => r.json()),
      fetch('/api/trending').then(r => r.json()),
    ])
    if (coinsRes.status   === 'fulfilled') setCoins(coinsRes.value)
    if (globalRes.status  === 'fulfilled') { setGlobal(globalRes.value.global); setFearGreed(globalRes.value.fearGreed) }
    if (trendRes.status   === 'fulfilled') setTrending(trendRes.value)
    setLoading(false)
  }, [])

  useEffect(() => { load(); const id = setInterval(load, REFRESH_MS); return () => clearInterval(id) }, [load])

  const gainers = useMemo(() =>
    [...coins].sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0)).slice(0, 4)
  , [coins])
  const losers = useMemo(() =>
    [...coins].sort((a, b) => (a.price_change_percentage_24h ?? 0) - (b.price_change_percentage_24h ?? 0)).slice(0, 4)
  , [coins])

  return (
    <>
      <TickerTape coins={coins} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10 fade-up">

        {/* Hero */}
        <section aria-label="Hero" className="text-center py-6 space-y-3">
          <div className="inline-flex items-center gap-2 badge badge-up mx-auto">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--up)', animation: 'flash-up 1.5s infinite' }} />
            Live · Updated every 90s
          </div>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight" style={{ color: 'var(--t1)' }}>
            Crypto Market
            <span style={{ background: 'linear-gradient(90deg,#6366f1,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}> Dashboard</span>
          </h1>
          <p className="text-sm max-w-lg mx-auto" style={{ color: 'var(--t2)' }}>
            Real-time prices, sparklines, market heatmap, Fear & Greed index — all in one place.
          </p>
        </section>

        {/* Global stats */}
        {loading
          ? <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{Array.from({length:4}).map((_,i)=><div key={i} className="card h-24 skeleton"/>)}</div>
          : <GlobalStats data={global} />
        }

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Heatmap */}
          <section aria-label="Market Heatmap" className="lg:col-span-2 card p-5">
            <SectionHeader title="Market Heatmap" href="/markets" label="Full table" />
            {loading
              ? <div className="h-48 skeleton rounded-xl" />
              : <HeatMap coins={coins} />
            }
          </section>

          {/* Fear & Greed */}
          <section aria-label="Fear and Greed" className="card p-5 flex flex-col items-center justify-center gap-2">
            <h2 className="text-base font-bold self-start" style={{ color: 'var(--t1)' }}>Fear & Greed</h2>
            {loading
              ? <div className="w-36 h-36 skeleton rounded-full" />
              : fearGreed
                ? <FearGreed value={fearGreed.value} label={fearGreed.label} />
                : <p className="text-sm" style={{ color: 'var(--t3)' }}>Unavailable</p>
            }
            <p className="text-[10px] text-center" style={{ color: 'var(--t4)' }}>
              Based on volatility, volume,<br/>social media & surveys
            </p>
          </section>
        </div>

        {/* Top Gainers / Losers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section aria-label="Top Gainers">
            <SectionHeader title="🟢 Top Gainers (24h)" />
            <div className="grid grid-cols-2 gap-3">
              {loading ? Array.from({length:4}).map((_,i)=><div key={i} className="card h-24 skeleton"/>) : gainers.map(c=><TopMoverCard key={c.id} coin={c}/>)}
            </div>
          </section>
          <section aria-label="Top Losers">
            <SectionHeader title="🔴 Top Losers (24h)" />
            <div className="grid grid-cols-2 gap-3">
              {loading ? Array.from({length:4}).map((_,i)=><div key={i} className="card h-24 skeleton"/>) : losers.map(c=><TopMoverCard key={c.id} coin={c}/>)}
            </div>
          </section>
        </div>

        {/* Trending + Top coins table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Trending */}
          <section aria-label="Trending" className="card p-5">
            <SectionHeader title="🔥 Trending" />
            <div>
              {loading
                ? Array.from({length:7}).map((_,i)=><div key={i} className="h-10 skeleton rounded-lg mb-1"/>)
                : trending.map((item,i)=><TrendingItem key={item.id} item={item} rank={i+1}/>)
              }
            </div>
          </section>

          {/* Top 10 table */}
          <section aria-label="Top 10 by Market Cap" className="lg:col-span-2 card overflow-hidden">
            <div className="p-5 pb-0">
              <SectionHeader title="Top 10 by Market Cap" href="/markets" />
            </div>
            <div className="overflow-x-auto no-sb">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="pl-5">Coin</th>
                    <th>Price</th>
                    <th>24h</th>
                    <th>7d</th>
                    <th>Market Cap</th>
                    <th className="pr-5">7d Chart</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({length:10}).map((_,i)=>(
                        <tr key={i}><td colSpan={6} className="py-2 px-5"><div className="h-8 skeleton rounded"/></td></tr>
                      ))
                    : coins.slice(0,10).map((coin,i)=>(
                        <CoinRow key={coin.id} coin={coin} rank={i+1}/>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
