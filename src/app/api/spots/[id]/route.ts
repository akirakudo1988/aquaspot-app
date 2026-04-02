import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { serializeWaterTypes } from '@/lib/utils'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const spot = await prisma.spot.findUnique({
    where: { id },
    include: {
      registeredBy: { select: { id: true, name: true } },
      reviews: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { favorites: true } },
    },
  })

  if (!spot) {
    return NextResponse.json({ error: 'スポットが見つかりません' }, { status: 404 })
  }

  const avgRating =
    spot.reviews.length > 0
      ? Math.round(
          (spot.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / spot.reviews.length) * 10
        ) / 10
      : 0

  return NextResponse.json({ ...spot, avgRating })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  const spot = await prisma.spot.findUnique({ where: { id }, select: { registeredById: true } })
  if (!spot) {
    return NextResponse.json({ error: 'スポットが見つかりません' }, { status: 404 })
  }
  if (spot.registeredById !== session.user.id) {
    return NextResponse.json({ error: '編集権限がありません' }, { status: 403 })
  }

  const body = await req.json()
  const { name, address, prefecture, city, waterTypes, operatingHours, phone, instagram, notes, image, lat, lng } = body

  if (!name || !address || !prefecture || !city || !waterTypes?.length) {
    return NextResponse.json({ error: '必須項目を入力してください' }, { status: 400 })
  }

  const updated = await prisma.spot.update({
    where: { id },
    data: {
      name,
      address,
      prefecture,
      city,
      waterTypes: serializeWaterTypes(waterTypes),
      operatingHours: operatingHours || null,
      phone: phone || null,
      instagram: instagram || null,
      notes: notes || null,
      image: image || null,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
    },
  })

  return NextResponse.json(updated)
}
