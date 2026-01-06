# CLAUDE.md - outrankllm.io Development Guide

## Project Overview

**outrankllm.io** is a SaaS platform for Generative Engine Optimization (GEO) - helping businesses improve their visibility in AI assistants like ChatGPT, Claude, and Gemini.

### Core Value Proposition
- Scan websites to analyze AI visibility
- Track how AI assistants recommend (or don't recommend) your business
- Generate ready-to-ship PRDs for AI coding tools (Cursor, Claude Code, Windsurf)

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Domain**: outrankllm.io (Cloudflare DNS)

## Project Structure

```
outrankllm/
├── app/                          # Next.js application
│   ├── content/guides/           # MDX blog/guide content
│   ├── public/images/            # Static assets
│   ├── src/
│   │   ├── app/                  # Next.js App Router pages
│   │   │   ├── api/              # API routes
│   │   │   ├── coming-soon/      # Pre-launch landing page
│   │   │   ├── learn/            # GEO guides & documentation
│   │   │   ├── pricing/          # Pricing page
│   │   │   ├── report/[token]/   # Dynamic report pages
│   │   │   └── page.tsx          # Homepage
│   │   ├── components/           # React components
│   │   │   ├── ghost/            # Ghost mascot component
│   │   │   ├── landing/          # Landing page components
│   │   │   ├── mdx/              # MDX rendering components
│   │   │   ├── nav/              # Navigation
│   │   │   └── report/           # Report components
│   │   ├── lib/                  # Utilities & services
│   │   │   ├── ai/               # AI query & analysis
│   │   │   ├── email/            # Email sending
│   │   │   ├── supabase/         # Database clients
│   │   │   └── guides.ts         # MDX guide utilities
│   │   └── middleware.ts         # Preview/coming-soon protection
│   ├── supabase/migrations/      # Database migrations
│   ├── .env.local                # Local environment (gitignored)
│   └── .env.example              # Environment template
├── reference sources/            # Design references & API examples
└── CLAUDE.md                     # This file
```

## Critical: Tailwind CSS v4 Quirk

**Arbitrary value classes don't compile properly.** Always use inline styles instead:

```tsx
// ❌ DON'T - These won't work
<div className="max-w-xl mx-auto">
<div className="gap-4">

// ✅ DO - Use inline styles
<div style={{ maxWidth: '576px', marginLeft: 'auto', marginRight: 'auto' }}>
<div style={{ gap: '16px' }}>
```

This affects: `max-w-*`, `mx-auto`, `gap-*`, `p-*` with custom values, etc.

## Design System

### CSS Variables (defined in globals.css)

```css
/* Background & Surfaces */
--bg: #0a0a0a;
--surface: #141414;
--surface-elevated: #1a1a1a;
--border: #262626;
--border-subtle: #1f1f1f;

/* Text Hierarchy */
--text: #fafafa;
--text-mid: #d4d4d4;
--text-dim: #8a8a8a;
--text-ghost: #525252;

/* Accent Colors */
--green: #22c55e;        /* Primary accent */
--red: #ef4444;
--blue: #3b82f6;
--amber: #f59e0b;
```

### Typography
- **Display font**: Outfit (--font-display)
- **Mono font**: DM Mono (--font-mono)
- Monospace used for labels, buttons, technical elements

### Key Components
- `Ghost` - Animated mascot (eyes blink, fades in/out)
- `FloatingPixels` - Ambient background particles
- `EmailForm` - Email + domain capture form
- `Nav` - Fixed navigation bar
- `Footer` - Fixed bottom footer

## Environment Variables

Required in Vercel and `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Vercel AI
VERCEL_AI_GATEWAY_KEY=

# App
NEXT_PUBLIC_APP_URL=https://outrankllm.io

# Preview Mode
COMING_SOON_ENABLED=true        # Set to 'false' to go live
PREVIEW_SECRET=your-secret-key  # URL param to bypass coming soon
```

## Preview/Coming Soon System

The middleware (`src/middleware.ts`) controls access:

- **Public visitors** → Redirected to `/coming-soon`
- **Preview access** → Add `?preview=SECRET` to any URL, sets 30-day cookie
- **Go live** → Set `COMING_SOON_ENABLED=false` in Vercel env vars

Share preview link: `https://outrankllm.io?preview=outrankllm-preview-2024`

## MDX Guides System

Guides are stored as MDX files in `content/guides/`:

```mdx
---
title: "Guide Title"
description: "SEO description"
publishedAt: "2025-01-06"
author: "outrankllm team"
category: "Fundamentals"
---

# Content here...
```

### Adding a new guide:
1. Create MDX file in `content/guides/`
2. Add frontmatter (title, description, publishedAt, author, category)
3. Add entry to guides array in `src/app/learn/page.tsx`
4. Guide auto-renders at `/learn/[slug]`

## API Routes

- `POST /api/scan` - Initiate domain scan (email + domain)
- `POST /api/process` - Process scan results
- `POST /api/opt-in` - Handle report opt-in

## Database Schema

See `supabase/migrations/001_initial_schema.sql` for full schema.

Key tables:
- `scans` - Scan requests and status
- `reports` - Generated reports
- `users` - User accounts (future)

## Git Workflow

```bash
# Deploy to production (auto-deploys on push to main)
git add .
git commit -m "Description"
git push

# Vercel auto-deploys from GitHub
# Check deploy status at vercel.com
```

## Common Tasks

### Update colors/spacing
Edit `src/app/globals.css` for CSS variables, or component files for specific elements.

### Add new page
Create folder in `src/app/` with `page.tsx`. Include `<Nav />` and `<Footer />` components.

### Modify navigation
Edit `src/components/nav/Nav.tsx`

### Update pricing
Edit `src/app/pricing/page.tsx` - plans array at top of file

## Notes

- Ghost mascot disappears on hover (Easter egg)
- Floating pixels use CSS animations, no JS
- Forms use monospace font for technical feel
- Green (#22c55e) is the primary accent throughout
