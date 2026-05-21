'use client'
import { fmtUsd, fmtPct, pctClass } from '@/lib/format'

function Stat({ label, value, sub, subClass = '' }) {
  return (
    <div className="card px-5 py-4 space-y-1">
      <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--t3)' }}>{label}</p>
      <p className="text-xl font-black mono tabnum" style={{ color: 'var(--t1)' }}>{value}</p>
      {sub && <p className={`text-[10px] mono ${subClass}`}>{sub}</p>}
    </div>
  )
}

function DomBar({ btc, eth }) {
  const other = 100 - (btc ?? 0) - (eth ?? 0)
  return (
    <div className="card px-5 py-4 space-y-3">
      <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--t3)' }}>Dominance</p>
      <div className="h-2 rounded-full overflow-hidden flex" aria-label="Market dominance bar">
        <div style={{ width: `${btc}%`, background: '#f59e0b' }} title={`BTC ${btc?.toFixed(1)}%`} />
        <div style={{ width: `${eth}%`, background: '#627eea' }} title={`ETH ${eth?.toFixed(1)}%`} />
        <div style={{ width: `${other}%`, background: 'var(--border)' }} title="Others" />
      </div>
      <div className="flex gap-4 text-[10px] mono">
        <span style={{ color: '#f59e0b' }}>BTC {btc?.toFixed(1)}%</span>
        <span style={{ color: '#627eea' }}>ETH {eth?.toFixed(1)}%</span>
        <span style={{ color: 'var(--t3)' }}>Others {other.toFixed(1)}%</span>
      </div>
    </div>
  )
}

export default function GlobalStats({ data }) {
  if (!data) return null
  const { totalMarketCap, totalVolume, marketCapChange, btcDominance, ethDominance, activeCryptos } = data
  const chgClass = pctClass(marketCapChange)

  return (
    <section aria-label="Global market statistics">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat
          label="Total Market Cap"
          value={fmtUsd(totalMarketCap)}
          sub={fmtPct(marketCapChange) + ' 24h'}
          subClass={chgClass}
        />
        <Stat
          label="24h Volume"
          value={fmtUsd(totalVolume)}
          sub="Global trading volume"
        />
        <Stat
          label="Active Cryptos"
          value={activeCryptos?.toLocaleString() ?? '—'}
          sub="Listed on CoinGecko"
        />
        <DomBar btc={btcDominance} eth={ethDominance} />
      </div>
    </section>
  )
}
