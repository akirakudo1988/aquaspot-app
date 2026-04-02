import 'server-only'
import { PrismaPg } from '@prisma/adapter-pg'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPrismaClient = any

const globalForPrisma = globalThis as unknown as { prisma: AnyPrismaClient }

function createPrisma(): AnyPrismaClient {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require('../generated/prisma/client')
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

export const prisma: AnyPrismaClient = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
