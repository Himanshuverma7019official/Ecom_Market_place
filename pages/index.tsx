import Link from 'next/link'
import ProductCard from '../components/ProductCard'
import { prisma } from '../lib/prisma'
import { GetServerSideProps } from 'next'

const fallbackProducts = [
  {
    id: 'fallback-001',
    title: 'Compact Bluetooth Speaker',
    description: 'Portable sound with deep bass for on-the-go listening.',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=800&q=80',
    category: 'Audio',
    rating: 4.3,
    reviews: 356,
  },
  {
    id: 'fallback-002',
    title: 'Smart Watch Band',
    description: 'Comfortable silicone band for everyday use.',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1508182314578-1c9365fe47ff?auto=format&fit=crop&w=800&q=80',
    category: 'Wearables',
    rating: 4.6,
    reviews: 219,
  },
  {
    id: 'fallback-003',
    title: 'Wireless Earbuds',
    description: 'Noise-isolating earbuds with long battery life.',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1520201163981-c7a191f5d9ff?auto=format&fit=crop&w=800&q=80',
    category: 'Audio',
    rating: 4.4,
    reviews: 514,
  },
  {
    id: 'fallback-004',
    title: 'USB-C Wall Charger',
    description: 'Fast charging adapter for all your devices.',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
    category: 'Power',
    rating: 4.7,
    reviews: 133,
  },
  {
    id: 'fallback-005',
    title: 'LED Desk Lamp',
    description: 'Adjustable light with USB charging port.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&w=800&q=80',
    category: 'Lighting',
    rating: 4.5,
    reviews: 88,
  },
  {
    id: 'fallback-006',
    title: 'Home Air Purifier',
    description: 'Keep your room fresh with HEPA filtration.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1581091870624-4b2a0165fe6f?auto=format&fit=crop&w=800&q=80',
    category: 'Home',
    rating: 4.2,
    reviews: 46,
  },
  {
    id: 'fallback-007',
    title: 'Smart Plug Mini',
    description: 'Control devices from your phone or voice assistant.',
    price: 22.99,
    image: 'https://images.unsplash.com/photo-1580914116074-57f7debd2f0a?auto=format&fit=crop&w=800&q=80',
    category: 'Smart Home',
    rating: 4.6,
    reviews: 72,
  },
  {
    id: 'fallback-008',
    title: 'Bluetooth Tracking Tag',
    description: 'Keep track of keys, bags, and other essentials.',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1585386959984-a415522a1a8f?auto=format&fit=crop&w=800&q=80',
    category: 'Accessories',
    rating: 4.1,
    reviews: 105,
  },
]

export default function Home({ products }: { products: any[] }) {
  const displayProducts = [...products, ...fallbackProducts].slice(0, 9)

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center rounded-[2rem] bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-10 text-white shadow-soft">
        <div className="space-y-6">
          <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-200">
            Professional electric marketplace
          </span>
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Power your lifestyle with premium electric gear.
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
            Browse top-rated smart devices, mobility products, and power accessories built for modern homes and active living.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/products" className="inline-flex rounded-full bg-indigo-500 px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-600">
              Explore products
            </Link>
            <Link href="/products" className="inline-flex rounded-full border border-white/20 bg-white/10 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
              Shop now
            </Link>
            <Link href="/cart" className="inline-flex rounded-full border border-white/20 bg-white/10 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
              View cart
            </Link>
          </div>
        </div>
        <div className="grid gap-4">
          {displayProducts[0] ? <ProductCard product={displayProducts[0]} highlight /> : null}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-indigo-600">Featured items</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Trending electric essentials</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Shop curated products designed for convenience, performance, and reliability.
          </p>
        </div>

        <div className="mt-6 mb-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]">
          {displayProducts.slice(1, 13).map((product) => (
            <Link key={product.id} href={`/products/${product.id}`} className="block w-full">
              <ProductCard product={product} compact />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
  return { props: { products: JSON.parse(JSON.stringify(products)) } }
}
