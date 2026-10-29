import Link from 'next/link'
import { useRouter } from 'next/router'

export default function OrderSuccessPage() {
  const router = useRouter()
  const orderNumber = router.query.order || 'EST-1001'
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] bg-white p-10 text-center shadow-soft">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">✓</div>
        <h1 className="mt-6 text-3xl font-bold text-slate-900">Payment Successful</h1>
        <p className="mt-3 text-slate-600">Your order has been placed successfully.</p>
        <div className="mt-8 rounded-2xl bg-slate-50 p-6 text-left">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Order ID</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{orderNumber}</p>
          <p className="mt-4 text-sm text-slate-600">Expected delivery: 3-5 business days</p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/" className="rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white">Continue shopping</Link>
          <Link href="/orders" className="rounded-full border border-slate-200 px-6 py-3 font-semibold text-slate-700">My orders</Link>
        </div>
      </div>
    </div>
  )
}
