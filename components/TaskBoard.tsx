'use client'

import { useState } from 'react'
import { Clock, CheckCircle, Circle, AlertTriangle, Users, Zap, FileText, Settings, Target } from 'lucide-react'

interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'blocked' | 'done'
  priority: 'critical' | 'high' | 'medium' | 'low'
  assignee: string
  category: 'infrastructure' | 'content' | 'integration' | 'sales' | 'operations'
  dueDate?: string
}

const realTasks: Task[] = [
  // Infrastructure
  {
    id: 'infra-1',
    title: 'Install crontab on Home Mac',
    description: 'Morning briefing cron (5:30 AM) never fires — crontab not installed. Mac Mini crontab file exists but was never applied.',
    status: 'todo',
    priority: 'critical',
    assignee: 'Harlan',
    category: 'infrastructure',
  },
  {
    id: 'infra-2',
    title: 'Set up cron heartbeat monitor',
    description: 'Verify cron jobs are running. Write timestamp file each run, alert via Telegram if stale > 2hrs.',
    status: 'todo',
    priority: 'high',
    assignee: 'Harlan',
    category: 'infrastructure',
  },
  {
    id: 'infra-3',
    title: 'Track .tmp/handoffs/ in git',
    description: 'Handoff files are gitignored — they don\'t sync across machines. Carve out handoffs/ from .gitignore.',
    status: 'todo',
    priority: 'high',
    assignee: 'Harlan',
    category: 'infrastructure',
  },
  {
    id: 'infra-4',
    title: 'Fix Mac Mini SSH config (DHCP)',
    description: 'SSH config now uses mDNS hostname instead of static IP. Verified working.',
    status: 'done',
    priority: 'high',
    assignee: 'Harlan',
    category: 'infrastructure',
  },
  {
    id: 'infra-5',
    title: 'Deploy Mission Control dashboard',
    description: 'Next.js dashboard on GitHub Pages with auto-deploy workflow. Live at troy-byte.github.io/agm-mission-control.',
    status: 'done',
    priority: 'high',
    assignee: 'Harlan',
    category: 'infrastructure',
  },

  // Content
  {
    id: 'content-1',
    title: 'AGM Friday — Episode 1',
    description: 'First episode through full pipeline: topic → script → thumbnail → film → edit → publish. Target: Friday 3/21.',
    status: 'todo',
    priority: 'critical',
    assignee: 'Troy + Quill',
    category: 'content',
    dueDate: '2026-03-21',
  },
  {
    id: 'content-2',
    title: 'Flywheel Operating Blueprint',
    description: 'Weekly content workflow, newsletter growth strategy, LinkedIn amplification, conversion paths.',
    status: 'todo',
    priority: 'high',
    assignee: 'Briggs',
    category: 'content',
  },
  {
    id: 'content-3',
    title: 'Texas Turf case study',
    description: 'Write founding partner case study for content pipeline and sales conversations.',
    status: 'todo',
    priority: 'medium',
    assignee: 'Quill',
    category: 'content',
  },

  // Integrations
  {
    id: 'int-1',
    title: 'Valleywide Pest — sync engine',
    description: 'Field Routes → AGM sync. APIs connected, data audit done. 49% phone-only handling required.',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Harlan',
    category: 'integration',
  },
  {
    id: 'int-2',
    title: 'Sunburst — BuildingConnected scoping',
    description: 'Contact: Noelle. API research done, webhooks confirmed. Scope the integration and pricing.',
    status: 'todo',
    priority: 'medium',
    assignee: 'Troy',
    category: 'integration',
  },
  {
    id: 'int-3',
    title: 'Oasis Turf — Arc Site + AI SEO',
    description: 'AI SEO ($1,297/mo) onboarding + Arc Site integration candidate.',
    status: 'todo',
    priority: 'medium',
    assignee: 'Troy + Andrew',
    category: 'integration',
  },

  // Sales / Operations
  {
    id: 'sales-1',
    title: 'Confirm HG & ATE AGM payments',
    description: 'Verify Heavenly Greens and Artificial Turf Express are paying for AGM platform subscriptions.',
    status: 'todo',
    priority: 'critical',
    assignee: 'Troy',
    category: 'sales',
  },
  {
    id: 'ops-1',
    title: 'Deploy Scout signal pipeline',
    description: 'Cron-powered social scanner: Facebook groups, X/Twitter, Reddit. Writes qualified signals to handoff files.',
    status: 'todo',
    priority: 'medium',
    assignee: 'Harlan',
    category: 'operations',
  },
  {
    id: 'ops-2',
    title: 'Dashboard deployment directive',
    description: 'Formalize Briggs → Harlan dashboard deploy loop (Option B: Briggs edits locally, Harlan pushes).',
    status: 'todo',
    priority: 'low',
    assignee: 'Harlan',
    category: 'operations',
  },
]

const columns = [
  { id: 'todo', title: 'To Do', icon: Circle, color: 'text-gray-400' },
  { id: 'in_progress', title: 'In Progress', icon: Clock, color: 'text-blue-400' },
  { id: 'blocked', title: 'Blocked', icon: AlertTriangle, color: 'text-red-400' },
  { id: 'done', title: 'Done', icon: CheckCircle, color: 'text-green-400' },
]

const categoryConfig: Record<string, { icon: typeof Zap; label: string; color: string }> = {
  infrastructure: { icon: Settings, label: 'Infra', color: 'bg-purple-900 text-purple-300' },
  content: { icon: FileText, label: 'Content', color: 'bg-blue-900 text-blue-300' },
  integration: { icon: Zap, label: 'Integration', color: 'bg-yellow-900 text-yellow-300' },
  sales: { icon: Target, label: 'Sales', color: 'bg-green-900 text-green-300' },
  operations: { icon: Settings, label: 'Ops', color: 'bg-orange-900 text-orange-300' },
}

export default function TaskBoard() {
  const [tasks] = useState<Task[]>(realTasks)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const filteredTasks = filterCategory === 'all'
    ? tasks
    : tasks.filter(t => t.category === filterCategory)

  const getTasksByStatus = (status: string) =>
    filteredTasks.filter(task => task.status === status)

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-900 text-red-300 border-red-700'
      case 'high': return 'bg-orange-900 text-orange-300 border-orange-700'
      case 'medium': return 'bg-yellow-900 text-yellow-300 border-yellow-700'
      case 'low': return 'bg-gray-800 text-gray-400 border-gray-700'
      default: return 'bg-gray-800 text-gray-400 border-gray-700'
    }
  }

  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null
    const due = new Date(dueDate)
    const now = new Date()
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  const totalTodo = getTasksByStatus('todo').length
  const totalInProgress = getTasksByStatus('in_progress').length
  const totalBlocked = getTasksByStatus('blocked').length
  const totalDone = getTasksByStatus('done').length

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl border border-gray-800">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">Task Board</h2>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <span className="text-gray-400">{totalTodo} todo</span>
            <span className="text-blue-400">{totalInProgress} active</span>
            {totalBlocked > 0 && <span className="text-red-400">{totalBlocked} blocked</span>}
            <span className="text-green-400">{totalDone} done</span>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              filterCategory === 'all' ? 'bg-indigo-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All ({tasks.length})
          </button>
          {Object.entries(categoryConfig).map(([key, config]) => {
            const count = tasks.filter(t => t.category === key).length
            if (count === 0) return null
            return (
              <button
                key={key}
                onClick={() => setFilterCategory(key)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  filterCategory === key ? 'bg-indigo-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {config.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {columns.map(column => {
            const columnTasks = getTasksByStatus(column.id)
            const ColumnIcon = column.icon
            return (
              <div key={column.id}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <ColumnIcon className={`w-4 h-4 ${column.color}`} />
                    <h3 className="font-medium text-white text-sm">{column.title}</h3>
                  </div>
                  <span className="text-xs text-gray-500">{columnTasks.length}</span>
                </div>

                <div className="space-y-3 min-h-[200px]">
                  {columnTasks.map(task => {
                    const cat = categoryConfig[task.category]
                    const daysLeft = getDaysUntilDue(task.dueDate)
                    return (
                      <div
                        key={task.id}
                        className="bg-black rounded-lg p-3 border border-gray-800 hover:border-gray-700 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${cat.color}`}>
                            {cat.label}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityBadge(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>

                        <h4 className="text-sm font-medium text-white mb-1">{task.title}</h4>

                        {task.description && (
                          <p className="text-xs text-gray-400 mb-2 line-clamp-2">{task.description}</p>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{task.assignee}</span>
                          {daysLeft !== null && (
                            <span className={`flex items-center ${
                              daysLeft < 0 ? 'text-red-400' :
                              daysLeft <= 2 ? 'text-yellow-400' :
                              'text-gray-500'
                            }`}>
                              <Clock className="w-3 h-3 mr-1" />
                              {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` :
                               daysLeft === 0 ? 'Due today' :
                               `${daysLeft}d left`}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {columnTasks.length === 0 && (
                    <div className="text-center text-xs text-gray-600 py-8">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
