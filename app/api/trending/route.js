import { getTrending } from '@/lib/coingecko'

export const revalidate = 300

export async function GET() {
  const coins = await getTrending()
  return Response.json(coins)
}
