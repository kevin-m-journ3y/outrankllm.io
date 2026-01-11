'use client'

import { useState, useRef, useEffect } from 'react'
import { HelpCircle, Bug, MessageSquare, ChevronDown } from 'lucide-react'
import { FeedbackModal } from './FeedbackModal'

type FeedbackType = 'bug' | 'feature' | 'feedback' | 'other'

export function HelpMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<FeedbackType>('feedback')
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const openModal = (type: FeedbackType) => {
    setModalType(type)
    setModalOpen(true)
    setIsOpen(false)
  }

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-[var(--text-mid)] hover:text-[var(--text)] transition-colors"
          style={{ padding: '8px' }}
          aria-label="Help menu"
        >
          <HelpCircle size={18} />
          <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className="absolute right-0 bg-[var(--surface-elevated)] border border-[var(--border)] shadow-lg z-50"
            style={{ top: '100%', marginTop: '4px', minWidth: '200px' }}
          >
            <button
              onClick={() => openModal('bug')}
              className="w-full flex items-center gap-3 text-left text-[var(--text-mid)] hover:bg-[var(--surface)] hover:text-[var(--text)] transition-colors"
              style={{ padding: '12px 16px' }}
            >
              <Bug size={16} className="text-[var(--red)]" />
              <div>
                <span className="block text-sm">Report an Issue</span>
                <span className="block text-xs text-[var(--text-ghost)]">Something not working?</span>
              </div>
            </button>
            <button
              onClick={() => openModal('feedback')}
              className="w-full flex items-center gap-3 text-left text-[var(--text-mid)] hover:bg-[var(--surface)] hover:text-[var(--text)] transition-colors border-t border-[var(--border)]"
              style={{ padding: '12px 16px' }}
            >
              <MessageSquare size={16} className="text-[var(--green)]" />
              <div>
                <span className="block text-sm">Give Feedback</span>
                <span className="block text-xs text-[var(--text-ghost)]">Share your thoughts</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialType={modalType}
      />
    </>
  )
}
