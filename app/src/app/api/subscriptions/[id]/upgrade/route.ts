import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import {
  stripe,
  getPriceId,
  STRIPE_PRICES,
  TIER_PRICES,
  CURRENCY_SYMBOL,
  type PricingRegion,
} from '@/lib/stripe'
import { getSubscriptionById, updateDomainSubscription } from '@/lib/subscriptions'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * Determine the pricing region from a Stripe price ID
 */
function getRegionFromPriceId(priceId: string): PricingRegion {
  // Check if this price ID belongs to AU pricing
  const auPrices = Object.values(STRIPE_PRICES.AU)
  if (auPrices.includes(priceId)) {
    return 'AU'
  }
  return 'INTL'
}

/**
 * POST /api/subscriptions/[id]/upgrade
 * Upgrade a subscription from Starter to Pro
 */
export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const subscription = await getSubscriptionById(id)

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Verify ownership
    if (subscription.lead_id !== session.lead_id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Can only upgrade active subscriptions
    if (subscription.status !== 'active') {
      return NextResponse.json(
        { error: 'Only active subscriptions can be upgraded' },
        { status: 400 }
      )
    }

    // Can only upgrade from starter to pro
    if (subscription.tier !== 'starter') {
      return NextResponse.json(
        { error: 'This subscription is already on Pro tier' },
        { status: 400 }
      )
    }

    if (!subscription.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'Subscription has no Stripe subscription ID' },
        { status: 400 }
      )
    }

    // Get the Stripe subscription to find the current item and currency
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id)
    const subscriptionItem = stripeSubscription.items.data[0]
    const subscriptionItemId = subscriptionItem?.id
    const currentPriceId = subscriptionItem?.price?.id

    if (!subscriptionItemId) {
      return NextResponse.json(
        { error: 'Could not find subscription item' },
        { status: 500 }
      )
    }

    // Determine region from current price to maintain currency consistency
    const region = currentPriceId ? getRegionFromPriceId(currentPriceId) : 'INTL'

    // Get the new price ID for Pro tier in the same region/currency
    const newPriceId = getPriceId('pro', region)

    // Update the Stripe subscription (prorates automatically)
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      items: [
        {
          id: subscriptionItemId,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
      metadata: {
        ...stripeSubscription.metadata,
        tier: 'pro',
      },
    })

    // Update local record
    const updated = await updateDomainSubscription(id, {
      tier: 'pro',
      stripe_price_id: newPriceId,
    })

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
    }

    // Get pricing info for the response
    const currencySymbol = CURRENCY_SYMBOL[region]
    const oldPrice = TIER_PRICES[region].starter
    const newPrice = TIER_PRICES[region].pro

    return NextResponse.json({
      subscription: updated,
      message: 'Subscription upgraded to Pro! Your card will be charged a prorated amount.',
      pricing: {
        oldTier: 'Starter',
        newTier: 'Pro',
        oldPrice: `${currencySymbol}${oldPrice}/mo`,
        newPrice: `${currencySymbol}${newPrice}/mo`,
      },
    })
  } catch (error) {
    console.error('Error upgrading subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
