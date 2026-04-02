import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, Phone, ExternalLink, ChevronLeft, Droplets, Star, User, Calendar, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReviewList } from '@/components/ReviewList'
import { ReviewForm } from '@/components/ReviewForm'
import { FavoriteButton } from '@/components/FavoriteButton'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { parseWaterTypes, formatDate } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const spot = await prisma.spot.findUnique({ where: { id }, select: { name: true, address: true } })
  if (!spot) return { title: 'スポットが見つかりません' }
  return {
    title: `${spot.name} | AquaSpot`,
    description: `${spot.address}の給水スポット情報`,
  }
}

export default async function SpotDetailPage({ params }: PageProps) {
  const { id } = await params
  const [session, spot] = await Promise.all([
    auth(),
    prisma.spot.findUnique({
      where: { id },
      include: {
        registeredBy: { select: { id: true, name: true } },
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { favorites: true } },
      },
    }),
  ])

  if (!spot) notFound()

  const avgRating =
    spot.reviews.length > 0
      ? Math.round(
          (spot.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / spot.reviews.length) * 10
        ) / 10
      : 0

  const waterTypes = parseWaterTypes(spot.waterTypes)

  // Check if user already favorited
  let userFavorited = false
  if (session?.user?.id) {
    const fav = await prisma.favorite.findUnique({
      where: { spotId_userId: { spotId: id, userId: session.user.id } },
    })
    userFavorited = !!fav
  }

  // Check if user already reviewed
  const userReviewed = session?.user?.id
    ? spot.reviews.some((r: { user: { id: string } }) => r.user.id === session.user.id)
    : false

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link href="/spots">
          <ChevronLeft className="h-4 w-4 mr-1" />
          スポット一覧に戻る
        </Link>
      </Button>

      {/* Hero image */}
      <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-sky-100 to-blue-200 dark:from-sky-900/30 dark:to-blue-900/30">
        {spot.image ? (
          <Image src={spot.image} alt={spot.name} fill className="object-cover" unoptimized />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Droplets className="h-20 w-20 text-primary/20" />
          </div>
        )}
      </div>

      {/* Title + actions */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <MapPin className="h-3.5 w-3.5" />
            <span>{spot.prefecture} {spot.city}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">{spot.name}</h1>
          {waterTypes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {waterTypes.map((type) => (
                <Badge key={type} variant="secondary">{type}</Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold">{avgRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({spot.reviews.length}件)</span>
          </div>
          {session?.user?.id === spot.registeredBy.id && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/spots/${spot.id}/edit`}>
                <Pencil className="h-3.5 w-3.5 mr-1" />
                編集
              </Link>
            </Button>
          )}
          <FavoriteButton
            spotId={spot.id}
            initialFavorited={userFavorited}
            initialCount={spot._count.favorites}
            isLoggedIn={!!session?.user}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">口コミ・評価</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewList reviews={spot.reviews} avgRating={avgRating} />
            </CardContent>
          </Card>

          {/* Review form */}
          {session?.user ? (
            !userReviewed ? (
              <ReviewForm spotId={spot.id} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                このスポットには既に口コミを投稿済みです
              </p>
            )
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">口コミを投稿するにはログインが必要です</p>
                <Button asChild size="sm">
                  <Link href="/login">ログインして口コミを書く</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">スポット情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>{spot.address}</span>
              </div>
              {spot.operatingHours && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{spot.operatingHours}</span>
                </div>
              )}
              {spot.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a href={`tel:${spot.phone}`} className="text-primary hover:underline">
                    {spot.phone}
                  </a>
                </div>
              )}
              {spot.instagram && (
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a
                    href={spot.instagram.startsWith('http') ? spot.instagram : `https://instagram.com/${spot.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate"
                  >
                    {spot.instagram.replace('https://www.instagram.com/', '@').replace('https://instagram.com/', '@')}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {spot.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">備考</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{spot.notes}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-4 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5" />
                <span>登録者: {spot.registeredBy.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                <span>登録日: {formatDate(spot.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
