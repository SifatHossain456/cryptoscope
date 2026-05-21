'use client'
import { useRef, useEffect } from 'react'

export default function Sparkline({ prices = [], width = 80, height = 32, positive }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || prices.length < 2) return
    const ctx   = canvas.getContext('2d')
    const dpr   = window.devicePixelRatio || 1
    const w     = width  * dpr
    const h     = height * dpr
    canvas.width  = w
    canvas.height = h
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    const min   = Math.min(...prices)
    const max   = Math.max(...prices)
    const range = max - min || 1
    const pad   = 2

    const x = i => (i / (prices.length - 1)) * (width  - pad * 2) + pad
    const y = v => height - pad - ((v - min) / range) * (height - pad * 2)

    const color = positive ? '#10b981' : '#ef4444'

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, height)
    grad.addColorStop(0, positive ? 'rgba(16,185,129,.25)' : 'rgba(239,68,68,.25)')
    grad.addColorStop(1, 'transparent')

    ctx.beginPath()
    prices.forEach((p, i) => i === 0 ? ctx.moveTo(x(i), y(p)) : ctx.lineTo(x(i), y(p)))
    ctx.lineTo(x(prices.length - 1), height)
    ctx.lineTo(x(0), height)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()

    // Line
    ctx.beginPath()
    prices.forEach((p, i) => i === 0 ? ctx.moveTo(x(i), y(p)) : ctx.lineTo(x(i), y(p)))
    ctx.strokeStyle  = color
    ctx.lineWidth    = 1.5
    ctx.lineJoin     = 'round'
    ctx.lineCap      = 'round'
    ctx.stroke()
  }, [prices, positive, width, height])

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      style={{ width, height, display: 'block' }}
      aria-hidden="true"
    />
  )
}
