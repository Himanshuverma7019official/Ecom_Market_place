import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="text-xl font-semibold text-white">Limited Stock Marketplace</p>
            <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
              A modern marketplace for electric devices, mobility accessories, and smart home essentials.
            </p>
          </div>
          <div className="grid gap-3 text-sm">
            <p className="font-semibold text-white">Company</p>
            <Link href="/about" className="hover:text-white">About</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
          </div>
          <div className="grid gap-3 text-sm">
            <p className="font-semibold text-white">Support</p>
            <Link href="/contact" className="hover:text-white">Contact</Link>
            <Link href="/faq" className="hover:text-white">FAQ</Link>
            <Link href="/cart" className="hover:text-white">Cart</Link>
          </div>
        </div>
        <div className="mt-10 border-t border-slate-800 pt-6 text-sm text-slate-500">
          © {new Date().getFullYear()} Limited Stock Marketplace. Built for modern electric shopping.
        </div>
      </div>
    </footer>
  )
}
