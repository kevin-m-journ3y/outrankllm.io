/**
 * Platform Detection Module
 * Detects CMS, frameworks, analytics, and other technology signals from websites
 */

export interface PlatformDetection {
  // CMS / Website Builder
  cms: string | null
  cmsConfidence: 'high' | 'medium' | 'low' | null

  // Frontend Framework
  framework: string | null

  // CSS Framework
  cssFramework: string | null

  // E-commerce Platform
  ecommerce: string | null

  // Hosting/Infrastructure hints
  hosting: string | null

  // Analytics platforms detected
  analytics: string[]

  // Lead capture tools detected
  leadCapture: string[]

  // Content sections found
  contentSections: {
    hasBlog: boolean
    hasCaseStudies: boolean
    hasResources: boolean
    hasFaq: boolean
    hasAboutPage: boolean
    hasTeamPage: boolean
    hasTestimonials: boolean
  }

  // E-commerce signals
  isEcommerce: boolean

  // "Vibe-coded" / AI-generated signals
  likelyAiGenerated: boolean
  aiSignals: string[]

  // AI Readability issues
  // Sites that use heavy client-side rendering won't be indexed well by AI
  hasAiReadabilityIssues: boolean
  aiReadabilityIssues: string[]
  rendersClientSide: boolean

  // Raw detection data for debugging
  detectedSignals: string[]
}

export interface DetectionInput {
  html: string
  headers: Record<string, string>
  url: string
  scripts?: string[]
  stylesheets?: string[]
  bodyClasses?: string[]
}

// ============================================
// CMS DETECTION PATTERNS
// ============================================

const CMS_PATTERNS: { name: string; patterns: RegExp[]; confidence: 'high' | 'medium' | 'low' }[] = [
  // WordPress
  {
    name: 'WordPress',
    patterns: [
      /<meta name="generator" content="WordPress[^"]*"/i,
      /wp-content\//i,
      /wp-includes\//i,
      /class="wp-/i,
      /\/wp-json\//i,
    ],
    confidence: 'high',
  },
  // Shopify
  {
    name: 'Shopify',
    patterns: [
      /cdn\.shopify\.com/i,
      /Shopify\.theme/i,
      /myshopify\.com/i,
      /<meta name="shopify-/i,
    ],
    confidence: 'high',
  },
  // Wix
  {
    name: 'Wix',
    patterns: [
      /<meta name="generator" content="Wix\.com[^"]*"/i,
      /static\.wix\.com/i,
      /wix-code-/i,
      /class="wix-/i,
      /wixsite\.com/i,
    ],
    confidence: 'high',
  },
  // Squarespace
  {
    name: 'Squarespace',
    patterns: [
      /<meta name="generator" content="Squarespace"/i,
      /static1\.squarespace\.com/i,
      /sqsp-/i,
      /class="sqs-/i,
      /squarespace-cdn\.com/i,
    ],
    confidence: 'high',
  },
  // Webflow
  {
    name: 'Webflow',
    patterns: [
      /<meta name="generator" content="Webflow"/i,
      /assets\.website-files\.com/i,
      /webflow\.com/i,
      /class="w-/i,
      /data-wf-/i,
    ],
    confidence: 'high',
  },
  // Drupal
  {
    name: 'Drupal',
    patterns: [
      /<meta name="generator" content="Drupal/i,
      /\/sites\/default\/files\//i,
      /Drupal\.settings/i,
      /drupal\.js/i,
    ],
    confidence: 'high',
  },
  // Joomla
  {
    name: 'Joomla',
    patterns: [
      /<meta name="generator" content="Joomla/i,
      /\/media\/jui\//i,
      /\/components\/com_/i,
    ],
    confidence: 'high',
  },
  // Ghost
  {
    name: 'Ghost',
    patterns: [
      /<meta name="generator" content="Ghost/i,
      /ghost-/i,
      /\/ghost\/api\//i,
    ],
    confidence: 'high',
  },
  // HubSpot CMS
  {
    name: 'HubSpot CMS',
    patterns: [
      /hs-scripts\.com/i,
      /hubspot\.com/i,
      /class="hs-/i,
      /hbspt\./i,
    ],
    confidence: 'medium',
  },
  // Framer
  {
    name: 'Framer',
    patterns: [
      /framer\.com/i,
      /framerusercontent\.com/i,
      /data-framer-/i,
    ],
    confidence: 'high',
  },
  // Carrd
  {
    name: 'Carrd',
    patterns: [
      /carrd\.co/i,
      /<meta name="generator" content="carrd\.co"/i,
    ],
    confidence: 'high',
  },
]

// ============================================
// FRAMEWORK DETECTION PATTERNS
// ============================================

const FRAMEWORK_PATTERNS: { name: string; patterns: RegExp[] }[] = [
  // Next.js
  {
    name: 'Next.js',
    patterns: [
      /_next\/static/i,
      /__NEXT_DATA__/i,
      /next\/dist\//i,
    ],
  },
  // React (generic)
  {
    name: 'React',
    patterns: [
      /react\.production\.min\.js/i,
      /react-dom/i,
      /data-reactroot/i,
      /__REACT_DEVTOOLS/i,
    ],
  },
  // Vue.js
  {
    name: 'Vue.js',
    patterns: [
      /vue\.runtime/i,
      /vue\.min\.js/i,
      /data-v-[a-f0-9]/i,
      /__VUE__/i,
    ],
  },
  // Nuxt.js
  {
    name: 'Nuxt.js',
    patterns: [
      /_nuxt\//i,
      /__NUXT__/i,
      /nuxt\.config/i,
    ],
  },
  // Angular
  {
    name: 'Angular',
    patterns: [
      /ng-version/i,
      /angular\.min\.js/i,
      /_ng[A-Z]/i,
      /ng-app/i,
    ],
  },
  // Svelte / SvelteKit
  {
    name: 'Svelte',
    patterns: [
      /svelte/i,
      /__sveltekit/i,
    ],
  },
  // Gatsby
  {
    name: 'Gatsby',
    patterns: [
      /gatsby-/i,
      /___gatsby/i,
      /gatsby\.js/i,
    ],
  },
  // Astro
  {
    name: 'Astro',
    patterns: [
      /astro/i,
      /data-astro-/i,
    ],
  },
]

// ============================================
// CSS FRAMEWORK DETECTION
// ============================================

const CSS_FRAMEWORK_PATTERNS: { name: string; patterns: RegExp[] }[] = [
  // Tailwind CSS
  {
    name: 'Tailwind CSS',
    patterns: [
      /tailwindcss/i,
      /class="[^"]*(?:flex|grid|bg-|text-|p-|m-|w-|h-)[^"]*"/i,
      /class="[^"]*(?:hover:|focus:|dark:)[^"]*"/i,
    ],
  },
  // Bootstrap
  {
    name: 'Bootstrap',
    patterns: [
      /bootstrap\.min\.css/i,
      /bootstrap\.min\.js/i,
      /class="[^"]*(?:container|row|col-|btn |navbar)[^"]*"/i,
    ],
  },
  // Material UI
  {
    name: 'Material UI',
    patterns: [
      /MuiButton/i,
      /material-ui/i,
      /@mui\//i,
      /class="Mui/i,
    ],
  },
  // Bulma
  {
    name: 'Bulma',
    patterns: [
      /bulma\.min\.css/i,
      /class="[^"]*(?:is-primary|is-success|is-info)[^"]*"/i,
    ],
  },
  // Foundation
  {
    name: 'Foundation',
    patterns: [
      /foundation\.min\.css/i,
      /foundation\.min\.js/i,
    ],
  },
]

// ============================================
// E-COMMERCE DETECTION
// ============================================

const ECOMMERCE_PATTERNS: { name: string; patterns: RegExp[] }[] = [
  // WooCommerce
  {
    name: 'WooCommerce',
    patterns: [
      /woocommerce/i,
      /wc-/i,
      /\/cart\//i,
      /add-to-cart/i,
    ],
  },
  // Magento
  {
    name: 'Magento',
    patterns: [
      /Magento/i,
      /mage\//i,
      /magento\.js/i,
    ],
  },
  // BigCommerce
  {
    name: 'BigCommerce',
    patterns: [
      /bigcommerce/i,
      /cdn\.bcapp\.com/i,
    ],
  },
  // PrestaShop
  {
    name: 'PrestaShop',
    patterns: [
      /prestashop/i,
      /PrestaShop/i,
    ],
  },
]

// ============================================
// ANALYTICS DETECTION
// ============================================

const ANALYTICS_PATTERNS: { name: string; patterns: RegExp[] }[] = [
  // Google Analytics 4
  {
    name: 'GA4',
    patterns: [
      /gtag\(/i,
      /google-analytics\.com\/g\//i,
      /googletagmanager\.com.*gtag/i,
      /G-[A-Z0-9]+/i,
    ],
  },
  // Google Tag Manager
  {
    name: 'GTM',
    patterns: [
      /googletagmanager\.com\/gtm/i,
      /GTM-[A-Z0-9]+/i,
    ],
  },
  // Mixpanel
  {
    name: 'Mixpanel',
    patterns: [
      /mixpanel/i,
      /cdn\.mxpnl\.com/i,
    ],
  },
  // Segment
  {
    name: 'Segment',
    patterns: [
      /segment\.com/i,
      /analytics\.min\.js/i,
      /cdn\.segment\.com/i,
    ],
  },
  // Heap
  {
    name: 'Heap',
    patterns: [
      /heap-/i,
      /heapanalytics\.com/i,
    ],
  },
  // Hotjar
  {
    name: 'Hotjar',
    patterns: [
      /hotjar/i,
      /static\.hotjar\.com/i,
    ],
  },
  // Plausible
  {
    name: 'Plausible',
    patterns: [
      /plausible\.io/i,
    ],
  },
  // Fathom
  {
    name: 'Fathom',
    patterns: [
      /usefathom\.com/i,
      /cdn\.usefathom\.com/i,
    ],
  },
  // PostHog
  {
    name: 'PostHog',
    patterns: [
      /posthog/i,
      /app\.posthog\.com/i,
    ],
  },
  // Amplitude
  {
    name: 'Amplitude',
    patterns: [
      /amplitude/i,
      /cdn\.amplitude\.com/i,
    ],
  },
]

// ============================================
// LEAD CAPTURE / TOOLS DETECTION
// ============================================

const LEAD_CAPTURE_PATTERNS: { name: string; patterns: RegExp[] }[] = [
  // Intercom
  {
    name: 'Intercom',
    patterns: [
      /intercom/i,
      /widget\.intercom\.io/i,
    ],
  },
  // Drift
  {
    name: 'Drift',
    patterns: [
      /drift\.com/i,
      /js\.driftt\.com/i,
    ],
  },
  // Zendesk
  {
    name: 'Zendesk',
    patterns: [
      /zendesk/i,
      /static\.zdassets\.com/i,
    ],
  },
  // HubSpot Forms
  {
    name: 'HubSpot Forms',
    patterns: [
      /hbspt\.forms/i,
      /forms\.hubspot\.com/i,
    ],
  },
  // Calendly
  {
    name: 'Calendly',
    patterns: [
      /calendly/i,
      /assets\.calendly\.com/i,
    ],
  },
  // Typeform
  {
    name: 'Typeform',
    patterns: [
      /typeform/i,
      /embed\.typeform\.com/i,
    ],
  },
  // Crisp
  {
    name: 'Crisp',
    patterns: [
      /crisp\.chat/i,
      /client\.crisp\.chat/i,
    ],
  },
  // Mailchimp
  {
    name: 'Mailchimp',
    patterns: [
      /mailchimp/i,
      /list-manage\.com/i,
      /mc\.js/i,
    ],
  },
  // Klaviyo
  {
    name: 'Klaviyo',
    patterns: [
      /klaviyo/i,
      /static\.klaviyo\.com/i,
    ],
  },
  // ConvertKit
  {
    name: 'ConvertKit',
    patterns: [
      /convertkit/i,
      /convertkit\.com/i,
    ],
  },
  // Tawk.to
  {
    name: 'Tawk.to',
    patterns: [
      /tawk\.to/i,
      /embed\.tawk\.to/i,
    ],
  },
  // LiveChat
  {
    name: 'LiveChat',
    patterns: [
      /livechat/i,
      /cdn\.livechatinc\.com/i,
    ],
  },
]

// ============================================
// HOSTING DETECTION (from headers)
// ============================================

const HOSTING_HEADER_PATTERNS: { name: string; header: string; patterns: RegExp[] }[] = [
  { name: 'Vercel', header: 'x-vercel-id', patterns: [/.*/] },
  { name: 'Vercel', header: 'server', patterns: [/vercel/i] },
  { name: 'Netlify', header: 'x-nf-request-id', patterns: [/.*/] },
  { name: 'Netlify', header: 'server', patterns: [/netlify/i] },
  { name: 'Cloudflare', header: 'cf-ray', patterns: [/.*/] },
  { name: 'Cloudflare', header: 'server', patterns: [/cloudflare/i] },
  { name: 'AWS', header: 'x-amz-cf-id', patterns: [/.*/] },
  { name: 'AWS', header: 'server', patterns: [/AmazonS3|CloudFront/i] },
  { name: 'Heroku', header: 'via', patterns: [/heroku/i] },
  { name: 'Google Cloud', header: 'server', patterns: [/Google Frontend/i] },
  { name: 'Azure', header: 'x-azure-ref', patterns: [/.*/] },
]

// ============================================
// CLIENT-SIDE RENDERING / AI-UNFRIENDLY PLATFORMS
// These platforms often don't render content server-side,
// making them difficult for AI crawlers to read
// ============================================

const CSR_PLATFORMS: { name: string; patterns: RegExp[]; severity: 'critical' | 'warning' }[] = [
  // Lovable - heavy client-side rendering
  {
    name: 'Lovable',
    patterns: [
      /lovable\.dev/i,
      /lovable\.app/i,
      /gptengineer\.app/i,
    ],
    severity: 'critical',
  },
  // Bubble - no-code, client-side heavy
  {
    name: 'Bubble',
    patterns: [
      /bubble\.io/i,
      /bubbleapps\.io/i,
      /class="bubble-/i,
    ],
    severity: 'critical',
  },
  // Glide - mobile app builder, very JS heavy
  {
    name: 'Glide',
    patterns: [
      /glideapp\.io/i,
      /glide\.page/i,
    ],
    severity: 'critical',
  },
  // Softr - Airtable-based, client-rendered
  {
    name: 'Softr',
    patterns: [
      /softr\.io/i,
      /softrplatform/i,
    ],
    severity: 'warning',
  },
  // Retool - internal tools, heavy JS
  {
    name: 'Retool',
    patterns: [
      /retool\.com/i,
      /tryretool\.com/i,
    ],
    severity: 'critical',
  },
  // Appsmith
  {
    name: 'Appsmith',
    patterns: [
      /appsmith/i,
    ],
    severity: 'critical',
  },
  // Single Page App indicators (generic)
  {
    name: 'SPA (generic)',
    patterns: [
      /<div id="root"><\/div>/i,
      /<div id="app"><\/div>/i,
      /<div id="__next"><\/div>/i, // Empty Next.js shell
    ],
    severity: 'warning',
  },
]

// ============================================
// AI-GENERATED SIGNALS
// ============================================

const AI_SIGNALS: { signal: string; patterns: RegExp[] }[] = [
  // shadcn/ui patterns (common in v0.dev, Cursor, Claude-generated code)
  {
    signal: 'shadcn/ui components',
    patterns: [
      /class="[^"]*(?:rounded-md|rounded-lg)[^"]*bg-(?:primary|secondary|muted)/i,
      /class="[^"]*inline-flex items-center justify-center/i,
      /data-slot=/i,
    ],
  },
  // v0.dev watermark
  {
    signal: 'v0.dev watermark',
    patterns: [
      /v0\.dev/i,
      /generated by v0/i,
    ],
  },
  // Radix UI (often paired with AI tools)
  {
    signal: 'Radix UI primitives',
    patterns: [
      /radix-ui/i,
      /@radix-ui/i,
      /data-radix-/i,
    ],
  },
  // Generic AI boilerplate patterns
  {
    signal: 'Generic hero section',
    patterns: [
      /class="[^"]*(?:hero|landing)[^"]*"[^>]*>\s*<(?:div|section)[^>]*class="[^"]*container/i,
    ],
  },
  // Lucide icons (very common in AI-generated code)
  {
    signal: 'Lucide icons',
    patterns: [
      /lucide-/i,
      /lucide\.dev/i,
    ],
  },
]

// ============================================
// CONTENT SECTION DETECTION
// ============================================

const CONTENT_SECTION_PATTERNS = {
  blog: [/\/blog\/?/i, /\/posts\/?/i, /\/articles\/?/i, /\/news\/?/i],
  caseStudies: [/\/case-stud/i, /\/success-stor/i, /\/portfolio\/?/i, /\/work\/?/i],
  resources: [/\/resources\/?/i, /\/guides\/?/i, /\/learn\/?/i, /\/documentation\/?/i],
  faq: [/\/faq\/?/i, /\/frequently-asked/i, /class="[^"]*faq/i, /<h[23][^>]*>.*(?:FAQ|Frequently Asked)/i],
  about: [/\/about\/?/i, /\/about-us\/?/i, /\/company\/?/i],
  team: [/\/team\/?/i, /\/our-team\/?/i, /\/people\/?/i, /\/leadership\/?/i],
  testimonials: [/testimonial/i, /\/reviews\/?/i, /class="[^"]*review/i, /customer-review/i],
}

// ============================================
// MAIN DETECTION FUNCTION
// ============================================

export function detectPlatform(input: DetectionInput): PlatformDetection {
  const { html, headers, url } = input
  const detectedSignals: string[] = []

  // Normalize headers to lowercase keys
  const normalizedHeaders: Record<string, string> = {}
  for (const [key, value] of Object.entries(headers)) {
    normalizedHeaders[key.toLowerCase()] = value
  }

  // Detect CMS
  let cms: string | null = null
  let cmsConfidence: 'high' | 'medium' | 'low' | null = null

  for (const detector of CMS_PATTERNS) {
    for (const pattern of detector.patterns) {
      if (pattern.test(html)) {
        cms = detector.name
        cmsConfidence = detector.confidence
        detectedSignals.push(`CMS: ${detector.name} (${detector.confidence})`)
        break
      }
    }
    if (cms) break
  }

  // Detect Framework
  let framework: string | null = null
  for (const detector of FRAMEWORK_PATTERNS) {
    for (const pattern of detector.patterns) {
      if (pattern.test(html)) {
        framework = detector.name
        detectedSignals.push(`Framework: ${detector.name}`)
        break
      }
    }
    if (framework) break
  }

  // Detect CSS Framework
  let cssFramework: string | null = null
  for (const detector of CSS_FRAMEWORK_PATTERNS) {
    for (const pattern of detector.patterns) {
      if (pattern.test(html)) {
        cssFramework = detector.name
        detectedSignals.push(`CSS: ${detector.name}`)
        break
      }
    }
    if (cssFramework) break
  }

  // Detect E-commerce
  let ecommerce: string | null = null
  for (const detector of ECOMMERCE_PATTERNS) {
    for (const pattern of detector.patterns) {
      if (pattern.test(html)) {
        ecommerce = detector.name
        detectedSignals.push(`E-commerce: ${detector.name}`)
        break
      }
    }
    if (ecommerce) break
  }

  // Shopify from CMS also means e-commerce
  if (cms === 'Shopify' && !ecommerce) {
    ecommerce = 'Shopify'
  }

  // Detect Hosting from headers
  let hosting: string | null = null
  for (const detector of HOSTING_HEADER_PATTERNS) {
    const headerValue = normalizedHeaders[detector.header.toLowerCase()]
    if (headerValue) {
      for (const pattern of detector.patterns) {
        if (pattern.test(headerValue)) {
          hosting = detector.name
          detectedSignals.push(`Hosting: ${detector.name}`)
          break
        }
      }
    }
    if (hosting) break
  }

  // Also check X-Powered-By header for framework hints
  const poweredBy = normalizedHeaders['x-powered-by']
  if (poweredBy) {
    detectedSignals.push(`X-Powered-By: ${poweredBy}`)
    if (!framework) {
      if (/next\.js/i.test(poweredBy)) framework = 'Next.js'
      else if (/express/i.test(poweredBy)) detectedSignals.push('Server: Express.js')
      else if (/php/i.test(poweredBy)) detectedSignals.push('Server: PHP')
    }
  }

  // Detect Analytics
  const analytics: string[] = []
  for (const detector of ANALYTICS_PATTERNS) {
    for (const pattern of detector.patterns) {
      if (pattern.test(html)) {
        if (!analytics.includes(detector.name)) {
          analytics.push(detector.name)
          detectedSignals.push(`Analytics: ${detector.name}`)
        }
        break
      }
    }
  }

  // Detect Lead Capture tools
  const leadCapture: string[] = []
  for (const detector of LEAD_CAPTURE_PATTERNS) {
    for (const pattern of detector.patterns) {
      if (pattern.test(html)) {
        if (!leadCapture.includes(detector.name)) {
          leadCapture.push(detector.name)
          detectedSignals.push(`Lead Capture: ${detector.name}`)
        }
        break
      }
    }
  }

  // Detect Contact Form (generic)
  if (/<form[^>]*>[\s\S]*?(?:email|contact|message|submit)/i.test(html)) {
    if (!leadCapture.includes('Contact Form')) {
      leadCapture.push('Contact Form')
      detectedSignals.push('Lead Capture: Contact Form')
    }
  }

  // Detect Content Sections
  const contentSections = {
    hasBlog: CONTENT_SECTION_PATTERNS.blog.some(p => p.test(html) || p.test(url)),
    hasCaseStudies: CONTENT_SECTION_PATTERNS.caseStudies.some(p => p.test(html) || p.test(url)),
    hasResources: CONTENT_SECTION_PATTERNS.resources.some(p => p.test(html) || p.test(url)),
    hasFaq: CONTENT_SECTION_PATTERNS.faq.some(p => p.test(html)),
    hasAboutPage: CONTENT_SECTION_PATTERNS.about.some(p => p.test(html) || p.test(url)),
    hasTeamPage: CONTENT_SECTION_PATTERNS.team.some(p => p.test(html) || p.test(url)),
    hasTestimonials: CONTENT_SECTION_PATTERNS.testimonials.some(p => p.test(html)),
  }

  // Log detected content sections
  if (contentSections.hasBlog) detectedSignals.push('Content: Blog')
  if (contentSections.hasCaseStudies) detectedSignals.push('Content: Case Studies')
  if (contentSections.hasResources) detectedSignals.push('Content: Resources')
  if (contentSections.hasFaq) detectedSignals.push('Content: FAQ')
  if (contentSections.hasAboutPage) detectedSignals.push('Content: About Page')
  if (contentSections.hasTeamPage) detectedSignals.push('Content: Team Page')
  if (contentSections.hasTestimonials) detectedSignals.push('Content: Testimonials')

  // Detect E-commerce signals (cart, checkout, products)
  const isEcommerce = !!(
    ecommerce ||
    /\/cart\/?/i.test(html) ||
    /\/checkout\/?/i.test(html) ||
    /add-to-cart/i.test(html) ||
    /\/products?\/?/i.test(html) ||
    /\/shop\/?/i.test(html)
  )

  // Detect AI-generated signals
  const aiSignals: string[] = []
  for (const detector of AI_SIGNALS) {
    for (const pattern of detector.patterns) {
      if (pattern.test(html)) {
        if (!aiSignals.includes(detector.signal)) {
          aiSignals.push(detector.signal)
          detectedSignals.push(`AI Signal: ${detector.signal}`)
        }
        break
      }
    }
  }

  // Determine if likely AI-generated (3+ signals or strong indicators)
  const likelyAiGenerated = aiSignals.length >= 2 ||
    aiSignals.includes('v0.dev watermark') ||
    (aiSignals.includes('shadcn/ui components') && aiSignals.includes('Lucide icons'))

  // Detect CSR / AI-unfriendly platforms
  const aiReadabilityIssues: string[] = []
  let rendersClientSide = false

  for (const detector of CSR_PLATFORMS) {
    for (const pattern of detector.patterns) {
      if (pattern.test(html) || pattern.test(url)) {
        const issue = detector.severity === 'critical'
          ? `${detector.name} uses heavy client-side rendering - AI crawlers cannot read content`
          : `${detector.name} may have limited server-side rendering`
        if (!aiReadabilityIssues.includes(issue)) {
          aiReadabilityIssues.push(issue)
          detectedSignals.push(`CSR Platform: ${detector.name} (${detector.severity})`)
        }
        if (detector.severity === 'critical') {
          rendersClientSide = true
        }
        break
      }
    }
  }

  // Check for minimal body content (sign of client-side rendering)
  // Extract text from body, excluding scripts/styles
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch) {
    const bodyContent = bodyMatch[1]
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    // If body has very little text content, it's likely CSR
    if (bodyContent.length < 200) {
      aiReadabilityIssues.push('Very little server-rendered content detected - site may rely on JavaScript rendering')
      detectedSignals.push('CSR Warning: Minimal body content (<200 chars)')
      rendersClientSide = true
    } else if (bodyContent.length < 500 && !cms) {
      // Slightly more content but still suspicious for a custom site
      detectedSignals.push('CSR Notice: Limited body content (200-500 chars)')
    }
  }

  // Check for empty root divs (React/Vue SPA pattern without SSR)
  if (/<div id="(?:root|app|__next)">\s*<\/div>/i.test(html)) {
    if (!aiReadabilityIssues.some(i => i.includes('empty root'))) {
      aiReadabilityIssues.push('Empty root element detected - content loads via JavaScript only')
      detectedSignals.push('CSR Warning: Empty root div')
      rendersClientSide = true
    }
  }

  const hasAiReadabilityIssues = aiReadabilityIssues.length > 0

  return {
    cms,
    cmsConfidence,
    framework,
    cssFramework,
    ecommerce,
    hosting,
    analytics,
    leadCapture,
    contentSections,
    isEcommerce,
    likelyAiGenerated,
    aiSignals,
    hasAiReadabilityIssues,
    aiReadabilityIssues,
    rendersClientSide,
    detectedSignals,
  }
}

/**
 * Fetch a page and detect its platform
 * Standalone function for testing/re-detection
 */
export async function detectPlatformFromUrl(url: string): Promise<PlatformDetection> {
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(normalizedUrl, {
      headers: { 'User-Agent': 'outrankllm-crawler/1.0' },
      signal: controller.signal,
      redirect: 'follow',
    })

    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()

    // Extract headers
    const headers: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      headers[key] = value
    })

    return detectPlatform({ html, headers, url: normalizedUrl })
  } catch (error) {
    clearTimeout(timeout)
    throw error
  }
}

/**
 * Format detection results for display
 */
export function formatPlatformSummary(detection: PlatformDetection): {
  platform: string
  techStack: string
  analytics: string
  leadCapture: string
  content: string
  aiReadability: string
  aiReadabilityStatus: 'good' | 'warning' | 'critical'
} {
  // Platform
  let platform = detection.cms || 'Custom-built'
  if (detection.cmsConfidence && detection.cms) {
    platform = detection.cms
  }

  // Tech Stack
  const techParts: string[] = []
  if (detection.framework) techParts.push(detection.framework)
  if (detection.cssFramework) techParts.push(detection.cssFramework)
  if (detection.hosting) techParts.push(detection.hosting)
  const techStack = techParts.length > 0 ? techParts.join(', ') : 'Not detected'

  // Analytics
  const analytics = detection.analytics.length > 0
    ? detection.analytics.join(', ')
    : 'None detected'

  // Lead Capture
  const leadCapture = detection.leadCapture.length > 0
    ? detection.leadCapture.join(', ')
    : 'None detected'

  // Content
  const contentParts: string[] = []
  if (detection.contentSections.hasBlog) contentParts.push('Blog')
  if (detection.contentSections.hasCaseStudies) contentParts.push('Case Studies')
  if (detection.contentSections.hasResources) contentParts.push('Resources')
  if (detection.contentSections.hasFaq) contentParts.push('FAQ')
  const content = contentParts.length > 0 ? contentParts.join(', ') : 'Basic pages only'

  // AI Readability
  let aiReadability: string
  let aiReadabilityStatus: 'good' | 'warning' | 'critical'

  if (detection.rendersClientSide) {
    aiReadability = 'Content may not be visible to AI'
    aiReadabilityStatus = 'critical'
  } else if (detection.hasAiReadabilityIssues) {
    aiReadability = 'Potential issues detected'
    aiReadabilityStatus = 'warning'
  } else {
    aiReadability = 'Good - server-rendered'
    aiReadabilityStatus = 'good'
  }

  return { platform, techStack, analytics, leadCapture, content, aiReadability, aiReadabilityStatus }
}
