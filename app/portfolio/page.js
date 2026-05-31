'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, Wallet, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react'
import { fmtUsd, pctClass } from '@/lib/format'

const DEMO_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' // vitalik.eth

function PieChart({ holdings, total }) {
  if (!holdings.length || total === 0) return null

  // Build segments
  const segments = []
  const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#22d3ee','#a78bfa','#fb7185','#34d399','#60a5fa','#fbbf24']
  let cumPct = 0

  holdings.slice(0, 10).forEach((h, i) => {
    const pct = (h.value / total) * 100
    segments.push({ ...h, pct, color: COLORS[i % COLORS.length], start: cumPct })
    cumPct += pct
  })

  const r  = 80
  const cx = 100
  const cy = 100

  function polarToXY(pct, radius) {
    const angle = (pct / 100) * 2 * Math.PI - Math.PI / 2
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]
  }

  function makeArc(start, pct, radius) {
    if (pct >= 99.9) {
      return `M ${cx},${cy - radius} A ${radius},${radius} 0 1 1 ${cx - 0.001},${cy - radius} Z`
    }
    const [sx, sy] = polarToXY(start, radius)
    const [ex, ey] = polarToXY(start + pct, radius)
    const large = pct > 50 ? 1 : 0
    return `M ${cx},${cy} L ${sx},${sy} A ${radius},${radius} 0 ${large} 1 ${ex},${ey} Z`
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
      <svg width="200" height="200" viewBox="0 0 200 200" style={{ flexShrink: 0 }}>
        {segments.map((seg, i) => (
          <path key={i} d={makeArc(seg.start, seg.pct, r)} fill={seg.color} opacity={0.9} />
        ))}
        {/* Inner circle */}
        <circle cx={cx} cy={cy} r={50} fill="var(--bg-card)" />
        <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--t1)" fontSize="12" fontWeight="700">
          {holdings.length} assets
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--t3)" fontSize="10">
          portfolio
        </text>
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 160 }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--t2)', flex: 1 }}>{seg.symbol}</span>
            <span style={{ fontSize: 12, color: 'var(--t3)' }}>{seg.pct.toFixed(1)}%</span>
          </div>
        ))}
        {holdings.length > 10 && (
          <div style={{ fontSize: 11, color: 'var(--t4)', paddingLeft: 18 }}>
            +{holdings.length - 10} more
          </div>
        )}
      </div>
    </div>
  )
}

function HoldingRow({ h, rank }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <td style={{ padding: '12px 16px', color: 'var(--t3)', fontSize: 12 }}>{rank}</td>
      <td style={{ padding: '12px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: 'var(--t2)', flexShrink: 0,
          }}>
            {h.symbol.slice(0, 2)}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{h.symbol}</div>
            <div style={{ fontSize: 11, color: 'var(--t3)' }}>{h.name}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{fmtUsd(h.price)}</div>
        <div className={pctClass(h.change24h)} style={{ fontSize: 11 }}>
          {h.change24h >= 0 ? '+' : ''}{h.change24h?.toFixed(2)}%
        </div>
      </td>
      <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: 13, color: 'var(--t2)' }}>
        {h.amount < 0.001 ? h.amount.toExponential(2) : h.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
      </td>
      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>{fmtUsd(h.value)}</span>
      </td>
    </tr>
  )
}

export default function PortfolioPage() {
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [portfolio, setPortfolio] = useState(null)
  const [error,     setError]     = useState('')

  const fetchPortfolio = useCallback(async (addr) => {
    const clean = addr.trim()
    if (!clean) return
    if (!/^0x[0-9a-fA-F]{40}$/.test(clean)) {
      setError('Enter a valid Ethereum address (0x…)')
      return
    }

    setLoading(true)
    setError('')
    setPortfolio(null)

    try {
      const res  = await fetch(`/api/portfolio?address=${clean}`)
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setPortfolio(data)
    } catch {
      setError('Network error — try again')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchPortfolio(input)
  }

  const loadDemo = () => {
    setInput(DEMO_ADDRESS)
    fetchPortfolio(DEMO_ADDRESS)
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Wallet size={20} color="var(--acc)" />
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Portfolio Tracker</h1>
        </div>
        <p style={{ color: 'var(--t3)', fontSize: 14 }}>
          Enter any Ethereum wallet address to see live token holdings and portfolio value.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--t4)',
            }} />
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="0x… Ethereum address"
              aria-label="Ethereum wallet address"
              style={{
                width: '100%', padding: '13px 14px 13px 40px',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 10, color: 'var(--t1)', fontSize: 14,
                fontFamily: 'monospace', outline: 'none',
                transition: 'border-color .15s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--acc)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '13px 22px', borderRadius: 10, fontWeight: 700, fontSize: 14,
              background: loading ? 'var(--bg-card)' : 'var(--acc)',
              color: loading ? 'var(--t3)' : '#fff',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0,
            }}
          >
            {loading
              ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading</>
              : 'Analyze'
            }
          </button>
        </div>

        {/* Demo button */}
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" onClick={loadDemo} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, color: 'var(--acc)', fontWeight: 600, padding: 0,
          }}>
            Try vitalik.eth →
          </button>
          <span style={{ fontSize: 12, color: 'var(--t4)' }}>or paste any 0x address</span>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 10, marginBottom: 20, fontSize: 13, color: '#ef4444',
        }}>
          <AlertCircle size={15} />
          {error}
          {error.includes('API') && (
            <span style={{ color: 'var(--t3)', marginLeft: 4 }}>
              — Add <code>ETHERSCAN_API_KEY</code> in .env for full data
            </span>
          )}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[80, 60, 90, 50, 70].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10, opacity: 1 - i * 0.1 }} />
          ))}
        </div>
      )}

      {/* Portfolio result */}
      {portfolio && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="fade-up">

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div className="card" style={{ padding: '16px 20px' }}>
              <p style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
                Total Value
              </p>
              <p style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--t1)' }}>
                {fmtUsd(portfolio.totalValue)}
              </p>
            </div>
            <div className="card" style={{ padding: '16px 20px' }}>
              <p style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
                24h Change
              </p>
              <p style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.04em' }}
                className={pctClass(portfolio.totalChange)}>
                {portfolio.totalChange >= 0 ? '+' : ''}{portfolio.totalChange?.toFixed(2)}%
              </p>
            </div>
            <div className="card" style={{ padding: '16px 20px' }}>
              <p style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
                Tokens
              </p>
              <p style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--t1)' }}>
                {portfolio.tokenCount}
              </p>
            </div>
          </div>

          {/* Address bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10,
          }}>
            <Wallet size={13} color="var(--t3)" />
            <code style={{ fontSize: 12, color: 'var(--t2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {portfolio.address}
            </code>
            <a
              href={`https://etherscan.io/address/${portfolio.address}`}
              target="_blank" rel="noopener noreferrer"
              aria-label="View on Etherscan"
              style={{ color: 'var(--t3)', flexShrink: 0 }}
            >
              <ExternalLink size={13} />
            </a>
          </div>

          {portfolio.holdings.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>
              No token holdings found with value &gt; $0.01
            </div>
          ) : (
            <>
              {/* Pie chart */}
              <div className="card" style={{ padding: '20px 24px' }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--t2)', marginBottom: 16 }}>
                  Allocation
                </h2>
                <PieChart holdings={portfolio.holdings} total={portfolio.totalValue} />
              </div>

              {/* Holdings table */}
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ fontSize: 13, fontWeight: 700 }}>Holdings</h2>
                  <span style={{ fontSize: 11, color: 'var(--t3)' }}>Prices from CoinGecko</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['#', 'Token', 'Price', 'Amount', 'Value'].map((h, i) => (
                          <th key={h} style={{
                            padding: '10px 8px', fontSize: 11, fontWeight: 700,
                            color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em',
                            textAlign: i >= 2 ? 'right' : 'left',
                            paddingLeft: i === 0 ? 16 : 8,
                            paddingRight: i === 4 ? 16 : 8,
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.holdings.map((h, i) => (
                        <HoldingRow key={h.symbol + i} h={h} rank={i + 1} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Refresh button */}
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => fetchPortfolio(portfolio.address)}
              style={{
                background: 'none', border: '1px solid var(--border)', borderRadius: 8,
                padding: '8px 18px', fontSize: 12, color: 'var(--t3)', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!portfolio && !loading && !error && (
        <div style={{ textAlign: 'center', padding: '56px 0' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
          }}>
            <Wallet size={28} color="var(--acc)" />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Enter a wallet address</h2>
          <p style={{ fontSize: 13, color: 'var(--t3)', maxWidth: 340, margin: '0 auto 16px', lineHeight: 1.7 }}>
            Paste any Ethereum address to instantly see token holdings, prices, and portfolio breakdown.
          </p>
          <button type="button" onClick={loadDemo} style={{
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 8, padding: '8px 20px', fontSize: 13, color: 'var(--acc)',
            cursor: 'pointer', fontWeight: 700,
          }}>
            Demo with vitalik.eth
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fade-up .3s ease forwards; }
      `}</style>
    </div>
  )
}
