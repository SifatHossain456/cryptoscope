import { getCoins } from '@/lib/coingecko'

export const revalidate = 60

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const page    = Number(searchParams.get('page')    ?? 1)
  const perPage = Number(searchParams.get('perPage') ?? 100)
  const coins = await getCoins(perPage, page)
  return Response.json(coins)
}
