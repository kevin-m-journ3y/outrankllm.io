/**
 * HiringBrand PPTX Presentation Generator
 * Generates a branded employer brand report as a PowerPoint file
 */

import PptxGenJS from 'pptxgenjs'
import { renderScoreRingPNG } from './render-score-ring'
import type { HBReportData, HBTrendsData, HBEmployerDimension, HBPlatform } from '@/app/hiringbrand/report/components/shared/types'

type ReportDataWithTrends = HBReportData & { trends: HBTrendsData }

// HiringBrand design tokens (subset for PPTX)
const C = {
  teal: '4ABDAC',
  tealDeep: '2D8A7C',
  tealLight: 'E8F7F5',
  coral: 'FC4A1A',
  gold: 'F7B733',
  slate: '1E293B',
  slateMid: '475569',
  slateLight: '94A3B8',
  surface: 'FFFFFF',
  surfaceDim: 'F1F5F9',
  strongGreen: '059669',
}

const FONTS = {
  display: 'Outfit',
  body: 'Source Sans 3',
  mono: 'JetBrains Mono',
}

const platformNames: Record<HBPlatform, string> = {
  chatgpt: 'ChatGPT',
  perplexity: 'Perplexity',
  gemini: 'Gemini',
  claude: 'Claude',
}

const dimensionLabels: Record<HBEmployerDimension, string> = {
  compensation: 'Compensation',
  culture: 'Culture',
  growth: 'Growth',
  balance: 'Work-Life Balance',
  leadership: 'Leadership',
  tech: 'Technology',
  mission: 'Mission',
}

function getScoreColorHex(score: number): string {
  if (score >= 80) return C.teal
  if (score >= 60) return C.tealDeep
  if (score >= 40) return C.gold
  return C.coral
}

function healthLabel(health: string): { text: string; color: string } {
  switch (health) {
    case 'strong': return { text: 'Well Positioned', color: C.teal }
    case 'moderate': return { text: 'Solid Foundation', color: C.gold }
    case 'needs_attention': return { text: 'Growth Opportunity', color: C.gold }
    case 'critical': return { text: 'Significant Opportunity', color: C.coral }
    default: return { text: health, color: C.slateMid }
  }
}

function effortLabel(effort: string): string {
  switch (effort) {
    case 'quick_win': return 'Quick Win'
    case 'moderate': return 'Moderate'
    case 'significant': return 'Significant'
    default: return effort
  }
}

function priorityColor(priority: string): string {
  switch (priority) {
    case 'immediate': return C.coral
    case 'short_term': return C.gold
    case 'long_term': return C.teal
    default: return C.slateMid
  }
}

function priorityLabel(priority: string): string {
  switch (priority) {
    case 'immediate': return 'Immediate'
    case 'short_term': return 'Short Term'
    case 'long_term': return 'Long Term'
    default: return priority
  }
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max - 1) + '…'
}

/**
 * Generate a branded PPTX presentation from HiringBrand report data
 */
export async function generatePresentation(data: ReportDataWithTrends): Promise<ArrayBuffer> {
  const pres = new PptxGenJS()

  // Presentation metadata
  pres.author = 'HiringBrand.io'
  pres.subject = `AI Employer Brand Report — ${data.company.name}`
  pres.title = `${data.company.name} — Employer Brand Report`

  // Widescreen layout
  pres.layout = 'LAYOUT_WIDE' // 13.33 x 7.5 inches

  // Define slide master with teal accent strip + footer
  pres.defineSlideMaster({
    title: 'HB_MASTER',
    background: { fill: C.surface },
    objects: [
      // Teal accent strip at top
      { rect: { x: 0, y: 0, w: '100%', h: 0.06, fill: { color: C.teal } } },
      // Footer text
      {
        text: {
          text: 'HiringBrand.io',
          options: {
            x: 11.5, y: 7.1, w: 1.8, h: 0.3,
            fontSize: 8, fontFace: FONTS.body, color: C.slateLight, align: 'right',
          },
        },
      },
    ],
  })

  // Define title slide master
  pres.defineSlideMaster({
    title: 'HB_TITLE',
    background: { fill: C.tealLight },
    objects: [
      { rect: { x: 0, y: 0, w: '100%', h: 0.08, fill: { color: C.teal } } },
    ],
  })

  // Define dark slide master (for closing)
  pres.defineSlideMaster({
    title: 'HB_DARK',
    background: { fill: C.slate },
    objects: [],
  })

  // ═══════════════════════════════════════
  // SLIDE 1: Title
  // ═══════════════════════════════════════
  const s1 = pres.addSlide({ masterName: 'HB_TITLE' })
  s1.addText('HiringBrand', {
    x: 0.8, y: 0.5, w: 5, h: 0.5,
    fontSize: 20, fontFace: FONTS.display, color: C.teal, bold: true,
  })
  s1.addText(data.company.name, {
    x: 0.8, y: 2.2, w: 11, h: 1.2,
    fontSize: 44, fontFace: FONTS.display, color: C.slate, bold: true,
  })
  s1.addText('AI Employer Brand Report', {
    x: 0.8, y: 3.4, w: 8, h: 0.6,
    fontSize: 22, fontFace: FONTS.body, color: C.slateMid,
  })
  const scanDate = new Date(data.report.createdAt).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  s1.addText(`${data.company.domain}  ·  ${scanDate}`, {
    x: 0.8, y: 4.2, w: 8, h: 0.4,
    fontSize: 14, fontFace: FONTS.body, color: C.slateLight,
  })

  // ═══════════════════════════════════════
  // SLIDE 2: Executive Summary
  // ═══════════════════════════════════════
  const strategic = data.report.strategicSummary
  if (strategic) {
    const s2 = pres.addSlide({ masterName: 'HB_MASTER' })
    s2.addText('Executive Summary', {
      x: 0.8, y: 0.4, w: 10, h: 0.6,
      fontSize: 28, fontFace: FONTS.display, color: C.slate, bold: true,
    })

    // Overall health badge
    const health = healthLabel(strategic.scoreInterpretation.overallHealth)
    s2.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.2, w: 1.6, h: 0.4,
      fill: { color: health.color }, rectRadius: 0.15,
    })
    s2.addText(health.text, {
      x: 0.8, y: 1.2, w: 1.6, h: 0.4,
      fontSize: 12, fontFace: FONTS.display, color: C.surface, bold: true, align: 'center', valign: 'middle',
    })

    // Executive summary text
    s2.addText(strategic.executiveSummary, {
      x: 0.8, y: 1.9, w: 11.5, h: 1.2,
      fontSize: 16, fontFace: FONTS.body, color: C.slate, lineSpacingMultiple: 1.3,
    })

    // Competitive positioning callout
    s2.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 3.4, w: 11.5, h: 0.8,
      fill: { color: C.tealLight }, rectRadius: 0.1,
    })
    s2.addText([
      { text: 'Competitive Positioning: ', options: { bold: true, color: C.tealDeep } },
      { text: strategic.competitivePositioning, options: { color: C.slate } },
    ], {
      x: 1.0, y: 3.5, w: 11.1, h: 0.6,
      fontSize: 13, fontFace: FONTS.body, valign: 'middle',
    })

    // Industry context
    if (strategic.industryContext) {
      s2.addText(strategic.industryContext, {
        x: 0.8, y: 4.5, w: 11.5, h: 0.8,
        fontSize: 12, fontFace: FONTS.body, color: C.slateMid, italic: true, lineSpacingMultiple: 1.3,
      })
    }
  }

  // ═══════════════════════════════════════
  // SLIDE 3: Three Pillar Scores
  // ═══════════════════════════════════════
  const s3 = pres.addSlide({ masterName: 'HB_MASTER' })
  s3.addText('Brand Health Scores', {
    x: 0.8, y: 0.4, w: 10, h: 0.6,
    fontSize: 28, fontFace: FONTS.display, color: C.slate, bold: true,
  })

  // Render score rings as PNG images
  const scores = [
    { score: data.report.visibilityScore, label: 'Desirability' },
    { score: data.report.researchabilityScore ?? 0, label: 'AI Awareness' },
    { score: data.report.differentiationScore ?? 0, label: 'Differentiation' },
  ]

  const ringPNGs = await Promise.all(
    scores.map((s) => renderScoreRingPNG(s.score, s.label, 240))
  )

  // Place three rings side by side
  const ringY = 1.3
  const ringSize = 2.4
  const startX = 1.2
  const gapX = 3.8

  for (let i = 0; i < 3; i++) {
    s3.addImage({
      data: `image/png;base64,${ringPNGs[i]}`,
      x: startX + i * gapX, y: ringY, w: ringSize, h: ringSize + 0.4,
    })

    // Score interpretation text below
    if (strategic) {
      const interpretations = [
        strategic.scoreInterpretation.desirability,
        strategic.scoreInterpretation.awareness,
        strategic.scoreInterpretation.differentiation,
      ]
      s3.addText(interpretations[i], {
        x: startX + i * gapX - 0.3, y: ringY + ringSize + 0.6, w: 3.0, h: 1.0,
        fontSize: 10, fontFace: FONTS.body, color: C.slateMid, align: 'center',
        lineSpacingMultiple: 1.2,
      })
    }
  }

  // ═══════════════════════════════════════
  // SLIDE 4: Sentiment Breakdown
  // ═══════════════════════════════════════
  const s4 = pres.addSlide({ masterName: 'HB_MASTER' })
  s4.addText('Sentiment Breakdown', {
    x: 0.8, y: 0.4, w: 10, h: 0.6,
    fontSize: 28, fontFace: FONTS.display, color: C.slate, bold: true,
  })

  // Doughnut chart
  const sentTotal = data.sentimentCounts.strong + data.sentimentCounts.positive +
    data.sentimentCounts.mixed + data.sentimentCounts.negative
  if (sentTotal > 0) {
    s4.addChart(pres.ChartType.doughnut, [
      {
        name: 'Sentiment',
        labels: ['Strongly Positive', 'Positive', 'Mixed', 'Negative'],
        values: [
          data.sentimentCounts.strong,
          data.sentimentCounts.positive,
          data.sentimentCounts.mixed,
          data.sentimentCounts.negative,
        ],
      },
    ], {
      x: 0.5, y: 1.2, w: 5.5, h: 5.5,
      holeSize: 55,
      chartColors: [C.strongGreen, C.teal, C.gold, C.coral],
      showLegend: true,
      legendPos: 'b',
      legendFontSize: 10,
      legendFontFace: FONTS.body,
      dataLabelPosition: 'outEnd',
      showPercent: true,
      showValue: false,
      showLabel: false,
      dataLabelFontSize: 10,
    })
  }

  // Top positive & negative phrases
  const allPositive = data.responses.flatMap((r) => r.sentimentPositivePhrases).filter(Boolean)
  const allNegative = data.responses.flatMap((r) => r.sentimentNegativePhrases).filter(Boolean)

  // Positive quotes
  s4.addText('Top Positive Signals', {
    x: 6.5, y: 1.2, w: 6, h: 0.4,
    fontSize: 14, fontFace: FONTS.display, color: C.tealDeep, bold: true,
  })
  const topPos = [...new Set(allPositive)].slice(0, 4)
  topPos.forEach((phrase, i) => {
    s4.addText(`"${truncate(phrase, 100)}"`, {
      x: 6.5, y: 1.7 + i * 0.6, w: 6.3, h: 0.5,
      fontSize: 11, fontFace: FONTS.body, color: C.slate, italic: true,
    })
  })

  // Negative quotes
  const negY = 1.7 + topPos.length * 0.6 + 0.3
  s4.addText('Areas of Concern', {
    x: 6.5, y: negY, w: 6, h: 0.4,
    fontSize: 14, fontFace: FONTS.display, color: C.coral, bold: true,
  })
  const topNeg = [...new Set(allNegative)].slice(0, 3)
  topNeg.forEach((phrase, i) => {
    s4.addText(`"${truncate(phrase, 100)}"`, {
      x: 6.5, y: negY + 0.5 + i * 0.6, w: 6.3, h: 0.5,
      fontSize: 11, fontFace: FONTS.body, color: C.slate, italic: true,
    })
  })

  // ═══════════════════════════════════════
  // SLIDE 5: Competitor Radar
  // ═══════════════════════════════════════
  const comp = data.report.competitorAnalysis
  if (comp && comp.employers.length > 1) {
    const s5 = pres.addSlide({ masterName: 'HB_MASTER' })
    s5.addText('Competitive Comparison', {
      x: 0.8, y: 0.4, w: 10, h: 0.6,
      fontSize: 28, fontFace: FONTS.display, color: C.slate, bold: true,
    })

    const target = comp.employers.find((e) => e.isTarget)
    const competitors = comp.employers
      .filter((e) => !e.isTarget)
      .sort((a, b) => {
        const aAvg = Object.values(a.scores).reduce((s, v) => s + v, 0) / 7
        const bAvg = Object.values(b.scores).reduce((s, v) => s + v, 0) / 7
        return bAvg - aAvg
      })
      .slice(0, 3)

    const radarEmployers = target ? [target, ...competitors] : competitors.slice(0, 4)
    const radarColors = [C.teal, C.coral, C.gold, '8B5CF6']
    const dimensions: HBEmployerDimension[] = ['compensation', 'culture', 'growth', 'balance', 'leadership', 'tech', 'mission']

    const chartData = radarEmployers.map((emp) => ({
      name: emp.name,
      labels: dimensions.map((d) => dimensionLabels[d]),
      values: dimensions.map((d) => emp.scores[d] || 0),
    }))

    s5.addChart(pres.ChartType.radar, chartData, {
      x: 0.3, y: 1.1, w: 7.5, h: 5.8,
      radarStyle: 'standard',
      chartColors: radarColors.slice(0, radarEmployers.length),
      showLegend: true,
      legendPos: 'b',
      legendFontSize: 10,
      legendFontFace: FONTS.body,
      catAxisLabelFontSize: 9,
      catAxisLabelFontFace: FONTS.body,
      valAxisMaxVal: 10,
      valAxisMinVal: 0,
      lineSize: 2,
    })

    // Key insight on right side
    if (comp.insights.strengths.length > 0 || comp.insights.weaknesses.length > 0) {
      s5.addText('Key Insights', {
        x: 8.2, y: 1.3, w: 4.5, h: 0.4,
        fontSize: 16, fontFace: FONTS.display, color: C.slate, bold: true,
      })

      let insightY = 1.9
      if (comp.insights.strengths.length > 0) {
        s5.addText('Strengths:', {
          x: 8.2, y: insightY, w: 4.5, h: 0.3,
          fontSize: 12, fontFace: FONTS.display, color: C.tealDeep, bold: true,
        })
        insightY += 0.35
        comp.insights.strengths.forEach((dim) => {
          s5.addText(`• ${dimensionLabels[dim]}`, {
            x: 8.4, y: insightY, w: 4.3, h: 0.3,
            fontSize: 11, fontFace: FONTS.body, color: C.slate,
          })
          insightY += 0.3
        })
        insightY += 0.2
      }

      if (comp.insights.weaknesses.length > 0) {
        s5.addText('Weaknesses:', {
          x: 8.2, y: insightY, w: 4.5, h: 0.3,
          fontSize: 12, fontFace: FONTS.display, color: C.coral, bold: true,
        })
        insightY += 0.35
        comp.insights.weaknesses.forEach((dim) => {
          s5.addText(`• ${dimensionLabels[dim]}`, {
            x: 8.4, y: insightY, w: 4.3, h: 0.3,
            fontSize: 11, fontFace: FONTS.body, color: C.slate,
          })
          insightY += 0.3
        })
      }
    }
  }

  // ═══════════════════════════════════════
  // SLIDE 6: Strengths
  // ═══════════════════════════════════════
  if (strategic && strategic.strengths.length > 0) {
    const s6 = pres.addSlide({ masterName: 'HB_MASTER' })
    s6.addText('Key Strengths', {
      x: 0.8, y: 0.4, w: 10, h: 0.6,
      fontSize: 28, fontFace: FONTS.display, color: C.slate, bold: true,
    })

    strategic.strengths.forEach((str, i) => {
      const cardY = 1.3 + i * 2.0

      // Number badge
      s6.addShape(pres.ShapeType.ellipse, {
        x: 0.8, y: cardY, w: 0.5, h: 0.5,
        fill: { color: C.teal },
      })
      s6.addText(`${i + 1}`, {
        x: 0.8, y: cardY, w: 0.5, h: 0.5,
        fontSize: 16, fontFace: FONTS.display, color: C.surface, bold: true, align: 'center', valign: 'middle',
      })

      // Headline
      s6.addText(str.headline, {
        x: 1.5, y: cardY, w: 11, h: 0.5,
        fontSize: 18, fontFace: FONTS.display, color: C.slate, bold: true,
      })

      // Score comparison
      s6.addText(`Score: ${str.score.toFixed(1)}/10  ·  Competitor Avg: ${str.competitorAvg.toFixed(1)}/10  ·  ${dimensionLabels[str.dimension]}`, {
        x: 1.5, y: cardY + 0.5, w: 11, h: 0.35,
        fontSize: 11, fontFace: FONTS.mono, color: C.tealDeep,
      })

      // Leverage strategy
      s6.addText(str.leverageStrategy, {
        x: 1.5, y: cardY + 0.9, w: 11, h: 0.8,
        fontSize: 12, fontFace: FONTS.body, color: C.slateMid, lineSpacingMultiple: 1.3,
      })
    })
  }

  // ═══════════════════════════════════════
  // SLIDE 7: Gaps & Opportunities
  // ═══════════════════════════════════════
  if (strategic && strategic.gaps.length > 0) {
    const s7 = pres.addSlide({ masterName: 'HB_MASTER' })
    s7.addText('Gaps & Opportunities', {
      x: 0.8, y: 0.4, w: 10, h: 0.6,
      fontSize: 28, fontFace: FONTS.display, color: C.slate, bold: true,
    })

    strategic.gaps.forEach((gap, i) => {
      const cardY = 1.3 + i * 2.0

      // Number badge (coral)
      s7.addShape(pres.ShapeType.ellipse, {
        x: 0.8, y: cardY, w: 0.5, h: 0.5,
        fill: { color: C.coral },
      })
      s7.addText(`${i + 1}`, {
        x: 0.8, y: cardY, w: 0.5, h: 0.5,
        fontSize: 16, fontFace: FONTS.display, color: C.surface, bold: true, align: 'center', valign: 'middle',
      })

      // Headline
      s7.addText(gap.headline, {
        x: 1.5, y: cardY, w: 11, h: 0.5,
        fontSize: 18, fontFace: FONTS.display, color: C.slate, bold: true,
      })

      // Score comparison
      s7.addText(`Score: ${gap.score.toFixed(1)}/10  ·  Competitor Avg: ${gap.competitorAvg.toFixed(1)}/10  ·  ${dimensionLabels[gap.dimension]}`, {
        x: 1.5, y: cardY + 0.5, w: 11, h: 0.35,
        fontSize: 11, fontFace: FONTS.mono, color: C.coral,
      })

      // Business impact
      s7.addText(gap.businessImpact, {
        x: 1.5, y: cardY + 0.9, w: 9, h: 0.8,
        fontSize: 12, fontFace: FONTS.body, color: C.slateMid, lineSpacingMultiple: 1.3,
      })

      // Top competitor reference
      s7.addText(`Learn from: ${gap.topCompetitor}`, {
        x: 10.5, y: cardY + 0.9, w: 2.5, h: 0.3,
        fontSize: 10, fontFace: FONTS.body, color: C.tealDeep, italic: true,
      })
    })
  }

  // ═══════════════════════════════════════
  // SLIDE 8: What AI Says
  // ═══════════════════════════════════════
  const s8 = pres.addSlide({ masterName: 'HB_MASTER' })
  s8.addText('What AI Says About You', {
    x: 0.8, y: 0.4, w: 10, h: 0.6,
    fontSize: 28, fontFace: FONTS.display, color: C.slate, bold: true,
  })

  // Pick standout responses: prioritise ChatGPT/Perplexity, pick mix of sentiment
  const scoredResponses = data.responses
    .filter((r) => r.sentimentScore != null && r.responseText.length > 50)
    .sort((a, b) => {
      // Prefer higher-weight platforms
      const platformWeight: Record<string, number> = { chatgpt: 10, perplexity: 4, gemini: 2, claude: 1 }
      return (platformWeight[b.platform] || 0) - (platformWeight[a.platform] || 0)
    })

  const bestResponses = [
    ...scoredResponses.filter((r) => r.sentimentCategory === 'strong').slice(0, 1),
    ...scoredResponses.filter((r) => r.sentimentCategory === 'positive').slice(0, 1),
    ...scoredResponses.filter((r) => r.sentimentCategory === 'mixed' || r.sentimentCategory === 'negative').slice(0, 1),
  ].slice(0, 3)

  // If we didn't get enough variety, fill from top scored
  if (bestResponses.length < 3) {
    const used = new Set(bestResponses.map((r) => r.id))
    for (const r of scoredResponses) {
      if (bestResponses.length >= 3) break
      if (!used.has(r.id)) bestResponses.push(r)
    }
  }

  const sentimentBadgeColor: Record<string, string> = {
    strong: C.strongGreen,
    positive: C.teal,
    mixed: C.gold,
    negative: C.coral,
  }

  bestResponses.forEach((resp, i) => {
    const qY = 1.2 + i * 2.1

    // Platform + sentiment badge row
    const badgeColor = sentimentBadgeColor[resp.sentimentCategory || 'mixed'] || C.slateMid
    s8.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: qY, w: 1.5, h: 0.35,
      fill: { color: badgeColor }, rectRadius: 0.1,
    })
    s8.addText(platformNames[resp.platform] || resp.platform, {
      x: 0.8, y: qY, w: 1.5, h: 0.35,
      fontSize: 10, fontFace: FONTS.display, color: C.surface, bold: true, align: 'center', valign: 'middle',
    })

    // Sentiment score
    s8.addText(`Sentiment: ${resp.sentimentScore}/10`, {
      x: 2.5, y: qY, w: 1.5, h: 0.35,
      fontSize: 10, fontFace: FONTS.mono, color: badgeColor, valign: 'middle',
    })

    // Question
    s8.addText(truncate(resp.promptText, 120), {
      x: 0.8, y: qY + 0.4, w: 12, h: 0.35,
      fontSize: 11, fontFace: FONTS.body, color: C.slateMid, italic: true,
    })

    // Response excerpt
    s8.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: qY + 0.8, w: 11.7, h: 1.0,
      fill: { color: C.surfaceDim }, rectRadius: 0.08,
    })
    s8.addText(`"${truncate(resp.responseText, 280)}"`, {
      x: 1.0, y: qY + 0.85, w: 11.3, h: 0.9,
      fontSize: 10, fontFace: FONTS.body, color: C.slate, lineSpacingMultiple: 1.3,
    })
  })

  // ═══════════════════════════════════════
  // SLIDE 9: 90-Day Action Plan
  // ═══════════════════════════════════════
  if (strategic && strategic.recommendations.length > 0) {
    const s9 = pres.addSlide({ masterName: 'HB_MASTER' })
    s9.addText('90-Day Action Plan', {
      x: 0.8, y: 0.4, w: 10, h: 0.6,
      fontSize: 28, fontFace: FONTS.display, color: C.slate, bold: true,
    })

    // Table header
    const tableRows: PptxGenJS.TableRow[] = [
      [
        { text: '#', options: { bold: true, fill: { color: C.slate }, color: C.surface, fontSize: 10, fontFace: FONTS.display, align: 'center' } },
        { text: 'Priority', options: { bold: true, fill: { color: C.slate }, color: C.surface, fontSize: 10, fontFace: FONTS.display } },
        { text: 'Recommendation', options: { bold: true, fill: { color: C.slate }, color: C.surface, fontSize: 10, fontFace: FONTS.display } },
        { text: 'Effort', options: { bold: true, fill: { color: C.slate }, color: C.surface, fontSize: 10, fontFace: FONTS.display, align: 'center' } },
        { text: 'Impact', options: { bold: true, fill: { color: C.slate }, color: C.surface, fontSize: 10, fontFace: FONTS.display, align: 'center' } },
      ],
    ]

    strategic.recommendations.forEach((rec, i) => {
      const isEven = i % 2 === 0
      const rowFill = isEven ? C.surface : C.surfaceDim
      tableRows.push([
        { text: `${i + 1}`, options: { fill: { color: rowFill }, fontSize: 10, fontFace: FONTS.mono, color: C.slateMid, align: 'center' } },
        { text: priorityLabel(rec.priority), options: { fill: { color: rowFill }, fontSize: 10, fontFace: FONTS.display, color: priorityColor(rec.priority), bold: true } },
        { text: `${rec.title}\n${rec.description}`, options: { fill: { color: rowFill }, fontSize: 10, fontFace: FONTS.body, color: C.slate } },
        { text: effortLabel(rec.effort), options: { fill: { color: rowFill }, fontSize: 9, fontFace: FONTS.body, color: C.slateMid, align: 'center' } },
        { text: rec.impact.charAt(0).toUpperCase() + rec.impact.slice(1), options: { fill: { color: rowFill }, fontSize: 9, fontFace: FONTS.body, color: C.slateMid, align: 'center' } },
      ])
    })

    s9.addTable(tableRows, {
      x: 0.5, y: 1.2, w: 12.3,
      colW: [0.5, 1.2, 7.6, 1.5, 1.5],
      border: { type: 'solid', pt: 0.5, color: C.surfaceDim },
      rowH: [0.4, ...strategic.recommendations.map(() => 0.7)],
    })
  }

  // ═══════════════════════════════════════
  // SLIDE 10: Score Trends (conditional)
  // ═══════════════════════════════════════
  if (data.trends.scoreHistory.length >= 2) {
    const s10 = pres.addSlide({ masterName: 'HB_MASTER' })
    s10.addText('Score Trends', {
      x: 0.8, y: 0.4, w: 10, h: 0.6,
      fontSize: 28, fontFace: FONTS.display, color: C.slate, bold: true,
    })

    const trendLabels = data.trends.scoreHistory.map((h) =>
      new Date(h.scanDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
    )

    const trendData = [
      {
        name: 'Desirability',
        labels: trendLabels,
        values: data.trends.scoreHistory.map((h) => h.desirabilityScore ?? 0),
      },
      {
        name: 'AI Awareness',
        labels: trendLabels,
        values: data.trends.scoreHistory.map((h) => h.awarenessScore ?? 0),
      },
      {
        name: 'Differentiation',
        labels: trendLabels,
        values: data.trends.scoreHistory.map((h) => h.differentiationScore ?? 0),
      },
    ]

    s10.addChart(pres.ChartType.line, trendData, {
      x: 0.5, y: 1.2, w: 12, h: 5.5,
      chartColors: [C.teal, C.gold, C.coral],
      showLegend: true,
      legendPos: 'b',
      legendFontSize: 11,
      legendFontFace: FONTS.body,
      lineSize: 2.5,
      lineSmooth: true,
      lineDataSymbol: 'circle',
      lineDataSymbolSize: 6,
      valAxisMaxVal: 100,
      valAxisMinVal: 0,
      valAxisLabelFontSize: 9,
      catAxisLabelFontSize: 9,
      catAxisLabelFontFace: FONTS.body,
      valGridLine: { color: C.surfaceDim, size: 0.5 },
    })
  }

  // ═══════════════════════════════════════
  // SLIDE 11: Closing / CTA
  // ═══════════════════════════════════════
  const sEnd = pres.addSlide({ masterName: 'HB_DARK' })
  sEnd.addText('Powered by', {
    x: 2, y: 2.0, w: 9.33, h: 0.5,
    fontSize: 16, fontFace: FONTS.body, color: C.slateLight, align: 'center',
  })
  sEnd.addText('HiringBrand.io', {
    x: 2, y: 2.5, w: 9.33, h: 1.0,
    fontSize: 40, fontFace: FONTS.display, color: C.teal, bold: true, align: 'center',
  })
  sEnd.addText('AI Employer Brand Intelligence', {
    x: 2, y: 3.5, w: 9.33, h: 0.5,
    fontSize: 16, fontFace: FONTS.body, color: C.slateLight, align: 'center',
  })
  sEnd.addText(`Report: hiringbrand.io/report/${data.report.urlToken}  ·  Data refreshed weekly`, {
    x: 2, y: 5.5, w: 9.33, h: 0.4,
    fontSize: 11, fontFace: FONTS.body, color: C.slateLight, align: 'center',
  })
  sEnd.addText(scanDate, {
    x: 2, y: 5.9, w: 9.33, h: 0.3,
    fontSize: 10, fontFace: FONTS.body, color: C.slateLight, align: 'center',
  })

  // Generate the PPTX buffer
  const buffer = await pres.write({ outputType: 'arraybuffer' }) as ArrayBuffer
  return buffer
}
