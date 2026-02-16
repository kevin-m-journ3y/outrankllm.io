/**
 * Check trial report expiry dates
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

async function check() {
  // Check the specific report mentioned
  const { data: specificReport } = await supabase
    .from('reports')
    .select('url_token, expires_at, run_id')
    .eq('url_token', '0a627e813b9b75d5')
    .single()

  console.log('Specific report (0a627e813b9b75d5):')
  console.log(specificReport)
  console.log('')

  // Get the lead for this report
  const { data: scanRun } = await supabase
    .from('scan_runs')
    .select('lead_id, id')
    .eq('id', specificReport?.run_id)
    .single()

  console.log('Scan run:', scanRun)

  // Check the lead's trial status
  const { data: lead } = await supabase
    .from('leads')
    .select('id, email, trial_tier, trial_expires_at, tier')
    .eq('id', scanRun?.lead_id)
    .single()

  console.log('Lead:', lead)
  console.log('')

  // Count reports that should be Feb 7 but aren't
  const { data: trialLeads } = await supabase
    .from('leads')
    .select('id')
    .eq('trial_tier', 'starter')
    .not('trial_expires_at', 'is', null)

  const trialLeadIds = trialLeads?.map((l: { id: string }) => l.id) || []
  console.log('Total trial leads:', trialLeadIds.length)

  // Get all reports for trial leads
  const { data: trialScans } = await supabase
    .from('scan_runs')
    .select('id, lead_id')
    .in('lead_id', trialLeadIds)
    .eq('status', 'complete')

  const scanIds = trialScans?.map((s: { id: string }) => s.id) || []
  console.log('Total completed scans for trial leads:', scanIds.length)

  // Check reports not set to Feb 7
  const { data: wrongExpiry, count } = await supabase
    .from('reports')
    .select('url_token, expires_at, run_id', { count: 'exact' })
    .in('run_id', scanIds)
    .neq('expires_at', '2026-02-07T13:00:00.000Z')

  console.log('')
  console.log('Reports with WRONG expiry (not Feb 7):', count)
  if (wrongExpiry && wrongExpiry.length > 0) {
    console.log('First 10:')
    wrongExpiry.slice(0, 10).forEach((r: { url_token: string; expires_at: string }) => {
      console.log('  ', r.url_token, '-', r.expires_at)
    })
  }

  // Check reports correctly set
  const { count: correctCount } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .in('run_id', scanIds)
    .eq('expires_at', '2026-02-07T13:00:00.000Z')

  console.log('Reports with CORRECT expiry (Feb 7):', correctCount)
}

check().catch(console.error)
