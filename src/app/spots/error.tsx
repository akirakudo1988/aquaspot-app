'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function SpotsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h2 className="text-xl font-semibold mb-2">ページの読み込みに失敗しました</h2>
      <p className="text-sm text-muted-foreground mb-6">
        {error.message || 'データの取得中にエラーが発生しました'}
      </p>
      <Button onClick={reset}>再試行</Button>
    </div>
  )
}
