'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Home, Users, GitBranch, ArrowRightLeft, FileText, Activity, Calendar as CalendarIcon, Zap, Heart, ShoppingCart, ExternalLink } from 'lucide-react'
import ErrorBoundary from '@/components/ErrorBoundary'

// Dynamically import components to avoid SSR issues
const TaskBoard = dynamic(() => import('@/components/TaskBoard'), { ssr: false })
const Calendar = dynamic(() => import('@/components/Calendar'), { ssr: false })
const ContentPipeline = dynamic(() => import('@/components/ContentPipeline'), { ssr: false })
const FlywheelStatus = dynamic(() => import('@/components/FlywheelStatus'), { ssr: false })
const MeetTheTeamDetailed = dynamic(() => import('@/components/MeetTheTeamDetailed'), { ssr: false })
const ClientsDashboard = dynamic(() => import('@/components/ClientsDashboard'), { ssr: false })
const IntegrationMonitor = dynamic(() => import('@/components/IntegrationMonitor'), { ssr: false })
const HandoffMonitor = dynamic(() => import('@/components/HandoffMonitor'), { ssr: false })
const AgentStatusMonitor = dynamic(() => import('@/components/AgentStatusMonitor'), { ssr: false })
const PublishingPipeline = dynamic(() => import('@/components/PublishingPipeline'), { ssr: false })
const SystemHealth = dynamic(() => import('@/components/SystemHealth'), { ssr: false })
const CostcoDashboard = dynamic(() => import('@/components/CostcoDashboard'), { ssr: false })
const HGCalendar = dynamic(() => import('@/components/HGCalendar'), { ssr: false })

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'integrations', label: 'Integrations', icon: GitBranch },
  { id: 'health', label: 'System Health', icon: Heart },
  { id: 'agents', label: 'Agents', icon: Users },
  { id: 'handoffs', label: 'Handoffs', icon: ArrowRightLeft },
  { id: 'publishing', label: 'Publishing', icon: FileText },
  { id: 'tasks', label: 'Task Board', icon: Activity },
  { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
  { id: 'pipeline', label: 'Content Pipeline', icon: Zap },
  { id: 'costco', label: 'Costco', icon: ShoppingCart },
  { id: 'hg-calendar', label: 'HG Calendar', icon: CalendarIcon },
]

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Client Operations — external, client-facing health */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-mono mb-3">Client Operations</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ClientsDashboard />
                <IntegrationMonitor />
              </div>
            </div>

            {/* Content Pipeline — flywheel health + content tracker */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-mono mb-3">Content Pipeline</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FlywheelStatus />
                <ContentPipeline compact />
              </div>
            </div>

            {/* Internal Processes — agents, handoffs, ops */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-mono mb-3">Internal Processes</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AgentStatusMonitor />
                <HandoffMonitor />
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gray-900 rounded-lg shadow-xl p-5 border border-gray-800">
              <h3 className="text-xs uppercase tracking-widest text-gray-500 font-mono mb-3">Quick Links</h3>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="https://troy-byte.github.io/master-project-list/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-gray-800 rounded p-3 hover:border-gray-600 transition-colors group"
                >
                  <p className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">AGM Master List</p>
                  <p className="text-xs text-gray-500 mt-0.5">Project tracking &amp; to-do list</p>
                </a>
                <a
                  href="https://troy-byte.github.io/hg-projects/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-gray-800 rounded p-3 hover:border-gray-600 transition-colors group"
                >
                  <p className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">HG &amp; ATE Master List</p>
                  <p className="text-xs text-gray-500 mt-0.5">Heavenly Greens &amp; ATE projects</p>
                </a>
              </div>
            </div>
          </div>
        )
      case 'clients':
        return <ClientsDashboard />
      case 'integrations':
        return <IntegrationMonitor />
      case 'health':
        return <SystemHealth />
      case 'agents':
        return (
          <div className="space-y-6">
            <AgentStatusMonitor />
            <MeetTheTeamDetailed />
          </div>
        )
      case 'handoffs':
        return <HandoffMonitor />
      case 'publishing':
        return <PublishingPipeline />
      case 'tasks':
        return <TaskBoard />
      case 'calendar':
        return <Calendar />
      case 'pipeline':
        return <ContentPipeline />
      case 'costco':
        return <CostcoDashboard />
      case 'hg-calendar':
        return <HGCalendar />
      default:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Coming Soon
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                This section is under construction
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Left Sidebar */}
      <aside className="w-60 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col fixed h-full z-50">
        {/* Logo / Title */}
        <div className="px-5 py-5 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">AGM Mission Control</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Autonomous Marketing Platform</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center px-5 py-2.5 text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-500'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                  }
                `}
              >
                <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                {tab.label}
              </button>
            )
          })}
        </nav>

        {/* Client Dashboards */}
        <div className="px-5 py-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-mono mb-1 mt-1">Client Dashboards</p>
          <a
            href="https://troy-byte.github.io/realturf-triage/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-0 py-1.5 text-sm font-medium text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-3 flex-shrink-0" />
            Real Turf
          </a>
          <a
            href="https://troy-byte.github.io/oasis-dashboard/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-0 py-1.5 text-sm font-medium text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-3 flex-shrink-0" />
            Oasis Turf
          </a>
          <a
            href="https://troy-byte.github.io/agm-franchise-demo/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-0 py-1.5 text-sm font-medium text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-3 flex-shrink-0" />
            AGM Franchise Demo
          </a>
          <a
            href="https://troy-byte.github.io/agm-jobber-dashboard/dashboard.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-0 py-1.5 text-sm font-medium text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-3 flex-shrink-0" />
            Texas Turf — Jobber
          </a>
        </div>

        {/* True North Link */}
        <div className="px-5 py-2 border-t border-gray-200 dark:border-gray-700">
          <a
            href="true-north.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-0 py-2 text-sm font-medium text-amber-500 hover:text-amber-400 transition-colors"
          >
            <Zap className="w-4 h-4 mr-3 flex-shrink-0" />
            True North
          </a>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400">
          <div>{new Date().toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</div>
          <div className="mt-1 text-gray-500">AGM Pro Tools &copy; 2026</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-60 p-8">
        <ErrorBoundary>
          {renderContent()}
        </ErrorBoundary>
      </main>
    </div>
  )
}
