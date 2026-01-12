import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { getFeatureFlags } from '@/lib/features/flags'

/**
 * PATCH /api/actions/[id]
 * Update action item status
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession()
    const supabase = createServiceClient()
    const { id } = await params

    // Check feature flags
    const flags = await getFeatureFlags(session.tier)
    if (!flags.showActionPlans) {
      return NextResponse.json(
        { error: 'Upgrade to manage action plans' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status } = body

    if (!status || !['pending', 'in_progress', 'completed', 'dismissed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Verify the action item belongs to this user's plan (include fields for history)
    const { data: item, error: fetchError } = await supabase
      .from('action_items')
      .select('id, plan_id, title, description, category, action_plans!inner(lead_id, domain_subscription_id)')
      .eq('id', id)
      .single()

    if (fetchError || !item) {
      return NextResponse.json(
        { error: 'Action item not found' },
        { status: 404 }
      )
    }

    // Check ownership via the plan
    const actionPlan = item.action_plans as { lead_id: string; domain_subscription_id: string | null }
    if (actionPlan.lead_id !== session.lead_id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update the action item
    const updateData: { status: string; completed_at?: string | null } = { status }
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    } else if (status === 'pending' || status === 'in_progress') {
      updateData.completed_at = null
    }

    const { data: updated, error: updateError } = await supabase
      .from('action_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating action item:', updateError)
      return NextResponse.json(
        { error: 'Failed to update action item' },
        { status: 500 }
      )
    }

    // If completing, also add to history for preservation across regenerations
    if (status === 'completed') {
      // First check if already in history to avoid duplicates
      const { data: existing } = await supabase
        .from('action_items_history')
        .select('id')
        .eq('lead_id', session.lead_id)
        .eq('original_action_id', id)
        .single()

      if (!existing) {
        // Not in history yet, insert it
        const historyData = {
          lead_id: session.lead_id,
          domain_subscription_id: actionPlan.domain_subscription_id,
          original_action_id: id,
          title: item.title,
          description: item.description,
          category: item.category,
        }

        const { error: historyError } = await supabase
          .from('action_items_history')
          .insert(historyData)

        if (historyError) {
          console.error('Error adding action to history:', historyError)
          // Don't fail the request - action status was updated successfully
        }
      }
    } else if (status === 'pending') {
      // If un-completing (reverting to pending), remove from history
      const { error: deleteError } = await supabase
        .from('action_items_history')
        .delete()
        .eq('lead_id', session.lead_id)
        .eq('original_action_id', id)

      if (deleteError) {
        console.error('Error removing action from history:', deleteError)
        // Don't fail the request - action status was updated successfully
      }
    }

    return NextResponse.json({ item: updated })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error in PATCH /api/actions/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
