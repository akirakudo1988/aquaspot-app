import 'server-only'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPrismaClient = any

const globalForPrisma = globalThis as unknown as { prisma: AnyPrismaClient }

function createPrisma(): AnyPrismaClient {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require('../generated/prisma/client')
  const dbPath = path.resolve(process.cwd(), 'dev.db')
  const adapter = new PrismaBetterSqlite3({ url: dbPath })
  return new PrismaClient({ adapter })
}

export const prisma: AnyPrismaClient = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
