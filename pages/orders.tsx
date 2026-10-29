import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [user, setUser] = useState<{ id?: string } | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('limited-stock-user')
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        setUser(parsed)
      } catch {
        setUser(null)
      }
    }
  }, [])

  useEffect(() => {
    if (!user) return
    fetch(`/api/orders?userId=${user.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('limited-stock-token') || ''}` },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch(() => setOrders([]))
  }, [user])

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-white p-10 shadow-soft text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-600">Sign in required</p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">View your orders</h1>
          <p className="mt-4 text-slate-600">Orders are available after signing in. Please sign in to view your order history.</p>
          <button onClick={() => window.location.href = '/login'} className="mt-8 rounded-full bg-indigo-600 px-8 py-3 text-white shadow-lg hover:bg-indigo-700">Sign in</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-600">My orders</p>
          <h1 className="text-3xl font-bold text-slate-900">Your recent orders</h1>
        </div>
      </div>
      <div className="mt-8 grid gap-6">
        {orders.map((order) => (
          <div key={order.id} className="rounded-[2rem] bg-white p-6 shadow-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Order ID</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{order.orderNumber}</p>
              </div>
              <div className="flex gap-3">
                <a href={`/api/invoices/${order.id}`} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Download invoice</a>
                <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">{order.paymentStatus}</div>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">Items</p>
                <p className="mt-2 text-slate-700">{order.items?.length || 0} item(s)</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Amount</p>
                <p className="mt-2 text-slate-700">₹{order.total?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Status</p>
                <p className="mt-2 text-slate-700">{order.status}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
