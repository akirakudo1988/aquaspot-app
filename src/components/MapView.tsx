'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

interface SpotForMap {
  id: string
  name: string
  address: string
  prefecture: string
  city: string
  waterTypes: string
  lat: number | null
  lng: number | null
  avgRating: number
  _count: { reviews: number; favorites: number }
}

interface MapViewProps {
  spots: SpotForMap[]
}

export function MapView({ spots }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    if (!apiKey || !mapRef.current) return

    const spotsWithCoords = spots.filter((s) => s.lat && s.lng)
    const center =
      spotsWithCoords.length > 0
        ? { lat: spotsWithCoords[0].lat!, lng: spotsWithCoords[0].lng! }
        : { lat: 35.6812, lng: 139.7671 } // Tokyo default

    // Use new functional API
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker&v=weekly`
    script.async = true
    script.defer = true
    script.onload = () => {
      if (!mapRef.current) return
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: spotsWithCoords.length > 0 ? 12 : 5,
        mapId: 'aquaspot-map',
      })

      spotsWithCoords.forEach((spot) => {
        const marker = new window.google.maps.Marker({
          map,
          position: { lat: spot.lat!, lng: spot.lng! },
          title: spot.name,
        })

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="max-width:200px;padding:4px">
              <p style="font-weight:600;font-size:14px;margin:0 0 4px">${spot.name}</p>
              <p style="font-size:12px;color:#666;margin:0 0 4px">${spot.prefecture} ${spot.city}</p>
              <p style="font-size:12px;margin:0 0 6px">★ ${spot.avgRating.toFixed(1)} (${spot._count.reviews}件)</p>
              <a href="/spots/${spot.id}" style="font-size:12px;color:#3b82f6">詳細を見る →</a>
            </div>
          `,
        })

        marker.addListener('click', () => {
          infoWindow.open({ anchor: marker, map })
        })
      })
    }
    script.onerror = () => setError(true)
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [apiKey, spots])

  if (!apiKey) {
    return <FallbackMap spots={spots} />
  }

  if (error) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-muted/30 rounded-xl border text-muted-foreground">
        地図の読み込みに失敗しました
      </div>
    )
  }

  return <div ref={mapRef} className="h-[500px] w-full rounded-xl overflow-hidden border" />
}

function FallbackMap({ spots }: MapViewProps) {
  const spotsWithCoords = spots.filter((s) => s.lat && s.lng)

  return (
    <div className="h-[500px] bg-muted/30 rounded-xl border flex flex-col items-center justify-center gap-4 p-6">
      <MapPin className="h-10 w-10 text-muted-foreground/40" />
      <div className="text-center">
        <p className="font-medium text-muted-foreground">地図を表示するには Google Maps API キーが必要です</p>
        <p className="text-sm text-muted-foreground/70 mt-1">.env.local に NEXT_PUBLIC_GOOGLE_MAPS_API_KEY を設定してください</p>
      </div>
      {spotsWithCoords.length > 0 && (
        <div className="w-full max-w-sm mt-2 space-y-2">
          {spotsWithCoords.slice(0, 5).map((spot) => (
            <a
              key={spot.id}
              href={`/spots/${spot.id}`}
              className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-background transition-colors"
            >
              <MapPin className="h-3 w-3 text-primary shrink-0" />
              <span className="font-medium truncate">{spot.name}</span>
              <span className="text-muted-foreground text-xs shrink-0">{spot.prefecture}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
