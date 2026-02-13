/**
 * HiringBrand Super-Admin Organizations API
 * GET  — List all organizations with usage counts
 * POST — Create a new organization
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireHBSuperAdmin } from '@/lib/hiringbrand-auth'
import { createServiceClient } from '@/lib/supabase/server'
import { createOrganization, updateOrganization } from '@/lib/organization'
import type { OrganizationTier } from '@/lib/organization'

export async function GET() {
  try {
    await requireHBSuperAdmin()

    const supabase = createServiceClient()

    // Fetch all orgs with aggregated counts in a single query
    const { data: orgs, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Admin list orgs error:', error)
      return NextResponse.json({ error: 'Failed to load organizations' }, { status: 500 })
    }

    // For each org, get member count, pending invite count, domain count, and owner email
    const enriched = await Promise.all(
      (orgs || []).map(async (org: Record<string, unknown>) => {
        const [
          { count: memberCount },
          { count: inviteCount },
          { data: domains },
          { data: ownerMember },
        ] = await Promise.all([
          supabase
            .from('organization_members')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', org.id),
          supabase
            .from('organization_invites')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', org.id)
            .is('accepted_at', null),
          supabase
            .from('monitored_domains')
            .select('domain, company_name')
            .eq('organization_id', org.id),
          supabase
            .from('organization_members')
            .select('leads!inner(email)')
            .eq('organization_id', org.id)
            .eq('role', 'owner')
            .single(),
        ])

        const ownerEmail = (ownerMember as { leads?: { email?: string } } | null)?.leads?.email || null

        return {
          id: org.id,
          name: org.name,
          tier: org.tier,
          status: org.status,
          domainLimit: org.domain_limit,
          maxUsers: org.max_users,
          maxQuestions: org.max_questions,
          maxCompetitors: org.max_competitors,
          ownerEmail,
          memberCount: memberCount || 0,
          pendingInviteCount: inviteCount || 0,
          domains: (domains || []).map((d: { domain: string; company_name: string | null }) => ({
            domain: d.domain,
            companyName: d.company_name,
          })),
          createdAt: org.created_at,
        }
      })
    )

    return NextResponse.json({ organizations: enriched })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    if (message === 'Unauthorized' || message === 'Super admin access required') {
      return NextResponse.json({ error: message }, { status: 403 })
    }
    console.error('Admin list orgs error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireHBSuperAdmin()

    const { name, ownerEmail, tier, maxUsers, maxQuestions, maxCompetitors, domainLimit } =
      await request.json()

    if (!name || !ownerEmail) {
      return NextResponse.json(
        { error: 'name and ownerEmail are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Look up or create lead for owner
    let { data: lead } = await supabase
      .from('leads')
      .select('id')
      .eq('email', ownerEmail.toLowerCase())
      .single()

    if (!lead) {
      const { data: newLead, error: leadError } = await supabase
        .from('leads')
        .insert({ email: ownerEmail.toLowerCase(), name: name })
        .select('id')
        .single()

      if (leadError || !newLead) {
        console.error('Failed to create lead:', leadError)
        return NextResponse.json({ error: 'Failed to create owner lead' }, { status: 500 })
      }
      lead = newLead
    }

    // Create organization
    const org = await createOrganization(
      { name, tier: (tier as OrganizationTier) || 'brand' },
      lead.id
    )

    if (!org) {
      return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
    }

    // Update limits and activate
    await updateOrganization(org.id, {
      status: 'active',
      ...(domainLimit != null && { domain_limit: domainLimit }),
      ...(maxUsers != null && { max_users: maxUsers }),
      ...(maxQuestions != null && { max_questions: maxQuestions }),
      ...(maxCompetitors != null && { max_competitors: maxCompetitors }),
    })

    return NextResponse.json({ success: true, organizationId: org.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    if (message === 'Unauthorized' || message === 'Super admin access required') {
      return NextResponse.json({ error: message }, { status: 403 })
    }
    console.error('Admin create org error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
