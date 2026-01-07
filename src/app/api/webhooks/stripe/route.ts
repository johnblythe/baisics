import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { SubscriptionStatus } from '@prisma/client'
import { NextResponse } from 'next/server'
import { getTierFromPriceId, COACH_TIER_CONFIG } from '@/lib/coach-tiers'
import { isJackedPrice } from '@/lib/user-tiers'

export const config = {
  api: {
    bodyParser: false,
  },
}

// Lazy initialization to avoid build-time errors
let _stripe: Stripe | null = null
function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-02-24.acacia',
    })
  }
  return _stripe
}

function getWebhookSecret(): string {
  return process.env.STRIPE_WEBHOOK_SECRET!
}

export async function POST(req: Request) {
  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const stripe = getStripe()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, getWebhookSecret())
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          await prisma.subscription.update({
            where: {
              stripeSubscriptionId: invoice.subscription as string,
            },
            data: {
              status: 'PAST_DUE',
            },
          })
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customer = await stripe.customers.retrieve(invoice.customer as string)
        // Handle deleted customers
        if ('deleted' in customer && customer.deleted) {
          console.warn(`Stripe webhook: Customer ${invoice.customer} was deleted`)
          return NextResponse.json({ received: true, warning: 'Customer deleted' })
        }
        const customerEmail = (customer as Stripe.Customer).email
        if (!customerEmail) {
          console.warn(`Stripe webhook: No email for customer ${invoice.customer}`)
          return NextResponse.json({ received: true, warning: 'Customer email not found' })
        }
        const user = await prisma.user.findUnique({
          where: {
            email: customerEmail,
          },
        })
        if (!user) {
          console.warn(`Stripe webhook: User not found for email ${customerEmail}`)
          return NextResponse.json({ received: true, warning: 'User not found' })
        }
        if (invoice.subscription) {
          await prisma.subscription.update({
            where: {
              stripeSubscriptionId: invoice.subscription as string,
              userId: user?.id,
            },
            data: {
              status: 'ACTIVE',
            },
          })
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customer = await stripe.customers.retrieve(subscription.customer as string)

        // Handle deleted customers
        if ('deleted' in customer && customer.deleted) {
          console.warn(`Stripe webhook: Customer ${subscription.customer} was deleted`)
          return NextResponse.json({ received: true, warning: 'Customer deleted' })
        }
        const customerEmail = (customer as Stripe.Customer).email

        if (!customerEmail) {
          console.warn(`Stripe webhook: No email for customer ${subscription.customer}`)
          return NextResponse.json({ received: true, warning: 'Customer email not found' })
        }

        const user = await prisma.user.findUnique({
          where: {
            email: customerEmail,
          },
        })

        if (!user) {
          console.warn(`Stripe webhook: User not found for email ${customerEmail}`)
          return NextResponse.json({ received: true, warning: 'User not found' })
        }
        
        const priceId = subscription.items.data[0]?.price?.id
        if (!priceId) {
          console.warn(`Stripe webhook: No price found for subscription ${subscription.id}`)
          return NextResponse.json({ received: true, warning: 'No price found' })
        }

        await prisma.subscription.upsert({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          create: {
            stripeSubscriptionId: subscription.id,
            userId: user.id,
            stripeCustomerId: subscription.customer as string,
            stripePriceId: priceId,
            status: mapStripeStatus(subscription.status),
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
          update: {
            stripePriceId: priceId,
            status: mapStripeStatus(subscription.status),
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        })

        // Update user based on subscription type
        const isCoachPrice = priceId === COACH_TIER_CONFIG.SWOLE.priceId ||
                            priceId === COACH_TIER_CONFIG.YOKED.priceId

        if (subscription.status === 'active') {
          if (isCoachPrice) {
            // Coach subscription - set isCoach and coachTier
            const newTier = getTierFromPriceId(priceId)
            await prisma.user.update({
              where: { id: user.id },
              data: {
                isCoach: true,
                coachTier: newTier,
              },
            })
          } else if (isJackedPrice(priceId)) {
            // Jacked subscription - set isPremium
            await prisma.user.update({
              where: { id: user.id },
              data: { isPremium: true },
            })
          }
        }
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const priceId = subscription.items.data[0]?.price?.id

        const sub = await prisma.subscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            status: 'CANCELED',
            cancelAtPeriodEnd: true,
          },
        })

        // Reset user status based on subscription type
        if (sub.userId) {
          const isCoachPrice = priceId === COACH_TIER_CONFIG.SWOLE.priceId ||
                              priceId === COACH_TIER_CONFIG.YOKED.priceId

          if (isCoachPrice) {
            // Reset coach tier to FREE (keep isCoach = true)
            await prisma.user.update({
              where: { id: sub.userId },
              data: { coachTier: 'FREE' },
            })
          } else if (isJackedPrice(priceId)) {
            // Reset isPremium
            await prisma.user.update({
              where: { id: sub.userId },
              data: { isPremium: false },
            })
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    // Log with event context for debugging
    console.error('Error processing webhook:', {
      eventType: event.type,
      eventId: event.id,
      error: error instanceof Error ? error.message : error,
    })
    // Return 500 only for unexpected errors - Stripe will retry
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

// Utils to map Stripe status to our enum
function mapStripeStatus(stripeStatus: string): SubscriptionStatus {
  switch (stripeStatus) {
    case 'active':
      return 'ACTIVE'
    case 'past_due':
      return 'PAST_DUE'
    case 'unpaid':
      return 'UNPAID'
    case 'canceled':
      return 'CANCELED'
    case 'trialing':
      return 'TRIAL'
    case 'incomplete':
    case 'incomplete_expired':
    case 'paused':
      console.warn(`Stripe status '${stripeStatus}' mapped to UNPAID`)
      return 'UNPAID'
    default:
      console.warn(`Unknown Stripe status '${stripeStatus}' mapped to UNPAID`)
      return 'UNPAID'
  }
}