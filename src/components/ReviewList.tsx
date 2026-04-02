import { Star } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/lib/utils'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: Date | string
  user: { id: string; name: string }
}

interface ReviewListProps {
  reviews: Review[]
  avgRating: number
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${cls} ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  )
}

export function ReviewList({ reviews, avgRating }: ReviewListProps) {
  return (
    <div>
      {/* Summary */}
      <div className="flex items-center gap-4 mb-6">
        <div className="text-center">
          <p className="text-4xl font-bold">{avgRating.toFixed(1)}</p>
          <StarRating rating={Math.round(avgRating)} size="lg" />
          <p className="text-sm text-muted-foreground mt-1">{reviews.length}件の口コミ</p>
        </div>
        {reviews.length > 0 && (
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-4 text-right text-muted-foreground">{star}</span>
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-4 text-muted-foreground">{count}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-sm py-4">まだ口コミがありません。最初の口コミを投稿しましょう！</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, i) => (
            <div key={review.id}>
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {review.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{review.user.name}</span>
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                  )}
                </div>
              </div>
              {i < reviews.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
