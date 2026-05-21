import { getCoin, getCoinChart } from '@/lib/coingecko'

export const revalidate = 120

export async function GET(req, { params }) {
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const days = Number(searchParams.get('days') ?? 7)

  const [coin, chart] = await Promise.allSettled([getCoin(id), getCoinChart(id, days)])
  return Response.json({
    coin:  coin.status  === 'fulfilled' ? coin.value  : null,
    chart: chart.status === 'fulfilled' ? chart.value : null,
  })
}
