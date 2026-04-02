import Link from 'next/link'
import { Droplets } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Droplets className="h-5 w-5" />
            <span>AquaSpot</span>
          </div>
          <p className="text-sm text-muted-foreground">
            日本中の給水スポットを探して、シェアしよう。
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">ホーム</Link>
            <Link href="/spots" className="hover:text-foreground transition-colors">スポット検索</Link>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} AquaSpot. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
