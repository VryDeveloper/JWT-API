import { Router } from 'express'
import { register, login, refresh, logout } from '../controllers/auth.controller'

const router = Router()

// Rotas públicas — não precisam de token
router.post('/register', register)  // Criar conta
router.post('/login', login)        // Fazer login → recebe accessToken + refreshToken
router.post('/refresh', refresh)    // Renovar accessToken com refreshToken
router.post('/logout', logout)      // Invalidar sessão

export default router
