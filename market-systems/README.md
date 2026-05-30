# ErebusCipher Market Systems

Public-facing market systems portfolio showing live crypto derivatives and options analytics.

## Systems

- Perp Momentum + Funding Engine: cross-sectional long/short signals from momentum, annualized funding carry, and approximate BTC beta.
- Market Structure Monitor: funding heatmaps, OI expansion proxy, and crowding risk screens.
- Factor-Driven BTC Long / Alt Short: long BTC versus weak, high-funding, high-FDV alt candidates.
- BTC Options Intelligence: Deribit vol surface, term structure, 25-delta skew, gamma exposure, options screener, and IV/RV premium.
- Mock Weekly Risk Memo: programmatic internal-style memo with regime classification, breadth, funding snapshot, crowding alerts, and dispersion ideas.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Recharts
- Binance, Bybit, Deribit, CoinGecko

## Run

```bash
npm install
npm run dev
```

The app uses public unauthenticated market data endpoints where possible. Rate limits may affect some views.
