import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { prisma } from '../../../lib/prisma'
import { rateLimit } from '../../../lib/rateLimit'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const payload = req.body || {}

  // Rate limit webhooks (protect endpoint)
  if (!rateLimit(req, res)) return

  // Verify Razorpay signature if present
  try {
    const razorSecret = process.env.RAZORPAY_SECRET || ''
    const signatureHeader = (req.headers['x-razorpay-signature'] as string) || (req.headers['x-razorpay_signature'] as string) || ''
    if (signatureHeader && razorSecret) {
      const bodyString = JSON.stringify(req.body)
      const expectedHex = crypto.createHmac('sha256', razorSecret).update(bodyString).digest('hex')
      const expectedBase64 = crypto.createHmac('sha256', razorSecret).update(bodyString).digest('base64')
      const match = signatureHeader === expectedHex || signatureHeader === expectedBase64
      if (!match) {
        console.warn('Webhook signature mismatch')
        return res.status(400).json({ error: 'Invalid signature' })
      }
    }
  } catch (err) {
    console.error('Signature verification failed', err)
    return res.status(400).json({ error: 'Signature verification failed' })
  }

  // Expecting a payload with at least: { status: 'paid', orderId?: string, transactionId?: string }
  if (payload.status === 'paid' || (payload.payload && payload.payload.payment && payload.payload.payment.entity && payload.payload.payment.entity.status === 'captured')) {
    const orderId = payload.orderId || payload.order_id || payload.order?.id || (payload.payload?.payment?.entity?.order_id as string) || null
    const transactionId = payload.transactionId || payload.txnId || payload.razorpay_payment_id || payload.payment_id || (payload.payload?.payment?.entity?.id as string) || null

    try {
      if (orderId) {
        const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payment: true } })
        if (order) {
          if (order.payment) {
            await prisma.payment.update({ where: { id: order.payment.id }, data: { status: 'PAID', transactionId: transactionId || order.payment.transactionId } })
          } else {
            await prisma.payment.create({ data: { orderId: order.id, userId: order.userId, amount: order.total, currency: 'INR', provider: payload.provider || 'RAZORPAY', status: 'PAID', transactionId: transactionId || undefined } })
          }

          await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'PAID' } })

          await prisma.notification.create({ data: { title: 'Payment Received', message: `Payment received for order ${order.orderNumber}`, type: 'PAYMENT', orderId: order.id } })

          return res.status(200).json({ received: true, updated: true })
        }
      }

      if (transactionId) {
        const existing = await prisma.payment.findFirst({ where: { transactionId } })
        if (existing) {
          await prisma.payment.update({ where: { id: existing.id }, data: { status: 'PAID' } })
          if (existing.orderId) await prisma.order.update({ where: { id: existing.orderId }, data: { paymentStatus: 'PAID' } })
          return res.status(200).json({ received: true, updated: true })
        }
      }

      // No matching order/payment found; acknowledge webhook so provider won't retry repeatedly
      return res.status(200).json({ received: true, message: 'No matching order/payment found' })
    } catch (err: any) {
      console.error('Webhook processing error:', err)
      return res.status(500).json({ error: 'Webhook processing failed' })
    }
  }

  return res.status(200).json({ received: true, message: 'Webhook received' })
}
