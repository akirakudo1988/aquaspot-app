'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Loader2, Upload, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
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
  website: string | null
  notes: string | null
  image: string | null
}

export function EditSpotForm({ spot }: { spot: Spot }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(spot.image)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [form, setForm] = useState({
    name: spot.name,
    address: spot.address,
    prefecture: spot.prefecture,
    city: spot.city,
    operatingHours: spot.operatingHours || '',
    phone: spot.phone || '',
    website: spot.website || '',
    notes: spot.notes || '',
  })
  const existing = parseWaterTypes(spot.waterTypes)
  const [waterType, setWaterType] = useState(existing[0] || '')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function uploadImage(): Promise<string | null> {
    if (!imageFile) return imagePreview // keep existing
    setUploadingImage(true)
    try {
      const fd = new FormData()
      fd.append('file', imageFile)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'アップロード失敗')
      return data.url
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.name || !form.address || !form.prefecture || !form.city) {
      setError('必須項目（名称・住所・都道府県・市区町村）を入力してください')
      return
    }
    if (!waterType) {
      setError('水の種類を選択してください')
      return
    }

    setLoading(true)
    try {
      const imageUrl = await uploadImage()
      const res = await fetch(`/api/spots/${spot.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, waterTypes: [waterType], image: imageUrl }),
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
              <Input id="name" name="name" value={form.name} onChange={handleChange} required />
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
                <Input id="city" name="city" value={form.city} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">住所 <span className="text-destructive">*</span></Label>
              <Input id="address" name="address" value={form.address} onChange={handleChange} required />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">水の種類 <span className="text-destructive text-sm font-normal">（1つ選択）</span></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {WATER_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setWaterType(type)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                    waterType === type
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
              <Input id="operatingHours" name="operatingHours" placeholder="例：10:00〜18:00 / 24時間" value={form.operatingHours} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="phone">電話番号</Label>
                <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Webサイト</Label>
                <Input id="website" name="website" type="url" placeholder="https://example.com" value={form.website} onChange={handleChange} />
              </div>
            </div>

            {/* 画像アップロード */}
            <div className="space-y-2">
              <Label>画像</Label>
              {imagePreview ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                  <Image src={imagePreview} alt="プレビュー" fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-background/80 rounded-full p-1 hover:bg-background transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-input rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">クリックして画像を選択</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG・PNG・WebP（5MBまで）</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
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

        <Button type="submit" size="lg" className="w-full" disabled={loading || uploadingImage}>
          {(loading || uploadingImage) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {uploadingImage ? '画像アップロード中...' : '変更を保存する'}
        </Button>
      </form>
    </div>
  )
}
