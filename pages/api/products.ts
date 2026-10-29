import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'
import { requireAdmin } from '../../lib/middleware'

const adminHandler = requireAdmin(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { title, description, price, image, category, inventory, sku } = req.body || {}
    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: Number(price),
        image,
        category,
        inventory: Number(inventory || 100),
        sku,
      },
    })
    return res.status(201).json(product)
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {}
    if (!id) {
      return res.status(400).json({ error: 'Product ID required' })
    }
    
    try {
      const product = await prisma.product.findUnique({ where: { id } })
      if (!product) return res.status(404).json({ error: 'Product not found' })

      // create trashed snapshot
      await prisma.trashedProduct.create({
        data: {
          originalId: product.id,
          title: product.title,
          description: product.description || '',
          price: product.price,
          sku: product.sku,
          image: product.image || '',
          category: product.category || '',
          inventory: product.inventory,
        },
      })

      // create a notification entry
      await prisma.notification.create({
        data: {
          title: 'Product Trashed',
          message: `Product "${product.title}" was moved to Trash by admin.`,
          type: 'PRODUCT_TRASHED',
        },
      })

      // delete original product
      await prisma.product.delete({ where: { id } })
      return res.status(200).json({ success: true })
    } catch (error) {
      return res.status(404).json({ error: 'Product not found' })
    }
  }

  if (req.method === 'PATCH') {
    const { id, title, description, price, image, category, inventory, sku } = req.body || {}
    if (!id) return res.status(400).json({ error: 'Product ID required' })

    try {
      const product = await prisma.product.update({
        where: { id },
        data: {
          title,
          description,
          price: price !== undefined ? Number(price) : undefined,
          image,
          category,
          inventory: inventory !== undefined ? Number(inventory) : undefined,
          sku,
        },
      })
      return res.status(200).json(product)
    } catch (error) {
      return res.status(404).json({ error: 'Product not found' })
    }
  }

  res.status(405).json({ error: 'Method not allowed' })
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
    return res.status(200).json(products)
  }

  return adminHandler(req, res)
}

