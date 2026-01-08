'use client'

import { Lock, CheckCircle2, Sparkles, FileCode } from 'lucide-react'

interface LockedTabProps {
  icon: React.ElementType
  title: string
  description: string
  features: string[]
  onUpgrade: () => void
}

export function LockedTab({
  icon: Icon,
  title,
  description,
  features,
  onUpgrade
}: LockedTabProps) {
  // Check if this is Action Plans or PRD to show appropriate mockup
  const isActionPlans = title.toLowerCase().includes('action')
  const isPRD = title.toLowerCase().includes('prd')

  return (
    <div style={{ display: 'grid', gap: '32px' }}>
      {/* Mocked Content Preview */}
      <div className="card relative overflow-hidden" style={{ padding: '32px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
          <div className="flex items-center gap-3">
            <Icon size={20} className="text-[var(--text-dim)]" />
            <h3
              className="text-[var(--text-dim)] font-mono uppercase tracking-wider"
              style={{ fontSize: '11px', letterSpacing: '0.1em' }}
            >
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Lock size={12} style={{ color: 'var(--gold)' }} />
            <span className="font-mono text-xs" style={{ color: 'var(--gold)' }}>
              Subscribers Only
            </span>
          </div>
        </div>

        {/* Mocked preview content - BRIGHT and visible */}
        <div className="relative" style={{ minHeight: '340px', backgroundColor: 'var(--surface-elevated)', padding: '20px' }}>
          {/* Fake content based on type */}
          <div>
            {isActionPlans ? (
              // Action Plans mockup - BRIGHT
              <div style={{ display: 'grid', gap: '12px' }}>
                {[
                  { priority: 'HIGH', action: 'Add schema markup for LocalBusiness', impact: '+25%', priorityColor: '#ef4444' },
                  { priority: 'HIGH', action: 'Create FAQ page targeting AI queries', impact: '+20%', priorityColor: '#ef4444' },
                  { priority: 'MED', action: 'Add structured service descriptions', impact: '+15%', priorityColor: '#f59e0b' },
                  { priority: 'MED', action: 'Improve meta descriptions for AI crawlers', impact: '+10%', priorityColor: '#f59e0b' },
                  { priority: 'LOW', action: 'Add customer testimonials with schema', impact: '+8%', priorityColor: '#22c55e' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center border"
                    style={{
                      padding: '14px 18px',
                      gap: '14px',
                      backgroundColor: 'var(--surface)',
                      borderColor: item.priorityColor,
                      borderLeftWidth: '4px',
                    }}
                  >
                    <span
                      className="font-mono text-xs px-3 py-1 flex-shrink-0 font-bold"
                      style={{
                        backgroundColor: `${item.priorityColor}20`,
                        color: item.priorityColor,
                      }}
                    >
                      {item.priority}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[var(--text-mid)] text-sm">{item.action}</p>
                    </div>
                    <span
                      className="font-mono text-sm font-bold flex-shrink-0"
                      style={{ color: '#22c55e' }}
                    >
                      {item.impact}
                    </span>
                  </div>
                ))}
              </div>
            ) : isPRD ? (
              // PRD mockup - BRIGHT
              <div style={{ display: 'grid', gap: '16px' }}>
                <div className="border" style={{ padding: '20px', backgroundColor: 'var(--surface)', borderColor: '#22c55e', borderWidth: '2px' }}>
                  <div className="font-mono text-xs uppercase font-bold" style={{ marginBottom: '12px', color: '#22c55e' }}>
                    Product Requirements Document
                  </div>
                  <h4 className="text-[var(--text)] font-medium text-lg" style={{ marginBottom: '8px' }}>
                    AI Visibility Enhancement PRD
                  </h4>
                  <p className="text-[var(--text-mid)] text-sm" style={{ lineHeight: '1.6' }}>
                    Technical implementation guide for improving visibility in AI assistant responses...
                  </p>
                </div>
                <div className="grid sm:grid-cols-2" style={{ gap: '12px' }}>
                  {[
                    { section: 'Schema Implementation', color: '#ef4444', items: 4 },
                    { section: 'Content Structure', color: '#f59e0b', items: 3 },
                    { section: 'Technical SEO', color: '#3b82f6', items: 5 },
                    { section: 'Monitoring Setup', color: '#22c55e', items: 2 },
                  ].map(({ section, color, items }) => (
                    <div
                      key={section}
                      className="border"
                      style={{
                        padding: '16px',
                        backgroundColor: 'var(--surface)',
                        borderColor: color,
                        borderLeftWidth: '4px',
                      }}
                    >
                      <div className="flex items-center gap-2" style={{ marginBottom: '10px' }}>
                        <FileCode size={16} style={{ color }} />
                        <span className="font-mono text-sm font-medium" style={{ color }}>{section}</span>
                      </div>
                      <div className="text-xs text-[var(--text-dim)]">{items} implementation tasks</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Generic mockup - BRIGHT
              <div className="grid" style={{ gap: '12px' }}>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="border"
                    style={{
                      padding: '18px',
                      backgroundColor: 'var(--surface)',
                      borderColor: '#22c55e',
                      borderLeftWidth: '4px',
                    }}
                  >
                    <div className="h-4 rounded" style={{ width: '40%', marginBottom: '10px', backgroundColor: '#333' }} />
                    <div className="h-3 rounded" style={{ width: '90%', marginBottom: '6px', backgroundColor: '#222' }} />
                    <div className="h-3 rounded" style={{ width: '75%', backgroundColor: '#222' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Frosted overlay with CTA - lighter */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.75) 100%)',
              backdropFilter: 'blur(3px)',
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dim) 100%)',
                marginBottom: '20px',
              }}
            >
              <Icon size={28} style={{ color: 'var(--bg)' }} />
            </div>
            <h3
              className="text-xl font-medium text-[var(--text)]"
              style={{ marginBottom: '12px' }}
            >
              {title}
            </h3>
            <p
              className="text-[var(--text-dim)] text-sm text-center"
              style={{ marginBottom: '24px', maxWidth: '400px' }}
            >
              {description}
            </p>
            <button
              onClick={onUpgrade}
              className="font-mono text-sm flex items-center gap-2 transition-all hover:opacity-90"
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dim) 100%)',
                color: 'var(--bg)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Sparkles size={16} />
              Unlock {title}
            </button>
          </div>
        </div>
      </div>

      {/* What's Included */}
      <div className="card" style={{ padding: '32px' }}>
        <h3
          className="text-[var(--green)] font-mono uppercase tracking-wider"
          style={{ fontSize: '11px', marginBottom: '24px', letterSpacing: '0.1em' }}
        >
          What&apos;s Included
        </h3>

        <div className="grid sm:grid-cols-2" style={{ gap: '20px' }}>
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div
                className="flex-shrink-0 flex items-center justify-center"
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--green)/10',
                }}
              >
                <CheckCircle2 size={14} className="text-[var(--green)]" />
              </div>
              <span className="text-[var(--text-mid)] text-sm" style={{ lineHeight: '1.5' }}>
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
