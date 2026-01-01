import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { SubscriptionStatus } from '@prisma/client'
import { NextResponse } from 'next/server'

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
        const customerEmail = (customer as Stripe.Customer).email
        if (!customerEmail) {
          console.error("Customer email not found")
          return NextResponse.json({ error: "Customer email not found" }, { status: 400 })
        }
        const user = await prisma.user.findUnique({
          where: {
            email: customerEmail,
          },
        })
        if (!user) {
          console.error("User not found")
          return NextResponse.json({ error: "User not found" }, { status: 400 })
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
        // get teh customer
        const customer = await stripe.customers.retrieve(subscription.customer as string)
        const customerEmail = (customer as Stripe.Customer).email

        if (!customerEmail) {
          console.error("Customer email not found")
          return NextResponse.json({ error: "Customer email not found" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
          where: {
            email: customerEmail,
          },
        })

        if (!user) {
          console.error("User not found")
          return NextResponse.json({ error: "User not found" }, { status: 400 })
        }
        
        await prisma.subscription.upsert({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          create: {
            stripeSubscriptionId: subscription.id,
            userId: user.id,
            stripeCustomerId: subscription.customer as string,
            stripePriceId: subscription.items.data[0].price.id,
            status: mapStripeStatus(subscription.status),
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
          update: {
            status: mapStripeStatus(subscription.status),
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        })
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        await prisma.subscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            status: 'CANCELED',
            cancelAtPeriodEnd: true,
          },
        })
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
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
    default:
      return 'UNPAID'
  }
}