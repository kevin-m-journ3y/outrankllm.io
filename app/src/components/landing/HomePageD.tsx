'use client'

import { useState, useRef, useEffect } from 'react'
import { Ghost } from '@/components/ghost/Ghost'
import { FloatingPixels } from '@/components/landing/FloatingPixels'
import { Journ3yAttribution } from '@/components/landing/Platforms'
import { DemoVideo } from '@/components/landing/DemoVideo'
import { Footer } from '@/components/landing/Footer'
import { Nav } from '@/components/nav/Nav'
import { ExperimentTracker } from '@/components/experiments/ExperimentTracker'
import { ScanFormModal } from '@/components/landing/ScanFormModal'
import Image from 'next/image'
import { Search, Users, CheckCircle, ArrowRight } from 'lucide-react'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics'
import {
  detectPricingRegion,
  parseRegionCookie,
  parseRegionParam,
  REGION_COOKIE_NAME,
  type PricingRegion,
} from '@/lib/geo/pricing-region'
import { TIER_PRICES, CURRENCY_SYMBOL } from '@/lib/stripe-config'

/**
 * Hook to detect pricing region on client-side
 */
function usePricingRegion(): {
  region: PricingRegion
  price: number
  symbol: string
  loading: boolean
} {
  const [region, setRegion] = useState<PricingRegion>('INTL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for query param override first
    const urlParams = new URLSearchParams(window.location.search)
    const queryRegion = parseRegionParam(urlParams.get('region'))

    if (queryRegion) {
      setRegion(queryRegion)
      setLoading(false)
      return
    }

    // Check cookie preference
    const cookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${REGION_COOKIE_NAME}=`))
      ?.split('=')[1]
    const cookieRegion = parseRegionCookie(cookieValue)

    if (cookieRegion) {
      setRegion(cookieRegion)
      setLoading(false)
      return
    }

    // Default detection - for homepage we don't have lead data,
    // so we rely on middleware having set the cookie from IP
    // If no cookie, default to INTL
    const result = detectPricingRegion({
      cookieRegion: null,
      queryParamRegion: null,
    })
    setRegion(result.region)
    setLoading(false)
  }, [])

  return {
    region,
    price: TIER_PRICES[region].starter,
    symbol: CURRENCY_SYMBOL[region],
    loading,
  }
}

export function HomePageD() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const ctaButtonRef = useRef<HTMLButtonElement>(null)
  const { price, symbol, region, loading } = usePricingRegion()

  // Display price - show USD while loading
  const displayPrice = loading ? '$24.99' : `${symbol}${price}`

  const openModal = (source: string) => {
    trackEvent(ANALYTICS_EVENTS.SCAN_MODAL_OPENED, {
      source,
      variant: 'variant-d',
      price_shown: displayPrice,
      region,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    trackEvent(ANALYTICS_EVENTS.SCAN_MODAL_CLOSED)
    setIsModalOpen(false)
  }

  return (
    <>
      {/* A/B Test Tracking */}
      <ExperimentTracker experimentName="homepage" />

      {/* Background layers */}
      <div className="grid-bg" />
      <FloatingPixels />
      <Nav />

      {/* Main content */}
      <main
        className="page relative z-10 min-h-screen flex flex-col items-center"
        style={{ paddingTop: '80px' }}
      >
        <div
          className="w-full flex flex-col items-center"
          style={{ maxWidth: '520px', padding: '0 20px' }}
        >
          {/* Logo - smaller to save vertical space */}
          <div className="flex flex-col items-center gap-2" style={{ marginBottom: '24px' }}>
            <Ghost size="sm" />
            <div className="logo-text" style={{ fontSize: '1.25rem' }}>
              outrank<span className="mark">llm</span>.io
            </div>
          </div>

          {/* Headline - Emotional, customer-focused */}
          <h1
            className="text-center"
            style={{
              marginBottom: '16px',
              fontSize: 'clamp(1.5rem, 5vw, 1.875rem)',
              lineHeight: '1.25',
            }}
          >
            Is AI sending your customers{' '}
            <span className="em">to the competition?</span>
          </h1>

          {/* Subhead - Value-first, price at end */}
          <p
            className="text-[var(--text-mid)] text-center"
            style={{
              marginBottom: '20px',
              fontSize: 'clamp(0.9rem, 3vw, 1.05rem)',
              lineHeight: '1.5',
            }}
          >
            Find out in minutes. Track your visibility across ChatGPT, Claude, Gemini and
            Perplexity — starting at just{' '}
            <span className="text-[var(--green)] font-semibold">{displayPrice}/month</span>.
          </p>

          {/* Price Comparison Section - moved up for price-led approach */}
          <div
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)]"
            style={{ padding: '16px', marginBottom: '20px' }}
          >
            <h2
              className="font-mono text-[0.65rem] text-[var(--text-dim)] uppercase tracking-widest text-center"
              style={{ marginBottom: '12px' }}
            >
              Compare the value
            </h2>

            <div className="flex flex-col gap-2">
              {/* Competitor: Profound */}
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-dim)] text-sm">Profound</span>
                <span className="text-[var(--text-dim)] font-mono text-sm">$499 USD/mo</span>
              </div>

              {/* Competitor: Semrush AI */}
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-dim)] text-sm">Semrush AI Toolkit</span>
                <span className="text-[var(--text-dim)] font-mono text-sm">$99 USD/mo</span>
              </div>

              {/* Competitor: Peec AI */}
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-dim)] text-sm">Peec AI</span>
                <span className="text-[var(--text-dim)] font-mono text-sm">$89 USD/mo</span>
              </div>

              {/* Divider */}
              <div
                className="border-t border-[var(--border)]"
                style={{ margin: '6px 0' }}
              />

              {/* Our price - highlighted */}
              <div className="flex items-center justify-between">
                <span className="text-[var(--text)] text-sm font-medium">
                  outrankllm.io
                </span>
                <span className="text-[var(--green)] font-mono text-sm font-bold">
                  {displayPrice}/mo
                </span>
              </div>

              {/* Brief value explanation */}
              <p
                className="text-[var(--text-dim)] text-xs text-center italic"
                style={{ marginTop: '10px' }}
              >
                One focus. Fair pricing.
              </p>
            </div>
          </div>

          {/* Platform logos - condensed */}
          <div className="flex flex-col items-center w-full" style={{ marginBottom: '20px' }}>
            <span
              className="font-mono text-[0.6rem] text-[var(--text-dim)] uppercase tracking-widest"
              style={{ marginBottom: '10px' }}
            >
              We scan these AI assistants
            </span>
            <div
              className="flex items-end justify-between w-full"
              style={{ maxWidth: '280px' }}
            >
              <div className="flex flex-col items-center">
                <div
                  className="flex items-center justify-center"
                  style={{ height: '28px' }}
                >
                  <Image
                    src="/images/ChatGPT-Logo.png"
                    alt="ChatGPT"
                    width={44}
                    height={44}
                    className="object-contain invert"
                  />
                </div>
                <span
                  className="text-[var(--text-dim)] text-[0.55rem] font-mono"
                  style={{ marginTop: '3px' }}
                >
                  ChatGPT
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className="flex items-center justify-center"
                  style={{ height: '28px' }}
                >
                  <Image
                    src="/images/Claude_AI_symbol.svg.png"
                    alt="Claude"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <span
                  className="text-[var(--text-dim)] text-[0.55rem] font-mono"
                  style={{ marginTop: '3px' }}
                >
                  Claude
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className="flex items-center justify-center"
                  style={{ height: '28px' }}
                >
                  <Image
                    src="/images/Google_Gemini_icon_2025.svg.png"
                    alt="Gemini"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <span
                  className="text-[var(--text-dim)] text-[0.55rem] font-mono"
                  style={{ marginTop: '3px' }}
                >
                  Gemini
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className="flex items-center justify-center"
                  style={{ height: '28px' }}
                >
                  <Image
                    src="/images/perplexity-color.png"
                    alt="Perplexity"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <span
                  className="text-[var(--text-dim)] text-[0.55rem] font-mono"
                  style={{ marginTop: '3px' }}
                >
                  Perplexity
                </span>
              </div>
            </div>
          </div>

          {/* Primary CTA Button - Opens Modal */}
          <div id="cta-section" className="w-full" style={{ marginBottom: '10px' }}>
            <button
              ref={ctaButtonRef}
              onClick={() => openModal('hero_cta')}
              className="form-button w-full flex items-center justify-center gap-2"
              style={{ fontSize: '1rem', padding: '14px 24px' }}
            >
              Start Your Free 7-Day Trial
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Micro-reassurance */}
          <p
            className="text-[var(--text-dim)] text-xs text-center font-mono"
            style={{ marginBottom: '40px' }}
          >
            Free &middot; No credit card &middot; Results in minutes
          </p>

          {/* Trial Value Preview Section */}
          <div className="w-full" style={{ marginBottom: '40px' }}>
            <h2
              className="font-mono text-[0.7rem] text-[var(--text-dim)] uppercase tracking-widest text-center"
              style={{ marginBottom: '16px' }}
            >
              During your free trial, you&apos;ll discover
            </h2>

            <div className="flex flex-col gap-4">
              {/* Item 1 */}
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                  <Search className="w-4 h-4 text-[var(--green)]" />
                </div>
                <div>
                  <p
                    className="text-[var(--text)] text-sm font-medium"
                    style={{ marginBottom: '2px' }}
                  >
                    Your AI Visibility Score
                  </p>
                  <p className="text-[var(--text-dim)] text-xs">
                    See how visible you are across ChatGPT, Claude, Gemini & Perplexity
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                  <Users className="w-4 h-4 text-[var(--green)]" />
                </div>
                <div>
                  <p
                    className="text-[var(--text)] text-sm font-medium"
                    style={{ marginBottom: '2px' }}
                  >
                    Who AI recommends instead
                  </p>
                  <p className="text-[var(--text-dim)] text-xs">
                    Discover which competitors are getting the visibility you deserve
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-[var(--green)]" />
                </div>
                <div>
                  <p
                    className="text-[var(--text)] text-sm font-medium"
                    style={{ marginBottom: '2px' }}
                  >
                    Your personalized action plan
                  </p>
                  <p className="text-[var(--text-dim)] text-xs">
                    Get specific, actionable fixes to improve your AI presence
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="w-full" style={{ marginBottom: '40px' }}>
            <h2
              className="font-mono text-[0.7rem] text-[var(--text-dim)] uppercase tracking-widest text-center"
              style={{ marginBottom: '16px' }}
            >
              How it works
            </h2>

            <div className="flex flex-col gap-4">
              {/* Step 1 */}
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                  <span className="text-[var(--green)] text-sm font-mono font-bold">1</span>
                </div>
                <div>
                  <p
                    className="text-[var(--text)] text-sm font-medium"
                    style={{ marginBottom: '2px' }}
                  >
                    Enter your website
                  </p>
                  <p className="text-[var(--text-dim)] text-xs">
                    We crawl your site to understand your business
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                  <span className="text-[var(--green)] text-sm font-mono font-bold">2</span>
                </div>
                <div>
                  <p
                    className="text-[var(--text)] text-sm font-medium"
                    style={{ marginBottom: '2px' }}
                  >
                    We scan 4 AI platforms
                  </p>
                  <p className="text-[var(--text-dim)] text-xs">
                    ChatGPT, Claude, Gemini, and Perplexity
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                  <span className="text-[var(--green)] text-sm font-mono font-bold">3</span>
                </div>
                <div>
                  <p
                    className="text-[var(--text)] text-sm font-medium"
                    style={{ marginBottom: '2px' }}
                  >
                    Get your report in minutes
                  </p>
                  <p className="text-[var(--text-dim)] text-xs">
                    See exactly what AI says about your business
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Video */}
          <div className="w-full" style={{ marginBottom: '40px' }}>
            <h2
              className="font-mono text-[0.7rem] text-[var(--text-dim)] uppercase tracking-widest text-center"
              style={{ marginBottom: '16px' }}
            >
              What you get
            </h2>
            <DemoVideo />
          </div>

          {/* Why We're Different Section */}
          <div className="w-full" style={{ marginBottom: '40px' }}>
            <h2
              className="font-mono text-[0.7rem] text-[var(--text-dim)] uppercase tracking-widest text-center"
              style={{ marginBottom: '16px' }}
            >
              Why we&apos;re different
            </h2>
            <div
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)]"
              style={{ padding: '20px' }}
            >
              <p
                className="text-[var(--text-mid)] text-sm text-center"
                style={{ marginBottom: '16px' }}
              >
                Other tools bundle dozens of features you&apos;ll never use. We focus on one
                thing: showing you exactly what AI says about your business. We believe every
                business deserves these insights — not just those with $500/month budgets.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[var(--green)] flex-shrink-0" style={{ marginTop: '2px' }} />
                  <span className="text-[var(--text)] text-sm">
                    No feature bloat — just the insights that matter
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[var(--green)] flex-shrink-0" style={{ marginTop: '2px' }} />
                  <span className="text-[var(--text)] text-sm">
                    Same AI platforms as the expensive tools
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[var(--green)] flex-shrink-0" style={{ marginTop: '2px' }} />
                  <span className="text-[var(--text)] text-sm">
                    Sign up in minutes, no sales calls required
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="w-full" style={{ marginBottom: '40px' }}>
            <h2
              className="font-mono text-[0.7rem] text-[var(--text-dim)] uppercase tracking-widest text-center"
              style={{ marginBottom: '16px' }}
            >
              What our customers say
            </h2>
            <div className="flex flex-col gap-4">
              {/* Testimonial 1 */}
              <div
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)]"
                style={{ padding: '16px' }}
              >
                <p
                  className="text-[var(--text-mid)] text-sm italic"
                  style={{ marginBottom: '12px' }}
                >
                  &ldquo;I was paying $99/month for another tool and getting the same insights.
                  Switched to outrankllm and saved $75/month with zero difference in quality.&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full bg-[var(--green)] flex items-center justify-center"
                    style={{ opacity: 0.2 }}
                  >
                    <span className="text-[var(--text)] text-xs font-bold">JM</span>
                  </div>
                  <div>
                    <p className="text-[var(--text)] text-sm font-medium">James M.</p>
                    <p className="text-[var(--text-dim)] text-xs">Marketing Director</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)]"
                style={{ padding: '16px' }}
              >
                <p
                  className="text-[var(--text-mid)] text-sm italic"
                  style={{ marginBottom: '12px' }}
                >
                  &ldquo;Finally understand why our competitors were ranking in AI results and we
                  weren&apos;t. The action plan alone was worth it.&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full bg-[var(--green)] flex items-center justify-center"
                    style={{ opacity: 0.2 }}
                  >
                    <span className="text-[var(--text)] text-xs font-bold">SR</span>
                  </div>
                  <div>
                    <p className="text-[var(--text)] text-sm font-medium">Sarah R.</p>
                    <p className="text-[var(--text-dim)] text-xs">Founder, SaaS startup</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)]"
                style={{ padding: '16px' }}
              >
                <p
                  className="text-[var(--text-mid)] text-sm italic"
                  style={{ marginBottom: '12px' }}
                >
                  &ldquo;We had no idea ChatGPT was recommending our main competitor instead of
                  us. Fixed it in two weeks using the insights from our report.&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full bg-[var(--green)] flex items-center justify-center"
                    style={{ opacity: 0.2 }}
                  >
                    <span className="text-[var(--text)] text-xs font-bold">DT</span>
                  </div>
                  <div>
                    <p className="text-[var(--text)] text-sm font-medium">David T.</p>
                    <p className="text-[var(--text-dim)] text-xs">E-commerce Owner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary CTA */}
          <button
            onClick={() => openModal('bottom_cta')}
            className="form-button flex items-center justify-center w-full gap-2"
            style={{ marginBottom: '48px', fontSize: '1rem', padding: '14px 24px' }}
          >
            Get Your Free Trial
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* JOURN3Y attribution */}
          <Journ3yAttribution />
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Scan Form Modal */}
      <ScanFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        triggerButtonRef={ctaButtonRef}
      />
    </>
  )
}
