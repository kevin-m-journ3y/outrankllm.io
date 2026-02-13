/**
 * HiringBrand Report Page - Server Component
 * Completely separate from outrankllm report
 */

// Force dynamic rendering — report data changes after scans complete
export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'
import { ReportClient } from './ReportClient'
import { fetchHBReportData } from '@/lib/hiringbrand-report-data'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function HiringBrandReportPage({ params }: PageProps) {
  const { token } = await params

  const reportData = await fetchHBReportData(token)

  if (!reportData) {
    notFound()
  }

  // Optional auth — detect user role and super-admin status without breaking public access
  let userRole: 'owner' | 'admin' | 'viewer' | null = null
  let isSuperAdmin = false
  try {
    const session = await getSession()
    if (session) {
      const SUPER_ADMIN_EMAILS = ['kevin.morrell@journ3y.com.au', 'adam.king@journ3y.com.au']
      isSuperAdmin = SUPER_ADMIN_EMAILS.includes(session.email.toLowerCase())

      if (reportData.organization) {
        const supabase = createServiceClient()
        const { data: membership } = await supabase
          .from('organization_members')
          .select('role')
          .eq('lead_id', session.lead_id)
          .eq('organization_id', reportData.organization.id)
          .single()
        if (membership) {
          userRole = membership.role as 'owner' | 'admin' | 'viewer'
        }
      }
    }
  } catch {
    // Not logged in — userRole stays null
  }

  return <ReportClient data={reportData} userRole={userRole} isSuperAdmin={isSuperAdmin} />
}

// Metadata
export async function generateMetadata({ params }: PageProps) {
  const { token } = await params
  const supabase = createServiceClient()

  const { data: report } = await supabase
    .from('reports')
    .select('run:scan_runs(domain)')
    .eq('url_token', token)
    .eq('brand', 'hiringbrand')
    .single()

  const domain = (report?.run as { domain: string } | null)?.domain || 'Company'
  const companyName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)

  return {
    title: `${companyName} - Employer Reputation Report | HiringBrand`,
    description: `AI employer reputation intelligence for ${companyName}. See how AI assistants describe your company to job seekers.`,
  }
}
