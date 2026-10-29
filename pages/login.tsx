import Link from 'next/link'
import { useRouter } from 'next/router'
import { FormEvent, useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    if (!res.ok) return setError(data.error || 'Login failed')

    localStorage.setItem('limited-stock-token', data.token)
    localStorage.setItem('limited-stock-user', JSON.stringify(data.user))
    const redirect = router.query.redirect
    const destination = typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
      ? redirect
      : '/orders'
    router.push(destination)
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full rounded-[2rem] bg-white p-8 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Welcome back</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Sign in to Limited Stock</h1>
        <p className="mt-3 text-slate-600">Access your orders and manage your account securely.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email address" className="w-full rounded-2xl border border-slate-200 px-4 py-3" required />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full rounded-2xl border border-slate-200 px-4 py-3" required />
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <button className="w-full rounded-2xl bg-indigo-600 px-4 py-3 font-semibold text-white">Sign in</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          New to Limited Stock? <Link href={typeof router.query.redirect === 'string' ? { pathname: '/register', query: { redirect: router.query.redirect } } : '/register'} className="font-semibold text-indigo-600">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
