/**
 * Masks an email address for privacy while keeping it recognizable to the owner.
 *
 * Examples:
 *   kevin@example.com → k***n@example.com
 *   ab@example.com → a***b@example.com
 *   a@example.com → a***@example.com (single char local part)
 */
export function maskEmail(email: string): string {
  const atIndex = email.indexOf('@')
  if (atIndex < 1) return email // Invalid email, return as-is

  const local = email.slice(0, atIndex)
  const domain = email.slice(atIndex) // includes @

  if (local.length === 1) {
    return `${local}***${domain}`
  }

  const first = local[0]
  const last = local[local.length - 1]
  return `${first}***${last}${domain}`
}
