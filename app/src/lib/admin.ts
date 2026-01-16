/**
 * Admin utilities for outrankllm.io
 *
 * This module provides admin authentication and authorization.
 * Used by admin-only routes and components.
 */

import { getSession } from './auth'

// Hardcoded admin emails - only these users can access admin features
const ADMIN_EMAILS = [
  'kevin.morrell@journ3y.com.au',
  'adam.king@journ3y.com.au',
]

/**
 * Check if an email is an admin
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

/**
 * Check if the current session belongs to an admin user
 * Returns the session if admin, null otherwise
 */
export async function getAdminSession() {
  const session = await getSession()

  if (!session) return null
  if (!isAdminEmail(session.email)) return null

  return session
}

/**
 * Require admin session - throws if not an admin
 */
export async function requireAdminSession() {
  const session = await getAdminSession()

  if (!session) {
    throw new Error('Admin access required')
  }

  return session
}

/**
 * Format a date for admin display (localized to viewer's timezone)
 * Returns ISO string for client-side formatting
 */
export function formatAdminDate(date: string | Date | null): string | null {
  if (!date) return null
  return new Date(date).toISOString()
}
