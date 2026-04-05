'use client'

import { useState, useEffect } from 'react'
import { Brain, Search, PenTool, Image, Megaphone, Crown, Activity, Circle, Cpu } from 'lucide-react'

interface Agent {
  id: string
  name: string
  role: string
  status: 'active' | 'idle' | 'offline' | 'pending'
  model: {
    provider: string
    name: string
    icon?: string
  }
  lastActivity: string
  currentTask?: string
  metrics: {
    tasksCompleted: number
    avgResponseTime: number
    successRate: number
  }
  flywheelStage: string
}

export default function AgentStatusMonitor() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'briggs',
      name: 'Briggs',
      role: 'Chief of Staff',
      status: 'active',
      model: {
        provider: 'Anthropic',
        name: 'Claude Opus 4.6'
      },
      lastActivity: new Date().toISOString(),
      currentTask: 'Morning briefings, task routing, handoff tracking, EOD rundowns, proactive execution',
      metrics: {
        tasksCompleted: 0,
        avgResponseTime: 0,
        successRate: 0
      },
      flywheelStage: 'Orchestration (All Stages)'
    },
    {
      id: 'harlan',
      name: 'Harlan',
      role: 'Lead Engineer',
      status: 'active',
      model: {
        provider: 'Anthropic',
        name: 'Claude Code (Opus 4.6)'
      },
      lastActivity: new Date().toISOString(),
      currentTask: 'Infrastructure, integrations, credentialed ops, Modal deploys, security hardening',
      metrics: {
        tasksCompleted: 0,
        avgResponseTime: 0,
        successRate: 0
      },
      flywheelStage: 'Infrastructure (Meta)'
    },
    {
      id: 'gemma',
      name: 'Gemma',
      role: 'Tier Zero Pre-Processor',
      status: 'active',
      model: {
        provider: 'Google',
        name: 'Gemma 3n E4B (Local)'
      },
      lastActivity: new Date().toISOString(),
      currentTask: 'Zero-cost inference — content first-pass, code review, bulk text processing, API fallback',
      metrics: {
        tasksCompleted: 0,
        avgResponseTime: 0,
        successRate: 0
      },
      flywheelStage: 'Tier Zero (Local)'
    },
    {
      id: 'scout',
      name: 'Scout',
      role: 'Research & Intelligence',
      status: 'idle',
      model: {
        provider: 'Perplexity',
        name: 'Sonar Large'
      },
      lastActivity: new Date(Date.now() - 86400000).toISOString(),
      currentTask: 'Industry intelligence — Facebook, X, Reddit contractor pain signals, trend reports',
      metrics: {
        tasksCompleted: 0,
        avgResponseTime: 0,
        successRate: 0
      },
      flywheelStage: 'Intelligence'
    },
    {
      id: 'quill',
      name: 'Quill',
      role: 'Writing & Editing',
      status: 'idle',
      model: {
        provider: 'Google',
        name: 'Gemini 2.5 Pro'
      },
      lastActivity: new Date(Date.now() - 86400000).toISOString(),
      currentTask: 'Scripts, newsletter copy, blog posts, franchise decks',
      metrics: {
        tasksCompleted: 0,
        avgResponseTime: 0,
        successRate: 0
      },
      flywheelStage: 'Content'
    },
    {
      id: 'pixel',
      name: 'Pixel',
      role: 'Visual & Video Production',
      status: 'idle',
      model: {
        provider: 'OpenAI',
        name: 'GPT-4o'
      },
      lastActivity: new Date(Date.now() - 86400000).toISOString(),
      currentTask: 'YouTube thumbnails, social graphics, video atomization (Shorts/Reels/TikTok)',
      metrics: {
        tasksCompleted: 0,
        avgResponseTime: 0,
        successRate: 0
      },
      flywheelStage: 'Content (Visual)'
    },
    {
      id: 'echo',
      name: 'Echo',
      role: 'Distribution & Outreach',
      status: 'idle',
      model: {
        provider: 'OpenAI',
        name: 'ChatGPT'
      },
      lastActivity: new Date(Date.now() - 86400000).toISOString(),
      currentTask: 'Email (GHL), YouTube, LinkedIn, newsletter, Instagram, TikTok distribution',
      metrics: {
        tasksCompleted: 0,
        avgResponseTime: 0,
        successRate: 0
      },
      flywheelStage: 'Distribution'
    }
  ])

  const getAgentIcon = (id: string) => {
    switch (id) {
      case 'briggs': return <Crown className="w-6 h-6 text-purple-400" />
      case 'scout': return <Search className="w-6 h-6 text-blue-400" />
      case 'quill': return <PenTool className="w-6 h-6 text-green-400" />
      case 'pixel': return <Image className="w-6 h-6 text-pink-400" />
      case 'echo': return <Megaphone className="w-6 h-6 text-orange-400" />
      case 'harlan': return <Brain className="w-6 h-6 text-indigo-400" />
      case 'gemma': return <Cpu className="w-6 h-6 text-cyan-400" />
      default: return <Activity className="w-6 h-6 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'idle': return 'text-yellow-400'
      case 'offline': return 'text-gray-500'
      case 'pending': return 'text-gray-600'
      default: return 'text-gray-500'
    }
  }

  const getHeartbeatAnimation = (status: string) => {
    switch (status) {
      case 'active': return 'animate-heartbeat'
      case 'idle': return 'animate-heartbeat-slow'
      default: return ''
    }
  }

  const getModelColor = (provider: string) => {
    switch (provider) {
      case 'Anthropic': return 'bg-purple-900 text-purple-300'
      case 'Perplexity': return 'bg-blue-900 text-blue-300'
      case 'Google': return 'bg-green-900 text-green-300'
      case 'OpenAI': return 'bg-orange-900 text-orange-300'
      default: return 'bg-gray-800 text-gray-400'
    }
  }

  const formatLastActivity = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Active now'
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return `${Math.floor(minutes / 1440)}d ago`
  }

  const activeCount = agents.filter(a => a.status === 'active').length
  const totalAgents = agents.length

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">Agent Status Monitor</h2>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">
            {activeCount}/{totalAgents} Active
          </span>
          <div className="flex space-x-1">
            <Circle className="w-3 h-3 text-green-400 fill-current" />
            <Circle className="w-3 h-3 text-yellow-400 fill-current" />
            <Circle className="w-3 h-3 text-gray-600 fill-current" />
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {agents.map(agent => (
          <div 
            key={agent.id} 
            className={`bg-black rounded-lg p-5 border transition-all relative overflow-hidden ${
              agent.status === 'active' ? 'border-green-500/30' : 'border-gray-800'
            }`}
          >

            <div className="flex items-start justify-between mb-4 relative">
              <div className="flex items-center space-x-3">
                <div className={agent.status === 'active' ? 'animate-heartbeat' : agent.status === 'idle' ? 'animate-heartbeat-slow' : ''}>
                  {getAgentIcon(agent.id)}
                </div>
                <div>
                  <h3 className="font-medium text-white">{agent.name}</h3>
                  <p className="text-sm text-gray-400 whitespace-nowrap">{agent.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Circle className={`w-3 h-3 fill-current ${getStatusColor(agent.status)} ${getHeartbeatAnimation(agent.status)}`} />
                  {(agent.status === 'active' || agent.status === 'idle') && (
                    <Circle className={`absolute inset-0 w-3 h-3 ${getStatusColor(agent.status)} opacity-40 ${getHeartbeatAnimation(agent.status)}`} style={{ animationDelay: '0.5s' }} />
                  )}
                </div>
                <span className="text-xs text-gray-500 capitalize">{agent.status}</span>
              </div>
            </div>

            {/* Model Badge */}
            <div className="mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getModelColor(agent.model.provider)}`}>
                {agent.model.provider} • {agent.model.name}
              </span>
            </div>

            {/* Current Task */}
            {agent.currentTask && (
              <div className="mb-3 p-2 bg-gray-800 rounded">
                <p className="text-xs text-gray-400">Current Task</p>
                <p className="text-sm text-white">{agent.currentTask}</p>
              </div>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-500">Tasks</p>
                <p className="text-sm font-medium text-white">{agent.metrics.tasksCompleted}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Avg Time</p>
                <p className="text-sm font-medium text-white">{agent.metrics.avgResponseTime}s</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Success</p>
                <p className="text-sm font-medium text-white">{agent.metrics.successRate}%</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-800">
              <span className="text-xs text-gray-500">{formatLastActivity(agent.lastActivity)}</span>
              <span className="text-xs text-gray-400">{agent.flywheelStage}</span>
            </div>
          </div>
        ))}
      </div>

      {/* System Overview */}
      <div className="mt-6 p-4 bg-black rounded-lg border border-gray-800">
        <h4 className="text-sm font-medium text-white mb-3">Multi-Model Architecture</h4>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="text-center">
            <p className="text-xs text-gray-500">Anthropic</p>
            <p className="text-lg font-semibold text-purple-400">2</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Google</p>
            <p className="text-lg font-semibold text-green-400">2</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">OpenAI</p>
            <p className="text-lg font-semibold text-orange-400">2</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Perplexity</p>
            <p className="text-lg font-semibold text-blue-400">1</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Local (Mac Mini)</p>
            <p className="text-lg font-semibold text-cyan-400">1</p>
          </div>
        </div>
      </div>
    </div>
  )
}