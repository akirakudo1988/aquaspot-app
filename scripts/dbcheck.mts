import { PrismaPg } from '@prisma/adapter-pg'
const { PrismaClient } = await import('../src/generated/prisma/client') as any
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })
const users = await prisma.user.findMany({ select: { id: true, name: true, email: true } })
console.log('=== Users ===')
console.log(JSON.stringify(users, null, 2))
const spots = await prisma.spot.findMany({ include: { registeredBy: { select: { name: true } } } })
console.log('=== Spots ===')
console.log(JSON.stringify(spots.map((s: any) => ({ id: s.id, name: s.name, user: s.registeredBy.name })), null, 2))
await prisma.$disconnect()
