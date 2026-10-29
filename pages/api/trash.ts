import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'
import { requireAdmin } from '../../lib/middleware'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const trashed = await prisma.trashedProduct.findMany({ orderBy: { deletedAt: 'desc' } })
    return res.status(200).json(trashed)
  }

  if (req.method === 'POST') {
    const { id, action } = req.body || {}
    if (!id || !action) return res.status(400).json({ error: 'id and action required' })

    const trashed = await prisma.trashedProduct.findUnique({ where: { id } })
    if (!trashed) return res.status(404).json({ error: 'Trashed product not found' })

    if (action === 'redpush') {
      // recreate product as red-pushed (inventory 0) using available details
      const product = await prisma.product.create({
        data: {
          title: trashed.title,
          description: trashed.description,
          price: trashed.price,
          sku: trashed.sku,
          image: trashed.image,
          category: trashed.category,
          inventory: 0,
        },
      })

      await prisma.notification.create({
        data: {
          title: 'Product Redpushed',
          message: `Product "${product.title}" has been re-listed as redpushed (out of stock).`,
          type: 'PRODUCT_REPUBLISHED',
        },
      })

      // remove trashed snapshot
      await prisma.trashedProduct.delete({ where: { id } })

      return res.status(200).json(product)
    }

    return res.status(400).json({ error: 'Unknown action' })
  }

  res.status(405).json({ error: 'Method not allowed' })
}

export default requireAdmin(handler)
