import { getGlobal, getFearGreed } from '@/lib/coingecko'

export const revalidate = 90

export async function GET() {
  const [global, fearGreed] = await Promise.allSettled([getGlobal(), getFearGreed()])
  return Response.json({
    global:    global.status === 'fulfilled'    ? global.value    : null,
    fearGreed: fearGreed.status === 'fulfilled' ? fearGreed.value : null,
  })
}
