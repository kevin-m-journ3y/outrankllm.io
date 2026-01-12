import Link from 'next/link'

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-status">
        <div className="status-dot amber" />
        Building in public
      </div>
      <div className="flex items-center gap-4 text-xs text-[var(--text-dim)]">
        <Link href="/about" className="hover:text-[var(--text)] transition-colors">
          About
        </Link>
        <Link href="/terms" className="hover:text-[var(--text)] transition-colors">
          Terms
        </Link>
        <span>© {new Date().getFullYear()} JOURN3Y</span>
      </div>
    </footer>
  )
}
