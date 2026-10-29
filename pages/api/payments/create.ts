import type { NextApiRequest, NextApiResponse } from 'next'
import Razorpay from 'razorpay'
import { prisma } from '../../../lib/prisma'
import { rateLimit } from '../../../lib/rateLimit'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY || '',
  key_secret: process.env.RAZORPAY_SECRET || '',
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!rateLimit(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { orderId, amount } = req.body || {}

  try {
    let value = Number(amount || 0)
    let receipt = `rcpt_${Date.now()}`

    if (orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId } })
      if (!order) return res.status(404).json({ error: 'Order not found' })
      value = Number(order.total)
      receipt = order.orderNumber
    }

    const amountPaise = Math.round(value * 100)

    const rpOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt,
      payment_capture: 1,
    })

    return res.status(200).json({ order: rpOrder, key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || process.env.RAZORPAY_KEY })
  } catch (err: any) {
    console.error('Create Razorpay order error', err)
    return res.status(500).json({ error: 'Could not create razorpay order' })
  }
}
