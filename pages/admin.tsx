import Link from 'next/link'
import { useRouter } from 'next/router'
import { FormEvent, useEffect, useState } from 'react'

type DashboardStats = {
  orders: number
  customers: number
  products: number
  revenue: number
  pending: number
  todaysOrders: number
  notifications: any[]
}

function adminAuthHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('limited-stock-token') || ''}` }
}

export default function AdminPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url')
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    image: '',
    category: '',
    inventory: '100',
    sku: '',
  })
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

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

    const headers = adminAuthHeaders()
    setAuthorized(true)
    fetch('/api/dashboard', { headers }).then((res) => res.json()).then(setStats)
    fetch('/api/orders', { headers }).then((res) => res.json()).then(setOrders)
    fetch('/api/products').then((res) => res.json()).then(setProducts)
  }, [router])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setForm({ ...form, image: event.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setMessage('')

    const payload = { ...form, price: Number(form.price), inventory: Number(form.inventory) }
    const method = editingProductId ? 'PATCH' : 'POST'
    if (editingProductId) Object.assign(payload, { id: editingProductId })

    const res = await fetch('/api/products', {
      method,
      headers: { 'Content-Type': 'application/json', ...adminAuthHeaders() },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      setMessage(editingProductId ? 'Product updated successfully!' : 'Product added successfully!')
      setForm({ title: '', description: '', price: '', image: '', category: '', inventory: '100', sku: '' })
      setUploadedFile(null)
      setImageMode('url')
      setEditingProductId(null)
      fetch('/api/dashboard', { headers: adminAuthHeaders() }).then((res) => res.json()).then(setStats)
      fetch('/api/products').then((res) => res.json()).then(setProducts)
    } else {
      setMessage(editingProductId ? 'Could not update product.' : 'Could not add product.')
    }
  }

  async function handleDeleteProduct(productId: string) {
    if (!confirm('Are you sure you want to delete this product?')) return

    const res = await fetch('/api/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...adminAuthHeaders() },
      body: JSON.stringify({ id: productId }),
    })

    if (res.ok) {
      setMessage('Product deleted successfully!')
      fetch('/api/products').then((res) => res.json()).then(setProducts)
      fetch('/api/dashboard', { headers: adminAuthHeaders() }).then((res) => res.json()).then(setStats)
    } else {
      setMessage('Could not delete product.')
    }
  }

  async function handleMarkOutOfStock(productId: string) {
    const res = await fetch('/api/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...adminAuthHeaders() },
      body: JSON.stringify({ id: productId, inventory: 0 }),
    })

    if (res.ok) {
      setMessage('Product marked out of stock.')
      fetch('/api/products').then((res) => res.json()).then(setProducts)
      fetch('/api/dashboard', { headers: adminAuthHeaders() }).then((res) => res.json()).then(setStats)
    } else {
      setMessage('Could not update product status.')
    }
  }

  if (!authorized) return null

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Today\'s Orders', stats?.todaysOrders ?? 0, 'bg-indigo-600'],
          ['Pending Orders', stats?.pending ?? 0, 'bg-amber-500'],
          ['Revenue', `₹${stats?.revenue?.toFixed(2) ?? '0.00'}`, 'bg-emerald-600'],
          ['Customers', stats?.customers ?? 0, 'bg-slate-800'],
        ].map(([title, value, color]) => (
          <div key={title} className={`rounded-[1.5rem] p-6 text-white shadow-soft ${color}`}>
            <p className="text-sm uppercase tracking-[0.28em] opacity-80">{title}</p>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-8">
          <div className="rounded-[2rem] bg-white p-8 shadow-soft">
            <h2 className="text-2xl font-semibold text-slate-900">{editingProductId ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Product title" className="rounded-2xl border border-slate-200 px-4 py-3" required />
              <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU" className="rounded-2xl border border-slate-200 px-4 py-3" required />
              <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} type="number" step="0.01" placeholder="Price" className="rounded-2xl border border-slate-200 px-4 py-3" required />
              <input value={form.inventory} onChange={(e) => setForm({ ...form, inventory: e.target.value })} type="number" placeholder="Inventory" className="rounded-2xl border border-slate-200 px-4 py-3" required />
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="rounded-2xl border border-slate-200 px-4 py-3" required />
              
              <div className="md:col-span-2">
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={imageMode === 'url'} onChange={() => setImageMode('url')} />
                    <span className="text-sm font-semibold text-slate-700">Image URL</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={imageMode === 'upload'} onChange={() => setImageMode('upload')} />
                    <span className="text-sm font-semibold text-slate-700">Upload Image</span>
                  </label>
                </div>
                
                {imageMode === 'url' ? (
                  <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Image URL" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                ) : (
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                )}
                
                {form.image && <p className="mt-2 text-xs text-slate-500">✓ Image selected</p>}
              </div>
              
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="md:col-span-2 min-h-[100px] rounded-2xl border border-slate-200 px-4 py-3" required />
              <div className="md:col-span-2 flex items-center gap-4">
                <button className="rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white">{editingProductId ? 'Update Product' : 'Add Product'}</button>
                {editingProductId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProductId(null)
                      setForm({ title: '', description: '', price: '', image: '', category: '', inventory: '100', sku: '' })
                      setUploadedFile(null)
                      setImageMode('url')
                    }}
                    className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                )}
                {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
              </div>
            </form>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-soft">
            <h2 className="text-2xl font-semibold text-slate-900">Products ({products.length})</h2>
            <div className="mt-6 space-y-3 max-h-96 overflow-y-auto">
              {products.length === 0 ? (
                <p className="text-sm text-slate-500">No products yet</p>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="rounded-2xl border border-slate-200 p-4">
                    <Link href={`/products/${product.id}`} className="group block rounded-2xl bg-slate-50 p-4 transition hover:bg-slate-100">
                      <div className="flex items-center gap-4">
                        {product.image && <img src={product.image} alt={product.title} className="h-12 w-12 rounded-lg object-cover" />}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: product.inventory > 0 ? '#22c55e' : '#f97316' }} />
                            <p className="font-semibold text-slate-900 group-hover:text-indigo-600">{product.title}</p>
                          </div>
                          <p className="text-xs text-slate-500">{product.category} • ₹{product.price?.toFixed(2)} • Stock: {product.inventory}</p>
                        </div>
                      </div>
                    </Link>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingProductId(product.id)
                          setForm({
                            title: product.title || '',
                            description: product.description || '',
                            price: String(product.price ?? ''),
                            image: product.image || '',
                            category: product.category || '',
                            inventory: String(product.inventory ?? 0),
                            sku: product.sku || '',
                          })
                          setImageMode('url')
                        }}
                        className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleMarkOutOfStock(product.id)}
                        className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        Redpush
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-soft">
            <h2 className="text-2xl font-semibold text-slate-900">Latest Orders</h2>
            <div className="mt-6 space-y-4">
                {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                    <p className="text-sm text-slate-500">{order.items?.length || 0} products</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">₹{order.total?.toFixed(2)}</p>
                    <p className="text-sm text-amber-600">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-slate-900 p-8 text-white shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Notifications</h2>
            <Link href="/admin/trash" className="text-sm text-amber-400 hover:underline">Trash History</Link>
          </div>
          <div className="mt-6 space-y-4">
            {(stats?.notifications || []).map((item) => (
              <div key={item.id} className="rounded-2xl bg-white/10 p-4">
                <p className="font-semibold">{item.title}</p>
                <p className="mt-2 text-sm text-slate-300">{item.message}</p>
                {item.type === 'PRODUCT_TRASHED' ? (
                  <div className="mt-3">
                    <Link href="/admin/trash" className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100">View Trash</Link>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
