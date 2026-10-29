import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

function adminAuthHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('limited-stock-token') || ''}` }
}

export default function TrashPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [trashed, setTrashed] = useState<any[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    let storedUser: { role?: string } | null = null
    try {
      storedUser = JSON.parse(localStorage.getItem('limited-stock-user') || 'null')
    } catch {
      storedUser = null
    }

    if (!localStorage.getItem('limited-stock-token') || storedUser?.role !== 'ADMIN') {
      router.replace('/login')
      return
    }

    setAuthorized(true)
    fetch('/api/trash', { headers: adminAuthHeaders() }).then((res) => res.json()).then(setTrashed)
  }, [router])

  async function handleRedpush(id: string) {
    setMessage('')
    const res = await fetch('/api/trash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...adminAuthHeaders() },
      body: JSON.stringify({ id, action: 'redpush' }),
    })

    if (res.ok) {
      setMessage('Product re-listed as redpushed (out of stock).')
      // refresh lists
      fetch('/api/trash', { headers: adminAuthHeaders() }).then((r) => r.json()).then(setTrashed)
      // also refresh dashboard counts by hitting dashboard endpoint if present
      fetch('/api/dashboard', { headers: adminAuthHeaders() })
    } else {
      const err = await res.json().catch(() => ({}))
      setMessage(err?.error || 'Could not redpush product.')
    }
  }

  if (!authorized) return null

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] bg-white p-8 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Trash History ({trashed.length})</h2>
          <Link href="/admin" className="text-sm text-indigo-600">Back to Dashboard</Link>
        </div>

        <div className="mt-6 space-y-4">
          {trashed.length === 0 ? (
            <p className="text-sm text-slate-500">No trashed products.</p>
          ) : (
            trashed.map((t) => (
              <div key={t.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-4">
                  {t.image && <img src={t.image} alt={t.title} className="h-12 w-12 rounded-lg object-cover" />}
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{t.title}</p>
                    <p className="text-xs text-slate-500">{t.category} • ₹{t.price?.toFixed?.(2) ?? t.price} • Former stock: {t.inventory}</p>
                    <p className="text-xs text-slate-400">Deleted at: {new Date(t.deletedAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleRedpush(t.id)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100">Redpush Listing</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {message ? <p className="mt-4 text-sm text-emerald-600">{message}</p> : null}
      </div>
    </div>
  )
}
