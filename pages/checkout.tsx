import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useCart } from '../contexts/CartContext'

export default function CheckoutPage() {
  const { items, total, clear } = useCart()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

      // If COD, finish flow
      if (paymentMethod === 'Cash on Delivery') {
        clear()
        router.push(`/order-success?order=${result.orderNumber}`)
        setSubmitting(false)
        return
      }

      // For Razorpay: create razorpay order
      const createRes = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: result.id }),
      })
      const createData = await createRes.json()
      if (!createRes.ok) {
        setMessage(createData.error || 'Payment initiation failed')
        setSubmitting(false)
        return
      }

      const rpOrder = createData.order
      const key = createData.key

      // Load Razorpay checkout script
      await new Promise((resolve, reject) => {
        if ((window as any).Razorpay) return resolve(true)
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => resolve(true)
        script.onerror = () => reject(new Error('Razorpay SDK failed to load'))
        document.body.appendChild(script)
      })

      const options = {
        key: key,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        name: 'Limited Stock Marketplace',
        description: 'Order Payment',
        order_id: rpOrder.id,
        handler: async (response: any) => {
          // Confirm payment with server
          const conf = await fetch('/api/payments/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: result.id,
            }),
          })
          const confData = await conf.json()
          if (conf.ok) {
            clear()
            router.push(`/order-success?order=${result.orderNumber}`)
          } else {
            setMessage(confData.error || 'Payment verification failed')
          }
          setSubmitting(false)
        },
        prefill: { name: form.fullName, email: form.email, contact: form.phone },
        theme: { color: '#6366F1' },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err: any) {
      console.error('Checkout error', err)
      setMessage(err?.message || 'Checkout failed')
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-8 shadow-soft">
          <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
          <p className="mt-2 text-sm text-slate-600">{user ? 'Your saved profile address will be used for delivery.' : 'Checkout as guest or sign in for a faster experience.'}</p>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Delivery details</p>
            <p className="mt-2">{form.fullName || 'No profile address yet'}</p>
            <p>{form.addressLine1}</p>
            <p>{form.city}, {form.state} - {form.pinCode}</p>
            <p>{form.phone}</p>
          </div>
          <p className="mt-4 text-sm text-slate-500">Update your address from the <a href="/profile" className="font-semibold text-indigo-600">Profile</a> page before checkout.</p>
          {!user ? <p className="mt-3 text-sm text-slate-600">Signing in stores your order history and speeds up checkout.</p> : null}
          <div className="mt-8 rounded-2xl border border-slate-200 p-4">
            <p className="font-semibold text-slate-900">Payment Options</p>
            <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              {['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet', 'Cash on Delivery'].map((method) => (
                <label key={method} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                  <input type="radio" name="payment" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} /> {method}
                </label>
              ))}
            </div>
          </div>
          {message ? <p className="mt-4 text-sm text-red-600">{message}</p> : null}
          <button type="submit" disabled={submitting} className="mt-8 w-full rounded-full bg-indigo-600 px-6 py-4 font-semibold text-white shadow-lg hover:bg-indigo-700 disabled:opacity-70">
            {submitting ? 'Placing order...' : 'Place order'}
          </button>
        </form>

        <aside className="rounded-[2rem] bg-slate-900 p-8 text-white shadow-soft">
          <h2 className="text-2xl font-semibold">Order Summary</h2>
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-slate-300">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 space-y-3 text-sm text-slate-300">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>GST</span><span>₹{gst.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>₹{shipping.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div>
            <div className="flex justify-between border-t border-white/20 pt-3 text-base font-semibold text-white"><span>Grand Total</span><span>₹{grandTotal.toFixed(2)}</span></div>
          </div>
        </aside>
      </div>
    </div>
  )
}
