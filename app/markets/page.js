'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import CoinRow from '@/components/CoinRow'
import TickerTape from '@/components/TickerTape'

const COLS = [
  { key: 'market_cap_rank',                label: '#',          align: 'left'  },
  { key: 'current_price',                  label: 'Price',      align: 'right' },
  { key: 'price_change_percentage_1h',     label: '1h %',       align: 'right' },
  { key: 'price_change_percentage_24h',    label: '24h %',      align: 'right' },
  { key: 'price_change_percentage_7d',     label: '7d %',       align: 'right' },
  { key: 'market_cap',                     label: 'Market Cap', align: 'right' },
  { key: 'total_volume',                   label: 'Volume',     align: 'right' },
  { key: 'sparkline',                      label: '7d Chart',   align: 'right' },
]

function SortIcon({ active, asc }) {
  if (!active) return <span style={{ color: 'var(--t4)' }}>⇅</span>
  return <span style={{ color: '#818cf8' }}>{asc ? '↑' : '↓'}</span>
}

function MarketsInner() {
  const searchParams = useSearchParams()
  const qParam = searchParams.get('q') ?? ''

  const [coins,   setCoins]   = useState([])
  const [loading, setLoading] = useState(true)
  const [q,       setQ]       = useState(qParam)
  const [sortKey, setSortKey] = useState('market_cap_rank')
  const [asc,     setAsc]     = useState(true)

  const load = useCallback(async () => {
    const res = await fetch('/api/coins?perPage=100')
    if (!res.ok) return
    setCoins(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { setQ(qParam) }, [qParam])

  const handleSort = key => {
    if (key === 'sparkline') return
    if (sortKey === key) setAsc(a => !a)
    else { setSortKey(key); setAsc(false) }
  }

  const filtered = coins.filter(c => {
    if (!q) return true
    const query = q.toLowerCase()
    return c.name.toLowerCase().includes(query) || c.symbol.toLowerCase().includes(query)
  })

  const sortField = {
    market_cap_rank:             c => c.market_cap_rank,
    current_price:               c => c.current_price,
    price_change_percentage_1h:  c => c.price_change_percentage_1h_in_currency ?? 0,
    price_change_percentage_24h: c => c.price_change_percentage_24h ?? 0,
    price_change_percentage_7d:  c => c.price_change_percentage_7d_in_currency ?? 0,
    market_cap:                  c => c.market_cap,
    total_volume:                c => c.total_volume,
  }

  const sorted = [...filtered].sort((a, b) => {
    const fn = sortField[sortKey]
    if (!fn) return 0
    const diff = (fn(a) ?? 0) - (fn(b) ?? 0)
    return asc ? diff : -diff
  })

  return (
    <>
      <TickerTape coins={coins.slice(0, 20)} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 fade-up">

        <header className="flex flex-wrap items-center gap-4">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--t1)' }}>All Markets</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>
              {loading ? '…' : `${filtered.length.toLocaleString()} coins`} · Top 100 by market cap
            </p>
          </div>

          {/* Search */}
          <div className="ml-auto relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--t3)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
            </svg>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Filter coins…"
              className="rounded-xl pl-9 pr-4 py-2 text-sm"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--t1)', outline: 'none', width: 220 }}
              onFocus={e => (e.target.style.borderColor = '#6366f1')}
              onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
              aria-label="Filter coins by name or symbol"
            />
          </div>
        </header>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto no-sb">
            <table className="data-table">
              <thead>
                <tr>
                  {COLS.map(col => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className={col.key !== 'sparkline' ? 'cursor-pointer hover:opacity-70 transition-opacity select-none' : ''}
                      style={{ textAlign: col.align }}
                    >
                      {col.label} {col.key !== 'sparkline' && <SortIcon active={sortKey === col.key} asc={asc} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({length: 20}).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={8} className="py-2">
                          <div className="h-8 skeleton rounded-lg mx-4" style={{ animationDelay: `${i * 30}ms` }} />
                        </td>
                      </tr>
                    ))
                  : sorted.map((coin, i) => (
                      <CoinRow key={coin.id} coin={coin} rank={coin.market_cap_rank ?? i + 1} />
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

export default function MarketsPage() {
  return <Suspense><MarketsInner /></Suspense>
}
