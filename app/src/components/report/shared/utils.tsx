'use client'

import type React from 'react'
import type { Analysis } from './types'

/**
 * Format AI response text by converting markdown-style formatting to styled content
 * - Converts **bold** to <strong> tags
 * - Converts *italic* to <em> tags
 * - Converts numbered lists (1. item) to styled list items
 * - Converts bullet points (- item, * item at start of line) to styled bullets
 * - Strips markdown headers (# ## ###)
 * - Converts markdown tables to styled tables
 */
export function formatResponseText(text: string): React.ReactNode[] {
  if (!text) return []

  const lines = text.split('\n')
  const result: React.ReactNode[] = []

  // Process inline formatting (bold and italic)
  const formatInline = (text: string, keyPrefix: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = []
    let remaining = text
    let keyIndex = 0

    while (remaining.length > 0) {
      // Check for bold (**text**) - allow any content between ** including spaces
      const boldMatch = remaining.match(/^\*\*(.+?)\*\*/)
      if (boldMatch) {
        parts.push(
          <strong key={`${keyPrefix}-bold-${keyIndex++}`} className="text-[var(--text)]">
            {boldMatch[1]}
          </strong>
        )
        remaining = remaining.slice(boldMatch[0].length)
        continue
      }

      // Check for italic (*text*) - but not ** which is bold
      const italicMatch = remaining.match(/^\*([^*]+)\*(?!\*)/)
      if (italicMatch) {
        parts.push(
          <em key={`${keyPrefix}-italic-${keyIndex++}`} className="text-[var(--text-mid)]">
            {italicMatch[1]}
          </em>
        )
        remaining = remaining.slice(italicMatch[0].length)
        continue
      }

      // Find the next markdown token
      const nextBold = remaining.indexOf('**')
      // Look for single * that isn't part of **
      let nextItalic = -1
      for (let i = 0; i < remaining.length; i++) {
        if (remaining[i] === '*') {
          // Check it's not part of **
          if (remaining[i + 1] !== '*' && (i === 0 || remaining[i - 1] !== '*')) {
            nextItalic = i
            break
          }
        }
      }

      let nextToken = remaining.length
      if (nextBold !== -1 && nextBold < nextToken) nextToken = nextBold
      if (nextItalic !== -1 && nextItalic < nextToken) nextToken = nextItalic

      // Add plain text up to the next token
      if (nextToken > 0) {
        parts.push(remaining.slice(0, nextToken))
        remaining = remaining.slice(nextToken)
      } else if (remaining.length > 0) {
        // If we're stuck, add one character and move on
        parts.push(remaining[0])
        remaining = remaining.slice(1)
      }
    }

    return parts
  }

  // Detect table sections and process them together
  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    // Check if this is the start of a markdown table (line with |)
    if (line.includes('|') && line.trim().startsWith('|')) {
      const tableLines: string[] = []

      // Collect all table lines
      while (i < lines.length && lines[i].includes('|')) {
        tableLines.push(lines[i])
        i++
      }

      // Skip separator lines (|---|---|) and parse table
      const dataRows = tableLines.filter(l => !l.match(/^\|[\s-:|]+\|$/))

      if (dataRows.length > 0) {
        const tableKey = `table-${i}`
        const headerCells = dataRows[0].split('|').filter(c => c.trim())
        const bodyRows = dataRows.slice(1)

        result.push(
          <div key={tableKey} className="overflow-x-auto" style={{ margin: '16px 0' }}>
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {headerCells.map((cell, cellIdx) => (
                    <th
                      key={cellIdx}
                      className="text-left font-mono text-xs text-[var(--text-mid)] uppercase"
                      style={{ padding: '8px 12px' }}
                    >
                      {formatInline(cell.trim(), `${tableKey}-h-${cellIdx}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rowIdx) => {
                  const cells = row.split('|').filter(c => c.trim())
                  return (
                    <tr key={rowIdx} className="border-b border-[var(--border-subtle)]">
                      {cells.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className="text-[var(--text-dim)]"
                          style={{ padding: '8px 12px' }}
                        >
                          {formatInline(cell.trim(), `${tableKey}-${rowIdx}-${cellIdx}`)}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      }
      continue
    }

    // Strip markdown headers (# ## ### etc.)
    let processedLine = line
    const headerMatch = line.match(/^#{1,6}\s+(.*)/)
    if (headerMatch) {
      processedLine = headerMatch[1]
    }

    // Check for bullet points (- item or * item at start of line, but not ** bold)
    const bulletMatch = processedLine.match(/^[\s]*[-]\s+(.*)/) ||
                        processedLine.match(/^[\s]*\*\s+(?!\*)(.*)/)
    const numberedMatch = processedLine.match(/^[\s]*(\d+)\.\s+(.*)/)

    // Handle numbered list items
    if (numberedMatch) {
      const content = formatInline(numberedMatch[2], `${i}`)
      result.push(
        <div key={i} className="flex" style={{ gap: '12px', marginTop: i > 0 ? '8px' : '0' }}>
          <span className="text-[var(--green)] font-mono flex-shrink-0" style={{ width: '24px' }}>
            {numberedMatch[1]}.
          </span>
          <span>{content}</span>
        </div>
      )
      i++
      continue
    }

    // Handle bullet points
    if (bulletMatch) {
      const content = formatInline(bulletMatch[1], `${i}`)
      result.push(
        <div key={i} className="flex" style={{ gap: '12px', marginTop: i > 0 ? '6px' : '0' }}>
          <span className="text-[var(--green)]">•</span>
          <span>{content}</span>
        </div>
      )
      i++
      continue
    }

    // Regular line - process inline formatting
    const content = formatInline(processedLine, `${i}`)

    if (processedLine.trim() === '') {
      result.push(<div key={i} style={{ height: '12px' }} />)
    } else {
      result.push(
        <span key={i}>
          {content}
          {i < lines.length - 1 && <br />}
        </span>
      )
    }
    i++
  }

  return result
}

/**
 * Calculate readiness score based on analysis quality
 */
export function calculateReadinessScore(analysis: Analysis | null): number {
  if (!analysis) return 0

  let score = 0
  const maxScore = 100

  if (analysis.business_name) score += 15
  if (analysis.business_type && analysis.business_type !== 'Business website') score += 20
  if (analysis.services && analysis.services.length > 0) {
    score += Math.min(analysis.services.length * 4, 20)
  }
  if (analysis.location) score += 10
  if (analysis.target_audience) score += 10
  if (analysis.industry && analysis.industry !== 'General') score += 10
  if (analysis.key_phrases && analysis.key_phrases.length > 0) {
    score += Math.min(analysis.key_phrases.length * 3, 15)
  }

  return Math.min(score, maxScore)
}

/**
 * Save scroll position before navigating to pricing page
 * This allows restoring position when user returns via back button
 */
export function handlePricingClick() {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('report_scroll_position', String(window.scrollY))
  }
}
