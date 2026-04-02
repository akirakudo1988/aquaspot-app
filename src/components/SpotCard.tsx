import Link from 'next/link'
import Image from 'next/image'
import { Star, MapPin, MessageSquare, Heart, Droplets } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { parseWaterTypes } from '@/lib/utils'

interface SpotCardProps {
  spot: {
    id: string
    name: string
    address: string
    prefecture: string
    city: string
    waterTypes: string
    image: string | null
    avgRating: number
    _count: {
      reviews: number
      favorites: number
    }
  }
}

export function SpotCard({ spot }: SpotCardProps) {
  const waterTypes = parseWaterTypes(spot.waterTypes)

  return (
    <Link href={`/spots/${spot.id}`}>
      <Card className="overflow-hidden h-full hover:shadow-md transition-shadow group cursor-pointer">
        {/* Image */}
        <div className="relative h-40 bg-gradient-to-br from-sky-100 to-blue-200 dark:from-sky-900/30 dark:to-blue-900/30">
          {spot.image ? (
            <Image
              src={spot.image}
              alt={spot.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Droplets className="h-12 w-12 text-primary/30" />
            </div>
          )}
          {/* Water type badges */}
          {waterTypes.length > 0 && (
            <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
              {waterTypes.map((type) => (
                <Badge key={type} variant="secondary" className="text-xs bg-white/90 dark:bg-black/60">
                  {type}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {spot.name}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="line-clamp-1">{spot.prefecture} {spot.city}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">{spot.avgRating.toFixed(1)}</span>
              <span>({spot._count.reviews}件)</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>{spot._count.favorites}</span>
              <MessageSquare className="h-3 w-3 ml-2" />
              <span>{spot._count.reviews}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
