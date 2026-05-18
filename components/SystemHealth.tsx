'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'

interface ClientHealth {
  status: string
  token_valid: boolean
  token_expires_in_minutes?: number
  processed_events_count?: number
  injections_today?: number
  injections_this_week?: number
  injections_this_month?: number
  pending_retries?: number
  dead_retries?: number
  last_event_at?: string
  last_check_at?: string
  last_event_key?: string
  dashboard_mode?: string
  issues?: string[]
}

interface Heartbeat {
  status: string
  timestamp?: string
  epoch?: number
  detail?: string
  stale?: boolean
  age_minutes?: number
}

interface UptimeEntry {
  ts: string
  status: 'green' | 'yellow' | 'red'
}

interface RecoveryAction {
  action: string
  client: string
  detail: string
  ts: string
}

interface TokenHealth {
  status: string
  valid: boolean
  expires_in_hours?: number
  has_refresh_token?: boolean
}

interface ApiCosts {
  total_cost: number
  call_count: number
  period_days: number
  by_provider?: Record<string, number>
  by_model?: Record<string, number>
  log_exists?: boolean
}

interface HealthData {
  status: string
  clients: Record<string, ClientHealth>
  heartbeats: Record<string, Heartbeat>
  uptime_history?: UptimeEntry[]
  recovery_log?: RecoveryAction[]
  google_token_health?: Record<string, TokenHealth>
  api_costs?: ApiCosts
}

const HEALTH_URL = 'https://agm-pro--agm-health-health.modal.run'
const REFRESH_INTERVAL = 60000

const CRON_LABELS: Record<string, { label: string; schedule: string }> = {
  'jobber_token_keepalive': { label: 'Jobber Token Keepalive', schedule: 'Every 15 min' },
  'ghl_token_keepalive': { label: 'AGM Token Keepalive', schedule: 'Every 12h' },
  'ghl_key_canary': { label: 'AGM Key Canary', schedule: 'Daily 6 AM PT' },
  'jobber_retry_cron': { label: 'Jobber Retry Queue', schedule: 'Every 15 min' },
  'jobber_layer4_diagnose': { label: 'Layer 4 AI Diagnosis', schedule: 'Every hour' },
  'synthetic_canary': { label: 'Synthetic Canary', schedule: 'Daily 6 AM UTC' },
  'morning_inbox_cleanup': { label: 'Morning Inbox Cleanup', schedule: '5:20 AM PT' },
  'morning_email_briefing': { label: 'Morning Email Briefing', schedule: '5:30 AM PT' },
  'volume_backup': { label: 'Volume Backup', schedule: 'Daily 1 AM PT' },
  'security_audit_weekly': { label: 'Security Audit', schedule: 'Weekly Sunday' },
  'security_audit_self_report': { label: 'Security Self-Report', schedule: 'Every 3 days' },
  'refresh_calendar': { label: 'HG Calendar Refresh', schedule: 'Every 5 min' },
  'costco_lead_intake': { label: 'Costco Lead Intake', schedule: 'Every 5 min' },
  'sf_agm_stage_sync': { label: 'SF Stage Sync', schedule: 'Every 5 min' },
  'costco_dashboard_refresh': { label: 'Costco Dashboard Refresh', schedule: 'Every 30 min' },
  'hg_sales_dashboard_refresh': { label: 'HG Sales Dashboard', schedule: 'Every 30 min' },
  'agm_to_sf_poller': { label: 'AGM to SF Poller', schedule: 'Every 5 min' },
  'sf_job_sold_remove_lnc': { label: 'SF Job Sold Tag', schedule: 'Every 5 min' },
  'fieldroutes_valleywide_sync': { label: 'Valleywide Sync', schedule: 'Every 5 min' },
  'daily_briefings': { label: 'Daily Briefings', schedule: 'Daily 6 AM PT' },
  'immune_system_sweep': { label: 'Immune System', schedule: 'Every 15 min' },
}

const CLIENT_PLATFORMS: Record<string, { label: string; bg: string; text: string; border: string }[]> = {
  'texas-turf': [
    { label: 'JOBBER', bg: 'bg-green-900/40', text: 'text-green-400', border: 'border-green-800/50' },
    { label: 'AGM', bg: 'bg-blue-900/40', text: 'text-blue-400', border: 'border-blue-800/50' },
  ],
  'heavenly-greens': [
    { label: 'AGM', bg: 'bg-blue-900/40', text: 'text-blue-400', border: 'border-blue-800/50' },
    { label: 'SALESFORCE', bg: 'bg-indigo-900/40', text: 'text-indigo-400', border: 'border-indigo-800/50' },
  ],
  'valleywide': [
    { label: 'FIELD ROUTES', bg: 'bg-amber-900/40', text: 'text-amber-400', border: 'border-amber-800/50' },
    { label: 'SERTBO', bg: 'bg-purple-900/40', text: 'text-purple-400', border: 'border-purple-800/50' },
  ],
}

// Internal process crons — shown separately from client integration crons.
const INTERNAL_CRONS = new Set([
  'security_audit_self_report',
  'morning_inbox_cleanup',
  'morning_email_briefing',
  'volume_backup',
  'immune_system_sweep',
])

function timeAgo(isoStr?: string): string {
  if (!isoStr) return 'Never'
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return 'N/A'
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return mins + 'm ago'
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return hrs + 'h ' + (mins % 60) + 'm ago'
  const days = Math.floor(hrs / 24)
  return days + 'd ' + (hrs % 24) + 'h ago'
}

// Metric card — boxed, monospace, bordered
function MetricCard({ label, value, color = 'text-white', subtitle }: {
  label: string; value: string | number; color?: string; subtitle?: string
}) {
  return (
    <div className="border border-gray-700 rounded p-3 text-center">
      <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-mono">{label}</p>
      <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
      {subtitle && <p className="text-[9px] text-gray-600 mt-0.5">{subtitle}</p>}
    </div>
  )
}

// Status badge — pill style
function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase()
  if (s === 'healthy' || s === 'ok' || s === 'green') {
    return <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-green-700 bg-green-900/40 text-green-400">healthy</span>
  }
  if (s === 'degraded' || s === 'yellow') {
    return <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-yellow-700 bg-yellow-900/40 text-yellow-400">degraded</span>
  }
  return <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-red-700 bg-red-900/40 text-red-400">unhealthy</span>
}

// Token health badge
function TokenBadge({ status }: { status: string }) {
  const s = status?.toLowerCase()
  const configs: Record<string, { label: string; border: string; bg: string; text: string }> = {
    healthy:          { label: 'VALID',        border: 'border-green-700',  bg: 'bg-green-900/40',  text: 'text-green-400' },
    auto_refreshable: { label: 'AUTO-REFRESH', border: 'border-green-700',  bg: 'bg-green-900/40',  text: 'text-green-400' },
    warning:          { label: 'EXPIRING',     border: 'border-yellow-700', bg: 'bg-yellow-900/40', text: 'text-yellow-400' },
    critical:         { label: 'CRITICAL',     border: 'border-red-700',    bg: 'bg-red-900/40',    text: 'text-red-400' },
    expired:          { label: 'EXPIRED',      border: 'border-red-700',    bg: 'bg-red-900/40',    text: 'text-red-400' },
    not_configured:   { label: 'N/A',          border: 'border-gray-700',   bg: 'bg-gray-900/40',   text: 'text-gray-500' },
    missing:          { label: 'MISSING',      border: 'border-red-700',    bg: 'bg-red-900/40',    text: 'text-red-400' },
  }
  const c = configs[s] || { label: s.toUpperCase(), border: 'border-gray-700', bg: 'bg-gray-900/40', text: 'text-gray-400' }
  return <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${c.border} ${c.bg} ${c.text}`}>{c.label}</span>
}


export default function SystemHealth() {
  const [data, setData] = useState<HealthData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchHealth = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true)
    try {
      const resp = await fetch(HEALTH_URL)
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const json = await resp.json()
      setData(json)
      setError(null)
      setLastUpdated(new Date())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(() => fetchHealth(), REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchHealth])

  if (loading) {
    return (
      <div className="border border-gray-800 rounded-lg p-8 bg-[#0d1117]">
        <div className="flex items-center justify-center space-x-3 text-gray-500 font-mono text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Connecting to health endpoint...</span>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="border border-red-900 rounded-lg p-6 bg-[#0d1117]">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-mono mb-2">System Health</p>
        <p className="font-mono text-sm text-red-400">Failed to reach Modal health endpoint: {error}</p>
      </div>
    )
  }

  if (!data) return null

  const clients = data.clients || {}
  const heartbeats = data.heartbeats || {}

  // Filter out non-production clients (test-sandbox is an internal dev environment)
  const clientEntries = Object.entries(clients).filter(([slug]) => slug !== 'test-sandbox')
  const totalEvents = clientEntries.reduce((sum, [, c]) => sum + (c.processed_events_count || 0), 0)
  const totalToday = clientEntries.reduce((sum, [, c]) => sum + (c.injections_today || 0), 0)
  const totalWeek = clientEntries.reduce((sum, [, c]) => sum + (c.injections_this_week || 0), 0)
  const totalMonth = clientEntries.reduce((sum, [, c]) => sum + (c.injections_this_month || 0), 0)
  const totalDead = clientEntries.reduce((sum, [, c]) => sum + (c.dead_retries || 0), 0)
  const totalPending = clientEntries.reduce((sum, [, c]) => sum + (c.pending_retries || 0), 0)

  const tokenHealth = data.google_token_health || {}
  const apiCosts = data.api_costs || { total_cost: 0, call_count: 0, period_days: 1 }
  const costColor = apiCosts.total_cost > 25 ? 'text-red-400' : apiCosts.total_cost > 10 ? 'text-yellow-400' : 'text-green-400'

  const allCronEntries = Object.entries(heartbeats).sort((a, b) => {
    if (a[1].status !== b[1].status) return a[1].status === 'error' ? -1 : 1
    return (b[1].epoch || 0) - (a[1].epoch || 0)
  })
  const cronEntries = allCronEntries.filter(([name]) => !INTERNAL_CRONS.has(name))
  const internalCronEntries = allCronEntries.filter(([name]) => INTERNAL_CRONS.has(name))

  // "Operational" = healthy or degraded (system is handling it). Only "unhealthy" counts against.
  const operationalClients = clientEntries.filter(([, c]) => {
    const s = c.status?.toLowerCase()
    return s === 'healthy' || s === 'degraded' || s === 'green' || s === 'yellow'
  }).length

  // Uptime calculation — green AND yellow (degraded) count as operational.
  // Only red (unhealthy) counts as downtime. Internal process errors like
  // content_pipeline shouldn't tank client uptime.
  const history = data.uptime_history || []
  const upCount = history.filter(h => h.status === 'green' || h.status === 'yellow').length
  const uptimePct = history.length > 0 ? ((upCount / history.length) * 100).toFixed(1) : '--'
  const uptimeColor = history.length === 0 ? 'text-gray-500' :
    parseFloat(String(uptimePct)) >= 99.5 ? 'text-green-400' :
    parseFloat(String(uptimePct)) >= 95 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="space-y-4 font-mono">

      {/* ── Header Bar ── */}
      <div className={`rounded-lg border p-4 flex items-center justify-between bg-[#0d1117] ${
        data.status?.toLowerCase() === 'healthy' ? 'border-green-800' :
        data.status?.toLowerCase() === 'degraded' ? 'border-yellow-800' : 'border-red-800'
      }`}>
        <div className="flex items-center space-x-4">
          <StatusBadge status={data.status} />
          <span className="text-sm text-gray-400">
            {clientEntries.length} active client{clientEntries.length !== 1 ? 's' : ''} &middot; {cronEntries.length} crons tracked
          </span>
        </div>
        <div className="flex items-center space-x-3">
          {lastUpdated && (
            <span className="text-[10px] text-gray-600">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            type="button"
            onClick={() => fetchHealth(true)}
            disabled={refreshing}
            className="px-2.5 py-1 border border-gray-700 rounded text-[10px] text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50 uppercase tracking-wider"
          >
            <RefreshCw className={`w-3 h-3 inline mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Top-Level Metrics ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <MetricCard label="Uptime" value={uptimePct === '--' ? '--' : `${uptimePct}%`} color={uptimeColor} />
        <MetricCard label="Clients" value={`${operationalClients}/${clientEntries.length}`} color={operationalClients === clientEntries.length ? 'text-green-400' : 'text-yellow-400'} />
        <MetricCard label="Today" value={totalToday} color="text-cyan-400" />
        <MetricCard label="This Week" value={totalWeek} color="text-cyan-400" />
        <MetricCard label="This Month" value={totalMonth} color="text-cyan-400" />
        <MetricCard label="Total Events" value={totalEvents.toLocaleString()} color="text-white" />
        <MetricCard
          label="API Cost (24h)"
          value={apiCosts.total_cost > 0 ? `$${apiCosts.total_cost.toFixed(2)}` : '$0'}
          color={costColor}
          subtitle={apiCosts.call_count > 0 ? `${apiCosts.call_count} calls` : undefined}
        />
      </div>

      {/* ── Uptime History Bar ── */}
      {history.length >= 2 && (
        <div className="border border-gray-800 rounded-lg p-4 bg-[#0d1117]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-widest text-gray-500">Uptime History</p>
            <p className="text-[10px] text-gray-600">{history.length} checks</p>
          </div>
          <div className="flex items-end gap-[3px]" style={{ height: '80px' }}>
            {history.map((h, i) => {
              const hash = ((i * 17 + 31) % 11)
              const baseHeights = [42, 50, 58, 64, 72, 48, 56, 68, 44, 62, 76]
              const px = h.status === 'red' ? 80 : baseHeights[hash]
              // Green + yellow both = operational. Only red = downtime.
              const barColor = h.status === 'red' ? 'bg-red-500' : 'bg-green-500'
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-t-sm cursor-default transition-opacity hover:opacity-60 ${barColor}`}
                  style={{ height: `${px}px` }}
                  title={`${new Date(h.ts).toLocaleString()} — ${h.status}`}
                />
              )
            })}
          </div>
          <div className="flex justify-between text-[10px] text-gray-600 mt-1">
            <span>{new Date(history[0].ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
            <span>Now</span>
          </div>
        </div>
      )}

      {/* ── System Infrastructure ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Google Token Health */}
        <div className="border border-gray-800 rounded-lg bg-[#0d1117]">
          <div className="px-4 py-3 border-b border-gray-800">
            <p className="text-[10px] uppercase tracking-widest text-gray-500">Google Token Health</p>
          </div>
          <div className="p-4 space-y-3">
            {Object.keys(tokenHealth).length === 0 ? (
              <p className="text-[10px] text-gray-600">No token data available</p>
            ) : (
              Object.entries(tokenHealth).map(([name, tok]) => (
                <div key={name} className="flex items-center justify-between border border-gray-800 rounded p-3">
                  <div>
                    <p className="text-xs text-white font-medium">{name}</p>
                    {tok.expires_in_hours !== undefined && tok.expires_in_hours !== null && (
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {tok.expires_in_hours > 0
                          ? `Expires in ${tok.expires_in_hours < 1 ? Math.round(tok.expires_in_hours * 60) + 'm' : tok.expires_in_hours.toFixed(1) + 'h'}`
                          : 'Expired'}
                      </p>
                    )}
                  </div>
                  <TokenBadge status={tok.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* API Cost Breakdown */}
        <div className="border border-gray-800 rounded-lg bg-[#0d1117]">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest text-gray-500">API Cost Tracking</p>
            <span className="text-[10px] text-gray-600">{apiCosts.period_days}d window</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-gray-800 rounded p-3 text-center">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Total Spend</p>
                <p className={`text-2xl font-bold font-mono ${costColor}`}>
                  ${apiCosts.total_cost.toFixed(2)}
                </p>
              </div>
              <div className="border border-gray-800 rounded p-3 text-center">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">API Calls</p>
                <p className="text-2xl font-bold font-mono text-white">
                  {apiCosts.call_count.toLocaleString()}
                </p>
              </div>
            </div>
            {apiCosts.by_model && Object.keys(apiCosts.by_model).length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-widest text-gray-500">By Model</p>
                {Object.entries(apiCosts.by_model)
                  .sort(([, a], [, b]) => b - a)
                  .map(([model, cost]) => (
                    <div key={model} className="flex items-center justify-between border border-gray-800/50 rounded px-3 py-1.5">
                      <span className="text-[10px] text-gray-400 font-mono">{model}</span>
                      <span className="text-[10px] text-white font-mono">${cost.toFixed(4)}</span>
                    </div>
                  ))}
              </div>
            )}
            {apiCosts.call_count === 0 && (
              <p className="text-[10px] text-gray-600 text-center py-2">
                Cost tracking active — data populates as Modal apps make API calls
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Client Integration Cards ── */}
      <div className="border border-gray-800 rounded-lg bg-[#0d1117]">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-widest text-gray-500">Client Integrations</p>
          <span className="text-[10px] text-gray-600">{clientEntries.length} active</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-800">
          {clientEntries.map(([slug, client]) => {
            const displayName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            const isAgmOnly = client.dashboard_mode === 'agm_only'

            return (
              <div key={slug} className="p-4 space-y-3">
                {/* Client header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white tracking-wide">{displayName}</span>
                    {isAgmOnly && (
                      <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-400 border border-blue-800/50">AGM Only</span>
                    )}
                    {CLIENT_PLATFORMS[slug]?.map(p => (
                      <span key={p.label} className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded ${p.bg} ${p.text} border ${p.border}`}>{p.label}</span>
                    ))}
                  </div>
                  <StatusBadge status={client.status} />
                </div>

                {/* Token + Last Check + Last Event row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="border border-gray-800 rounded p-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500">Token</p>
                    <p className={`text-lg font-bold ${client.token_valid ? 'text-green-400' : 'text-red-400'}`}>
                      {client.token_valid
                        ? (client.token_expires_in_minutes && client.token_expires_in_minutes <= 30
                          ? Math.round(client.token_expires_in_minutes) + 'm'
                          : 'Valid')
                        : 'Expired'}
                    </p>
                  </div>
                  <div className="border border-gray-800 rounded p-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500">Last Check</p>
                    <p className="font-bold text-green-400">{timeAgo(client.last_check_at)}</p>
                  </div>
                  <div className="border border-gray-800 rounded p-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500">Last Event</p>
                    <p className="font-bold text-white">{isAgmOnly ? 'N/A' : timeAgo(client.last_event_at)}</p>
                  </div>
                </div>

                {isAgmOnly ? (
                  <div className="border border-gray-800 rounded p-3 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500">AGM-native client — no webhook event tracking</p>
                  </div>
                ) : (
                  <>
                    {/* Injection counts — Today / This Week / This Month */}
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Injections</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="border border-gray-800 rounded p-2 text-center">
                          <p className="text-[9px] uppercase tracking-widest text-gray-600">Today</p>
                          <p className="text-xl font-bold text-cyan-400">{(client.injections_today || 0).toLocaleString()}</p>
                        </div>
                        <div className="border border-gray-800 rounded p-2 text-center">
                          <p className="text-[9px] uppercase tracking-widest text-gray-600">This Week</p>
                          <p className="text-xl font-bold text-cyan-400">{(client.injections_this_week || 0).toLocaleString()}</p>
                        </div>
                        <div className="border border-gray-800 rounded p-2 text-center">
                          <p className="text-[9px] uppercase tracking-widest text-gray-600">This Month</p>
                          <p className="text-xl font-bold text-cyan-400">{(client.injections_this_month || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Health indicators */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="border border-gray-800 rounded p-2 text-center">
                        <p className="text-[9px] uppercase tracking-widest text-gray-600">Total Events</p>
                        <p className="text-lg font-bold text-white">{(client.processed_events_count || 0).toLocaleString()}</p>
                      </div>
                      <div className="border border-gray-800 rounded p-2 text-center">
                        <p className="text-[9px] uppercase tracking-widest text-gray-600">Retries</p>
                        <p className={`text-lg font-bold ${(client.pending_retries || 0) > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {client.pending_retries || 0}
                        </p>
                      </div>
                      <div className="border border-gray-800 rounded p-2 text-center">
                        <p className="text-[9px] uppercase tracking-widest text-gray-600">Dead Letters</p>
                        <p className={`text-lg font-bold ${(client.dead_retries || 0) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {client.dead_retries || 0}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Issues */}
                {client.issues && client.issues.filter(i => !i.includes('within_tolerance')).length > 0 && (
                  <div className="border-t border-gray-800 pt-2">
                    {client.issues.filter(i => !i.includes('within_tolerance')).map((issue, i) => (
                      <p key={i} className="text-[10px] text-yellow-500">! {issue.replace(/_/g, ' ')}</p>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Recovery Action Log ── */}
      {data.recovery_log && data.recovery_log.length > 0 && (
        <div className="border border-gray-800 rounded-lg bg-[#0d1117]">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest text-gray-500">Recovery Actions</p>
            <span className="text-[10px] text-gray-600">last {data.recovery_log.length} actions</span>
          </div>
          <div className="divide-y divide-gray-800/40 max-h-48 overflow-y-auto">
            {[...data.recovery_log].reverse().map((entry, i) => {
              const isSuccess = entry.action.includes('replayed') && !entry.action.includes('failed')
              const isLost = entry.action.includes('lost')
              const isFailed = entry.action.includes('failed')
              const isAlert = entry.action.includes('alert')
              const dotColor = isLost ? 'bg-red-500' : isFailed ? 'bg-yellow-500' : isSuccess ? 'bg-green-500' : isAlert ? 'bg-blue-500' : 'bg-gray-500'

              return (
                <div key={i} className="px-4 py-2 flex items-start space-x-3 hover:bg-white/[0.02]">
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${dotColor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] uppercase tracking-wider ${
                        isLost ? 'text-red-400' : isFailed ? 'text-yellow-400' : isSuccess ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        {entry.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-gray-700 flex-shrink-0 ml-2">
                        {new Date(entry.ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 truncate">{entry.client}: {entry.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Client Integration Crons ── */}
      <div className="border border-gray-800 rounded-lg bg-[#0d1117]">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-widest text-gray-500">Client Integration Crons</p>
          <div className="flex items-center space-x-3">
            <span className="text-[10px] text-gray-600">{cronEntries.length} jobs</span>
            {totalPending > 0 && (
              <span className="text-[10px] text-yellow-500">{totalPending} pending retries</span>
            )}
            {totalDead > 0 && (
              <span className="text-[10px] text-red-500">{totalDead} dead letters</span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] text-gray-600 uppercase tracking-widest border-b border-gray-800">
                <th className="text-left py-2 px-4">Cron</th>
                <th className="text-left py-2 px-4">Status</th>
                <th className="text-left py-2 px-4">Schedule</th>
                <th className="text-left py-2 px-4">Last Run</th>
                <th className="text-left py-2 px-4">Age</th>
                <th className="text-left py-2 px-4">Detail</th>
              </tr>
            </thead>
            <tbody>
              {cronEntries.map(([name, hb]) => {
                const info = CRON_LABELS[name] || { label: name, schedule: '-' }
                const isStale = hb.stale === true || hb.status === 'stale'
                const isOk = hb.status === 'ok'

                return (
                  <tr key={name} className="border-b border-gray-800/40 hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-4 text-white font-medium">{info.label}</td>
                    <td className="py-2.5 px-4">
                      <span className="flex items-center space-x-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isStale ? 'bg-yellow-400' : isOk ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        <span className={
                          isStale ? 'text-yellow-400' : isOk ? 'text-green-400' : 'text-red-400'
                        }>{isStale ? 'STALE' : isOk ? 'OK' : 'ERR'}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-gray-500">{info.schedule}</td>
                    <td className="py-2.5 px-4 text-gray-500">
                      {hb.timestamp ? new Date(hb.timestamp.endsWith('Z') ? hb.timestamp : hb.timestamp + 'Z').toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-gray-500">{timeAgo(hb.timestamp)}</td>
                    <td className="py-2.5 px-4 text-gray-600 max-w-[240px] truncate">
                      {hb.detail ? (typeof hb.detail === 'string' ? hb.detail : JSON.stringify(hb.detail)) : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Internal Process Crons (separate from client health) ── */}
      {internalCronEntries.length > 0 && (
        <div className="border border-gray-800 rounded-lg bg-[#0d1117]">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest text-gray-500">Internal Process Crons</p>
            <span className="text-[10px] text-gray-600">{internalCronEntries.length} jobs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] text-gray-600 uppercase tracking-widest border-b border-gray-800">
                  <th className="text-left py-2 px-4">Cron</th>
                  <th className="text-left py-2 px-4">Status</th>
                  <th className="text-left py-2 px-4">Schedule</th>
                  <th className="text-left py-2 px-4">Last Run</th>
                  <th className="text-left py-2 px-4">Age</th>
                  <th className="text-left py-2 px-4">Detail</th>
                </tr>
              </thead>
              <tbody>
                {internalCronEntries.map(([name, hb]) => {
                  const info = CRON_LABELS[name] || { label: name, schedule: '-' }
                  const isStale = hb.stale === true || hb.status === 'stale'
                  const isOk = hb.status === 'ok'

                  return (
                    <tr key={name} className="border-b border-gray-800/40 hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-4 text-white font-medium">{info.label}</td>
                      <td className="py-2.5 px-4">
                        <span className="flex items-center space-x-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isStale ? 'bg-yellow-400' : isOk ? 'bg-green-400' : 'bg-red-400'
                          }`} />
                          <span className={
                            isStale ? 'text-yellow-400' : isOk ? 'text-green-400' : 'text-red-400'
                          }>{isStale ? 'STALE' : isOk ? 'OK' : 'ERR'}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-gray-500">{info.schedule}</td>
                      <td className="py-2.5 px-4 text-gray-500">
                        {hb.timestamp ? new Date(hb.timestamp.endsWith('Z') ? hb.timestamp : hb.timestamp + 'Z').toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-gray-500">{timeAgo(hb.timestamp)}</td>
                      <td className="py-2.5 px-4 text-gray-600 max-w-[240px] truncate">
                        {hb.detail ? (typeof hb.detail === 'string' ? hb.detail : JSON.stringify(hb.detail)) : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="flex items-center justify-between text-[10px] text-gray-700 px-1">
        <span>Auto-refresh: 60s</span>
        <a href={HEALTH_URL} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-400 transition-colors">
          Health API &rarr;
        </a>
      </div>
    </div>
  )
}
