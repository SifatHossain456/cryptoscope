import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 1rem',
      background: 'var(--bg-0)',
    }}>
      <div style={{ fontSize: '5rem', fontWeight: 900, color: '#6366f1', marginBottom: '1rem', lineHeight: 1 }}>
        404
      </div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--t1)' }}>
        Coin not found
      </h1>
      <p style={{ marginBottom: '2rem', maxWidth: '24rem', fontSize: '0.875rem', color: 'var(--t3)', lineHeight: 1.7 }}>
        This coin or page doesn&apos;t exist. Search for a token or browse all markets.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link href="/markets" style={{
          padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem',
          background: '#6366f1', color: '#fff', textDecoration: 'none',
        }}>
          All Markets
        </Link>
        <Link href="/" style={{
          padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem',
          border: '1px solid var(--border)', color: 'var(--t3)', textDecoration: 'none',
        }}>
          Home
        </Link>
      </div>
    </div>
  )
}
