'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DeleteSpotButton({ spotId }: { spotId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('このスポットを削除しますか？この操作は取り消せません。')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/spots/${spotId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/spots')
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || '削除に失敗しました')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
      削除
    </Button>
  )
}
