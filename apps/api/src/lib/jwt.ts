import jwt from 'jsonwebtoken'
import type { JwtPayload } from '@omstore/shared'

const SECRET = process.env.JWT_SECRET || 'fallback-secret'
const EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '8h') as jwt.SignOptions['expiresIn']

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload
}
