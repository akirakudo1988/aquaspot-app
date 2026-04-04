import { PrismaPg } from '@prisma/adapter-pg'
const { PrismaClient } = await import('../src/generated/prisma/client') as any
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const KUDO_USER_ID = 'cmnhpcv0g000004jrl5ms3uym' // 工藤 晶

// 工藤 晶以外のスポットを削除（レビュー・お気に入りはCascadeで自動削除）
const deleted = await prisma.spot.deleteMany({
  where: { registeredById: { not: KUDO_USER_ID } }
})
console.log(`✅ Deleted ${deleted.count} spots`)

// デモユーザーも削除
const deletedUsers = await prisma.user.deleteMany({
  where: { id: { in: ['cmnhp7vz50000nrsve4vcu36n', 'cmnhp7whn0001nrsvu0wzvedd'] } }
})
console.log(`✅ Deleted ${deletedUsers.count} demo users`)

await prisma.$disconnect()
