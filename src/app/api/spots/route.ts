import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { serializeWaterTypes } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const prefecture = searchParams.get('prefecture') || ''
  const waterType = searchParams.get('waterType') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')

  const where: Record<string, unknown> = {}
  const conditions: Record<string, unknown>[] = []

  if (prefecture) conditions.push({ prefecture })
  if (search) {
    conditions.push({
      OR: [
        { name: { contains: search } },
        { address: { contains: search } },
        { city: { contains: search } },
      ],
    })
  }
  if (waterType) {
    conditions.push({ waterTypes: { contains: waterType } })
  }
  if (conditions.length > 0) where.AND = conditions

  const [spots, total] = await Promise.all([
    prisma.spot.findMany({
      where,
      include: {
        _count: { select: { reviews: true, favorites: true } },
        reviews: { select: { rating: true } },
        registeredBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.spot.count({ where }),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const spotsWithAvg = spots.map((spot: any) => {
    const avg =
      spot.reviews.length > 0
        ? spot.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / spot.reviews.length
        : 0
    return { ...spot, avgRating: Math.round(avg * 10) / 10 }
  })

  return NextResponse.json({ spots: spotsWithAvg, total, page, limit })
}

async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) return null
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&language=ja`
    const res = await fetch(url)
    const data = await res.json()
    if (data.status === 'OK' && data.results[0]) {
      const { lat, lng } = data.results[0].geometry.location
      return { lat, lng }
    }
  } catch {}
  return null
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  const body = await req.json()
  const { name, address, prefecture, city, waterTypes, operatingHours, phone, website, notes, image } = body

  if (!name || !address || !prefecture || !city || !waterTypes?.length) {
    return NextResponse.json({ error: '必須項目を入力してください' }, { status: 400 })
  }

  const coords = await geocode(address)

  const spot = await prisma.spot.create({
    data: {
      name,
      address,
      prefecture,
      city,
      waterTypes: serializeWaterTypes(waterTypes),
      operatingHours: operatingHours || null,
      phone: phone || null,
      website: website || null,
      notes: notes || null,
      image: image || null,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      registeredById: session.user.id,
    },
  })

  return NextResponse.json(spot, { status: 201 })
}
