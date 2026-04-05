'use client'

import { useState } from 'react'
import {
  ArrowRightLeft, FileJson, Clock, AlertCircle, CheckCircle, Timer,
  ArrowRight, Shield, Code, Search, Cpu, PenTool, Palette, Megaphone,
  Lightbulb, ListTodo, Info, AlertTriangle
} from 'lucide-react'

type Status = 'fresh' | 'stale' | 'missing' | 'pending'

interface HandoffFile {
  name: string
  path: string
  lastUpdated?: string
  status: Status
  description: string
  schedule: string
}

interface HandoffType {
  type: string
  icon: any
  color: string
  description: string
}

// --- Harlan -> Briggs: Morning cron pipeline ---
const harlanToBriggs: HandoffFile[] = [
  {
    name: 'Email Triage',
    path: 'latest.json',
    description: 'ACTION / REVIEW / FYI / INTEL categorization of incoming email',
    schedule: '6:30 AM Daily',
    status: 'pending'
  },
  {
    name: 'Command Center',
    path: 'latest_command_center.json',
    description: 'Google Sheets data — all client tabs, metrics, status',
    schedule: '6:30 AM Daily',
    status: 'pending'
  },
  {
    name: 'Full Briefing',
    path: 'latest_full_briefing.json',
    description: 'System health, webhook status, cron results, infrastructure state',
    schedule: '6:30 AM Daily',
    status: 'pending'
  }
]

// --- Briggs -> Harlan: Session-based handoffs ---
const handoffTypes: HandoffType[] = [
  { type: 'Decision', icon: Lightbulb, color: 'text-yellow-400', description: 'Pricing, strategy, priority changes' },
  { type: 'Task', icon: ListTodo, color: 'text-blue-400', description: 'Something needs building, fixing, deploying' },
  { type: 'Intel', icon: Info, color: 'text-green-400', description: 'Meetings, market signals, partner updates' },
  { type: 'Escalation', icon: AlertTriangle, color: 'text-red-400', description: 'Briggs couldn\'t resolve — Harlan needs to dig in' }
]

// --- Flywheel stage handoffs ---
interface FlywheelStage {
  from: string
  to: string
  fromIcon: any
  toIcon: any
  artifact: string
  format: string
  location: string
  fromColor: string
  toColor: string
}

const flywheelHandoffs: FlywheelStage[] = [
  {
    from: 'Scout', to: 'Gemma',
    fromIcon: Search, toIcon: Cpu,
    artifact: 'Intelligence Brief',
    format: 'JSON',
    location: '.tmp/flywheel/scout_brief_*.json',
    fromColor: 'text-green-400',
    toColor: 'text-amber-400'
  },
  {
    from: 'Gemma', to: 'Quill',
    fromIcon: Cpu, toIcon: PenTool,
    artifact: 'Content Outlines',
    format: 'JSON/MD',
    location: '.tmp/flywheel/gemma_drafts/',
    fromColor: 'text-amber-400',
    toColor: 'text-purple-400'
  },
  {
    from: 'Quill', to: 'Pixel',
    fromIcon: PenTool, toIcon: Palette,
    artifact: 'Draft Content',
    format: 'Markdown',
    location: '.tmp/flywheel/quill_draft_*.md',
    fromColor: 'text-purple-400',
    toColor: 'text-pink-400'
  },
  {
    from: 'Pixel', to: 'Echo',
    fromIcon: Palette, toIcon: Megaphone,
    artifact: 'Visual Assets + Video Derivatives',
    format: 'PNG/MP4 + JSON manifest',
    location: '.tmp/flywheel/pixel_assets_*/',
    fromColor: 'text-pink-400',
    toColor: 'text-cyan-400'
  }
]

function getStatusIcon(status: Status) {
  switch (status) {
    case 'fresh': return <CheckCircle className="w-4 h-4 text-green-400" />
    case 'stale': return <Clock className="w-4 h-4 text-yellow-400" />
    case 'missing': return <AlertCircle className="w-4 h-4 text-red-400" />
    case 'pending': return <Timer className="w-4 h-4 text-blue-400" />
  }
}

function getStatusText(status: Status) {
  switch (status) {
    case 'fresh': return 'Fresh'
    case 'stale': return 'Needs refresh'
    case 'missing': return 'File missing'
    case 'pending': return 'Awaiting first run'
  }
}

function getStatusDotColor(status: Status) {
  switch (status) {
    case 'fresh': return 'bg-green-400'
    case 'stale': return 'bg-yellow-400'
    case 'missing': return 'bg-red-400'
    case 'pending': return 'bg-blue-400'
  }
}

export default function HandoffMonitor({ compact = false }: { compact?: boolean }) {
  const [handoffs] = useState(harlanToBriggs)

  const anyMissing = handoffs.some(h => h.status === 'missing')
  const allPending = handoffs.every(h => h.status === 'pending')

  // ===== COMPACT VIEW (for Dashboard grid) =====
  if (compact) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-xl p-5 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">Handoff Pipeline</h2>
          </div>
          <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
            allPending ? 'bg-blue-900/50 text-blue-300 border border-blue-800' :
            anyMissing ? 'bg-red-900/50 text-red-300 border border-red-800' :
            'bg-green-900/50 text-green-300 border border-green-800'
          }`}>
            {allPending ? 'Awaiting First Run' : anyMissing ? 'Action Required' : 'Operational'}
          </div>
        </div>

        {/* Harlan -> Briggs summary */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs font-medium text-white">Harlan &rarr; Briggs</span>
            <span className="text-[10px] text-gray-500 ml-auto">Daily 6:30 AM</span>
          </div>
          <div className="flex items-center gap-1">
            {handoffs.map((h, i) => (
              <div key={i} className="flex items-center gap-1 flex-1">
                <div className={`w-2 h-2 rounded-full ${getStatusDotColor(h.status)}`} />
                <span className="text-[10px] text-gray-400 truncate">{h.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Briggs -> Harlan summary */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-medium text-white">Briggs &rarr; Harlan</span>
            <span className="text-[10px] text-gray-500 ml-auto">Session-based</span>
          </div>
          <div className="flex items-center gap-1">
            {handoffTypes.map((ht, i) => {
              const Icon = ht.icon
              return (
                <div key={i} className="flex items-center gap-1 flex-1">
                  <Icon className={`w-2.5 h-2.5 ${ht.color}`} />
                  <span className="text-[10px] text-gray-400">{ht.type}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Flywheel summary */}
        <div className="pt-3 border-t border-gray-800">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[10px] text-gray-500">Flywheel:</span>
            <Search className="w-3 h-3 text-green-400" />
            <ArrowRight className="w-2 h-2 text-gray-600" />
            <Cpu className="w-3 h-3 text-amber-400" />
            <ArrowRight className="w-2 h-2 text-gray-600" />
            <PenTool className="w-3 h-3 text-purple-400" />
            <ArrowRight className="w-2 h-2 text-gray-600" />
            <Palette className="w-3 h-3 text-pink-400" />
            <ArrowRight className="w-2 h-2 text-gray-600" />
            <Megaphone className="w-3 h-3 text-cyan-400" />
          </div>
        </div>
      </div>
    )
  }

  // ===== FULL VIEW (for Handoffs tab) =====
  return (
    <div className="space-y-6">
      {/* ===== COMMAND HANDOFFS ===== */}
      <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
            <ArrowRightLeft className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">Command Handoffs</h2>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            allPending ? 'bg-blue-900/50 text-blue-300 border border-blue-800' :
            anyMissing ? 'bg-red-900/50 text-red-300 border border-red-800' :
            'bg-green-900/50 text-green-300 border border-green-800'
          }`}>
            {allPending ? 'Waiting for First Run' : anyMissing ? 'Action Required' : 'Operational'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Harlan -> Briggs */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Code className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-white">Harlan &rarr; Briggs</h3>
              <span className="text-[10px] text-gray-500 ml-auto">.tmp/handoffs/harlan_to_briggs/</span>
            </div>
            <p className="text-[11px] text-gray-500 mb-3">Morning cron pipeline &mdash; automated daily at 6:30 AM PT</p>

            <div className="space-y-2">
              {handoffs.map((handoff, i) => (
                <div key={i} className={`bg-black rounded-lg p-3 border ${
                  handoff.status === 'missing' ? 'border-red-800' :
                  handoff.status === 'pending' ? 'border-blue-800/50' :
                  'border-gray-800'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      {getStatusIcon(handoff.status)}
                      <div>
                        <h4 className="text-sm font-medium text-white">{handoff.name}</h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">{handoff.description}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-gray-500 flex items-center gap-1">
                            <FileJson className="w-3 h-3" />
                            {handoff.path}
                          </span>
                          <span className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {handoff.schedule}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs font-medium ${
                      handoff.status === 'fresh' ? 'text-green-400' :
                      handoff.status === 'stale' ? 'text-yellow-400' :
                      handoff.status === 'pending' ? 'text-blue-400' :
                      'text-red-400'
                    }`}>
                      {getStatusText(handoff.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pipeline dots */}
            <div className="flex items-center space-x-2 mt-3">
              {handoffs.map((h, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-16 h-0.5 bg-gray-700 rounded" />
                  <div className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(h.status)}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Briggs -> Harlan */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Briggs &rarr; Harlan</h3>
              <span className="text-[10px] text-gray-500 ml-auto">.tmp/handoffs/briggs_to_harlan/</span>
            </div>
            <p className="text-[11px] text-gray-500 mb-3">Session-based &mdash; written at end of every substantive Briggs session</p>

            <div className="space-y-2">
              {handoffTypes.map((ht, i) => {
                const Icon = ht.icon
                return (
                  <div key={i} className="bg-black rounded-lg p-3 border border-gray-800 flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${ht.color} flex-shrink-0`} />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white">{ht.type}</h4>
                      <p className="text-[11px] text-gray-400">{ht.description}</p>
                    </div>
                    <span className="text-[10px] text-gray-600 font-mono">JSON</span>
                  </div>
                )
              })}
            </div>

            <div className="mt-3 p-2.5 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <p className="text-[10px] text-gray-400">
                <span className="text-gray-300 font-medium">Script:</span> python3 execution/write_briggs_handoff.py --type [decision|task|intel|escalation]
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">Auto-commits and pushes to git. Harlan sees it on next session start.</p>
            </div>
          </div>
        </div>

        {/* Status messages */}
        {allPending && (
          <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-800">
            <h4 className="text-sm font-medium text-blue-300 flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Waiting for First Cron Run
            </h4>
            <p className="text-[11px] text-blue-400 mt-1">
              Harlan&apos;s morning cron jobs begin at 5:30 AM PT. The pipeline populates automatically during the briefing sequence.
            </p>
          </div>
        )}

        {anyMissing && !allPending && (
          <div className="mt-4 p-3 bg-red-900/20 rounded-lg border border-red-800">
            <h4 className="text-sm font-medium text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Action Required
            </h4>
            <p className="text-[11px] text-red-400 mt-1">
              Some handoff files are missing. Check cron job configuration and run harlan_morning_briefing.py manually if needed.
            </p>
          </div>
        )}
      </div>

      {/* ===== FLYWHEEL HANDOFFS ===== */}
      <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
            <ArrowRight className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Flywheel Handoffs</h2>
          </div>
          <span className="text-[10px] text-gray-500">Content pipeline stage-to-stage artifacts</span>
        </div>

        {/* Pipeline visualization */}
        <div className="space-y-3">
          {flywheelHandoffs.map((stage, i) => {
            const FromIcon = stage.fromIcon
            const ToIcon = stage.toIcon
            return (
              <div key={i} className="bg-black rounded-lg p-4 border border-gray-800 flex items-center gap-4">
                {/* From */}
                <div className="flex items-center gap-2 w-24 flex-shrink-0">
                  <FromIcon className={`w-4 h-4 ${stage.fromColor}`} />
                  <span className={`text-sm font-medium ${stage.fromColor}`}>{stage.from}</span>
                </div>

                {/* Arrow + artifact */}
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 relative">
                    <div className="h-px bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700" />
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
                      <span className="bg-gray-900 px-2 text-[11px] text-gray-300 font-medium">
                        {stage.artifact}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                </div>

                {/* To */}
                <div className="flex items-center gap-2 w-24 flex-shrink-0">
                  <ToIcon className={`w-4 h-4 ${stage.toColor}`} />
                  <span className={`text-sm font-medium ${stage.toColor}`}>{stage.to}</span>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700 font-mono">
                    {stage.format}
                  </span>
                  <span className="text-[10px] text-gray-600 font-mono hidden xl:block">
                    {stage.location}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary bar */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <Search className="w-3.5 h-3.5 text-green-400" />
          <ArrowRight className="w-3 h-3 text-gray-600" />
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <ArrowRight className="w-3 h-3 text-gray-600" />
          <PenTool className="w-3.5 h-3.5 text-purple-400" />
          <ArrowRight className="w-3 h-3 text-gray-600" />
          <Palette className="w-3.5 h-3.5 text-pink-400" />
          <ArrowRight className="w-3 h-3 text-gray-600" />
          <Megaphone className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] text-gray-500 ml-3">All artifacts in .tmp/flywheel/</span>
        </div>
      </div>
    </div>
  )
}
