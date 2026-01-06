import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { COACH_TIER_CONFIG } from '@/lib/coach-tiers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tier } = await req.json()

    if (!tier || !['SWOLE', 'YOKED'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    const tierConfig = COACH_TIER_CONFIG[tier as 'SWOLE' | 'YOKED']
    if (!tierConfig.priceId) {
      return NextResponse.json({ error: 'Price not configured' }, { status: 500 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If user already has an active subscription, redirect to billing portal instead
    if (user.subscription?.status === 'ACTIVE') {
      return NextResponse.json({
        error: 'Already subscribed',
        message: 'Use billing portal to manage subscription',
      }, { status: 400 })
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001'

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email || undefined,
      line_items: [
        {
          price: tierConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/coach/dashboard?upgraded=true`,
      cancel_url: `${baseUrl}/coach/dashboard?canceled=true`,
      metadata: {
        userId: user.id,
        tier: tier,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
