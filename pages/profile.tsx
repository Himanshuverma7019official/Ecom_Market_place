import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const router = useRouter()
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    state: '',
    city: '',
    pinCode: '',
  })
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null)

  useEffect(() => {
    const savedProfile = localStorage.getItem('limited-stock-profile')
    if (savedProfile) {
      setForm(JSON.parse(savedProfile))
    }

    const storedUser = localStorage.getItem('limited-stock-user')
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        setUser(parsed)
        if (parsed.name) setForm((current) => ({ ...current, fullName: parsed.name, email: parsed.email || current.email }))
      } catch {
        setUser(null)
      }
    }
  }, [])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    localStorage.setItem('limited-stock-profile', JSON.stringify(form))
    setMessage('Address saved successfully')
    setTimeout(() => setMessage(''), 2000)
  }

  const profileSections = [
    {
      id: 'orders',
      icon: '📦',
      title: 'Your Orders',
      subtitle: 'Track, return, or buy things again',
      href: '/orders',
      highlight: true,
    },
    {
      id: 'addresses',
      icon: '📍',
      title: 'Your Addresses',
      subtitle: 'Edit addresses for orders and gifts',
      action: () => setShowAddressForm(!showAddressForm),
      highlight: true,
    },
    {
      id: 'security',
      icon: '🔒',
      title: 'Login & Security',
      subtitle: 'Edit login, name, and mobile number',
      href: '#',
      highlight: true,
    },
    {
      id: 'payment',
      icon: '💳',
      title: 'Payment Options',
      subtitle: 'Edit or add payment methods',
      href: '#',
    },
    {
      id: 'contact',
      icon: '🎧',
      title: 'Contact Us',
      subtitle: 'Contact our customer service',
      href: '#',
      highlight: true,
    },
    {
      id: 'notifications',
      icon: '🔔',
      title: 'Notifications',
      subtitle: 'Manage your alerts and preferences',
      href: '#',
    },
  ]

  if (!user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-white p-10 shadow-soft text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-600">Sign in required</p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Your account page</h1>
          <p className="mt-4 text-slate-600">Sign in to manage your profile, addresses, orders, and account details.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button onClick={() => router.push('/login')} className="rounded-full bg-indigo-600 px-8 py-3 text-white hover:bg-indigo-700">Sign in</button>
            <button onClick={() => router.push('/register')} className="rounded-full border border-indigo-600 px-8 py-3 text-indigo-600 hover:bg-indigo-50">Create account</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-slate-900">Your Account</h1>
      
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {profileSections.map((section) => (
          <div
            key={section.id}
            onClick={section.action || (() => section.href && section.href !== '#' && router.push(section.href))}
            className="cursor-pointer rounded-2xl border-2 border-blue-300 bg-white p-6 shadow-md transition hover:shadow-lg"
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl">{section.icon}</span>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{section.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddressForm && (
        <div className="mt-10 rounded-2xl border-2 border-blue-500 bg-white p-8 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Edit Your Address</h2>
            <button onClick={() => setShowAddressForm(false)} className="text-2xl text-slate-400 hover:text-slate-600">×</button>
          </div>
          <form onSubmit={handleSave} className="mt-6 grid gap-4 sm:grid-cols-2">
            <input required className="rounded-xl border border-slate-300 p-3 focus:border-blue-500 focus:outline-none" placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <input required className="rounded-xl border border-slate-300 p-3 focus:border-blue-500 focus:outline-none" placeholder="Mobile Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input required type="email" className="rounded-xl border border-slate-300 p-3 sm:col-span-2 focus:border-blue-500 focus:outline-none" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input required className="rounded-xl border border-slate-300 p-3 sm:col-span-2 focus:border-blue-500 focus:outline-none" placeholder="Address" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
            <input required className="rounded-xl border border-slate-300 p-3 focus:border-blue-500 focus:outline-none" placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            <input required className="rounded-xl border border-slate-300 p-3 focus:border-blue-500 focus:outline-none" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input required className="rounded-xl border border-slate-300 p-3 focus:border-blue-500 focus:outline-none" placeholder="PIN Code" value={form.pinCode} onChange={(e) => setForm({ ...form, pinCode: e.target.value })} />
            <div className="sm:col-span-2 flex items-center gap-4">
              <button type="submit" className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">Save Address</button>
              {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

