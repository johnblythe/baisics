import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    })

    if (!user?.subscription?.stripeCustomerId) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.subscription.stripeCustomerId,
      return_url: `${baseUrl}/coach/dashboard`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Billing portal error:', error)
    return NextResponse.json({ error: 'Failed to create billing portal session' }, { status: 500 })
  }
}
