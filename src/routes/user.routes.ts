import { Router } from 'express'
import { getAllUsers, getMe, getUserById, updateMe, deleteUser } from '../controllers/user.controller'
import { authenticate, authorize } from '../middlewares/auth.middleware'

const router = Router()

// Todas as rotas abaixo exigem token válido (authenticate)
router.get('/me', authenticate, getMe)           // Qualquer usuário logado
router.put('/me', authenticate, updateMe)        // Qualquer usuário logado

// Rotas abaixo exigem role ADMIN além do token
router.get('/', authenticate, authorize('ADMIN'), getAllUsers)
router.get('/:id', authenticate, authorize('ADMIN'), getUserById)
router.delete('/:id', authenticate, authorize('ADMIN'), deleteUser)

export default router
