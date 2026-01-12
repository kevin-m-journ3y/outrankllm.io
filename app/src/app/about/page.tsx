import { Nav } from '@/components/nav/Nav'
import { Footer } from '@/components/landing/Footer'
import { ExternalLink, Mail } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'About | OutrankLLM',
  description: 'Learn about OutrankLLM and JOURN3Y, the team building AI visibility tools for businesses.',
}

export default function AboutPage() {
  return (
    <>
      <div className="grid-bg" />
      <Nav />

      <main className="relative z-10 px-6" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
          {/* Hero */}
          <h1 className="text-4xl font-medium" style={{ marginBottom: '24px' }}>
            About OutrankLLM
          </h1>
          <p className="text-xl text-[var(--text-mid)]" style={{ marginBottom: '48px' }}>
            Helping businesses understand and improve their visibility in AI assistants like ChatGPT, Claude, and Gemini.
          </p>

          {/* What is OutrankLLM */}
          <section style={{ marginBottom: '48px' }}>
            <h2 className="text-2xl font-medium" style={{ marginBottom: '16px' }}>
              What is OutrankLLM?
            </h2>
            <div className="text-[var(--text-mid)]" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p>
                OutrankLLM is a Generative Engine Optimization (GEO) platform that helps businesses track, measure, and improve how they appear in AI-powered search and assistant responses.
              </p>
              <p>
                As more people turn to AI assistants for recommendations and information, traditional SEO alone isn&apos;t enough. OutrankLLM shows you exactly how ChatGPT, Claude, Gemini, and Perplexity respond to questions about your industry&mdash;and whether they&apos;re recommending you or your competitors.
              </p>
              <p>
                Our platform provides actionable insights, visibility scoring, competitor analysis, and AI-ready implementation guides to help you optimize your online presence for the age of AI.
              </p>
            </div>
          </section>

          {/* Built by JOURN3Y */}
          <section style={{ marginBottom: '48px' }}>
            <h2 className="text-2xl font-medium" style={{ marginBottom: '16px' }}>
              Built by JOURN3Y
            </h2>
            <div className="text-[var(--text-mid)]" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p>
                OutrankLLM is built and operated by <strong className="text-[var(--text)]">JOURN3Y Pty Ltd</strong>, an Australian technology company focused on helping businesses navigate the rapidly evolving digital landscape.
              </p>
              <p>
                We believe that as AI transforms how people discover and choose businesses, every company deserves the tools to understand and adapt to this shift. OutrankLLM is our answer to that challenge.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section style={{ marginBottom: '48px' }}>
            <h2 className="text-2xl font-medium" style={{ marginBottom: '16px' }}>
              Contact Us
            </h2>
            <div className="text-[var(--text-mid)]" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p>
                Have questions about OutrankLLM or want to learn more about how we can help your business? We&apos;d love to hear from you.
              </p>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[var(--green)]" />
                <a
                  href="mailto:info@journ3y.com.au"
                  className="text-[var(--green)] hover:underline font-mono"
                >
                  info@journ3y.com.au
                </a>
              </div>
            </div>
          </section>

          {/* Legal */}
          <section
            className="border border-[var(--border)] bg-[var(--surface)]"
            style={{ padding: '24px' }}
          >
            <h2 className="text-lg font-medium" style={{ marginBottom: '16px' }}>
              Legal
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/terms"
                className="flex items-center gap-2 text-[var(--text-mid)] hover:text-[var(--green)] transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Terms & Conditions</span>
              </Link>
              <Link
                href="/privacy"
                className="flex items-center gap-2 text-[var(--text-mid)] hover:text-[var(--green)] transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Privacy Policy</span>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}
