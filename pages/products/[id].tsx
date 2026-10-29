import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useCart } from '../../contexts/CartContext'
import { prisma } from '../../lib/prisma'
import { readUserWishlists, writeUserWishlists, type UserWishlist } from '../../lib/wishlist'

export default function ProductPage({ product }: { product: any }) {
  const { addItem } = useCart()
  const router = useRouter()
  const [added, setAdded] = useState(false)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [wishlisted, setWishlisted] = useState(false)
  const [wishlistMessage, setWishlistMessage] = useState('')
  const [customWishlists, setCustomWishlists] = useState<UserWishlist[]>([])
  const [listPickerOpen, setListPickerOpen] = useState(false)

  useEffect(() => {
    if (!window.localStorage.getItem('limited-stock-token')) {
      setUser(null)
      return
    }

    const storedUser = window.localStorage.getItem('limited-stock-user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(typeof parsedUser.id === 'string' ? parsedUser : null)
      } catch {
        setUser(null)
      }
    }
  }, [])

  useEffect(() => {
    if (!product?.id || !user?.id) {
      setWishlisted(false)
      return
    }

    try {
      const wishlists = readUserWishlists(user.id)
      const liked = wishlists.find((wishlist) => wishlist.id === 'liked')
      setWishlisted(Boolean(liked?.items.some((item) => item.id === product.id)))
      setCustomWishlists(wishlists.filter((wishlist) => wishlist.id !== 'liked'))
    } catch {
      setWishlisted(false)
      setCustomWishlists([])
    }
  }, [product?.id, user?.id])

  function toggleWishlist() {
    if (!user?.id) return

    const wishlists = readUserWishlists(user.id)
    const liked = wishlists.find((wishlist) => wishlist.id === 'liked')
    if (!liked) return

    const alreadySaved = liked.items.some((item) => item.id === product.id)
    liked.items = alreadySaved
      ? liked.items.filter((item) => item.id !== product.id)
      : [...liked.items, { id: product.id, title: product.title, price: product.price, image: product.image }]

    writeUserWishlists(user.id, wishlists)
    setWishlisted(!alreadySaved)
    setWishlistMessage(alreadySaved ? 'Removed from wishlist' : 'Added to wishlist')
  }

  function toggleNamedWishlist(wishlistId: string) {
    if (!user?.id) return

    const wishlists = readUserWishlists(user.id)
    const wishlist = wishlists.find((item) => item.id === wishlistId)
    if (!wishlist) return

    const alreadySaved = wishlist.items.some((item) => item.id === product.id)
    wishlist.items = alreadySaved
      ? wishlist.items.filter((item) => item.id !== product.id)
      : [...wishlist.items, { id: product.id, title: product.title, price: product.price, image: product.image }]

    writeUserWishlists(user.id, wishlists)
    setCustomWishlists(wishlists.filter((item) => item.id !== 'liked'))
    setWishlistMessage(alreadySaved ? `Removed from ${wishlist.name}` : `Added to ${wishlist.name}`)
  }

  if (!product) return <div className="p-6">Product not found</div>

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="relative overflow-hidden rounded-[1.5rem] bg-slate-50 p-4">
            <img src={product.image} alt={product.title} className="h-[28rem] w-full rounded-[1.25rem] object-cover" />
            {user ? (
              <div className="absolute right-7 top-7 flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleWishlist}
                  aria-label={wishlisted ? 'Remove from Liked' : 'Add to Liked'}
                  aria-pressed={wishlisted}
                  title={wishlisted ? 'Remove from Liked' : 'Add to Liked'}
                  className={`flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-105 ${wishlisted ? 'text-rose-600' : 'text-slate-600'}`}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setListPickerOpen((open) => !open)}
                  aria-expanded={listPickerOpen}
                  className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-md hover:bg-slate-50"
                >
                  Save to list
                </button>
                {listPickerOpen ? (
                  <div className="absolute right-0 top-full z-10 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                    {customWishlists.length ? customWishlists.map((wishlist) => {
                      const saved = wishlist.items.some((item) => item.id === product.id)
                      return (
                        <button
                          key={wishlist.id}
                          type="button"
                          onClick={() => toggleNamedWishlist(wishlist.id)}
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                        >
                          {saved ? 'Remove from' : 'Add to'} {wishlist.name}
                        </button>
                      )
                    }) : (
                      <p className="px-3 py-2 text-sm text-slate-600">No named lists yet.</p>
                    )}
                    <button
                      type="button"
                      onClick={() => router.push('/wishlist')}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-indigo-600 hover:bg-slate-100"
                    >
                      Create a wishlist
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700">4.5★</span>
            <span>{product.reviews || 1200} ratings</span>
            <span>•</span>
            <span>{product.category}</span>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600">{product.category}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{product.title}</h1>
            <p className="mt-3 text-lg text-slate-600">{product.description || product.tagline || 'No product description available.'}</p>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-end gap-3">
              <p className="text-4xl font-bold text-slate-900">₹{Number(product.price).toFixed(2)}</p>
              <p className="text-lg text-slate-500 line-through">₹{(Number(product.price) + 2000).toFixed(2)}</p>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">25% off</span>
            </div>
            <p className="mt-3 text-sm text-emerald-700">Inclusive of all taxes</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">Free delivery</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">Cash on delivery</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{product.inventory > 0 ? `In stock (${product.inventory})` : 'Out of stock'}</span>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">About this item</h2>
            <p className="mt-4 text-slate-600">{product.description || product.tagline || 'This product has no additional description yet.'}</p>
            <p className="sr-only" aria-live="polite">{wishlistMessage}</p>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Delivery</h3>
            <p className="mt-2 text-sm text-slate-600">Delivered in 2–4 days • Ships from Delhi • Free shipping above ₹999</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              className="flex-1 rounded-full bg-indigo-600 px-6 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-indigo-700"
              onClick={() => {
                if (!user) {
                  router.push('/login')
                  return
                }
                addItem({ id: product.id, title: product.title, price: product.price })
                setAdded(true)
                setTimeout(() => setAdded(false), 1500)
              }}
            >
              {added ? 'Added to cart ✓' : 'Add to cart'}
            </button>
            <button
              className="flex-1 rounded-full border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-slate-800 transition hover:bg-slate-50"
              onClick={() => {
                if (!user) {
                  router.push('/login')
                  return
                }
                addItem({ id: product.id, title: product.title, price: product.price })
                router.push('/cart')
              }}
            >
              Buy now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = ctx.params?.id as string
  const product = await prisma.product.findUnique({ where: { id } })

  if (!product) {
    return { notFound: true }
  }

  return {
    props: {
      product: JSON.parse(JSON.stringify(product)),
    },
  }
}
