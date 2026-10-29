import Link from 'next/link'
import ProductCard from '../components/ProductCard'
import { prisma } from '../lib/prisma'
import { GetServerSideProps } from 'next'

export default function ProductsPage({ products }: { products: any[] }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-600">Shop</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Shop premium electric essentials</h1>
        </div>
        <p className="max-w-xl text-sm text-slate-600">Search, compare, and buy high-performance electric products with a smooth checkout experience.</p>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.id}`}>
            <ProductCard product={product} />
          </Link>
        ))}
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
  return { props: { products: JSON.parse(JSON.stringify(products)) } }
}
