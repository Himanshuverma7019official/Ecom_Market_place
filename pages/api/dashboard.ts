import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'
import { requireAdmin } from '../../lib/middleware'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const [orders, customers, products, notifications] = await Promise.all([
    prisma.order.findMany(),
    prisma.user.count(),
    prisma.product.count(),
    prisma.notification.findMany({ where: { isRead: false }, orderBy: { createdAt: 'desc' } }),
  ])

  const revenue = orders.reduce((sum: number, item: any) => sum + Number(item.total), 0)
  const pending = orders.filter((item: any) => item.status === 'NEW_ORDER').length
  const today = new Date()
  const todaysOrders = orders.filter((order: any) => {
    const created = new Date(order.createdAt)
    return created.toDateString() === today.toDateString()
  }).length

  return res.status(200).json({
    orders: orders.length,
    customers,
    products,
    revenue,
    pending,
    todaysOrders,
    notifications,
  })
}

export default requireAdmin(handler)
