import { Suspense } from 'react'
import Link from 'next/link'
import { Plus, MapIcon, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SpotCard } from '@/components/SpotCard'
import { SearchBar } from '@/components/SearchBar'
import { MapView } from '@/components/MapView'
import { prisma } from '@/lib/db'
import { Skeleton } from '@/components/ui/skeleton'

interface PageProps {
  searchParams: Promise<{
    search?: string
    prefecture?: string
    waterType?: string
    page?: string
    view?: string
  }>
}

async function getSpots(params: Awaited<PageProps['searchParams']>) {
  const search = params.search || ''
  const prefecture = params.prefecture || ''
  const waterType = params.waterType || ''
  const page = parseInt(params.page || '1')
  const limit = 12

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
  if (waterType) conditions.push({ waterTypes: { contains: waterType } })
  const where = conditions.length > 0 ? { AND: conditions } : {}

  const [spots, total] = await Promise.all([
    prisma.spot.findMany({
      where,
      include: {
        _count: { select: { reviews: true, favorites: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.spot.count({ where }),
  ])

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    spots: spots.map((spot: any) => ({
      ...spot,
      avgRating:
        spot.reviews.length > 0
          ? Math.round(
              (spot.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / spot.reviews.length) * 10
            ) / 10
          : 0,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

export default async function SpotsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const view = params.view || 'list'
  const { spots, total, page, totalPages } = await getSpots(params)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">スポット検索</h1>
        <Button asChild size="sm">
          <Link href="/spots/new">
            <Plus className="h-4 w-4 mr-1" />
            スポット登録
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Suspense>
          <SearchBar
            initialSearch={params.search}
            initialPrefecture={params.prefecture}
            initialWaterType={params.waterType}
          />
        </Suspense>
      </div>

      {/* Results info + view toggle */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {total}件のスポット
        </p>
        <div className="flex items-center gap-1 border rounded-lg p-1">
          <Link
            href={`?${new URLSearchParams({ ...params, view: 'list' }).toString()}`}
            className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          >
            <List className="h-4 w-4" />
          </Link>
          <Link
            href={`?${new URLSearchParams({ ...params, view: 'map' }).toString()}`}
            className={`p-1.5 rounded-md transition-colors ${view === 'map' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          >
            <MapIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Content */}
      {view === 'map' ? (
        <MapView spots={spots} />
      ) : (
        <>
          {spots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {spots.map((spot: any) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg font-medium">スポットが見つかりませんでした</p>
              <p className="text-sm mt-1">検索条件を変えてみてください</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {page > 1 && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}>
                    前へ
                  </Link>
                </Button>
              )}
              <span className="flex items-center px-3 text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}>
                    次へ
                  </Link>
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
