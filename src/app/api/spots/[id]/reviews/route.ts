import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  const { id: spotId } = await params
  const body = await req.json()
  const { rating, comment } = body

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: '評価は1〜5の間で選択してください' }, { status: 400 })
  }

  const spot = await prisma.spot.findUnique({ where: { id: spotId } })
  if (!spot) {
    return NextResponse.json({ error: 'スポットが見つかりません' }, { status: 404 })
  }

  const existing = await prisma.review.findFirst({
    where: { spotId, userId: session.user.id },
  })
  if (existing) {
    return NextResponse.json({ error: 'すでにレビューを投稿しています' }, { status: 409 })
  }

  const review = await prisma.review.create({
    data: {
      spotId,
      userId: session.user.id,
      rating: parseInt(rating),
      comment: comment || null,
    },
    include: { user: { select: { id: true, name: true } } },
  })

  return NextResponse.json(review, { status: 201 })
}
