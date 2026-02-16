/**
 * Trigger Enrichment for Trial Users
 *
 * This script triggers enrichment for all users who have been granted trial access.
 * It calls the admin/enrich endpoint for each user with their email.
 *
 * Usage:
 *   npx tsx scripts/trigger-trial-enrichment.ts
 *
 * Options:
 *   --dry-run       Show what would be done without making changes
 *   --limit=N       Only process N users (default: all)
 *   --prod          Run against production (default: localhost)
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'somerandomstring103333388300003qwh'

// Batch settings
const BATCH_SIZE = 10
const BATCH_DELAY_MS = 5000 // 5 seconds between batches

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

interface TrialUser {
  id: string
  email: string
  domain: string | null
  trial_tier: string
  trial_expires_at: string
}

async function getTrialUsers(limit?: number): Promise<TrialUser[]> {
  console.log('🔍 Finding trial users who need enrichment...\n')

  let query = supabase
    .from('leads')
    .select('id, email, domain, trial_tier, trial_expires_at')
    .eq('trial_tier', 'starter')
    .not('trial_expires_at', 'is', null)
    .order('created_at', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data: users, error } = await query

  if (error) {
    console.error('Error fetching trial users:', error)
    throw error
  }

  return users || []
}

async function triggerEnrichment(
  email: string,
  baseUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${baseUrl}/api/admin/enrich`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': ADMIN_SECRET,
      },
      body: JSON.stringify({
        email,
        force: true, // Clear existing data and re-enrich
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || `HTTP ${response.status}` }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const useProd = args.includes('--prod')
  const limitArg = args.find(a => a.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined

  const baseUrl = useProd ? 'https://outrankllm.io' : 'http://localhost:3000'

  console.log('🚀 Trial Enrichment Script')
  console.log('==========================\n')
  console.log(`🌐 Target: ${baseUrl}`)
  console.log(`🔄 Batch size: ${BATCH_SIZE}`)
  console.log(`⏱️  Batch delay: ${BATCH_DELAY_MS}ms`)
  if (limit) console.log(`📊 Limit: ${limit}`)
  if (dryRun) console.log(`🏃 Mode: DRY RUN`)
  console.log('')

  const trialUsers = await getTrialUsers(limit)

  if (trialUsers.length === 0) {
    console.log('✅ No trial users found!')
    return
  }

  console.log(`📊 Found ${trialUsers.length} trial users:\n`)

  if (dryRun) {
    console.log('🏃 DRY RUN - Would trigger enrichment for:\n')
    trialUsers.forEach((user, i) => {
      console.log(`${i + 1}. ${user.email} (${user.domain || 'no domain'})`)
    })
    console.log('\nRun without --dry-run to execute.')
    return
  }

  console.log('🚀 Starting enrichment...\n')

  let successCount = 0
  let failCount = 0
  const failures: { email: string; error: string }[] = []

  for (let i = 0; i < trialUsers.length; i++) {
    const user = trialUsers[i]
    const progress = `[${i + 1}/${trialUsers.length}]`

    process.stdout.write(`${progress} Triggering enrichment for ${user.email}... `)

    const result = await triggerEnrichment(user.email, baseUrl)

    if (result.success) {
      console.log('✅')
      successCount++
    } else {
      console.log(`❌ ${result.error}`)
      failCount++
      failures.push({ email: user.email, error: result.error || 'Unknown error' })
    }

    // Batch delay
    if ((i + 1) % BATCH_SIZE === 0 && i < trialUsers.length - 1) {
      console.log(`\n⏳ Waiting ${BATCH_DELAY_MS / 1000}s before next batch...\n`)
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS))
    }
  }

  console.log('\n📊 Enrichment Complete')
  console.log('======================')
  console.log(`✅ Success: ${successCount}`)
  console.log(`❌ Failed: ${failCount}`)

  if (failures.length > 0) {
    console.log('\n❌ Failures:')
    failures.forEach(f => {
      console.log(`   - ${f.email}: ${f.error}`)
    })
  }

  if (successCount > 0) {
    console.log('\n📡 Enrichment jobs dispatched to Inngest')
    console.log('   Monitor progress at: https://app.inngest.com')
  }
}

main().catch(console.error)
