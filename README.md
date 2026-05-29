# CryptoScope — Live Crypto Dashboard

Live cryptocurrency market dashboard with prices, market cap heatmap, Fear & Greed index, sparklines, and full coin detail pages — for 100+ coins. Powered by CoinGecko.

## Features

- **Market Overview** — Top 100 coins by market cap with live price, 24h/7d change, volume, and sparkline charts
- **Coin Detail** — Full market data page per coin: ATH, circulating supply, price history, and 1h/24h/7d/30d/1y changes
- **Price Heatmap** — Visual grid of the market by 24h performance
- **Fear & Greed Index** — Live sentiment indicator from Alternative.me
- **Ticker tape** — Continuous scrolling price ticker at the top of every page
- **Search** — Filter coins by name or symbol in real time with `useMemo`

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 App Router |
| Styling | Tailwind CSS v4 + CSS variables |
| Data | CoinGecko API v3 (free tier) |
| Charts | Canvas-based sparklines |

## Getting Started

```bash
git clone https://github.com/SifatHossain456/cryptoscope.git
cd cryptoscope
npm install
npm run dev
```

No API key required — uses CoinGecko free public API.

## Project Structure

```
app/
├── page.js              # Market overview + heatmap
├── markets/             # Full sortable market table
└── coin/[id]/           # Coin detail page
```

## License

MIT
