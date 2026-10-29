import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { useCart } from '../contexts/CartContext'

export default function Header() {
  const { items } = useCart()
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null)
  const accountRef = useRef<HTMLDivElement>(null)

  const onAccountClick = () => {
    if (user) {
      router.push('/profile')
    } else {
      setAccountOpen(true)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('limited-stock-token')
    window.localStorage.removeItem('limited-stock-user')
    setUser(null)
    setAccountOpen(false)
    router.push('/')
  }

  useEffect(() => {
    const saved = window.localStorage.getItem('estock-theme')
    if (saved) setDarkMode(saved === 'dark')
  }, [])

  useEffect(() => {
    const storedUser = window.localStorage.getItem('limited-stock-user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        setUser(null)
      }
    } else {
      setUser(null)
    }
  }, [router.asPath])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (accountOpen && accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [accountOpen])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    window.localStorage.setItem('estock-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const count = items.reduce((s, it) => s + it.quantity, 0)

  return (
    <header className="relative z-50 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-5">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 font-bold text-white shadow-soft">E</span>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">E-stock</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
            <Link
              href="/"
              className={`transition hover:text-slate-900 dark:hover:text-white ${router.pathname === '/' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''}`}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={`transition hover:text-slate-900 dark:hover:text-white ${router.pathname === '/products' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''}`}
            >
              Products
            </Link>
            <Link
              href="/orders"
              className={`transition hover:text-slate-900 dark:hover:text-white ${router.pathname === '/orders' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''}`}
            >
              My Orders
            </Link>
            {user?.role === 'ADMIN' ? (
              <Link
                href="/admin"
                className={`transition hover:text-slate-900 dark:hover:text-white ${router.pathname === '/admin' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''}`}
              >
                Admin
              </Link>
            ) : null}
          </nav>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="hidden md:block">
            <input
              type="search"
              placeholder="Search electric gear"
              className="w-72 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              onKeyDown={(e) => {
                if (e.key === 'Enter') router.push(`/?q=${(e.target as HTMLInputElement).value}`)
              }}
            />
          </div>
          <button
            onClick={() => setDarkMode((value) => !value)}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:border-indigo-300 dark:border-slate-700 dark:text-slate-200"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <div
            className="relative inline-block text-left pb-3"
            ref={accountRef}
            onMouseEnter={() => setAccountOpen(true)}
            onMouseLeave={() => setAccountOpen(false)}
          >
            <button
              type="button"
              onClick={onAccountClick}
              className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <div className="text-left">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Hello, {user?.name ? user.name : 'sign in'}</p>
                <span className="font-semibold text-slate-900 dark:text-white">Account & Lists</span>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="block">
                  <path d="M12 16L6 10H18L12 16Z" fill="currentColor" />
                </svg>
              </span>
            </button>
            <div className={`absolute right-0 z-50 mt-2 w-[28rem] rounded-3xl border border-slate-200 bg-white p-4 shadow-xl transition duration-200 dark:border-slate-700 dark:bg-slate-950 ${accountOpen ? 'visible opacity-100' : 'invisible opacity-0 pointer-events-none'}`}>
              <div className="absolute right-6 -top-2 h-4 w-4 rotate-45 bg-white shadow-sm dark:bg-slate-950" />
              {!user ? (
                <div className="mb-4 rounded-3xl bg-slate-100 p-4 dark:bg-slate-900">
                  <div className="space-y-3 text-center">
                    <button
                      type="button"
                      onClick={() => router.push('/login')}
                      className="w-full rounded-3xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-yellow-300"
                    >
                      Sign in
                    </button>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      New customer? <button type="button" onClick={() => router.push('/register')} className="font-semibold text-indigo-600 hover:text-indigo-500">Start here.</button>
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between rounded-3xl bg-slate-100 p-4 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200 text-xl text-slate-700 dark:bg-slate-800 dark:text-slate-200">{user.name?.charAt(0).toUpperCase() || 'A'}</div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                    >
                      Manage Profiles
                    </Link>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Your Lists</p>
                      <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                        <li><Link href="/wishlist" className="block rounded-2xl px-3 py-2 transition hover:bg-slate-100 dark:hover:bg-slate-800">Your Wishlist</Link></li>
                        <li><Link href="/wish-from-any" className="block rounded-2xl px-3 py-2 transition hover:bg-slate-100 dark:hover:bg-slate-800">Wish from Any Website</Link></li>
                        <li><Link href="/baby-wishlist" className="block rounded-2xl px-3 py-2 transition hover:bg-slate-100 dark:hover:bg-slate-800">Baby Wishlist</Link></li>
                        <li><Link href="/discover-style" className="block rounded-2xl px-3 py-2 transition hover:bg-slate-100 dark:hover:bg-slate-800">Discover Your Style</Link></li>
                        <li><Link href="/explore-showroom" className="block rounded-2xl px-3 py-2 transition hover:bg-slate-100 dark:hover:bg-slate-800">Explore Showroom</Link></li>
                      </ul>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Your Account</p>
                      <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                        <li><Link href="/profile" className="block rounded-2xl px-3 py-2 transition hover:bg-slate-100 dark:hover:bg-slate-800">Your Account</Link></li>
                        <li><Link href="/orders" className="block rounded-2xl px-3 py-2 transition hover:bg-slate-100 dark:hover:bg-slate-800">Your Orders</Link></li>
                        <li><Link href="/returns" className="block rounded-2xl px-3 py-2 transition hover:bg-slate-100 dark:hover:bg-slate-800">Returns</Link></li>
                      </ul>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                  >
                    Sign out
                  </button>
                </>
              )}
            </div>
          </div>
          <Link href="/cart" className="relative inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <span>Cart</span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">{count}</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
