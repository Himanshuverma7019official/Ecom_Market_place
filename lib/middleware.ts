import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from './auth'

export function getTokenFromHeader(req: NextApiRequest) {
  const auth = (req.headers.authorization as string) || ''
  const m = auth.match(/^Bearer (.+)$/)
  return m ? m[1] : null
}

export function requireAdmin(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<any> | any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const token = getTokenFromHeader(req)
      if (!token) return res.status(401).json({ error: 'Unauthorized' })
      const payload = verifyToken(token)
      if ((payload as any).role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })
      ;(req as any).user = payload
      return handler(req, res)
    } catch (err: any) {
      return res.status(401).json({ error: err?.message || 'Unauthorized' })
    }
  }
}

export function requireAuth(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<any> | any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const token = getTokenFromHeader(req)
      if (!token) return res.status(401).json({ error: 'Unauthorized' })
      const payload = verifyToken(token)
      ;(req as any).user = payload
      return handler(req, res)
    } catch (err: any) {
      return res.status(401).json({ error: err?.message || 'Unauthorized' })
    }
  }
}

export default null
