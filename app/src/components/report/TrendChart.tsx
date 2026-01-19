'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface TrendDataPoint {
  date: string
  value: number
  label?: string
}

export interface MultiLineSeries {
  key: string
  name: string
  color: string
  data: TrendDataPoint[]
  isOverall?: boolean // If true, render with thicker line and area fill
}

interface TrendChartProps {
  data: TrendDataPoint[]
  height?: number
  showLabels?: boolean
  color?: string
  title?: string
  unit?: string
}

interface MultiLineTrendChartProps {
  series: MultiLineSeries[]
  height?: number
  showLabels?: boolean
  title?: string
  unit?: string
  rightAxisLabel?: string // Label for right axis (default: "Platform %")
  rightAxisUnit?: string // Unit for right axis values (default: "%")
  defaultToMovingAverage?: boolean // Start with MA view (default: true)
}

/**
 * Simple SVG line chart for displaying score trends
 */
export function TrendChart({
  data,
  height = 120,
  showLabels = true,
  color = 'var(--green)',
  title,
  unit = '%',
}: TrendChartProps) {
  const chartWidth = 280
  const padding = { top: 10, right: 10, bottom: 24, left: 35 }
  const innerWidth = chartWidth - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom

  const { points, minValue, maxValue, trend, trendPercent } = useMemo(() => {
    if (data.length === 0) {
      return { points: '', minValue: 0, maxValue: 100, trend: 'neutral' as const, trendPercent: 0 }
    }

    const values = data.map(d => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)

    // Add some padding to the range
    const range = max - min
    const minValue = Math.max(0, min - range * 0.1)
    const maxValue = Math.min(100, max + range * 0.1)
    const valueRange = maxValue - minValue || 1

    // Calculate points for the line
    const pts = data.map((d, i) => {
      const x = padding.left + (i / Math.max(1, data.length - 1)) * innerWidth
      const y = padding.top + innerHeight - ((d.value - minValue) / valueRange) * innerHeight
      return `${x},${y}`
    }).join(' ')

    // Calculate trend
    const firstValue = data[0]?.value || 0
    const lastValue = data[data.length - 1]?.value || 0
    const trendPercent = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0
    const trend = trendPercent > 1 ? 'up' : trendPercent < -1 ? 'down' : 'neutral'

    return { points: pts, minValue, maxValue, trend, trendPercent }
  }, [data, innerWidth, innerHeight])

  // Calculate area fill path
  const areaPath = useMemo(() => {
    if (data.length === 0) return ''

    const values = data.map(d => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min
    const minValue = Math.max(0, min - range * 0.1)
    const maxValue = Math.min(100, max + range * 0.1)
    const valueRange = maxValue - minValue || 1

    const pts = data.map((d, i) => {
      const x = padding.left + (i / Math.max(1, data.length - 1)) * innerWidth
      const y = padding.top + innerHeight - ((d.value - minValue) / valueRange) * innerHeight
      return { x, y }
    })

    const startX = pts[0]?.x || padding.left
    const endX = pts[pts.length - 1]?.x || padding.left + innerWidth
    const bottomY = padding.top + innerHeight

    return `M ${startX},${bottomY} ${pts.map(p => `L ${p.x},${p.y}`).join(' ')} L ${endX},${bottomY} Z`
  }, [data, innerWidth, innerHeight])

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-[var(--text-dim)] text-sm"
        style={{ height }}
      >
        No data yet
      </div>
    )
  }

  // Only show chart if we have multiple points
  if (data.length === 1) {
    return (
      <div
        className="flex flex-col items-center justify-center"
        style={{ height }}
      >
        <div className="text-2xl font-bold" style={{ color }}>
          {data[0].value.toFixed(0)}{unit}
        </div>
        <div className="text-xs text-[var(--text-dim)]" style={{ marginTop: '4px' }}>
          {data[0].label || formatDate(data[0].date)}
        </div>
        <div className="text-xs text-[var(--text-ghost)]" style={{ marginTop: '8px' }}>
          More data points needed for trend
        </div>
      </div>
    )
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'var(--green)' : trend === 'down' ? 'var(--red)' : 'var(--text-dim)'

  return (
    <div>
      {/* Header with title and trend */}
      {(title || trend !== 'neutral') && (
        <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
          {title && (
            <span className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-wider">
              {title}
            </span>
          )}
          <div
            className="flex items-center gap-1 text-xs font-mono"
            style={{ color: trendColor }}
          >
            <TrendIcon size={14} />
            <span>{trendPercent > 0 ? '+' : ''}{trendPercent.toFixed(1)}%</span>
          </div>
        </div>
      )}

      {/* SVG Chart */}
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${chartWidth} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ overflow: 'visible' }}
      >
        {/* Grid lines */}
        <g className="grid" stroke="var(--border)" strokeDasharray="2,2" strokeWidth="0.5">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + innerHeight * (1 - ratio)
            return (
              <line
                key={ratio}
                x1={padding.left}
                y1={y}
                x2={padding.left + innerWidth}
                y2={y}
              />
            )
          })}
        </g>

        {/* Y-axis labels */}
        {showLabels && (
          <g className="y-labels" fill="var(--text-ghost)" fontSize="9" fontFamily="monospace">
            {[0, 0.5, 1].map((ratio) => {
              const y = padding.top + innerHeight * (1 - ratio)
              const value = minValue + (maxValue - minValue) * ratio
              return (
                <text
                  key={ratio}
                  x={padding.left - 4}
                  y={y + 3}
                  textAnchor="end"
                >
                  {value.toFixed(0)}
                </text>
              )
            })}
          </g>
        )}

        {/* Area fill */}
        <path
          d={areaPath}
          fill={color}
          fillOpacity="0.1"
        />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((d, i) => {
          const values = data.map(d => d.value)
          const min = Math.min(...values)
          const max = Math.max(...values)
          const range = max - min
          const rangeMin = Math.max(0, min - range * 0.1)
          const rangeMax = Math.min(100, max + range * 0.1)
          const valueRange = rangeMax - rangeMin || 1

          const x = padding.left + (i / Math.max(1, data.length - 1)) * innerWidth
          const y = padding.top + innerHeight - ((d.value - rangeMin) / valueRange) * innerHeight

          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="3"
                fill="var(--bg)"
                stroke={color}
                strokeWidth="2"
              />
              {/* Tooltip on hover would go here */}
            </g>
          )
        })}

        {/* X-axis labels (first and last date) */}
        {showLabels && data.length >= 2 && (
          <g className="x-labels" fill="var(--text-ghost)" fontSize="9" fontFamily="monospace">
            <text
              x={padding.left}
              y={height - 4}
              textAnchor="start"
            >
              {formatDate(data[0].date)}
            </text>
            <text
              x={padding.left + innerWidth}
              y={height - 4}
              textAnchor="end"
            >
              {formatDate(data[data.length - 1].date)}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}

/**
 * Compact trend indicator for inline use
 */
export function TrendIndicator({
  currentValue,
  previousValue,
  unit = '%',
}: {
  currentValue: number
  previousValue: number
  unit?: string
}) {
  const diff = currentValue - previousValue
  const percentChange = previousValue > 0 ? (diff / previousValue) * 100 : 0
  const trend = percentChange > 1 ? 'up' : percentChange < -1 ? 'down' : 'neutral'

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'var(--green)' : trend === 'down' ? 'var(--red)' : 'var(--text-dim)'

  return (
    <div
      className="flex items-center gap-1 text-xs font-mono"
      style={{ color: trendColor }}
    >
      <TrendIcon size={12} />
      <span>
        {diff > 0 ? '+' : ''}{diff.toFixed(1)}{unit}
      </span>
    </div>
  )
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Calculate 3-point moving average for a data series
 */
function calculateMovingAverage(data: TrendDataPoint[], window = 3): TrendDataPoint[] {
  if (data.length < window) return data

  const result: TrendDataPoint[] = []
  for (let i = 0; i < data.length; i++) {
    // For the first and last points, use smaller windows
    const start = Math.max(0, i - Math.floor(window / 2))
    const end = Math.min(data.length, i + Math.ceil(window / 2))
    const windowData = data.slice(start, end)
    const avg = windowData.reduce((sum, d) => sum + d.value, 0) / windowData.length
    result.push({ ...data[i], value: avg })
  }
  return result
}

/**
 * Generate a smooth SVG path using monotone cubic spline interpolation
 * This ensures curves pass through all data points without overshooting,
 * which is ideal for data visualization
 */
function generateSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ''
  if (points.length === 2) {
    return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`
  }

  const n = points.length

  // Calculate slopes between consecutive points
  const slopes: number[] = []
  for (let i = 0; i < n - 1; i++) {
    const dx = points[i + 1].x - points[i].x
    const dy = points[i + 1].y - points[i].y
    slopes.push(dx !== 0 ? dy / dx : 0)
  }

  // Calculate tangent at each point using monotone method
  const tangents: number[] = []
  tangents[0] = slopes[0]
  for (let i = 1; i < n - 1; i++) {
    // If slopes have different signs, tangent is 0 (local extremum)
    if (slopes[i - 1] * slopes[i] <= 0) {
      tangents[i] = 0
    } else {
      // Use harmonic mean of slopes for smoother results
      tangents[i] = (slopes[i - 1] + slopes[i]) / 2
    }
  }
  tangents[n - 1] = slopes[n - 2]

  // Build path with cubic bezier segments
  let path = `M ${points[0].x},${points[0].y}`

  for (let i = 0; i < n - 1; i++) {
    const p0 = points[i]
    const p1 = points[i + 1]
    const dx = (p1.x - p0.x) / 3

    // Control points based on tangents
    const cp1x = p0.x + dx
    const cp1y = p0.y + dx * tangents[i]
    const cp2x = p1.x - dx
    const cp2y = p1.y - dx * tangents[i + 1]

    path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`
  }

  return path
}

/**
 * Single-axis trend chart showing all metrics as percentages (0-100)
 * with toggle between raw values and 3-point moving average
 */
export function MultiLineTrendChart({
  series,
  height = 200,
  showLabels = true,
  title,
  defaultToMovingAverage = true,
}: MultiLineTrendChartProps) {
  const padding = { top: 16, right: 20, bottom: 32, left: 45 }
  const [showMovingAverage, setShowMovingAverage] = useState(defaultToMovingAverage)
  const [isVisible, setIsVisible] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)
  const chartRef = useRef<HTMLDivElement>(null)

  // Observe when chart becomes visible
  useEffect(() => {
    const element = chartRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Animate line drawing when visible
  useEffect(() => {
    if (!isVisible) return

    const duration = 2500
    const steps = 100
    const interval = duration / steps

    let step = 0
    const timer = setInterval(() => {
      step++
      if (step >= steps) {
        setAnimationProgress(1)
        clearInterval(timer)
      } else {
        const progress = step / steps
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setAnimationProgress(eased)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [isVisible])

  // Apply moving average if enabled
  const displaySeries = useMemo(() => {
    if (!showMovingAverage) return series
    return series.map(s => ({
      ...s,
      data: calculateMovingAverage(s.data, 3),
    }))
  }, [series, showMovingAverage])

  // Calculate chart dimensions and ranges - single axis (0-100)
  const { innerHeight, dates, yAxis, overallSeries, platformSeries } = useMemo(() => {
    const overall = displaySeries.find(s => s.isOverall)
    const platforms = displaySeries.filter(s => !s.isOverall)

    const allDates: string[] = []
    const seenDates = new Set<string>()

    for (const s of displaySeries) {
      for (const d of s.data) {
        if (!seenDates.has(d.date)) {
          seenDates.add(d.date)
          allDates.push(d.date)
        }
      }
    }
    allDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

    // Single axis: All values are percentages (0-100)
    const allValues = displaySeries.flatMap(s => s.data.map(d => d.value))
    const minVal = Math.min(...allValues)
    const maxVal = Math.max(...allValues)
    const range = maxVal - minVal
    const yMin = Math.max(0, minVal - range * 0.1)
    const yMax = Math.min(100, maxVal + range * 0.1)

    return {
      innerHeight: height - padding.top - padding.bottom,
      dates: allDates,
      yAxis: { min: yMin, max: yMax, range: yMax - yMin || 1 },
      overallSeries: overall,
      platformSeries: platforms,
    }
  }, [displaySeries, height])

  const getX = (date: string, viewBoxWidth: number) => {
    const dateIndex = dates.indexOf(date)
    if (dates.length <= 1) return padding.left + (viewBoxWidth - padding.left - padding.right) / 2
    return padding.left + (dateIndex / (dates.length - 1)) * (viewBoxWidth - padding.left - padding.right)
  }

  const getY = (value: number) => {
    return padding.top + innerHeight - ((value - yAxis.min) / yAxis.range) * innerHeight
  }

  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    name: string
    value: string
    date: string
    color: string
  } | null>(null)

  if (dates.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-[var(--text-dim)] text-sm"
        style={{ height }}
      >
        No data yet
      </div>
    )
  }

  const viewBoxWidth = 800

  // Calculate stroke-dasharray for animation
  const getAnimatedStroke = (totalLength: number) => {
    const visibleLength = totalLength * animationProgress
    return `${visibleLength} ${totalLength}`
  }

  return (
    <div ref={chartRef} style={{ position: 'relative' }}>
      {/* Header with title and toggle */}
      <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
        {title && (
          <span className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-wider">
            {title}
          </span>
        )}

        {/* Moving Average Toggle */}
        <div className="flex items-center" style={{ gap: '8px' }}>
          <span className="text-xs font-mono text-[var(--text-ghost)]">Raw</span>
          <div className="relative group">
            <button
              onClick={() => setShowMovingAverage(!showMovingAverage)}
              className="relative"
              style={{
                width: '36px',
                height: '20px',
                borderRadius: '10px',
                backgroundColor: showMovingAverage ? 'var(--green)' : 'var(--border)',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              aria-label={showMovingAverage ? 'Show raw values' : 'Show moving average'}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: showMovingAverage ? '18px' : '2px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  transition: 'left 0.2s',
                }}
              />
            </button>
            {/* Tooltip */}
            <div
              className="absolute opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{
                top: '100%',
                right: '0',
                marginTop: '8px',
                backgroundColor: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '8px 12px',
                width: '200px',
                zIndex: 50,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              <p className="text-xs text-[var(--text)]" style={{ marginBottom: '4px' }}>
                <strong>Moving Average</strong> smooths out week-to-week variation to reveal the broader trend.
              </p>
              <p className="text-xs text-[var(--text-ghost)]">
                <strong>Raw</strong> shows exact values for each scan.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-[var(--text-ghost)]">MA</span>
        </div>
      </div>

      {/* SVG Chart */}
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${viewBoxWidth} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ overflow: 'visible' }}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Grid lines */}
        <g className="grid" stroke="var(--border)" strokeDasharray="2,2" strokeWidth="0.5">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + innerHeight * (1 - ratio)
            return (
              <line
                key={ratio}
                x1={padding.left}
                y1={y}
                x2={viewBoxWidth - padding.right}
                y2={y}
              />
            )
          })}
        </g>

        {/* Y-axis labels (single axis, percentages) */}
        {showLabels && (
          <g className="y-labels" fill="var(--text-dim)" fontSize="10" fontFamily="monospace">
            {[0, 0.5, 1].map((ratio) => {
              const y = padding.top + innerHeight * (1 - ratio)
              const value = yAxis.min + yAxis.range * ratio
              return (
                <text
                  key={ratio}
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                >
                  {value.toFixed(0)}%
                </text>
              )
            })}
            <text
              x={12}
              y={padding.top + innerHeight / 2}
              textAnchor="middle"
              fontSize="9"
              fill="var(--text-ghost)"
              transform={`rotate(-90, 12, ${padding.top + innerHeight / 2})`}
            >
              Visibility %
            </text>
          </g>
        )}

        {/* Render platform series first so overall is on top */}
        {platformSeries.map((s) => {
          if (s.data.length === 0) return null

          const points = s.data.map((d) => ({
            x: getX(d.date, viewBoxWidth),
            y: getY(d.value),
            value: d.value,
            date: d.date,
          }))

          // Estimate path length for animation
          let pathLength = 0
          for (let i = 1; i < points.length; i++) {
            const dx = points[i].x - points[i-1].x
            const dy = points[i].y - points[i-1].y
            pathLength += Math.sqrt(dx * dx + dy * dy)
          }

          // Use smooth curves in MA mode, straight lines in raw mode
          const smoothPath = showMovingAverage ? generateSmoothPath(points) : null
          const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ')

          return (
            <g key={s.key}>
              {smoothPath ? (
                <path
                  d={smoothPath}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity="0.8"
                  strokeDasharray={getAnimatedStroke(pathLength * 1.2 || 1000)}
                />
              ) : (
                <polyline
                  points={pointsStr}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity="0.8"
                  strokeDasharray={getAnimatedStroke(pathLength || 1000)}
                />
              )}
              {/* Data points - only show after animation */}
              {animationProgress > 0.9 && points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  fill={s.color}
                  fillOpacity="0.9"
                  style={{ cursor: 'pointer', opacity: animationProgress > 0.95 ? 1 : 0 }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect()
                    if (rect) {
                      const scaleX = rect.width / viewBoxWidth
                      const scaleY = rect.height / height
                      setTooltip({
                        x: rect.left + p.x * scaleX,
                        y: rect.top + p.y * scaleY - 10,
                        name: s.name,
                        value: `${p.value.toFixed(0)}% visibility`,
                        date: formatDate(p.date),
                        color: s.color,
                      })
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </g>
          )
        })}

        {/* Render overall series on top */}
        {overallSeries && overallSeries.data.length > 0 && (() => {
          const points = overallSeries.data.map(d => ({
            x: getX(d.date, viewBoxWidth),
            y: getY(d.value),
            value: d.value,
            date: d.date,
          }))

          // Estimate path length
          let pathLength = 0
          for (let i = 1; i < points.length; i++) {
            const dx = points[i].x - points[i-1].x
            const dy = points[i].y - points[i-1].y
            pathLength += Math.sqrt(dx * dx + dy * dy)
          }

          // Use smooth curves in MA mode, straight lines in raw mode
          const smoothPath = showMovingAverage ? generateSmoothPath(points) : null
          const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ')

          return (
            <g key={overallSeries.key}>
              {smoothPath ? (
                <path
                  d={smoothPath}
                  fill="none"
                  stroke={overallSeries.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={getAnimatedStroke(pathLength * 1.2 || 1000)}
                />
              ) : (
                <polyline
                  points={pointsStr}
                  fill="none"
                  stroke={overallSeries.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={getAnimatedStroke(pathLength || 1000)}
                />
              )}
              {animationProgress > 0.9 && points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="6"
                  fill="var(--bg)"
                  stroke={overallSeries.color}
                  strokeWidth="2"
                  style={{ cursor: 'pointer', opacity: animationProgress > 0.95 ? 1 : 0 }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect()
                    if (rect) {
                      const scaleX = rect.width / viewBoxWidth
                      const scaleY = rect.height / height
                      setTooltip({
                        x: rect.left + p.x * scaleX,
                        y: rect.top + p.y * scaleY - 10,
                        name: overallSeries.name,
                        value: `${p.value.toFixed(1)}% visibility`,
                        date: formatDate(p.date),
                        color: overallSeries.color,
                      })
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </g>
          )
        })()}

        {/* X-axis labels */}
        {showLabels && dates.length >= 2 && (
          <g className="x-labels" fill="var(--text-ghost)" fontSize="10" fontFamily="monospace">
            {dates.map((date, i) => {
              const x = getX(date, viewBoxWidth)
              return (
                <text
                  key={i}
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                >
                  {formatDate(date)}
                </text>
              )
            })}
          </g>
        )}
      </svg>

      {/* Legend */}
      <div
        className="flex flex-wrap items-center justify-center"
        style={{ marginTop: '16px', gap: '16px' }}
      >
        {overallSeries && (
          <div className="flex items-center gap-2">
            <span
              style={{
                width: '24px',
                height: '3px',
                backgroundColor: overallSeries.color,
                borderRadius: '2px',
              }}
            />
            <span className="font-mono text-xs text-[var(--text)]">
              {overallSeries.name}
            </span>
          </div>
        )}
        {platformSeries.map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <span
              style={{
                width: '16px',
                height: '2px',
                backgroundColor: s.color,
                borderRadius: '1px',
              }}
            />
            <span className="font-mono text-xs text-[var(--text-dim)]">
              {s.name}
            </span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            backgroundColor: 'var(--surface-elevated)',
            border: `1px solid ${tooltip.color}`,
            borderRadius: '4px',
            padding: '8px 12px',
            pointerEvents: 'none',
            zIndex: 100,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <div
            className="font-mono text-xs font-medium"
            style={{ color: tooltip.color, marginBottom: '4px' }}
          >
            {tooltip.name}
          </div>
          <div className="text-sm text-[var(--text)]" style={{ marginBottom: '2px' }}>
            {tooltip.value}
          </div>
          <div className="text-xs text-[var(--text-dim)]">
            {tooltip.date}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Competitor colors - distinct from platform colors
 */
const COMPETITOR_COLORS = [
  '#f97316', // orange
  '#a855f7', // purple
  '#eab308', // yellow
  '#ec4899', // pink
  '#14b8a6', // teal
]

export interface CompetitorMentionsSeries {
  name: string
  isDomain?: boolean // If true, this is the user's domain (use white, thicker line)
  data: { date: string; value: number }[]
}

interface CompetitorMentionsTrendChartProps {
  domain: string
  series: CompetitorMentionsSeries[]
  height?: number
  showLabels?: boolean
  title?: string
  defaultToMovingAverage?: boolean
}

/**
 * Calculate 3-point moving average for competitor mention data
 */
function calculateCompetitorMovingAverage(
  data: { date: string; value: number }[],
  window = 3
): { date: string; value: number }[] {
  if (data.length < window) return data

  const result: { date: string; value: number }[] = []
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(window / 2))
    const end = Math.min(data.length, i + Math.ceil(window / 2))
    const windowData = data.slice(start, end)
    const avg = windowData.reduce((sum, d) => sum + d.value, 0) / windowData.length
    result.push({ ...data[i], value: avg })
  }
  return result
}

/**
 * Trend chart showing absolute mention counts for domain vs competitors
 */
export function CompetitorMentionsTrendChart({
  domain,
  series,
  height = 250,
  showLabels = true,
  title,
  defaultToMovingAverage = true,
}: CompetitorMentionsTrendChartProps) {
  const padding = { top: 16, right: 20, bottom: 32, left: 45 } // Same padding as visibility trends
  const [showMovingAverage, setShowMovingAverage] = useState(defaultToMovingAverage)
  const [isVisible, setIsVisible] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)
  const chartRef = useRef<HTMLDivElement>(null)

  // Observe when chart becomes visible
  useEffect(() => {
    const element = chartRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Animate line drawing when visible
  useEffect(() => {
    if (!isVisible) return

    const duration = 2500
    const steps = 100
    const interval = duration / steps

    let step = 0
    const timer = setInterval(() => {
      step++
      if (step >= steps) {
        setAnimationProgress(1)
        clearInterval(timer)
      } else {
        const progress = step / steps
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setAnimationProgress(eased)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [isVisible])

  // Apply moving average if enabled
  const displaySeries = useMemo(() => {
    if (!showMovingAverage) return series
    return series.map(s => ({
      ...s,
      data: calculateCompetitorMovingAverage(s.data, 3),
    }))
  }, [series, showMovingAverage])

  // Separate domain series from competitor series
  const domainSeries = displaySeries.find(s => s.isDomain)
  const competitorSeries = displaySeries.filter(s => !s.isDomain)

  // Assign colors to competitors
  const competitorWithColors = competitorSeries.map((s, i) => ({
    ...s,
    color: COMPETITOR_COLORS[i % COMPETITOR_COLORS.length],
  }))

  // Calculate chart dimensions and ranges
  const { innerHeight, dates, yAxis } = useMemo(() => {
    const allDates: string[] = []
    const seenDates = new Set<string>()

    for (const s of series) {
      for (const d of s.data) {
        if (!seenDates.has(d.date)) {
          seenDates.add(d.date)
          allDates.push(d.date)
        }
      }
    }
    allDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

    // Y-axis: absolute mention counts - scale dynamically to data
    const allValues = series.flatMap(s => s.data.map(d => d.value))
    const maxValue = Math.max(1, ...allValues) // At least 1 to avoid division by zero
    // Add 10% padding above max value, minimum of 1
    const niceMax = Math.max(1, Math.ceil(maxValue * 1.1))

    return {
      innerHeight: height - padding.top - padding.bottom,
      dates: allDates,
      yAxis: { min: 0, max: niceMax, range: niceMax },
    }
  }, [series, height])

  // Helper to get X position
  const getX = (date: string, viewBoxWidth: number) => {
    const dateIndex = dates.indexOf(date)
    if (dates.length <= 1) return padding.left + (viewBoxWidth - padding.left - padding.right) / 2
    return padding.left + (dateIndex / (dates.length - 1)) * (viewBoxWidth - padding.left - padding.right)
  }

  // Helper to get Y position
  const getY = (value: number) => {
    return padding.top + innerHeight - (value / yAxis.range) * innerHeight
  }

  // State for tooltip
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    name: string
    value: string
    date: string
    color: string
  } | null>(null)

  if (dates.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-[var(--text-dim)] text-sm"
        style={{ height }}
      >
        No data yet
      </div>
    )
  }

  const viewBoxWidth = 800

  // Calculate stroke-dasharray for animation
  const getAnimatedStroke = (totalLength: number) => {
    const visibleLength = totalLength * animationProgress
    return `${visibleLength} ${totalLength}`
  }

  return (
    <div ref={chartRef} style={{ position: 'relative' }}>
      {/* Header with title and toggle */}
      <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
        {title && (
          <span className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-wider">
            {title}
          </span>
        )}

        {/* Moving Average Toggle */}
        <div className="flex items-center" style={{ gap: '8px' }}>
          <span className="text-xs font-mono text-[var(--text-ghost)]">Raw</span>
          <div className="relative group">
            <button
              onClick={() => setShowMovingAverage(!showMovingAverage)}
              className="relative"
              style={{
                width: '36px',
                height: '20px',
                borderRadius: '10px',
                backgroundColor: showMovingAverage ? 'var(--green)' : 'var(--border)',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              aria-label={showMovingAverage ? 'Show raw values' : 'Show moving average'}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: showMovingAverage ? '18px' : '2px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  transition: 'left 0.2s',
                }}
              />
            </button>
            {/* Tooltip */}
            <div
              className="absolute opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{
                top: '100%',
                right: '0',
                marginTop: '8px',
                backgroundColor: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '8px 12px',
                width: '200px',
                zIndex: 50,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              <p className="text-xs text-[var(--text)]" style={{ marginBottom: '4px' }}>
                <strong>Moving Average</strong> smooths out week-to-week variation to reveal the broader trend.
              </p>
              <p className="text-xs text-[var(--text-ghost)]">
                <strong>Raw</strong> shows exact values for each scan.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-[var(--text-ghost)]">MA</span>
        </div>
      </div>

      {/* SVG Chart */}
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${viewBoxWidth} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ overflow: 'visible' }}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Grid lines */}
        <g className="grid" stroke="var(--border)" strokeDasharray="2,2" strokeWidth="0.5">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + innerHeight * (1 - ratio)
            return (
              <line
                key={ratio}
                x1={padding.left}
                y1={y}
                x2={viewBoxWidth - padding.right}
                y2={y}
              />
            )
          })}
        </g>

        {/* Y-axis labels (mention counts) */}
        {showLabels && (
          <g className="y-labels" fill="var(--text-dim)" fontSize="10" fontFamily="monospace">
            {[0, 0.5, 1].map((ratio) => {
              const y = padding.top + innerHeight * (1 - ratio)
              const value = yAxis.min + yAxis.range * ratio
              return (
                <text
                  key={ratio}
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                >
                  {Math.round(value)}
                </text>
              )
            })}
            {/* Axis label */}
            <text
              x={12}
              y={padding.top + innerHeight / 2}
              textAnchor="middle"
              fontSize="9"
              fill="var(--text-ghost)"
              transform={`rotate(-90, 12, ${padding.top + innerHeight / 2})`}
            >
              Mentions
            </text>
          </g>
        )}

        {/* Render competitor series first (so domain is on top) */}
        {competitorWithColors.map((s) => {
          if (s.data.length === 0) return null

          const points = s.data.map((d) => ({
            x: getX(d.date, viewBoxWidth),
            y: getY(d.value),
            value: d.value,
            date: d.date,
          }))
          const smoothPath = showMovingAverage ? generateSmoothPath(points) : null
          const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ')

          // Estimate path length for animation
          let pathLength = 0
          for (let i = 1; i < points.length; i++) {
            const dx = points[i].x - points[i-1].x
            const dy = points[i].y - points[i-1].y
            pathLength += Math.sqrt(dx * dx + dy * dy)
          }

          return (
            <g key={s.name}>
              {/* Line - smooth in MA mode, sharp in raw mode */}
              {smoothPath ? (
                <path
                  d={smoothPath}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity="0.8"
                  strokeDasharray={getAnimatedStroke(pathLength * 1.2 || 1000)}
                />
              ) : (
                <polyline
                  points={pointsStr}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity="0.8"
                  strokeDasharray={getAnimatedStroke(pathLength || 1000)}
                />
              )}
              {/* Data points with hover - only show after animation */}
              {animationProgress > 0.9 && points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  fill={s.color}
                  fillOpacity="0.9"
                  style={{ cursor: 'pointer', opacity: animationProgress > 0.95 ? 1 : 0 }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect()
                    if (rect) {
                      const scaleX = rect.width / viewBoxWidth
                      const scaleY = rect.height / height
                      setTooltip({
                        x: rect.left + p.x * scaleX,
                        y: rect.top + p.y * scaleY - 10,
                        name: s.name,
                        value: `${p.value} mention${p.value !== 1 ? 's' : ''}`,
                        date: formatDate(p.date),
                        color: s.color,
                      })
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </g>
          )
        })}

        {/* Render domain series on top */}
        {domainSeries && domainSeries.data.length > 0 && (() => {
          const points = domainSeries.data.map(d => ({
            x: getX(d.date, viewBoxWidth),
            y: getY(d.value),
            value: d.value,
            date: d.date,
          }))
          const smoothPath = showMovingAverage ? generateSmoothPath(points) : null
          const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ')

          // Estimate path length for animation
          let pathLength = 0
          for (let i = 1; i < points.length; i++) {
            const dx = points[i].x - points[i-1].x
            const dy = points[i].y - points[i-1].y
            pathLength += Math.sqrt(dx * dx + dy * dy)
          }

          return (
            <g>
              {/* Line - smooth in MA mode, sharp in raw mode */}
              {smoothPath ? (
                <path
                  d={smoothPath}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={getAnimatedStroke(pathLength * 1.2 || 1000)}
                />
              ) : (
                <polyline
                  points={pointsStr}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={getAnimatedStroke(pathLength || 1000)}
                />
              )}
              {/* Data points with hover - only show after animation */}
              {animationProgress > 0.9 && points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="6"
                  fill="var(--bg)"
                  stroke="#ffffff"
                  strokeWidth="2"
                  style={{ cursor: 'pointer', opacity: animationProgress > 0.95 ? 1 : 0 }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect()
                    if (rect) {
                      const scaleX = rect.width / viewBoxWidth
                      const scaleY = rect.height / height
                      setTooltip({
                        x: rect.left + p.x * scaleX,
                        y: rect.top + p.y * scaleY - 10,
                        name: domain,
                        value: `${p.value} mention${p.value !== 1 ? 's' : ''}`,
                        date: formatDate(p.date),
                        color: '#ffffff',
                      })
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </g>
          )
        })()}

        {/* X-axis labels */}
        {showLabels && dates.length >= 2 && (
          <g className="x-labels" fill="var(--text-ghost)" fontSize="10" fontFamily="monospace">
            {dates.map((date, i) => {
              const x = getX(date, viewBoxWidth)
              return (
                <text
                  key={i}
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                >
                  {formatDate(date)}
                </text>
              )
            })}
          </g>
        )}
      </svg>

      {/* Legend */}
      <div
        className="flex flex-wrap items-center justify-center"
        style={{ marginTop: '16px', gap: '16px' }}
      >
        {/* Domain (user's site) - thicker line like "Overall" */}
        {domainSeries && (
          <div className="flex items-center gap-2">
            <span
              style={{
                width: '24px',
                height: '3px',
                backgroundColor: '#ffffff',
                borderRadius: '2px',
              }}
            />
            <span className="font-mono text-xs text-[var(--text)]">
              {domain}
            </span>
          </div>
        )}
        {/* Competitors */}
        {competitorWithColors.map((s) => (
          <div key={s.name} className="flex items-center gap-2">
            <span
              style={{
                width: '16px',
                height: '2px',
                backgroundColor: s.color,
                borderRadius: '1px',
              }}
            />
            <span className="font-mono text-xs text-[var(--text-dim)]">
              {s.name}
            </span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            backgroundColor: 'var(--surface-elevated)',
            border: `1px solid ${tooltip.color}`,
            borderRadius: '4px',
            padding: '8px 12px',
            pointerEvents: 'none',
            zIndex: 100,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <div
            className="font-mono text-xs font-medium"
            style={{ color: tooltip.color, marginBottom: '4px' }}
          >
            {tooltip.name}
          </div>
          <div className="text-sm text-[var(--text)]" style={{ marginBottom: '2px' }}>
            {tooltip.value}
          </div>
          <div className="text-xs text-[var(--text-dim)]">
            {tooltip.date}
          </div>
        </div>
      )}
    </div>
  )
}
