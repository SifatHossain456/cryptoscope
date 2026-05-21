const BASE = 'https://api.coingecko.com/api/v3'
const OPTS = { next: { revalidate: 90 } }

export async function getGlobal() {
  const r = await fetch(`${BASE}/global`, OPTS)
  if (!r.ok) throw new Error('global fetch failed')
  const { data } = await r.json()
  return {
    totalMarketCap:   data.total_market_cap.usd,
    totalVolume:      data.total_volume.usd,
    btcDominance:     data.market_cap_percentage.btc,
    ethDominance:     data.market_cap_percentage.eth,
    marketCapChange:  data.market_cap_change_percentage_24h_usd,
    activeCryptos:    data.active_cryptocurrencies,
    markets:          data.markets,
  }
}

export async function getCoins(perPage = 100, page = 1) {
  const url = `${BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=1h,24h,7d`
  const r = await fetch(url, OPTS)
  if (!r.ok) throw new Error('coins fetch failed')
  return r.json()
}

export async function getTrending() {
  const r = await fetch(`${BASE}/search/trending`, OPTS)
  if (!r.ok) throw new Error('trending fetch failed')
  const { coins } = await r.json()
  return coins.slice(0, 7).map(c => c.item)
}

export async function getCoin(id) {
  const url = `${BASE}/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`
  const r = await fetch(url, OPTS)
  if (!r.ok) throw new Error('coin fetch failed')
  return r.json()
}

export async function getCoinChart(id, days = 7) {
  const url = `${BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}`
  const r = await fetch(url, OPTS)
  if (!r.ok) throw new Error('chart fetch failed')
  return r.json()
}

export async function getFearGreed() {
  const r = await fetch('https://api.alternative.me/fng/?limit=1', { next: { revalidate: 3600 } })
  if (!r.ok) return null
  const { data } = await r.json()
  const d = data[0]
  return { value: Number(d.value), label: d.value_classification }
}
