'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h2>Something went wrong</h2>
          {error?.message && (
            <p style={{ color: '#888', fontSize: 14, marginTop: 8 }}>{error.message}</p>
          )}
          <button
            onClick={() => typeof reset === 'function' && reset()}
            style={{ marginTop: 16, padding: '8px 24px', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
