export type WishlistItem = {
  id: string
  title: string
  price: number
  image?: string | null
}

export type UserWishlist = {
  id: string
  name: string
  items: WishlistItem[]
}

function storageKey(userId: string) {
  return `limited-stock-wishlist:${userId}`
}

function defaultWishlist(): UserWishlist {
  return { id: 'liked', name: 'Liked', items: [] }
}

export function readUserWishlists(userId: string): UserWishlist[] {
  let stored: unknown
  try {
    stored = JSON.parse(window.localStorage.getItem(storageKey(userId)) || 'null')
  } catch {
    stored = null
  }

  if (!Array.isArray(stored)) return [defaultWishlist()]

  const isWishlistCollection = stored.some((entry) =>
    entry && typeof entry === 'object' && typeof entry.name === 'string' && Array.isArray(entry.items),
  )

  if (!isWishlistCollection) {
    const migrated = [{ ...defaultWishlist(), items: stored.filter((item) => item && typeof item.id === 'string') }]
    writeUserWishlists(userId, migrated)
    return migrated
  }

  const wishlists = stored.filter((entry): entry is UserWishlist =>
    entry && typeof entry === 'object' && typeof entry.id === 'string' && typeof entry.name === 'string' && Array.isArray(entry.items),
  )
  return wishlists.some((wishlist) => wishlist.id === 'liked')
    ? wishlists
    : [defaultWishlist(), ...wishlists]
}

export function writeUserWishlists(userId: string, wishlists: UserWishlist[]) {
  window.localStorage.setItem(storageKey(userId), JSON.stringify(wishlists))
}

export function createWishlistId() {
  return `wishlist-${Date.now()}-${Math.random().toString(36).slice(2)}`
}