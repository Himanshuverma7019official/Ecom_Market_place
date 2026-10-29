import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { prisma } from '../../../lib/prisma'
import { rateLimit } from '../../../lib/rateLimit'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!rateLimit(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body || {}
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ error: 'Missing fields' })

  const secret = process.env.RAZORPAY_SECRET || ''
  const expected = crypto.createHmac('sha256', secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex')
  if (expected !== razorpay_signature) return res.status(400).json({ error: 'Invalid signature' })

  try {
    // Try to find corresponding order by provided orderId
    if (orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payment: true } })
      if (order) {
        if (order.payment) {
          await prisma.payment.update({ where: { id: order.payment.id }, data: { status: 'PAID', transactionId: razorpay_payment_id, provider: 'RAZORPAY' } })
        } else {
          await prisma.payment.create({ data: { orderId: order.id, userId: order.userId, amount: order.total, currency: 'INR', provider: 'RAZORPAY', status: 'PAID', transactionId: razorpay_payment_id } })
        }
        await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'PAID' } })
        await prisma.notification.create({ data: { title: 'Payment Received', message: `Payment received for order ${order.orderNumber}`, type: 'PAYMENT', orderId: order.id } })
        return res.status(200).json({ ok: true })
      }
    }

    // Fallback: match by transaction id
    const existing = await prisma.payment.findFirst({ where: { transactionId: razorpay_payment_id } })
    if (existing) {
      await prisma.payment.update({ where: { id: existing.id }, data: { status: 'PAID' } })
      if (existing.orderId) await prisma.order.update({ where: { id: existing.orderId }, data: { paymentStatus: 'PAID' } })
      return res.status(200).json({ ok: true })
    }

    return res.status(404).json({ error: 'Order/payment not found' })
  } catch (err: any) {
    console.error('Confirm payment error', err)
    return res.status(500).json({ error: 'Server error' })
  }
}
