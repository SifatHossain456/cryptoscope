'use client'

const ZONES = [
  { max: 25,  label: 'Extreme Fear', color: '#ef4444' },
  { max: 45,  label: 'Fear',         color: '#f97316' },
  { max: 55,  label: 'Neutral',      color: '#eab308' },
  { max: 75,  label: 'Greed',        color: '#84cc16' },
  { max: 100, label: 'Extreme Greed',color: '#10b981' },
]

function getZone(v) {
  return ZONES.find(z => v <= z.max) ?? ZONES[ZONES.length - 1]
}

export default function FearGreed({ value, label }) {
  if (value == null) return null
  const zone  = getZone(value)
  const angle = -90 + (value / 100) * 180   // -90° to +90°
  const r     = 56
  const cx    = 72; const cy = 72

  // Arc path (semicircle, left to right, bottom half excluded)
  const arc = (pct, color) => {
    const start = -Math.PI
    const end   = start + (pct / 100) * Math.PI
    const x1 = cx + r * Math.cos(start)
    const y1 = cy + r * Math.sin(start)
    const x2 = cx + r * Math.cos(end)
    const y2 = cy + r * Math.sin(end)
    const large = pct > 50 ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
  }

  // Needle
  const rad = (angle * Math.PI) / 180
  const nx  = cx + (r - 10) * Math.cos(rad)
  const ny  = cy + (r - 10) * Math.sin(rad)

  return (
    <figure className="flex flex-col items-center gap-3" aria-label={`Fear and Greed Index: ${value} — ${label}`}>
      <svg width="144" height="80" viewBox="0 0 144 80" aria-hidden="true">
        {/* Background arc */}
        <path d={arc(100, '#1a2744')} fill="none" stroke="#1a2744" strokeWidth="10" />

        {/* Colored segments */}
        {ZONES.map((z, i) => {
          const prev  = i === 0 ? 0 : ZONES[i - 1].max
          const segPct = z.max - prev
          const offset = prev
          const start  = -Math.PI + (offset / 100) * Math.PI
          const end    =  start   + (segPct / 100) * Math.PI
          const x1 = cx + r * Math.cos(start); const y1 = cy + r * Math.sin(start)
          const x2 = cx + r * Math.cos(end);   const y2 = cy + r * Math.sin(end)
          const large = segPct > 50 ? 1 : 0
          return (
            <path
              key={z.label}
              d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
              fill="none" stroke={z.color} strokeWidth="8" opacity=".35"
            />
          )
        })}

        {/* Filled arc up to value */}
        <path d={arc(value, zone.color)} fill="none" stroke={zone.color} strokeWidth="8" strokeLinecap="round" />

        {/* Needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={4} fill="white" />
      </svg>

      <figcaption className="text-center">
        <p className="text-3xl font-black mono tabnum" style={{ color: zone.color }}>{value}</p>
        <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--t2)' }}>{zone.label}</p>
      </figcaption>
    </figure>
  )
}
