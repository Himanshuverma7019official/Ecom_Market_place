import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useCart } from '../contexts/CartContext'

export default function CartPage() {
  const { items, total, removeItem, updateQuantity, clear } = useCart()
  const router = useRouter()
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    state: '',
    city: '',
    pinCode: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery')
  const [user, setUser] = useState<{ id?: string } | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('limited-stock-profile')
    if (saved) {
      setForm(JSON.parse(saved))
    }
    const storedUser = localStorage.getItem('limited-stock-user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        setUser(null)
      }
    }
  }, [])

  const subtotal = total
  const gst = subtotal * 0.18
  const shipping = subtotal > 0 ? 40 : 0
  const discount = subtotal > 500 ? 50 : 0
  const grandTotal = subtotal + gst + shipping - discount

  const handleProceedToPay = async () => {
    if (items.length === 0) {
      setMessage('Your cart is empty')
      return
    }

    setSubmitting(true)
    setMessage('')

    const body = {
      userId: user?.id || null,
      items: items.map((item) => ({
        productId: item.id,
        title: item.title,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),
      address: { ...form },
      paymentMethod: paymentMethod === 'Cash on Delivery' ? 'COD' : 'RAZORPAY',
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = await res.json()
      if (!res.ok) {
        setMessage(result.error || 'Order could not be placed')
        setSubmitting(false)
        return
      }

      clear()
      router.push(`/order-success?order=${result.orderNumber}`)
    } catch (err: any) {
      setMessage(err?.message || 'Payment failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-600">Cart</p>
              <h1 className="text-3xl font-bold text-slate-900">Your selected products</h1>
            </div>
            {items.length > 0 ? <button onClick={() => clear()} className="text-sm font-semibold text-slate-500">Clear cart</button> : null}
          </div>
          {items.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-slate-200 p-10 text-center">
              <p className="text-lg font-semibold text-slate-700">Your cart is empty</p>
              <p className="mt-2 text-sm text-slate-500">Add premium products to continue your order.</p>
              <button className="mt-6 rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white" onClick={() => router.push('/')}>
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {items.map((it) => (
                <div key={it.id} className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{it.title}</p>
                    <p className="mt-1 text-sm text-slate-500">₹{it.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="number" value={it.quantity} min={1} onChange={(e) => updateQuantity(it.id, Number(e.target.value))} className="w-20 rounded-xl border border-slate-200 p-2" />
                    <button onClick={() => removeItem(it.id)} className="text-sm font-semibold text-red-600">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] bg-slate-900 p-8 text-white shadow-soft">
          <h2 className="text-2xl font-semibold">Summary</h2>
          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>GST</span><span>₹{gst.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>₹{shipping.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div>
            <div className="flex justify-between border-t border-white/20 pt-3 text-base font-semibold text-white"><span>Grand Total</span><span>₹{grandTotal.toFixed(2)}</span></div>
          </div>
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-slate-200">
            <p className="font-semibold text-white">Delivery details</p>
            <p className="mt-2">{form.fullName || 'No profile address yet'}</p>
            <p>{form.addressLine1}</p>
            <p>{form.city}, {form.state} - {form.pinCode}</p>
            <p>{form.phone}</p>
            <p className="mt-3 text-xs text-slate-400">Update your address from <Link href="/profile" className="font-semibold text-indigo-300">Profile</Link>.</p>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="font-semibold text-white">Payment options</p>
            <div className="mt-3 grid gap-2 text-sm text-slate-200">
              {['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet', 'Cash on Delivery'].map((method) => (
                <label key={method} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2">
                  <input type="radio" name="payment" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} /> {method}
                </label>
              ))}
            </div>
          </div>

          {message ? <p className="mt-4 text-sm text-red-300">{message}</p> : null}

          <button onClick={handleProceedToPay} disabled={submitting} className="mt-8 inline-flex w-full justify-center rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg hover:bg-indigo-700 disabled:opacity-70">
            {submitting ? 'Processing...' : 'Proceed to Pay'}
          </button>
        </div>
      </div>
    </div>
  )
}
