import type { NextApiRequest, NextApiResponse } from 'next'

type Entry = { tokens: number; last: number }

const STORE = new Map<string, Entry>()
const WINDOW = 60 * 1000 // 1 minute
const MAX_TOKENS = 60 // requests per window per IP

export function getIp(req: NextApiRequest) {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown'
}

export function rateLimit(req: NextApiRequest, res: NextApiResponse) {
  const ip = getIp(req)
  const now = Date.now()
  const ent = STORE.get(ip) || { tokens: MAX_TOKENS, last: now }
  const elapsed = now - ent.last
  const refill = Math.floor(elapsed / WINDOW) * MAX_TOKENS
  if (refill > 0) {
    ent.tokens = Math.min(MAX_TOKENS, ent.tokens + refill)
    ent.last = now
  }

  if (ent.tokens <= 0) {
    res.setHeader('Retry-After', '60')
    res.status(429).json({ error: 'Too many requests' })
    return false
  }

  ent.tokens -= 1
  ent.last = now
  STORE.set(ip, ent)
  return true
}

export default rateLimit
