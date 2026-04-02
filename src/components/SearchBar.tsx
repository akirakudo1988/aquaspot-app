'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PREFECTURES, WATER_TYPES } from '@/lib/utils'

interface SearchBarProps {
  initialSearch?: string
  initialPrefecture?: string
  initialWaterType?: string
}

export function SearchBar({ initialSearch = '', initialPrefecture = '', initialWaterType = '' }: SearchBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState(initialSearch)
  const [prefecture, setPrefecture] = useState(initialPrefecture)
  const [waterType, setWaterType] = useState(initialWaterType)

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    }
    params.delete('page')
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParams({ search, prefecture, waterType })
  }

  function handleClear() {
    setSearch('')
    setPrefecture('')
    setWaterType('')
    startTransition(() => {
      router.push(pathname)
    })
  }

  const hasFilters = search || prefecture || waterType

  return (
    <form onSubmit={handleSearch} className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="スポット名や住所で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit">検索</Button>
        {hasFilters && (
          <Button type="button" variant="ghost" size="icon" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex gap-2 flex-wrap">
        <Select value={prefecture} onValueChange={(v) => { setPrefecture(v); updateParams({ search, prefecture: v, waterType }) }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="都道府県" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">すべて</SelectItem>
            {PREFECTURES.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={waterType} onValueChange={(v) => { setWaterType(v); updateParams({ search, prefecture, waterType: v }) }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="水の種類" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">すべて</SelectItem>
            {WATER_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </form>
  )
}
