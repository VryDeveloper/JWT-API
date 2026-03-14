import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'

// Extende o tipo Request do Express para incluir o usuário autenticado
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        email: string
        role: string
      }
    }
  }
}

// Middleware de autenticação
// Executa antes de qualquer rota protegida e verifica o token no header
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    // Espera o header: Authorization: Bearer <token>
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token não fornecido' })
      return
    }

    const token = authHeader.split(' ')[1]
    const payload = verifyAccessToken(token)

    // Injeta os dados do usuário no request para usar nos controllers
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}

// Middleware de autorização por role
// Uso: authorize('ADMIN') — só permite administradores
export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Acesso negado: permissão insuficiente' })
      return
    }
    next()
  }
}
