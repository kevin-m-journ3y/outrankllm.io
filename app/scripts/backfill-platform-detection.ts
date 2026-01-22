/**
 * Backfill platform detection data for existing reports
 *
 * This script queries the database for reports missing platform detection data
 * and calls the redetect-platform endpoint to populate it.
 *
 * Usage:
 *   npx tsx scripts/backfill-platform-detection.ts
 *
 * Options:
 *   --dry-run       Show what would be done without making changes
 *   --force-unknown Mark failed detections as 'unknown' (for invalid/blocked domains)
 *   --limit=N       Only process N reports (default: all)
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ADMIN_SECRET = process.env.ADMIN_SECRET!
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

if (!ADMIN_SECRET) {
  console.error('Missing ADMIN_SECRET')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

interface ReportToBackfill {
  url_token: string
  domain: string | null
  email: string
  tier: string | null
}

async function getReportsNeedingBackfill(limit?: number): Promise<ReportToBackfill[]> {
  // Get reports where site_analyses.detected_cms is NULL
  let query = supabase
    .from('reports')
    .select(`
      url_token,
      scan_runs!inner (
        domain,
        leads!inner (
          email,
          tier
        ),
        site_analyses!inner (
          detected_cms
        )
      )
    `)
    .is('scan_runs.site_analyses.detected_cms', null)
    .not('scan_runs.domain', 'is', null)
    .order('created_at', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching reports:', error)
    throw error
  }

  // Flatten the nested structure
  return (data || []).map((r: any) => ({
    url_token: r.url_token,
    domain: r.scan_runs?.domain,
    email: r.scan_runs?.leads?.email,
    tier: r.scan_runs?.leads?.tier,
  }))
}

async function redetectPlatform(reportToken: string): Promise<{ success: boolean; domain?: string; error?: string }> {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/redetect-platform`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': ADMIN_SECRET,
      },
      body: JSON.stringify({
        reportToken,
        save: true,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      return { success: false, error: result.error || 'Unknown error' }
    }

    return { success: true, domain: result.domain }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Fetch failed' }
  }
}

async function markAsUnknown(reportToken: string): Promise<{ success: boolean; error?: string }> {
  // Directly mark a report as 'unknown' when platform detection fails
  // This is used for domains that can't be fetched (invalid, bot protection, etc.)
  try {
    // First get the run_id for this report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('run_id')
      .eq('url_token', reportToken)
      .single()

    if (reportError || !report?.run_id) {
      return { success: false, error: 'Report not found' }
    }

    // Update site_analyses to mark as unknown
    const { error: updateError } = await supabase
      .from('site_analyses')
      .update({ detected_cms: 'unknown' })
      .eq('run_id', report.run_id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const forceUnknown = args.includes('--force-unknown')
  const limitArg = args.find(a => a.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined

  console.log('🔍 Fetching reports needing platform detection backfill...\n')

  const reports = await getReportsNeedingBackfill(limit)

  if (reports.length === 0) {
    console.log('✅ No reports need backfilling!')
    return
  }

  // Group by subscription tier for display
  const byTier = reports.reduce((acc, r) => {
    const tier = r.tier || 'free'
    acc[tier] = (acc[tier] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  console.log(`📊 Found ${reports.length} reports needing backfill:`)
  Object.entries(byTier).forEach(([tier, count]) => {
    console.log(`   - ${tier}: ${count}`)
  })
  console.log('')

  if (dryRun) {
    console.log('🏃 DRY RUN - Would process the following reports:\n')
    reports.forEach((r, i) => {
      console.log(`${i + 1}. ${r.domain} (${r.email}) - ${r.tier || 'free'}`)
    })
    console.log('\nRun without --dry-run to execute backfill.')
    return
  }

  console.log('🚀 Starting backfill...\n')

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < reports.length; i++) {
    const report = reports[i]
    const progress = `[${i + 1}/${reports.length}]`

    process.stdout.write(`${progress} Processing ${report.domain}... `)

    let result = await redetectPlatform(report.url_token)

    if (result.success) {
      console.log('✅')
      successCount++
    } else if (forceUnknown) {
      // If detection failed and --force-unknown is set, mark as unknown directly
      process.stdout.write(`⚠️  Detection failed, marking as unknown... `)
      const unknownResult = await markAsUnknown(report.url_token)
      if (unknownResult.success) {
        console.log('✅')
        successCount++
      } else {
        console.log(`❌ ${unknownResult.error}`)
        failCount++
      }
    } else {
      console.log(`❌ ${result.error}`)
      failCount++
    }

    // Small delay to avoid overwhelming the server
    if (i < reports.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  console.log('\n📊 Backfill complete:')
  console.log(`   ✅ Success: ${successCount}`)
  console.log(`   ❌ Failed: ${failCount}`)
}

main().catch(console.error)
