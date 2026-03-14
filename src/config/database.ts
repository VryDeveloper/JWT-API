import { PrismaClient } from '@prisma/client'

// Singleton: garante que só existe uma conexão com o banco durante toda a execução
const prisma = new PrismaClient()

export default prisma
