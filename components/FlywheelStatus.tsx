'use client'

import { useState, useEffect, useCallback } from 'react'
import { Activity, AlertCircle, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react'

interface PipelineHeartbeat {
  cron: string
  status: string
  timestamp: string
  epoch: number
  detail: string
}

interface HealthData {
  heartbeats: Record<string, PipelineHeartbeat>
}

interface FlywheelStage {
  id: string
  name: string
  description: string
  schedule: string
  dependencies: string[]
}

const HEALTH_URL = 'https://agm-pro--agm-health-health.modal.run'
const REFRESH_INTERVAL = 60000

const PIPELINE_STAGES: FlywheelStage[] = [
  {
    id: 'scout',
    name: 'Scout',
    description: 'Industry research + trend signals',
    schedule: 'Monday',
    dependencies: ['ANTHROPIC_API_KEY'],
  },
  {
    id: 'gemma',
    name: 'Gemma',
    description: 'Zero-cost pre-processing (local LLM)',
    schedule: 'On-demand',
    dependencies: [],
  },
  {
    id: 'quill',
    name: 'Quill',
    description: 'Newsletter + report writing',
    schedule: 'Wednesday',
    dependencies: ['ANTHROPIC_API_KEY', 'token_sheets.json'],
  },
  {
    id: 'pixel',
    name: 'Pixel',
    description: 'Video, thumbnails, visuals',
    schedule: 'Thursday',
    dependencies: ['OPENAI_API_KEY', 'ELEVENLABS_API_KEY', 'token_sheets.json'],
  },
  {
    id: 'echo',
    name: 'Echo',
    description: 'Distribution (email, YouTube, S3)',
    schedule: 'Tuesday',
    dependencies: ['GHL_API_KEY', 'youtube_token.json'],
  },
]

function timeAgo(isoString: string): string {
  const now = Date.now()
  const then = new Date(isoString).getTime()
  const diffMs = now - then
  if (diffMs < 0) return 'just now'
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h ago`
}

function parseFailures(detail: string): string[] {
  if (!detail) return []
  // Detail format: "Content pipeline validation failed (N checks): item1, item2"
  const match = detail.match(/:\s*(.+)$/)
  if (match) {
    return match[1].split(',').map(s => s.trim()).filter(Boolean)
  }
  return [detail]
}

function getStageStatus(stage: FlywheelStage, failures: string[]): 'green' | 'yellow' | 'red' {
  const stageFailures = stage.dependencies.filter(dep => failures.includes(dep))
  if (stageFailures.length > 0) return 'red'
  return 'green'
}

export default function FlywheelStatus() {
  const [heartbeat, setHeartbeat] = useState<PipelineHeartbeat | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [, setLastRefresh] = useState<Date>(new Date())

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch(HEALTH_URL, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: HealthData = await res.json()
      const cp = data.heartbeats?.content_pipeline || null
      setHeartbeat(cp)
      setError(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch')
    } finally {
      setLoading(false)
      setLastRefresh(new Date())
    }
  }, [])

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchHealth])

  const failures = heartbeat ? parseFailures(heartbeat.detail) : []
  const pipelineOk = heartbeat?.status === 'ok'
  const pipelineError = heartbeat?.status === 'error'
  const neverRun = !heartbeat

  const stagesWithStatus = PIPELINE_STAGES.map(stage => ({
    ...stage,
    status: neverRun ? 'yellow' as const : getStageStatus(stage, failures),
  }))

  const redCount = stagesWithStatus.filter(s => s.status === 'red').length
  const overallHealth = neverRun ? 'unknown' : pipelineOk ? 'healthy' : redCount > 1 ? 'critical' : 'degraded'

  const getStatusIcon = (status: string, size = 'w-4 h-4') => {
    switch (status) {
      case 'green': return <CheckCircle className={`${size} text-green-500`} />
      case 'yellow': return <AlertCircle className={`${size} text-yellow-500`} />
      case 'red': return <XCircle className={`${size} text-red-500`} />
      default: return <AlertCircle className={`${size} text-gray-500`} />
    }
  }

  const getBadge = () => {
    switch (overallHealth) {
      case 'healthy': return { text: 'Operational', classes: 'text-green-400 bg-green-900/30 border-green-700' }
      case 'degraded': return { text: 'Degraded', classes: 'text-yellow-400 bg-yellow-900/30 border-yellow-700' }
      case 'critical': return { text: 'Critical', classes: 'text-red-400 bg-red-900/30 border-red-700' }
      default: return { text: 'No Data', classes: 'text-gray-400 bg-gray-900/30 border-gray-700' }
    }
  }

  const badge = getBadge()

  if (loading) {
    return (
      <div className="bg-[#0d1117] rounded-lg border border-gray-800 p-6">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-5 h-5 text-gray-500 animate-spin" />
          <span className="text-sm text-gray-500 font-mono">Loading content flywheel...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0d1117] rounded-lg border border-gray-800">
      {/* Header */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-semibold text-white">Content Flywheel</h2>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                Scout &rarr; Gemma &rarr; Quill &rarr; Pixel &rarr; Echo
              </p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-medium border ${badge.classes}`}>
            {badge.text}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Error Banner */}
        {pipelineError && failures.length > 0 && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-red-300">
                  Pipeline validation failed — {failures.length} {failures.length === 1 ? 'check' : 'checks'}
                </p>
                <ul className="mt-1.5 space-y-1">
                  {failures.map((f, i) => (
                    <li key={i} className="text-xs text-red-400/80 font-mono flex items-center space-x-1.5">
                      <XCircle className="w-3 h-3 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {neverRun && (
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-300">
                No content pipeline heartbeat found. Cron may not be deployed or hasn&apos;t run yet.
              </p>
            </div>
          </div>
        )}

        {/* Pipeline Flow */}
        <div className="flex items-center justify-between">
          {stagesWithStatus.map((stage, index) => (
            <div key={stage.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                  stage.status === 'green' ? 'bg-green-900/30 border-green-700' :
                  stage.status === 'red' ? 'bg-red-900/30 border-red-700' :
                  'bg-gray-800 border-gray-700'
                }`}>
                  {getStatusIcon(stage.status, 'w-5 h-5')}
                </div>
                <p className="text-[11px] font-medium text-white mt-1.5">{stage.name}</p>
                <p className="text-[9px] text-gray-500">{stage.schedule}</p>
              </div>
              {index < stagesWithStatus.length - 1 && (
                <div className={`h-0.5 w-6 mx-1 ${
                  stage.status === 'green' && stagesWithStatus[index + 1].status === 'green'
                    ? 'bg-green-800' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Stage Detail Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {stagesWithStatus.map(stage => {
            const stageFailures = stage.dependencies.filter(dep => failures.includes(dep))
            return (
              <div
                key={stage.id}
                className={`rounded border p-3 ${
                  stage.status === 'red' ? 'bg-red-900/10 border-red-900' :
                  stage.status === 'green' ? 'bg-green-900/10 border-green-900/50' :
                  'bg-gray-900/50 border-gray-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5">
                    {getStatusIcon(stage.status, 'w-3.5 h-3.5')}
                    <span className="text-xs font-medium text-white">{stage.name}</span>
                  </div>
                  <span className="text-[9px] text-gray-500 font-mono">{stage.schedule}</span>
                </div>
                <p className="text-[10px] text-gray-400 mb-1">{stage.description}</p>
                {stageFailures.length > 0 && (
                  <div className="mt-1.5 space-y-0.5">
                    {stageFailures.map((f, i) => (
                      <p key={i} className="text-[10px] text-red-400 font-mono">
                        Missing: {f}
                      </p>
                    ))}
                  </div>
                )}
                {stage.status === 'green' && !neverRun && (
                  <p className="text-[10px] text-green-500/70 font-mono mt-1">All deps OK</p>
                )}
              </div>
            )
          })}
        </div>

        {/* Last Check */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
          <div className="text-[10px] text-gray-500 font-mono">
            {heartbeat ? (
              <>Last check: {timeAgo(heartbeat.timestamp)}</>
            ) : (
              <>No heartbeat data</>
            )}
          </div>
          <button
            onClick={fetchHealth}
            className="text-[10px] text-gray-500 hover:text-gray-300 font-mono flex items-center space-x-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Error connecting to endpoint */}
        {error && (
          <p className="text-[10px] text-red-500/60 font-mono">
            Endpoint error: {error}
          </p>
        )}
      </div>
    </div>
  )
}
