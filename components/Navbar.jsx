'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV = [
  { href: '/',        label: 'Dashboard' },
  { href: '/markets', label: 'Markets'   },
]

export default function Navbar() {
  const [q, setQ]       = useState('')
  const router          = useRouter()
  const pathname        = usePathname()

  const search = e => {
    e.preventDefault()
    const v = q.trim()
    if (v) { router.push(`/markets?q=${encodeURIComponent(v)}`); setQ('') }
  }

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{ background: 'rgba(5,10,20,.92)', borderColor: 'var(--border)' }}
    >
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="CryptoScope home">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm"
            style={{ background: 'linear-gradient(135deg,#6366f1,#10b981)', boxShadow: '0 0 14px rgba(99,102,241,.4)' }}
          >
            ◈
          </div>
          <span className="font-black text-sm tracking-tight" style={{ color: 'var(--t1)' }}>
            CryptoScope
          </span>
        </Link>

        {/* Nav links */}
        <ul className="hidden sm:flex items-center gap-1 ml-2" role="list">
          {NAV.map(({ href, label }) => {
            const active = pathname === href
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={{
                    background: active ? 'rgba(99,102,241,.15)' : 'transparent',
                    color:      active ? '#818cf8' : 'var(--t2)',
                  }}
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Search */}
        <form onSubmit={search} className="flex-1 max-w-xs ml-auto" role="search">
          <label htmlFor="nav-search" className="sr-only">Search coins</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--t3)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              id="nav-search"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search coins…"
              className="w-full rounded-xl pl-9 pr-3 py-2 text-xs transition-colors"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--t1)', outline: 'none' }}
              onFocus={e  => (e.target.style.borderColor = '#6366f1')}
              onBlur={e   => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
        </form>
      </nav>
    </header>
  )
}
