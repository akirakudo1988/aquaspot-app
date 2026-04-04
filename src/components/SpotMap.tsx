'use client'

interface SpotMapProps {
  name: string
  address: string
  prefecture: string
  city: string
  lat: number | null
  lng: number | null
}

export function SpotMap({ name, address, prefecture, city, lat, lng }: SpotMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) return null

  const fullAddress = `${prefecture}${city}${address}`

  const src = lat && lng
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&language=ja`
    : `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(fullAddress)}&language=ja`

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden border">
      <iframe
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`${name}の地図`}
      />
    </div>
  )
}
