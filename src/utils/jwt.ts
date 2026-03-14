import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

interface TokenPayload {
  userId: string
  email: string
  role: string
}

// Gera o Access Token (curta duração - 15 min)
// Enviado no header Authorization de cada request protegido
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  })
}

// Gera o Refresh Token (longa duração - 7 dias)
// Usado para renovar o Access Token sem precisar fazer login novamente
export function generateRefreshToken(): string {
  return uuidv4() // Token aleatório único armazenado no banco
}

// Valida e decodifica o Access Token
// Lança erro se inválido ou expirado
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload
}
