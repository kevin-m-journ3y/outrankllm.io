/**
 * Test script for employer-research.ts
 * Run: npx tsx scripts/test-employer-research.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv'
config({ path: '.env.local' })

import { researchEmployer, generateFallbackEmployerQuestions } from '../src/lib/ai/employer-research'
import type { EmployerAnalysis } from '../src/lib/ai/employer-research'

// Test companies
const TEST_COMPANIES: EmployerAnalysis[] = [
  {
    companyName: 'Atlassian',
    industry: 'Technology / Software',
    location: 'Sydney, Australia',
    companySize: '10,000+ employees',
    commonRoles: ['Software Engineer', 'Product Manager', 'Designer', 'Data Scientist'],
    cultureKeywords: ['collaborative', 'innovative', 'flexible', 'remote-friendly'],
  },
  {
    companyName: 'Canva',
    industry: 'Technology / Design Software',
    location: 'Sydney, Australia',
    companySize: '3,000+ employees',
    commonRoles: ['Software Engineer', 'Designer', 'Marketing', 'Customer Success'],
    cultureKeywords: ['creative', 'fast-paced', 'mission-driven', 'inclusive'],
  },
  {
    companyName: 'Commonwealth Bank',
    industry: 'Banking / Financial Services',
    location: 'Sydney, Australia',
    companySize: '50,000+ employees',
    commonRoles: ['Software Engineer', 'Data Analyst', 'Product Manager', 'Risk Analyst'],
    cultureKeywords: ['stable', 'professional', 'structured', 'benefits-focused'],
  },
]

async function testEmployerResearch(company: EmployerAnalysis) {
  console.log('\n' + '='.repeat(60))
  console.log(`Testing: ${company.companyName}`)
  console.log('='.repeat(60))

  const runId = `test-${Date.now()}`

  try {
    const startTime = Date.now()

    const result = await researchEmployer(company, runId, (platform, step) => {
      console.log(`  [${platform}] ${step}`)
    })

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)

    console.log(`\n✓ Completed in ${duration}s`)

    // Display competitors
    console.log('\n📊 Competitor Employers:')
    if (result.competitors.length === 0) {
      console.log('  (none found)')
    } else {
      for (const comp of result.competitors) {
        console.log(`  • ${comp.name}${comp.domain ? ` (${comp.domain})` : ''}`)
        console.log(`    └─ ${comp.reason}`)
      }
    }

    // Display questions
    console.log('\n❓ Generated Questions:')
    const categoryEmoji: Record<string, string> = {
      reputation: '⭐',
      culture: '🏢',
      compensation: '💰',
      growth: '📈',
      comparison: '⚖️',
      industry: '🏆',
      balance: '⚖️',
      leadership: '👔',
    }

    for (let i = 0; i < result.questions.length; i++) {
      const q = result.questions[i]
      const emoji = categoryEmoji[q.category] || '❓'
      const platforms = q.suggestedBy.length > 0 ? ` [${q.suggestedBy.join(', ')}]` : ''
      console.log(`  ${i + 1}. ${emoji} ${q.question}`)
      console.log(`     └─ ${q.category}${platforms} (score: ${q.relevanceScore})`)
    }

    // Category distribution
    console.log('\n📈 Category Distribution:')
    const categoryCount = new Map<string, number>()
    for (const q of result.questions) {
      categoryCount.set(q.category, (categoryCount.get(q.category) || 0) + 1)
    }
    for (const [cat, count] of categoryCount) {
      console.log(`  ${cat}: ${count}`)
    }

    return result
  } catch (error) {
    console.error(`\n✗ Error:`, error)

    // Show fallback
    console.log('\n📋 Fallback Questions:')
    const fallback = generateFallbackEmployerQuestions(company, [
      { name: 'Competitor Co', reason: 'test' },
    ])
    for (const q of fallback) {
      console.log(`  • ${q.question} [${q.category}]`)
    }

    return null
  }
}

async function main() {
  console.log('🔬 Employer Research Test')
  console.log('Testing dynamic question generation for HiringBrand\n')

  // Check for API keys
  const hasOpenAI = !!process.env.OPENAI_API_KEY
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
  const hasGoogle =
    !!process.env.GOOGLE_AI_API_KEY ||
    !!process.env.GOOGLE_API_KEY ||
    !!process.env.GOOGLE_GENERATIVE_AI_API_KEY
  const hasGateway = !!process.env.VERCEL_AI_GATEWAY_KEY || !!process.env.AI_GATEWAY_API_KEY

  console.log('API Keys:')
  console.log(`  OpenAI: ${hasOpenAI ? '✓' : '✗'}`)
  console.log(`  Anthropic: ${hasAnthropic ? '✓' : '✗'}`)
  console.log(`  Google: ${hasGoogle ? '✓' : '✗'}`)
  console.log(`  Gateway: ${hasGateway ? '✓' : '✗'}`)

  if (!hasGateway && (!hasOpenAI || !hasAnthropic || !hasGoogle)) {
    console.log('\n⚠️  Warning: Some API keys missing. Results may be incomplete.')
  }

  // Get company index from args (default to first)
  const companyIndex = parseInt(process.argv[2] || '0', 10)
  const company = TEST_COMPANIES[companyIndex] || TEST_COMPANIES[0]

  console.log(`\nTesting company index: ${companyIndex}`)
  console.log('Available companies:')
  TEST_COMPANIES.forEach((c, i) => {
    console.log(`  ${i}: ${c.companyName}${i === companyIndex ? ' ← selected' : ''}`)
  })

  await testEmployerResearch(company)

  console.log('\n' + '='.repeat(60))
  console.log('Test complete!')
  console.log('='.repeat(60))
}

main().catch(console.error)
