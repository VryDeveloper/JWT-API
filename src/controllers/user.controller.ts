import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../config/database'

// GET /users
// Retorna todos os usuários — apenas ADMIN pode acessar
export async function getAllUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json(users)
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

// GET /users/me
// Retorna os dados do próprio usuário autenticado
export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' })
      return
    }

    res.json(user)
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

// GET /users/:id
// Retorna um usuário pelo ID — apenas ADMIN pode acessar
export async function getUserById(req: Request, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' })
      return
    }

    res.json(user)
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

// PUT /users/me
// Atualiza nome ou senha do próprio usuário autenticado
export async function updateMe(req: Request, res: Response): Promise<void> {
  try {
    const { name, password } = req.body
    const updateData: { name?: string; password?: string } = {}

    if (name) updateData.name = name
    if (password) {
      if (password.length < 6) {
        res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' })
        return
      }
      updateData.password = await bcrypt.hash(password, 10)
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'Nenhum dado para atualizar' })
      return
    }

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, updatedAt: true },
    })

    res.json({ message: 'Perfil atualizado com sucesso', user })
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

// DELETE /users/:id
// Deleta um usuário — apenas ADMIN pode acessar
export async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } })

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' })
      return
    }

    await prisma.user.delete({ where: { id: req.params.id } })

    res.json({ message: 'Usuário deletado com sucesso' })
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
