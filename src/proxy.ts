import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl
  const isProtected =
    pathname.startsWith('/spots/new') ||
    /^\/spots\/[^/]+\/edit$/.test(pathname)
  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url))
  }
})

export const config = {
  matcher: ['/spots/new', '/spots/:id/edit'],
}
