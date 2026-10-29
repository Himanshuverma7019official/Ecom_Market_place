import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const products = [
    { title: 'Electric Scooter X1', description: 'High-performance city scooter.', price: 349.99, image: 'https://images.unsplash.com/photo-1564468781195-9fa7fc760f4f?auto=format&fit=crop&w=900&q=80', category: 'Mobility', inventory: 40, sku: 'EST-SC-001' },
    { title: 'Portable Power Bank Pro', description: 'Fast charging and travel-ready.', price: 49.99, image: 'https://images.unsplash.com/photo-1523475496153-3d6cc2622cc5?auto=format&fit=crop&w=900&q=80', category: 'Power', inventory: 80, sku: 'EST-PB-001' },
    { title: 'Noise-Canceling Headphones', description: 'Premium listening experience.', price: 129.99, image: 'https://images.unsplash.com/photo-1518449460371-1d33bf46b84f?auto=format&fit=crop&w=900&q=80', category: 'Audio', inventory: 60, sku: 'EST-HD-001' },
    { title: 'Smart Home Hub', description: 'Centralized smart control gateway.', price: 179.99, image: 'https://images.unsplash.com/photo-1580894908361-1b3d37f84d53?auto=format&fit=crop&w=900&q=80', category: 'Smart Home', inventory: 35, sku: 'EST-HH-001' },
  ]

  for (const item of products) {
    await prisma.product.upsert({
      where: { sku: item.sku },
      update: {},
      create: item,
    })
  }

  return res.status(200).json({ done: true })
}
