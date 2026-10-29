import type { NextApiRequest, NextApiResponse } from 'next'
import PDFDocument from 'pdfkit'
import { prisma } from '../../../lib/prisma'
import { rateLimit } from '../../../lib/rateLimit'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  if (!rateLimit(req, res)) return

  const id = req.query.id as string
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, address: true, payment: true },
  })

  if (!order) return res.status(404).json({ error: 'Order not found' })

  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`)

  doc.fontSize(20).text('Limited Stock Marketplace', { align: 'left' })
  doc.moveDown()
  doc.fontSize(12).text(`Invoice: ${order.orderNumber}`)
  doc.text(`Order Date: ${new Date(order.createdAt).toLocaleString()}`)
  doc.text(`Customer: ${order.address?.fullName || 'N/A'}`)
  doc.text(`Email: ${order.address?.email || ''}`)
  doc.moveDown()

  doc.fontSize(14).text('Items')
  doc.moveDown(0.5)
  order.items.forEach((it: any) => {
    doc.fontSize(12).text(`${it.title} — ${it.quantity} x ₹${it.price.toFixed(2)} = ₹${(it.quantity * it.price).toFixed(2)}`)
  })
  doc.moveDown()

  doc.text(`Subtotal: ₹${order.subtotal.toFixed(2)}`)
  doc.text(`GST: ₹${order.tax.toFixed(2)}`)
  doc.text(`Shipping: ₹${order.shipping.toFixed(2)}`)
  doc.text(`Discount: -₹${order.discount.toFixed(2)}`)
  doc.moveDown()
  doc.fontSize(16).text(`Grand Total: ₹${order.total.toFixed(2)}`)

  doc.moveDown(2)
  doc.fontSize(12).text(`Payment Status: ${order.paymentStatus}`)
  doc.text(`Order Status: ${order.status}`)

  doc.end()
  doc.pipe(res)
}
