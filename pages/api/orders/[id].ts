import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { requireAdmin, requireAuth } from '../../../lib/middleware'

const getOrderHandler = requireAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.id as string
  const user = (req as any).user as { userId: string; role?: string }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, address: true, payment: true, notifications: true },
  })
  if (!order) return res.status(404).json({ error: 'Order not found' })
  if (user.role !== 'ADMIN' && order.userId !== user.userId) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  return res.status(200).json(order)
})

const updateOrderHandler = requireAdmin(async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.id as string
  const { status, paymentStatus, notes } = req.body || {}
  const updated = await prisma.order.update({
    where: { id },
    data: { status, paymentStatus, notes },
    include: { items: true, address: true, payment: true },
  })
  return res.status(200).json(updated)
})

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return getOrderHandler(req, res)
  if (req.method === 'PATCH') return updateOrderHandler(req, res)
  return res.status(405).json({ error: 'Method not allowed' })
}
