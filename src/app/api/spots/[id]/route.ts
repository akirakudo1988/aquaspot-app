import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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
