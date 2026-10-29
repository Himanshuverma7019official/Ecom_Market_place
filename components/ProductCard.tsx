import React from 'react'

export default function ProductCard({ product, highlight, compact }: { product: any; highlight?: boolean; compact?: boolean }) {
  return (
    <div className={`group w-full overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lg ${highlight ? 'lg:col-span-2' : ''}`}>
      <div className={`relative overflow-hidden bg-slate-100 ${compact ? 'h-32' : 'h-64'}`}>
        <img
          src={product.image}
          alt={product.title}
          className={`w-full object-cover transition duration-500 group-hover:scale-105 ${compact ? 'h-32' : 'h-64'}`}
        />
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700 shadow">
          {product.category}
        </div>
      </div>
      <div className={`${compact ? 'p-4' : 'p-6'}`}>
        <div className="flex items-start justify-between gap-3">
          <h3 className={`${compact ? 'text-sm' : 'text-xl'} font-semibold text-slate-900 line-clamp-2`}>{product.title}</h3>
          <span className={`${compact ? 'text-sm' : 'text-lg'} font-bold text-indigo-600`}>₹{Number(product.price).toFixed(2)}</span>
        </div>
        <p className={`${compact ? 'mt-2 text-xs leading-5' : 'mt-3 text-sm leading-6'} text-slate-600 line-clamp-2`}>
          {product.description || product.tagline}
        </p>
        <div className={`mt-4 flex items-center justify-between ${compact ? 'text-[10px]' : 'text-sm'} text-slate-500`}>
          <span>{product.rating ?? '—'} ★</span>
          <span>{product.reviews ?? 0} reviews</span>
        </div>
      </div>
    </div>
  )
}
