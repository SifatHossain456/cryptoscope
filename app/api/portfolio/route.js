// Portfolio API — fetches ERC-20 token balances for a wallet address
// Uses Etherscan API (free tier) + CoinGecko for prices

const ETHERSCAN_KEY = process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken'
const CG_BASE = 'https://api.coingecko.com/api/v3'

// Top tokens we care about mapping contract → CoinGecko ID
const TOKEN_MAP = {
  '0xdac17f958d2ee523a2206206994597c13d831ec7': 'tether',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'usd-coin',
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'wrapped-bitcoin',
  '0x514910771af9ca656af840dff83e8264ecf986ca': 'chainlink',
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': 'uniswap',
  '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0': 'matic-network',
  '0x4fabb145d64652a948d72533023f6e7a623c7c53': 'binance-usd',
  '0x6b175474e89094c44da98b954eedeac495271d0f': 'dai',
  '0xc00e94cb662c3520282e6f5717214004a7f26888': 'compound-governance-token',
  '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e': 'yearn-finance',
  '0xd533a949740bb3306d119cc777fa900ba034cd52': 'curve-dao-token',
  '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2': 'maker',
  '0x111111111117dc0aa78b770fa6a738034120c302': '1inch',
  '0xba100000625a3754423978a60c9317c58a424e3d': 'balancer',
  '0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0': 'frax-share',
}

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')?.toLowerCase()

  if (!address || !/^0x[0-9a-f]{40}$/i.test(address)) {
    return Response.json({ error: 'Invalid address' }, { status: 400 })
  }

  try {
    // 1. Fetch ETH balance
    const ethUrl = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_KEY}`

    // 2. Fetch ERC-20 token transfers to find held tokens
    const tokensUrl = `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&sort=desc&apikey=${ETHERSCAN_KEY}`

    const [ethRes, tokensRes] = await Promise.all([
      fetch(ethUrl, { next: { revalidate: 60 } }),
      fetch(tokensUrl, { next: { revalidate: 60 } }),
    ])

    const [ethData, tokensData] = await Promise.all([
      ethRes.json(),
      tokensRes.json(),
    ])

    // Parse ETH balance
    const ethBalance = ethData.status === '1'
      ? parseFloat(ethData.result) / 1e18
      : 0

    // Find unique tokens from transfer history
    const tokenMap = new Map()
    if (tokensData.status === '1' && Array.isArray(tokensData.result)) {
      for (const tx of tokensData.result) {
        const contract = tx.contractAddress.toLowerCase()
        if (!tokenMap.has(contract)) {
          tokenMap.set(contract, {
            contract,
            name:     tx.tokenName,
            symbol:   tx.tokenSymbol,
            decimals: parseInt(tx.tokenDecimal),
          })
        }
      }
    }

    // 3. Fetch current balance for each token
    const tokenAddresses = [...tokenMap.keys()].slice(0, 20) // max 20 tokens
    const balancePromises = tokenAddresses.map(async (contract) => {
      const url = `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${contract}&address=${address}&tag=latest&apikey=${ETHERSCAN_KEY}`
      try {
        const r = await fetch(url, { next: { revalidate: 60 } })
        const d = await r.json()
        return { contract, balance: d.status === '1' ? d.result : '0' }
      } catch {
        return { contract, balance: '0' }
      }
    })

    const balances = await Promise.all(balancePromises)

    // Build token list with balances
    const tokens = balances
      .map(({ contract, balance }) => {
        const info = tokenMap.get(contract)
        if (!info) return null
        const amount = parseFloat(balance) / Math.pow(10, info.decimals)
        if (amount < 0.001) return null
        return { ...info, amount, cgId: TOKEN_MAP[contract] || null }
      })
      .filter(Boolean)

    // 4. Fetch prices from CoinGecko for known tokens
    const knownIds = ['ethereum', ...tokens.map(t => t.cgId).filter(Boolean)]
    const uniqueIds = [...new Set(knownIds)]
    const cgUrl = `${CG_BASE}/simple/price?ids=${uniqueIds.join(',')}&vs_currencies=usd&include_24hr_change=true`

    let prices = {}
    try {
      const cgRes = await fetch(cgUrl, { next: { revalidate: 60 } })
      prices = await cgRes.json()
    } catch { /* use 0 prices */ }

    // Build final portfolio
    const ethValue = ethBalance * (prices.ethereum?.usd ?? 0)
    const holdings = [
      {
        symbol:     'ETH',
        name:       'Ethereum',
        amount:     ethBalance,
        price:      prices.ethereum?.usd ?? 0,
        value:      ethValue,
        change24h:  prices.ethereum?.usd_24h_change ?? 0,
        contract:   null,
        cgId:       'ethereum',
      },
      ...tokens.map(t => {
        const price     = prices[t.cgId]?.usd ?? 0
        const change24h = prices[t.cgId]?.usd_24h_change ?? 0
        return {
          symbol:   t.symbol,
          name:     t.name,
          amount:   t.amount,
          price,
          value:    t.amount * price,
          change24h,
          contract: t.contract,
          cgId:     t.cgId,
        }
      }),
    ]
      .filter(h => h.value > 0.01)
      .sort((a, b) => b.value - a.value)

    const totalValue = holdings.reduce((s, h) => s + h.value, 0)
    const totalChange = totalValue > 0
      ? holdings.reduce((s, h) => s + h.change24h * h.value / totalValue, 0)
      : 0

    return Response.json({
      address,
      totalValue,
      totalChange,
      holdings,
      tokenCount: holdings.length,
    })
  } catch (err) {
    return Response.json({ error: err.message || 'Failed to fetch portfolio' }, { status: 500 })
  }
}
