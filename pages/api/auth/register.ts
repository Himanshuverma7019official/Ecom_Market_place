import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { hashPassword, signToken } from '../../../lib/auth'
import { rateLimit } from '../../../lib/rateLimit'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!rateLimit(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, email, password } = req.body || {}
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(409).json({ error: 'User already exists' })

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword(password),
      role: 'CUSTOMER',
    },
  })

  const token = signToken({ userId: user.id, email: user.email, role: user.role })
  return res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
}
