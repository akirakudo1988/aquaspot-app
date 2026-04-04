import { PrismaPg } from '@prisma/adapter-pg'
const { PrismaClient } = await import('../src/generated/prisma/client') as any
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const apiKey = process.env.GOOGLE_MAPS_API_KEY!

const spots = await prisma.spot.findMany({
  where: { OR: [{ lat: null }, { lng: null }] },
})

console.log(`座標未設定のスポット: ${spots.length}件`)

for (const spot of spots) {
  // 都道府県+市区町村+住所で完全な住所を構成
  const fullAddress = `${spot.prefecture}${spot.city}${spot.address}`
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}&language=ja&region=jp`
  const res = await fetch(url)
  const data = await res.json()
  if (data.status === 'OK' && data.results[0]) {
    const { lat, lng } = data.results[0].geometry.location
    await prisma.spot.update({ where: { id: spot.id }, data: { lat, lng } })
    console.log(`✅ ${spot.name} (${fullAddress}): ${lat}, ${lng}`)
  } else {
    console.log(`❌ ${spot.name} (${fullAddress}): ${data.status} - ${data.error_message || ''}`)
  }
}

await prisma.$disconnect()
