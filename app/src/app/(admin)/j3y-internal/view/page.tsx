import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin'
import { AdminReportViewer } from './AdminReportViewer'

/**
 * Secret admin page for viewing any user's report
 *
 * URL: /j3y-internal/view
 * Query: ?token=xxx
 *
 * Only accessible by admin users (kevin.morrell@journ3y.com.au, adam.king@journ3y.com.au)
 */
export default async function AdminViewPage() {
  // Check admin access server-side
  const session = await getAdminSession()

  if (!session) {
    // Redirect non-admins to login
    redirect('/login?redirect=/j3y-internal/view')
  }

  return <AdminReportViewer adminEmail={session.email} />
}

export const metadata = {
  title: 'Admin Report Viewer | outrankllm.io',
  robots: 'noindex, nofollow',
}
