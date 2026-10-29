import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'
import { rateLimit } from '../../lib/rateLimit'
import { requireAuth } from '../../lib/middleware'

function generateOrderNumber() {
  const date = new Date()
  return `EST${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 9000) + 1000)}`
}

const getOrdersHandler = requireAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  const user = (req as any).user as { userId: string; role?: string }
  const requestedUserId = typeof req.query.userId === 'string' ? req.query.userId : undefined

  if (user.role !== 'ADMIN' && requestedUserId && requestedUserId !== user.userId) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const where = user.role === 'ADMIN' && !requestedUserId
    ? undefined
    : { userId: requestedUserId || user.userId }
  const orders = await prisma.order.findMany({
    where,
    include: { items: true, address: true, payment: true },
    orderBy: { createdAt: 'desc' },
  })
  return res.status(200).json(orders)
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!rateLimit(req, res)) return
  if (req.method === 'POST') {
    const { userId, items, address, paymentMethod = 'COD' } = req.body || {}

    // Basic payload validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' })
    }

    for (const it of items) {
      if (!it || !it.title || typeof it.price === 'undefined' || typeof it.quantity === 'undefined') {
        return res.status(400).json({ error: 'Invalid cart item format' })
      }
      if (Number.isNaN(Number(it.price)) || Number(it.price) < 0) return res.status(400).json({ error: 'Invalid item price' })
      if (!Number.isInteger(Number(it.quantity)) || Number(it.quantity) <= 0) return res.status(400).json({ error: 'Invalid item quantity' })
    }

    const requiredAddr = ['fullName', 'phone', 'email', 'addressLine1', 'state', 'city', 'pinCode']
    for (const k of requiredAddr) {
      if (!address || !address[k]) return res.status(400).json({ error: `Missing address field: ${k}` })
    }

    const subtotal = items.reduce((sum: number, i: any) => sum + Number(i.price) * Number(i.quantity), 0)
    const gst = subtotal * 0.18
    const shipping = subtotal > 0 ? 40 : 0
    const discount = subtotal > 500 ? 50 : 0
    const total = subtotal + gst + shipping - discount

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: userId || null,
        paymentMethod,
        subtotal,
        shipping,
        discount,
        tax: gst,
        total,
        paymentStatus: paymentMethod === 'COD' ? 'PAID' : 'PENDING',
        status: 'NEW_ORDER',
        address: {
          create: {
            fullName: address?.fullName,
            phone: address?.phone,
            email: address?.email,
            addressLine1: address?.addressLine1,
            state: address?.state,
            city: address?.city,
            pinCode: address?.pinCode,
          },
        },
        items: {
          create: items.map((item: any) => ({
            title: item.title,
            image: item.image,
            price: Number(item.price),
            quantity: Number(item.quantity),
            productId: item.productId || null,
          })),
        },
        payment: {
          create: {
            userId: userId || null,
            amount: total,
            currency: 'INR',
            provider: paymentMethod === 'COD' ? 'CASH_ON_DELIVERY' : 'Razorpay',
            status: paymentMethod === 'COD' ? 'PAID' : 'PENDING',
          },
        },
        notifications: {
          create: {
            title: 'New Order Received',
            message: 'A new order has been placed and is awaiting review.',
            type: 'NEW_ORDER',
          },
        },
      },
      include: {
        items: true,
        address: true,
        payment: true,
      },
    })

    return res.status(201).json(order)
  }

  if (req.method === 'GET') {
    if (!rateLimit(req, res)) return
    return getOrdersHandler(req, res)
  }

  res.status(405).json({ error: 'Method not allowed' })
}
