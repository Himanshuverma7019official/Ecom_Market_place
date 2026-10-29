import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { comparePassword, signToken } from '../../../lib/auth'
import { rateLimit } from '../../../lib/rateLimit'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!rateLimit(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' })
  const valid = comparePassword(password, user.password)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  const token = signToken({ userId: user.id, email: user.email, role: user.role })
  return res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
}
