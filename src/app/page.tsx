export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Search, MapPin, Star, Plus, Droplets, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SpotCard } from '@/components/SpotCard'
import { prisma } from '@/lib/db'

async function getLatestSpots() {
  const spots = await prisma.spot.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { reviews: true, favorites: true } },
      reviews: { select: { rating: true } },
    },
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return spots.map((spot: any) => ({
    ...spot,
    avgRating:
      spot.reviews.length > 0
        ? Math.round(
            (spot.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / spot.reviews.length) * 10
          ) / 10
        : 0,
  }))
}

async function getStats() {
  const [spotCount, reviewCount] = await Promise.all([
    prisma.spot.count(),
    prisma.review.count(),
  ])
  return { spotCount, reviewCount }
}

export default async function HomePage() {
  const [spots, stats] = await Promise.all([getLatestSpots(), getStats()])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-sky-50/50 to-blue-100/50 dark:from-primary/10 dark:via-background dark:to-background py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium">
              <Droplets className="h-4 w-4" />
              日本全国の給水スポット
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            いつでもどこでも
            <br />
            <span className="text-primary">おいしい水</span>を
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            全国の給水スポットを探したり、シェアできるサービスです。
            水素水・シリカ水・バナジウム水など、こだわりの水をお近くで見つけましょう。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <Button size="lg" asChild className="flex-1">
              <Link href="/spots">
                <Search className="h-4 w-4 mr-2" />
                スポットを探す
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="flex-1">
              <Link href="/spots/new">
                <Plus className="h-4 w-4 mr-2" />
                スポットを登録
              </Link>
            </Button>
          </div>
        </div>
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-sky-300/20 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">{stats.spotCount}</p>
              <p className="text-sm text-muted-foreground mt-1">登録スポット数</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">{stats.reviewCount}</p>
              <p className="text-sm text-muted-foreground mt-1">口コミ数</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">47</p>
              <p className="text-sm text-muted-foreground mt-1">対応都道府県</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">3</p>
              <p className="text-sm text-muted-foreground mt-1">水の種類</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest spots */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">最新のスポット</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/spots">すべて見る</Link>
          </Button>
        </div>

        {spots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {spots.map((spot: any) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Droplets className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>まだスポットが登録されていません。</p>
            <Button className="mt-4" asChild>
              <Link href="/spots/new">最初のスポットを登録する</Link>
            </Button>
          </div>
        )}
      </section>

      {/* Features */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">AquaSpotの特徴</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-background rounded-2xl border">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">地図で探す</h3>
              <p className="text-muted-foreground text-sm">
                インタラクティブな地図で近くの給水スポットを簡単に見つけられます。
              </p>
            </div>
            <div className="text-center p-6 bg-background rounded-2xl border">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Filter className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">水の種類で検索</h3>
              <p className="text-muted-foreground text-sm">
                水素水・シリカ水・バナジウム水など、お好みの水質でフィルタリング。
              </p>
            </div>
            <div className="text-center p-6 bg-background rounded-2xl border">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">口コミ・評価</h3>
              <p className="text-muted-foreground text-sm">
                実際に利用したユーザーの口コミと評価で、事前に品質を確認できます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">お気に入りの給水スポットをシェアしよう</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          みんなで情報をシェアして、日本中の給水スポットマップを作りましょう。
        </p>
        <Button size="lg" asChild>
          <Link href="/register">
            無料で始める
          </Link>
        </Button>
      </section>
    </div>
  )
}
