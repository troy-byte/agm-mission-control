'use client'

import { useState, useEffect, useCallback } from 'react'
import { Heart, RefreshCw, CheckCircle, AlertCircle, XCircle, Clock, Activity } from 'lucide-react'

interface ClientHealth {
  status: string
  token_valid: boolean
  token_expires_in_minutes?: number
  processed_events_count?: number
  injections?: number
  pending_retries?: number
  dead_retries?: number
  last_event_at?: string
  last_event_key?: string
  issues?: string[]
}

interface Heartbeat {
  status: string
  timestamp?: string
  epoch?: number
  detail?: string
}

interface HealthData {
  status: string
  clients: Record<string, ClientHealth>
  heartbeats: Record<string, Heartbeat>
}

const HEALTH_URL = 'https://agm-pro--claude-orchestrator-health.modal.run'
const REFRESH_INTERVAL = 60000

const CRON_LABELS: Record<string, { label: string; schedule: string }> = {
  'jobber_token_keepalive': { label: 'Jobber Token Keepalive', schedule: 'Every 30 min' },
  'ghl_token_keepalive': { label: 'AGM Token Keepalive', schedule: 'Every 12h' },
  'ghl_key_canary': { label: 'AGM Key Canary', schedule: 'Daily 6 AM PT' },
  'jobber_retry_cron': { label: 'Jobber Retry Queue', schedule: 'Every 15 min' },
  'jobber_layer4_diagnose': { label: 'Layer 4 AI Diagnosis', schedule: 'Every hour' },
  'synthetic_canary': { label: 'Synthetic Canary', schedule: 'Daily 6 AM UTC' },
  'morning_inbox_cleanup': { label: 'Morning Inbox Cleanup', schedule: '5:20 AM PT' },
  'morning_email_briefing': { label: 'Morning Email Briefing', schedule: '5:30 AM PT' },
}

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

const MAX_HISTORY = 96 // ~24h at 15-min intervals or ~96 min at 60s

interface UptimeEntry {
  ts: string
  status: 'green' | 'yellow' | 'red'
}

function statusToColor(status: string): 'green' | 'yellow' | 'red' {
  const s = (status || '').toLowerCase()
  if (s === 'healthy' || s === 'ok' || s === 'green') return 'green'
  if (s === 'degraded' || s === 'yellow') return 'yellow'
  return 'red'
}

function loadUptimeHistory(): UptimeEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('agm_uptime_history') || '[]')
  } catch { return [] }
}

function saveUptimeHistory(history: UptimeEntry[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem('agm_uptime_history', JSON.stringify(history))
}

export default function SystemHealth() {
  const [data, setData] = useState<HealthData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [uptimeHistory, setUptimeHistory] = useState<UptimeEntry[]>(loadUptimeHistory)

  const recordUptime = useCallback((status: string) => {
    setUptimeHistory(prev => {
      const entry: UptimeEntry = { ts: new Date().toISOString(), status: statusToColor(status) }
      const next = [...prev, entry].slice(-MAX_HISTORY)
      saveUptimeHistory(next)
      return next
    })
  }, [])

  const fetchHealth = useCallback(async () => {
    try {
      const resp = await fetch(HEALTH_URL)
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const json = await resp.json()
      setData(json)
      setError(null)
      setLastUpdated(new Date())
      recordUptime(json.status || 'unhealthy')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      recordUptime('unhealthy')
    } finally {
      setLoading(false)
    }
  }, [recordUptime])

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchHealth])

  const getStatusIcon = (status: string) => {
    const s = status?.toLowerCase()
    if (s === 'healthy' || s === 'ok' || s === 'green') return <CheckCircle className="w-5 h-5 text-green-400" />
    if (s === 'degraded' || s === 'yellow') return <AlertCircle className="w-5 h-5 text-yellow-400" />
    return <XCircle className="w-5 h-5 text-red-400" />
  }

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase()
    if (s === 'healthy' || s === 'ok' || s === 'green') return { text: 'Healthy', classes: 'bg-green-900 text-green-300' }
    if (s === 'degraded' || s === 'yellow') return { text: 'Degraded', classes: 'bg-yellow-900 text-yellow-300' }
    return { text: 'Unhealthy', classes: 'bg-red-900 text-red-300' }
  }

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-xl p-8 border border-gray-800">
        <div className="flex items-center justify-center space-x-3 text-gray-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Connecting to Modal health endpoint...</span>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
        <div className="flex items-center space-x-3 mb-4">
          <Heart className="w-6 h-6 text-red-400" />
          <h2 className="text-xl font-semibold text-white">System Health</h2>
        </div>
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-300">
          Failed to reach Modal health endpoint: {error}
        </div>
      </div>
    )
  }

  if (!data) return null

  const clients = data.clients || {}
  const heartbeats = data.heartbeats || {}
  const overallBadge = getStatusBadge(data.status)

  const cronEntries = Object.entries(heartbeats).sort((a, b) => {
    if (a[1].status !== b[1].status) return a[1].status === 'error' ? -1 : 1
    return (b[1].epoch || 0) - (a[1].epoch || 0)
  })

  return (
    <div className="space-y-6">
      {/* Overall Status Banner */}
      <div className={`rounded-lg border p-5 flex items-center justify-between ${
        data.status?.toLowerCase() === 'healthy' ? 'bg-green-900/10 border-green-800' :
        data.status?.toLowerCase() === 'degraded' ? 'bg-yellow-900/10 border-yellow-800' :
        'bg-red-900/10 border-red-800'
      }`}>
        <div className="flex items-center space-x-4">
          {getStatusIcon(data.status)}
          <div>
            <h2 className="text-lg font-semibold text-white">System {overallBadge.text}</h2>
            <p className="text-sm text-gray-400">
              {Object.keys(clients).length} active client{Object.keys(clients).length !== 1 ? 's' : ''} &middot; {cronEntries.length} crons tracked
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchHealth}
            className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
            Refresh
          </button>
        </div>
      </div>

      {/* Uptime Bar */}
      {uptimeHistory.length >= 2 && (() => {
        const upCount = uptimeHistory.filter(h => h.status === 'green').length
        const pct = ((upCount / uptimeHistory.length) * 100).toFixed(1)
        const pctNum = parseFloat(pct)
        const pctColor = pctNum >= 99.5 ? 'text-green-400' : pctNum >= 95 ? 'text-yellow-400' : 'text-red-400'
        const oldest = new Date(uptimeHistory[0].ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

        return (
          <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Uptime</h3>
              <span className="text-xs text-gray-500">{uptimeHistory.length} checks</span>
            </div>
            <p className={`text-3xl font-bold mb-2 ${pctColor}`}>{pct}%</p>
            <div className="flex gap-px h-8 mb-2">
              {uptimeHistory.map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm cursor-default transition-opacity hover:opacity-80 ${
                    h.status === 'green' ? 'bg-green-500' :
                    h.status === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  title={`${new Date(h.ts).toLocaleString()} — ${h.status}`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{oldest}</span>
              <span>Now</span>
            </div>
          </div>
        )
      })()}

      {/* Client Health Cards */}
      <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
        <div className="flex items-center space-x-3 mb-4">
          <Heart className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-semibold text-white">Client Integrations</h2>
          <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full">{Object.keys(clients).length}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(clients).map(([slug, client]) => {
            const badge = getStatusBadge(client.status)
            const displayName = slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

            return (
              <div key={slug} className="bg-black rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(client.status)}
                    <span className="font-medium text-white">{displayName}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${badge.classes}`}>{badge.text}</span>
                </div>

                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Token</p>
                    <p className={`font-medium ${client.token_valid ? 'text-green-400' : 'text-red-400'}`}>
                      {client.token_valid
                        ? (client.token_expires_in_minutes && client.token_expires_in_minutes <= 30
                          ? Math.round(client.token_expires_in_minutes) + 'm left'
                          : 'Valid')
                        : 'Expired'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Injections</p>
                    <p className="font-medium text-cyan-400">{(client.injections || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Events</p>
                    <p className="font-medium text-white">{(client.processed_events_count || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Event</p>
                    <p className="font-medium text-white">{timeAgo(client.last_event_at)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Pending Retries</p>
                    <p className={`font-medium ${(client.pending_retries || 0) > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {client.pending_retries || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Dead Letters</p>
                    <p className={`font-medium ${(client.dead_retries || 0) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {client.dead_retries || 0}
                    </p>
                  </div>
                </div>

                {client.issues && client.issues.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    {client.issues.map((issue, i) => (
                      <p key={i} className="text-xs text-yellow-400">! {issue.replace(/_/g, ' ')}</p>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Cron Heartbeats */}
      <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
        <div className="flex items-center space-x-3 mb-4">
          <Activity className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Cron Heartbeats</h2>
          <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full">{cronEntries.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                <th className="text-left py-2 px-3">Cron</th>
                <th className="text-left py-2 px-3">Status</th>
                <th className="text-left py-2 px-3">Schedule</th>
                <th className="text-left py-2 px-3">Last Run</th>
                <th className="text-left py-2 px-3">Age</th>
                <th className="text-left py-2 px-3">Detail</th>
              </tr>
            </thead>
            <tbody>
              {cronEntries.map(([name, hb]) => {
                const info = CRON_LABELS[name] || { label: name, schedule: '-' }
                let isStale = false
                if (hb.epoch) {
                  const ageMs = Date.now() - (hb.epoch * 1000)
                  const isFrequent = name.includes('keepalive') || name.includes('retry')
                  if (isFrequent && ageMs > 2 * 3600 * 1000) isStale = true
                }

                return (
                  <tr key={name} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2.5 px-3 font-medium text-white">{info.label}</td>
                    <td className="py-2.5 px-3">
                      <span className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${
                          isStale ? 'bg-yellow-400' : hb.status === 'ok' ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        <span className="text-gray-300">{isStale ? 'Stale' : hb.status === 'ok' ? 'OK' : 'Error'}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-500">{info.schedule}</td>
                    <td className="py-2.5 px-3 text-gray-500">
                      {hb.timestamp ? new Date(hb.timestamp.endsWith('Z') ? hb.timestamp : hb.timestamp + 'Z').toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-gray-500">{timeAgo(hb.timestamp)}</td>
                    <td className="py-2.5 px-3 text-gray-500 max-w-[200px] truncate">
                      {hb.detail ? (hb.detail.length > 60 ? hb.detail.substring(0, 60) + '...' : hb.detail) : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Health API Link */}
      <div className="text-xs text-gray-600 flex items-center space-x-4">
        <span>Auto-refresh: 60s</span>
        <a href={HEALTH_URL} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Health API</a>
      </div>
    </div>
  )
}
