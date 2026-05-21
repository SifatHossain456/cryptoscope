export function fmtUsd(n, decimals = 2) {
  if (n == null) return '—'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3)  return `$${(n / 1e3).toFixed(2)}K`
  if (n < 0.01)  return `$${n.toFixed(6)}`
  return `$${n.toFixed(decimals)}`
}

export function fmtPct(n) {
  if (n == null) return '—'
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

export function fmtNum(n) {
  if (n == null) return '—'
  return n.toLocaleString()
}

export function pctClass(n) {
  if (!n) return 'neu'
  return n > 0 ? 'up' : 'dn'
}

export function pctBadge(n) {
  if (!n) return 'badge-neu'
  return n > 0 ? 'badge-up' : 'badge-dn'
}

export function shortAddr(s) {
  return s ? `${s.slice(0, 6)}…${s.slice(-4)}` : '—'
}
