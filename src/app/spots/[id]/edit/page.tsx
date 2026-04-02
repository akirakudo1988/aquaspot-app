import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { EditSpotForm } from './EditSpotForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditSpotPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/spots/${id}/edit`)
  }

  const spot = await prisma.spot.findUnique({ where: { id } })
  if (!spot) notFound()

  if (spot.registeredById !== session.user.id) {
    redirect(`/spots/${id}`)
  }

  return <EditSpotForm spot={spot} />
}
