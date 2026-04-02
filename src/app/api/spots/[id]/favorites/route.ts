import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  const { id: spotId } = await params

  const existing = await prisma.favorite.findUnique({
    where: { spotId_userId: { spotId, userId: session.user.id } },
  })

  if (existing) {
    await prisma.favorite.delete({
      where: { spotId_userId: { spotId, userId: session.user.id } },
    })
    return NextResponse.json({ favorited: false })
  }

  await prisma.favorite.create({ data: { spotId, userId: session.user.id } })
  return NextResponse.json({ favorited: true })
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id: spotId } = await params

  if (!session?.user?.id) {
    return NextResponse.json({ favorited: false })
  }

  const favorite = await prisma.favorite.findUnique({
    where: { spotId_userId: { spotId, userId: session.user.id } },
  })

  return NextResponse.json({ favorited: !!favorite })
}
