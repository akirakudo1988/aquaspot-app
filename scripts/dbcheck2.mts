import { PrismaPg } from '@prisma/adapter-pg'
const { PrismaClient } = await import('../src/generated/prisma/client') as any
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })
const spots = await prisma.spot.findMany()
for (const s of spots) {
  console.log(`${s.name} | ${s.address} | lat:${s.lat} lng:${s.lng}`)
}
await prisma.$disconnect()
