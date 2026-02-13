'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

// ============================================
// DESIGN TOKENS
// ============================================

const hb = {
  teal: '#4ABDAC',
  tealDeep: '#2D8A7C',
  tealLight: '#E8F7F5',
  coral: '#FC4A1A',
  coralLight: '#FFF0EC',
  gold: '#F7B733',
  goldLight: '#FEF9EC',
  slate: '#1E293B',
  slateMid: '#475569',
  slateLight: '#94A3B8',
  surface: '#FFFFFF',
  surfaceDim: '#F1F5F9',
  success: '#22C55E',
  error: '#EF4444',
}

const fonts = {
  display: "'Outfit', system-ui, sans-serif",
  body: "'Source Sans 3', system-ui, sans-serif",
}

// ============================================
// TYPES
// ============================================

interface OrgDomain {
  domain: string
  companyName: string | null
}

interface AdminOrg {
  id: string
  name: string
  tier: string
  status: string
  domainLimit: number
  maxUsers: number | null
  maxQuestions: number | null
  maxCompetitors: number | null
  ownerEmail: string | null
  memberCount: number
  pendingInviteCount: number
  domains: OrgDomain[]
  createdAt: string
}

// ============================================
// TIER + STATUS BADGES
// ============================================

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    brand: { bg: hb.tealLight, text: hb.tealDeep },
    agency_10: { bg: hb.goldLight, text: '#B8860B' },
    agency_20: { bg: hb.goldLight, text: '#B8860B' },
    enterprise: { bg: `${hb.coral}15`, text: hb.coral },
  }
  const c = colors[tier] || colors.brand
  return (
    <span
      style={{
        fontSize: '11px',
        fontWeight: 600,
        color: c.text,
        background: c.bg,
        padding: '3px 10px',
        borderRadius: '100px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}
    >
      {tier}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === 'active'
  return (
    <span
      style={{
        fontSize: '11px',
        fontWeight: 600,
        color: isActive ? hb.success : hb.slateLight,
        background: isActive ? `${hb.success}15` : hb.surfaceDim,
        padding: '3px 10px',
        borderRadius: '100px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}
    >
      {status}
    </span>
  )
}

// ============================================
// LIMIT DISPLAY
// ============================================

function LimitCell({ current, max }: { current?: number; max: number | null }) {
  if (current !== undefined) {
    return (
      <span style={{ fontSize: '14px', color: hb.slate, fontFamily: fonts.body }}>
        <strong>{current}</strong>
        <span style={{ color: hb.slateLight }}> / {max ?? '∞'}</span>
      </span>
    )
  }
  return (
    <span style={{ fontSize: '14px', color: hb.slate, fontFamily: fonts.body }}>
      {max ?? '∞'}
    </span>
  )
}

// ============================================
// INLINE EDIT ROW
// ============================================

function EditRow({
  org,
  onSave,
  onCancel,
}: {
  org: AdminOrg
  onSave: (updates: Record<string, unknown>) => Promise<void>
  onCancel: () => void
}) {
  const [maxUsers, setMaxUsers] = useState(org.maxUsers?.toString() ?? '')
  const [maxQuestions, setMaxQuestions] = useState(org.maxQuestions?.toString() ?? '')
  const [maxCompetitors, setMaxCompetitors] = useState(org.maxCompetitors?.toString() ?? '')
  const [domainLimit, setDomainLimit] = useState(org.domainLimit.toString())
  const [tier, setTier] = useState(org.tier)
  const [status, setStatus] = useState(org.status)
  const [saving, setSaving] = useState(false)

  const inputStyle: React.CSSProperties = {
    width: '60px',
    padding: '6px 8px',
    fontSize: '13px',
    fontFamily: fonts.body,
    border: `1px solid ${hb.slateLight}40`,
    borderRadius: '6px',
    textAlign: 'center',
    color: hb.slate,
  }

  const selectStyle: React.CSSProperties = {
    padding: '6px 8px',
    fontSize: '13px',
    fontFamily: fonts.body,
    border: `1px solid ${hb.slateLight}40`,
    borderRadius: '6px',
    color: hb.slate,
    background: hb.surface,
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({
        max_users: maxUsers === '' ? null : parseInt(maxUsers, 10),
        max_questions: maxQuestions === '' ? null : parseInt(maxQuestions, 10),
        max_competitors: maxCompetitors === '' ? null : parseInt(maxCompetitors, 10),
        domain_limit: parseInt(domainLimit, 10) || 1,
        tier,
        status,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <tr style={{ background: hb.tealLight }}>
      <td style={{ padding: '12px 16px' }} colSpan={2}>
        <strong style={{ fontSize: '14px', color: hb.slate }}>{org.name}</strong>
        <div style={{ fontSize: '12px', color: hb.slateLight, marginTop: '2px' }}>
          {org.ownerEmail}
        </div>
      </td>
      <td style={{ padding: '12px 8px' }}>
        <select value={tier} onChange={(e) => setTier(e.target.value)} style={selectStyle}>
          <option value="brand">brand</option>
          <option value="agency_10">agency_10</option>
          <option value="agency_20">agency_20</option>
          <option value="enterprise">enterprise</option>
        </select>
      </td>
      <td style={{ padding: '12px 8px' }}>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={selectStyle}>
          <option value="active">active</option>
          <option value="incomplete">incomplete</option>
          <option value="past_due">past_due</option>
          <option value="canceled">canceled</option>
        </select>
      </td>
      <td style={{ padding: '12px 8px' }}>
        <input
          type="number"
          value={domainLimit}
          onChange={(e) => setDomainLimit(e.target.value)}
          style={inputStyle}
          min={1}
        />
      </td>
      <td style={{ padding: '12px 8px' }}>
        <input
          type="number"
          value={maxUsers}
          onChange={(e) => setMaxUsers(e.target.value)}
          placeholder="∞"
          style={inputStyle}
          min={1}
        />
      </td>
      <td style={{ padding: '12px 8px' }}>
        <input
          type="number"
          value={maxQuestions}
          onChange={(e) => setMaxQuestions(e.target.value)}
          placeholder="∞"
          style={inputStyle}
          min={1}
        />
      </td>
      <td style={{ padding: '12px 8px' }}>
        <input
          type="number"
          value={maxCompetitors}
          onChange={(e) => setMaxCompetitors(e.target.value)}
          placeholder="∞"
          style={inputStyle}
          min={1}
        />
      </td>
      <td style={{ padding: '12px 8px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: fonts.display,
              background: saving ? hb.slateLight : hb.teal,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 500,
              fontFamily: fonts.body,
              background: 'none',
              border: `1px solid ${hb.slateLight}40`,
              borderRadius: '6px',
              cursor: 'pointer',
              color: hb.slateMid,
            }}
          >
            Cancel
          </button>
        </div>
      </td>
    </tr>
  )
}

// ============================================
// CREATE ORG FORM
// ============================================

function CreateOrgForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [tier, setTier] = useState('brand')
  const [domainLimit, setDomainLimit] = useState('1')
  const [maxUsers, setMaxUsers] = useState('')
  const [maxQuestions, setMaxQuestions] = useState('20')
  const [maxCompetitors, setMaxCompetitors] = useState('10')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/hiringbrand/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          ownerEmail,
          tier,
          domainLimit: parseInt(domainLimit, 10) || 1,
          maxUsers: maxUsers === '' ? null : parseInt(maxUsers, 10),
          maxQuestions: maxQuestions === '' ? null : parseInt(maxQuestions, 10),
          maxCompetitors: maxCompetitors === '' ? null : parseInt(maxCompetitors, 10),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create organization')
        return
      }

      onSuccess()
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    fontFamily: fonts.body,
    border: `1px solid ${hb.slateLight}40`,
    borderRadius: '8px',
    color: hb.slate,
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: hb.slateMid,
    marginBottom: '4px',
    fontFamily: fonts.body,
  }

  return (
    <div
      style={{
        background: hb.surface,
        borderRadius: '16px',
        padding: '28px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        border: `1px solid ${hb.teal}30`,
      }}
    >
      <h2
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color: hb.slate,
          fontFamily: fonts.display,
          marginBottom: '20px',
        }}
      >
        Create Account
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={labelStyle}>Organization Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Company or Agency Name"
              style={inputStyle}
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={labelStyle}>Owner Email *</label>
            <input
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              required
              placeholder="owner@company.com"
              style={inputStyle}
            />
          </div>
          <div style={{ flex: '0 0 140px' }}>
            <label style={labelStyle}>Tier</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              style={{ ...inputStyle, background: hb.surface }}
            >
              <option value="brand">brand</option>
              <option value="agency_10">agency_10</option>
              <option value="agency_20">agency_20</option>
              <option value="enterprise">enterprise</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div style={{ flex: '0 0 100px' }}>
            <label style={labelStyle}>Brands</label>
            <input
              type="number"
              value={domainLimit}
              onChange={(e) => setDomainLimit(e.target.value)}
              min={1}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: '0 0 100px' }}>
            <label style={labelStyle}>Max Users</label>
            <input
              type="number"
              value={maxUsers}
              onChange={(e) => setMaxUsers(e.target.value)}
              placeholder="∞"
              min={1}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: '0 0 100px' }}>
            <label style={labelStyle}>Max Questions</label>
            <input
              type="number"
              value={maxQuestions}
              onChange={(e) => setMaxQuestions(e.target.value)}
              placeholder="∞"
              min={1}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: '0 0 100px' }}>
            <label style={labelStyle}>Max Competitors</label>
            <input
              type="number"
              value={maxCompetitors}
              onChange={(e) => setMaxCompetitors(e.target.value)}
              placeholder="∞"
              min={1}
              style={inputStyle}
            />
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: hb.coralLight,
              color: hb.error,
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: fonts.display,
              background: loading ? hb.slateLight : hb.coral,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 500,
              fontFamily: fonts.body,
              background: 'none',
              border: `1px solid ${hb.slateLight}40`,
              borderRadius: '10px',
              cursor: 'pointer',
              color: hb.slateMid,
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

// ============================================
// MAIN ADMIN CLIENT
// ============================================

export function AdminClient() {
  const [orgs, setOrgs] = useState<AdminOrg[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const fetchOrgs = useCallback(async () => {
    try {
      const res = await fetch('/api/hiringbrand/admin/organizations')
      if (res.status === 403) {
        setError('Access denied. You must be a HiringBrand super admin.')
        setLoading(false)
        return
      }
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to load')
        return
      }
      setOrgs(data.organizations)
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrgs()
  }, [fetchOrgs])

  const handleSave = async (orgId: string, updates: Record<string, unknown>) => {
    const res = await fetch(`/api/hiringbrand/admin/organizations/${orgId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })

    if (!res.ok) {
      const data = await res.json()
      alert(data.error || 'Failed to update')
      return
    }

    setEditingId(null)
    fetchOrgs()
  }

  // Loading
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: hb.surfaceDim, fontFamily: fonts.body }}>
        <div style={{ textAlign: 'center', padding: '100px 24px' }}>
          <p style={{ color: hb.slateMid, fontSize: '15px' }}>Loading admin...</p>
        </div>
      </div>
    )
  }

  // Error / Access denied
  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: hb.surfaceDim, fontFamily: fonts.body }}>
        <div style={{ textAlign: 'center', padding: '100px 24px' }}>
          <p style={{ color: hb.error, fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
            {error}
          </p>
          <Link
            href="/hiringbrand/account"
            style={{
              color: hb.teal,
              fontSize: '14px',
              textDecoration: 'underline',
            }}
          >
            Back to Account
          </Link>
        </div>
      </div>
    )
  }

  const thStyle: React.CSSProperties = {
    padding: '10px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 600,
    color: hb.slateLight,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontFamily: fonts.body,
    borderBottom: `1px solid ${hb.slateLight}20`,
  }

  const tdStyle: React.CSSProperties = {
    padding: '14px 16px',
    fontSize: '14px',
    color: hb.slate,
    fontFamily: fonts.body,
    borderBottom: `1px solid ${hb.slateLight}12`,
  }

  return (
    <div style={{ minHeight: '100vh', background: hb.surfaceDim }}>
      {/* Header */}
      <div
        style={{
          background: hb.surface,
          borderBottom: `1px solid ${hb.slateLight}20`,
          padding: '16px 24px',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/hiringbrand/account"
              style={{ textDecoration: 'none' }}
            >
              <span
                style={{
                  fontFamily: fonts.display,
                  fontSize: '20px',
                  fontWeight: 700,
                  color: hb.teal,
                }}
              >
                hiring<span style={{ fontWeight: 800 }}>brand</span>
                <span style={{ color: hb.gold }}>.io</span>
              </span>
            </Link>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: hb.coral,
                background: hb.coralLight,
                padding: '3px 10px',
                borderRadius: '100px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Admin
            </span>
          </div>
          <Link
            href="/hiringbrand/account"
            style={{
              fontSize: '14px',
              color: hb.slateMid,
              textDecoration: 'none',
              fontFamily: fonts.body,
            }}
          >
            Back to Account
          </Link>
        </div>
      </div>

      {/* Main */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Title row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: hb.slate,
              fontFamily: fonts.display,
              margin: 0,
            }}
          >
            Organizations ({orgs.length})
          </h1>
          {!showCreate && (
            <button
              onClick={() => setShowCreate(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: fonts.display,
                background: hb.coral,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Account
            </button>
          )}
        </div>

        {/* Create form */}
        {showCreate && (
          <CreateOrgForm
            onSuccess={() => {
              setShowCreate(false)
              fetchOrgs()
            }}
            onCancel={() => setShowCreate(false)}
          />
        )}

        {/* Org table */}
        <div
          style={{
            background: hb.surface,
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            border: `1px solid ${hb.slateLight}20`,
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Organization</th>
                  <th style={thStyle}>Owner</th>
                  <th style={thStyle}>Tier</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Brands</th>
                  <th style={thStyle}>Users</th>
                  <th style={thStyle}>Questions</th>
                  <th style={thStyle}>Competitors</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {orgs.map((org) =>
                  editingId === org.id ? (
                    <EditRow
                      key={org.id}
                      org={org}
                      onSave={(updates) => handleSave(org.id, updates)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <tr
                      key={org.id}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = hb.surfaceDim
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <td style={tdStyle}>
                        <div>
                          <strong style={{ fontFamily: fonts.display }}>{org.name}</strong>
                          {org.domains.length > 0 && (
                            <div style={{ fontSize: '12px', color: hb.slateLight, marginTop: '2px' }}>
                              {org.domains.map((d) => d.companyName || d.domain).join(', ')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ ...tdStyle, fontSize: '13px', color: hb.slateMid }}>
                        {org.ownerEmail || '—'}
                      </td>
                      <td style={tdStyle}>
                        <TierBadge tier={org.tier} />
                      </td>
                      <td style={tdStyle}>
                        <StatusBadge status={org.status} />
                      </td>
                      <td style={tdStyle}>
                        <LimitCell current={org.domains.length} max={org.domainLimit} />
                      </td>
                      <td style={tdStyle}>
                        <LimitCell current={org.memberCount + org.pendingInviteCount} max={org.maxUsers} />
                      </td>
                      <td style={tdStyle}>
                        <LimitCell max={org.maxQuestions} />
                      </td>
                      <td style={tdStyle}>
                        <LimitCell max={org.maxCompetitors} />
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => setEditingId(org.id)}
                          style={{
                            padding: '5px 12px',
                            fontSize: '12px',
                            fontWeight: 500,
                            fontFamily: fonts.body,
                            background: 'none',
                            border: `1px solid ${hb.slateLight}30`,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: hb.slateMid,
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  )
                )}

                {orgs.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ ...tdStyle, textAlign: 'center', padding: '40px', color: hb.slateLight }}>
                      No organizations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          textAlign: 'center',
          padding: '24px',
          fontSize: '13px',
          color: hb.slateLight,
        }}
      >
        &copy; {new Date().getFullYear()} HiringBrand.io &mdash; Super Admin
      </footer>
    </div>
  )
}
