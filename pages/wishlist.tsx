import Link from 'next/link'
import { useRouter } from 'next/router'
import { FormEvent, useEffect, useState } from 'react'
import { createWishlistId, readUserWishlists, type UserWishlist, writeUserWishlists } from '../lib/wishlist'

export default function WishlistPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [authorized, setAuthorized] = useState(false)
  const [wishlists, setWishlists] = useState<UserWishlist[]>([])
  const [activeWishlistId, setActiveWishlistId] = useState('liked')
  const [newWishlistName, setNewWishlistName] = useState('')

  useEffect(() => {
    if (!router.isReady) return

    let storedUser: { id?: string } | null = null
    try {
      storedUser = JSON.parse(window.localStorage.getItem('limited-stock-user') || 'null')
    } catch {
      storedUser = null
    }

    if (!window.localStorage.getItem('limited-stock-token') || !storedUser?.id) {
      router.replace('/login?redirect=%2Fwishlist')
      return
    }

    const lists = readUserWishlists(storedUser.id)
    setUserId(storedUser.id)
    setWishlists(lists)
    setAuthorized(true)
  }, [router, router.isReady])

  const activeWishlist = wishlists.find((wishlist) => wishlist.id === activeWishlistId) || wishlists[0]

  function saveWishlists(updated: UserWishlist[]) {
    if (!userId) return
    writeUserWishlists(userId, updated)
    setWishlists(updated)
  }

  function createWishlist(event: FormEvent) {
    event.preventDefault()
    const name = newWishlistName.trim()
    if (!name) return

    const wishlist: UserWishlist = { id: createWishlistId(), name, items: [] }
    saveWishlists([...wishlists, wishlist])
    setActiveWishlistId(wishlist.id)
    setNewWishlistName('')
  }

  function removeItem(id: string) {
    if (!activeWishlist) return
    saveWishlists(wishlists.map((wishlist) => wishlist.id === activeWishlist.id
      ? { ...wishlist, items: wishlist.items.filter((item) => item.id !== id) }
      : wishlist))
  }

  if (!authorized) return null

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between border-b border-slate-200 pb-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600">Saved items</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Your wishlist</h1>
        </div>
        <span className="text-sm text-slate-500">{wishlists.length} {wishlists.length === 1 ? 'list' : 'lists'}</span>
      </div>

      <form onSubmit={createWishlist} className="flex flex-col gap-3 border-b border-slate-200 py-5 sm:flex-row">
        <input
          value={newWishlistName}
          onChange={(event) => setNewWishlistName(event.target.value)}
          aria-label="New wishlist name"
          placeholder="Name a wishlist"
          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3"
          maxLength={60}
          required
        />
        <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
          Create wishlist
        </button>
      </form>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 py-4" role="tablist" aria-label="Wishlists">
        {wishlists.map((wishlist) => (
          <button
            key={wishlist.id}
            type="button"
            role="tab"
            aria-selected={activeWishlist?.id === wishlist.id}
            onClick={() => setActiveWishlistId(wishlist.id)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${activeWishlist?.id === wishlist.id ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            {wishlist.name} ({wishlist.items.length})
          </button>
        ))}
      </div>

      {!activeWishlist?.items.length ? (
        <div className="py-16 text-center">
          <p className="text-lg font-semibold text-slate-900">{activeWishlist?.name || 'This list'} is empty</p>
          <p className="mt-2 text-sm text-slate-600">Save products from their product pages to add them here.</p>
          <Link href="/products" className="mt-6 inline-flex rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 py-6 sm:grid-cols-2 lg:grid-cols-3">
          {activeWishlist.items.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <Link href={`/products/${item.id}`} className="block">
                {item.image ? <img src={item.image} alt={item.title} className="h-56 w-full object-cover" /> : null}
                <div className="p-4">
                  <h2 className="font-semibold text-slate-900">{item.title}</h2>
                  <p className="mt-2 text-lg font-bold text-indigo-600">₹{Number(item.price).toFixed(2)}</p>
                </div>
              </Link>
              <div className="border-t border-slate-100 p-4">
                <button type="button" onClick={() => removeItem(item.id)} className="text-sm font-semibold text-rose-700 hover:underline">
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}