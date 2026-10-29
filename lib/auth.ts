import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64UrlDecode(value: string) {
  const padding = value.length % 4
  const normalized = padding ? value + '='.repeat(4 - padding) : value
  return Buffer.from(normalized.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 100_000, 64, 'sha256').toString('hex')
  return `pbkdf2$100000$${salt}$${hash}`
}

export function comparePassword(password: string, hash: string) {
  const parts = hash.split('$')
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false

  const [, iterations, salt, expectedHash] = parts
  const candidateHash = crypto.pbkdf2Sync(password, salt, Number(iterations), 64, 'sha256').toString('hex')
  return crypto.timingSafeEqual(Buffer.from(candidateHash, 'hex'), Buffer.from(expectedHash, 'hex'))
}

export function signToken(payload: object) {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = base64UrlEncode(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 }))
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
  return `${header}.${body}.${signature}`
}

export function verifyToken(token: string) {
  const [header, body, signature] = token.split('.')
  if (!header || !body || !signature) throw new Error('Invalid token')

  const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new Error('Invalid token')

  const decoded = JSON.parse(base64UrlDecode(body).toString('utf8')) as { userId?: string; email?: string; role?: string; exp?: number }
  if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired')
  return decoded
}
