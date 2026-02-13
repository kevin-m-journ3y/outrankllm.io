/**
 * HiringBrand Super-Admin Single Organization API
 * PATCH — Update org limits and settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireHBSuperAdmin } from '@/lib/hiringbrand-auth'
import { updateOrganization } from '@/lib/organization'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireHBSuperAdmin()

    const { id } = await params
    const body = await request.json()

    const allowedFields = [
      'name', 'tier', 'status', 'domain_limit',
      'max_users', 'max_questions', 'max_competitors',
    ] as const

    // Build update payload from allowed fields only
    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const org = await updateOrganization(id, updates)
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, organization: org })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    if (message === 'Unauthorized' || message === 'Super admin access required') {
      return NextResponse.json({ error: message }, { status: 403 })
    }
    console.error('Admin update org error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
