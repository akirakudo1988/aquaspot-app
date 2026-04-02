'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PREFECTURES, WATER_TYPES, parseWaterTypes } from '@/lib/utils'

interface Spot {
  id: string
  name: string
  address: string
  prefecture: string
  city: string
  waterTypes: string
  operatingHours: string | null
  phone: string | null
  instagram: string | null
  notes: string | null
  image: string | null
  lat: number | null
  lng: number | null
}

export function EditSpotForm({ spot }: { spot: Spot }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: spot.name,
    address: spot.address,
    prefecture: spot.prefecture,
    city: spot.city,
    operatingHours: spot.operatingHours || '',
    phone: spot.phone || '',
    instagram: spot.instagram || '',
    notes: spot.notes || '',
    image: spot.image || '',
    lat: spot.lat?.toString() || '',
    lng: spot.lng?.toString() || '',
  })
  const [waterTypes, setWaterTypes] = useState<string[]>(parseWaterTypes(spot.waterTypes))

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function toggleWaterType(type: string) {
    setWaterTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.name || !form.address || !form.prefecture || !form.city) {
      setError('必須項目（名称・住所・都道府県・市区町村）を入力してください')
      return
    }
    if (waterTypes.length === 0) {
      setError('水の種類を1つ以上選択してください')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/spots/${spot.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, waterTypes }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '更新に失敗しました')
        return
      }
      router.push(`/spots/${spot.id}`)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link href={`/spots/${spot.id}`}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          スポット詳細に戻る
        </Link>
      </Button>

      <h1 className="text-2xl font-bold mb-6">スポットを編集する</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">スポット名 <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>都道府県 <span className="text-destructive">*</span></Label>
                <Select value={form.prefecture} onValueChange={(v) => setForm((p) => ({ ...p, prefecture: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PREFECTURES.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">市区町村 <span className="text-destructive">*</span></Label>
                <Input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">住所 <span className="text-destructive">*</span></Label>
              <Input
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">水の種類 <span className="text-destructive text-sm font-normal">（1つ以上選択）</span></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {WATER_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleWaterType(type)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                    waterTypes.includes(type)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-input hover:bg-muted'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">詳細情報（任意）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="operatingHours">営業時間</Label>
              <Input
                id="operatingHours"
                name="operatingHours"
                placeholder="例：10:00〜18:00 / 24時間"
                value={form.operatingHours}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="phone">電話番号</Label>
                <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input id="instagram" name="instagram" value={form.instagram} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">画像URL</Label>
              <Input id="image" name="image" type="url" value={form.image} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="lat">緯度</Label>
                <Input id="lat" name="lat" type="number" step="any" value={form.lat} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">経度</Label>
                <Input id="lng" name="lng" type="number" step="any" value={form.lng} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">備考・メモ</Label>
              <Textarea id="notes" name="notes" value={form.notes} onChange={handleChange} rows={3} />
            </div>
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3">{error}</p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          変更を保存する
        </Button>
      </form>
    </div>
  )
}
