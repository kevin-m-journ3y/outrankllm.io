/**
 * Fix trial expiry dates to Feb 7
 * Updates both leads.trial_expires_at and reports.expires_at
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

// Feb 7th 2026 at midnight Sydney time (AEDT = UTC+11)
// midnight AEDT = 13:00 UTC on Feb 6th
const PROMO_TRIAL_EXPIRY = '2026-02-07T13:00:00.000Z'

async function fix() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')

  console.log('🔧 Fix Trial Expiry Script')
  console.log('==========================\n')
  console.log(`📅 Target expiry: ${new Date(PROMO_TRIAL_EXPIRY).toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })} AEDT`)
  if (dryRun) console.log('🏃 Mode: DRY RUN')
  console.log('')

  // Get all trial leads
  const { data: trialLeads, error: leadsError } = await supabase
    .from('leads')
    .select('id, email, trial_tier, trial_expires_at')
    .eq('trial_tier', 'starter')
    .not('trial_expires_at', 'is', null)

  if (leadsError) {
    console.error('Error fetching leads:', leadsError)
    return
  }

  console.log(`Found ${trialLeads?.length || 0} trial leads\n`)

  // Find leads with wrong expiry (compare dates, not strings)
  const targetDate = new Date(PROMO_TRIAL_EXPIRY).getTime()
  const wrongLeads = (trialLeads || []).filter(
    (l: { trial_expires_at: string }) => {
      const leadDate = new Date(l.trial_expires_at).getTime()
      // Allow 1 second tolerance for rounding
      return Math.abs(leadDate - targetDate) > 1000
    }
  )
  console.log(`Leads with WRONG trial_expires_at: ${wrongLeads.length}`)
  wrongLeads.forEach((l: { email: string; trial_expires_at: string }) => {
    console.log(`  - ${l.email}: ${l.trial_expires_at}`)
  })
  console.log('')

  // Get all scan runs for trial leads
  const trialLeadIds = (trialLeads || []).map((l: { id: string }) => l.id)
  const { data: scanRuns } = await supabase
    .from('scan_runs')
    .select('id, lead_id')
    .in('lead_id', trialLeadIds)
    .eq('status', 'complete')

  const scanIds = (scanRuns || []).map((s: { id: string }) => s.id)

  // Get all reports for trial leads
  const { data: allReports } = await supabase
    .from('reports')
    .select('url_token, expires_at, run_id')
    .in('run_id', scanIds)

  // Filter to reports with wrong expiry (compare dates, not strings)
  const wrongReports = (allReports || []).filter(
    (r: { expires_at: string }) => {
      const reportDate = new Date(r.expires_at).getTime()
      // Allow 1 second tolerance for rounding
      return Math.abs(reportDate - targetDate) > 1000
    }
  )

  console.log(`Reports with WRONG expires_at: ${wrongReports?.length || 0}`)
  ;(wrongReports || []).forEach((r: { url_token: string; expires_at: string }) => {
    console.log(`  - ${r.url_token}: ${r.expires_at}`)
  })
  console.log('')

  if (dryRun) {
    console.log('🏃 DRY RUN - No changes made')
    console.log('Run without --dry-run to apply fixes')
    return
  }

  // Fix leads
  if (wrongLeads.length > 0) {
    console.log('Fixing leads...')
    const wrongLeadIds = wrongLeads.map((l: { id: string }) => l.id)
    const { error: updateLeadsError } = await supabase
      .from('leads')
      .update({ trial_expires_at: PROMO_TRIAL_EXPIRY })
      .in('id', wrongLeadIds)

    if (updateLeadsError) {
      console.error('Error updating leads:', updateLeadsError)
    } else {
      console.log(`✅ Fixed ${wrongLeads.length} leads`)
    }
  }

  // Fix reports
  if (wrongReports && wrongReports.length > 0) {
    console.log('Fixing reports...')
    const wrongRunIds = wrongReports.map((r: { run_id: string }) => r.run_id)
    const { error: updateReportsError } = await supabase
      .from('reports')
      .update({ expires_at: PROMO_TRIAL_EXPIRY })
      .in('run_id', wrongRunIds)

    if (updateReportsError) {
      console.error('Error updating reports:', updateReportsError)
    } else {
      console.log(`✅ Fixed ${wrongReports.length} reports`)
    }
  }

  console.log('\n✅ Done!')
}

fix().catch(console.error)
