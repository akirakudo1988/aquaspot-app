'use client'

import { useState } from 'react'
import { Heart, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  spotId: string
  initialFavorited: boolean
  initialCount: number
  isLoggedIn: boolean
}

export function FavoriteButton({ spotId, initialFavorited, initialCount, isLoggedIn }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!isLoggedIn) {
      window.location.href = '/login'
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/spots/${spotId}/favorites`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setFavorited(data.favorited)
        setCount((prev) => (data.favorited ? prev + 1 : prev - 1))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={loading}
      className={cn(
        'gap-2 transition-colors',
        favorited && 'text-rose-500 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950'
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={cn('h-4 w-4', favorited && 'fill-rose-500')} />
      )}
      <span>{count}</span>
    </Button>
  )
}
