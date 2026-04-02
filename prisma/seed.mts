// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { PrismaClient } = (await import('../src/generated/prisma/client')) as any
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  console.log('🌱 Seeding database...')

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      name: '田中アリス',
      email: 'alice@example.com',
      password: await bcrypt.hash('password123', 12),
    },
  })

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      name: '鈴木ボブ',
      email: 'bob@example.com',
      password: await bcrypt.hash('password123', 12),
    },
  })

  const spotsData = [
    {
      name: '渋谷駅前 水素水サーバー',
      address: '東京都渋谷区道玄坂1-1-1',
      prefecture: '東京都',
      city: '渋谷区',
      waterTypes: JSON.stringify(['水素水']),
      operatingHours: '7:00〜22:00',
      notes: '渋谷駅ハチ公口から徒歩1分。清潔で使いやすいです。',
      lat: 35.658,
      lng: 139.7016,
      registeredById: alice.id,
    },
    {
      name: '新宿中央公園 シリカ水スポット',
      address: '東京都新宿区西新宿2-11',
      prefecture: '東京都',
      city: '新宿区',
      waterTypes: JSON.stringify(['シリカ水', '水素水']),
      operatingHours: '6:00〜22:00',
      notes: '公園内の給水スポットです。無料で利用できます。',
      lat: 35.6918,
      lng: 139.6921,
      registeredById: alice.id,
    },
    {
      name: '梅田スカイビル バナジウム水',
      address: '大阪府大阪市北区大淀中1-1-88',
      prefecture: '大阪府',
      city: '大阪市北区',
      waterTypes: JSON.stringify(['バナジウム水']),
      operatingHours: '10:00〜18:00',
      notes: 'スカイビル1Fロビーにあります。見学者も無料利用可。',
      lat: 34.7056,
      lng: 135.49,
      registeredById: bob.id,
    },
    {
      name: '京都御所前 水素・シリカ複合スポット',
      address: '京都府京都市上京区京都御苑3',
      prefecture: '京都府',
      city: '京都市上京区',
      waterTypes: JSON.stringify(['水素水', 'シリカ水']),
      operatingHours: '9:00〜17:00（年末年始休業）',
      lat: 35.0253,
      lng: 135.7623,
      registeredById: bob.id,
    },
    {
      name: '名古屋栄 バナジウム天然水サーバー',
      address: '愛知県名古屋市中区栄3-4-5',
      prefecture: '愛知県',
      city: '名古屋市中区',
      waterTypes: JSON.stringify(['バナジウム水']),
      operatingHours: '10:00〜20:00',
      phone: '052-123-4567',
      notes: '栄交差点すぐ。ショッピングモール1F入口付近。',
      lat: 35.1706,
      lng: 136.9068,
      registeredById: alice.id,
    },
    {
      name: '横浜みなとみらい シリカ水スポット',
      address: '神奈川県横浜市西区みなとみらい2-2-1',
      prefecture: '神奈川県',
      city: '横浜市西区',
      waterTypes: JSON.stringify(['シリカ水']),
      operatingHours: '24時間',
      lat: 35.4561,
      lng: 139.6312,
      registeredById: bob.id,
    },
    {
      name: '福岡天神 水素水スタンド',
      address: '福岡県福岡市中央区天神2-1-1',
      prefecture: '福岡県',
      city: '福岡市中央区',
      waterTypes: JSON.stringify(['水素水', 'バナジウム水']),
      operatingHours: '9:00〜21:00',
      notes: '天神コアB1Fにあります。',
      lat: 33.5904,
      lng: 130.3987,
      registeredById: alice.id,
    },
    {
      name: '札幌大通 ミネラルウォータースポット',
      address: '北海道札幌市中央区大通西3',
      prefecture: '北海道',
      city: '札幌市中央区',
      waterTypes: JSON.stringify(['シリカ水']),
      operatingHours: '5月〜10月 10:00〜17:00',
      notes: '大通公園内の季節限定スポットです。',
      lat: 43.0621,
      lng: 141.3544,
      registeredById: bob.id,
    },
  ]

  const createdSpots = []
  for (const spotData of spotsData) {
    const spot = await prisma.spot.create({ data: spotData })
    createdSpots.push(spot)
  }

  const reviewsData = [
    { spotIdx: 0, userId: bob.id, rating: 5, comment: '水質がとても良く、毎日利用しています。清潔感もあって安心です。' },
    { spotIdx: 1, userId: bob.id, rating: 5, comment: '公園散歩のついでに利用できてお気に入りです。' },
    { spotIdx: 2, userId: alice.id, rating: 4, comment: 'バナジウム水が気軽に飲めるのが嬉しい。スタッフの方も親切。' },
    { spotIdx: 3, userId: alice.id, rating: 5, comment: '御所の散歩後に最高！水が本当に美味しかったです。' },
    { spotIdx: 3, userId: bob.id, rating: 4, comment: '観光の合間に立ち寄れて便利。もう少し営業時間が長いと嬉しい。' },
    { spotIdx: 4, userId: bob.id, rating: 3, comment: '水は美味しいですが、混雑することがあります。' },
    { spotIdx: 5, userId: alice.id, rating: 5, comment: '24時間利用できるのが最高です！夜遅くも安心。' },
    { spotIdx: 6, userId: bob.id, rating: 4, comment: '天神の中心部にあってアクセス抜群。水素水とバナジウム水が両方飲める！' },
    { spotIdx: 7, userId: alice.id, rating: 4, comment: '夏の大通公園散歩のおともに最適。季節限定なのが残念。' },
  ]

  for (const r of reviewsData) {
    await prisma.review.create({
      data: {
        spotId: createdSpots[r.spotIdx].id,
        userId: r.userId,
        rating: r.rating,
        comment: r.comment,
      },
    })
  }

  const favoritesData = [
    { spotId: createdSpots[0].id, userId: bob.id },
    { spotId: createdSpots[1].id, userId: bob.id },
    { spotId: createdSpots[3].id, userId: alice.id },
    { spotId: createdSpots[5].id, userId: alice.id },
    { spotId: createdSpots[6].id, userId: alice.id },
  ]
  for (const fav of favoritesData) {
    await prisma.favorite.upsert({
      where: { spotId_userId: fav },
      update: {},
      create: fav,
    })
  }

  console.log(`✅ Created ${createdSpots.length} spots, ${reviewsData.length} reviews`)
  console.log('🔑 Demo accounts:')
  console.log('   alice@example.com / password123')
  console.log('   bob@example.com / password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
