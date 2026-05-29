'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('[CryptoScope] Error:', error)
  }, [error])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 1rem',
      background: 'var(--bg-0)',
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>⚠️</div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--t1)' }}>
        Something went wrong
      </h1>
      <p style={{ marginBottom: '1.5rem', maxWidth: '24rem', fontSize: '0.875rem', color: 'var(--t3)', lineHeight: 1.7 }}>
        {error.message || 'Failed to load market data. The CoinGecko API may be temporarily unavailable.'}
      </p>
      {error.digest && (
        <p style={{ marginBottom: '1.5rem', fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--t4)' }}>
          ID: {error.digest}
        </p>
      )}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={reset}
          style={{
            padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem',
            background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer',
          }}
        >
          Try again
        </button>
        <a href="/" style={{
          padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem',
          border: '1px solid var(--border)', color: 'var(--t3)', textDecoration: 'none',
        }}>
          Go home
        </a>
      </div>
    </div>
  )
}
