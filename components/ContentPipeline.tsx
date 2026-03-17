'use client'

import { useState } from 'react'
import { ArrowRight, Lightbulb, Edit, Image, Film, CheckCircle2, Zap, Clock } from 'lucide-react'

interface ContentItem {
  id: string
  title: string
  platform: 'youtube' | 'shorts' | 'twitter' | 'linkedin' | 'newsletter' | 'tiktok' | 'blog'
  stage: 'ideas' | 'scripting' | 'thumbnail' | 'filming' | 'editing' | 'published'
  assignee?: string
  dueDate?: string
  notes?: string
}

const contentItems: ContentItem[] = [
  {
    id: '1',
    title: 'AGM Friday — Episode 1',
    platform: 'youtube',
    stage: 'ideas',
    assignee: 'Troy + Quill',
    dueDate: '2026-03-21',
    notes: 'First episode through the full pipeline. Need topic, script, thumbnail, film, edit, publish by Friday.'
  },
  {
    id: '2',
    title: 'Episode 1 — LinkedIn summary post',
    platform: 'linkedin',
    stage: 'ideas',
    assignee: 'Echo',
    dueDate: '2026-03-21',
    notes: 'Atomized from AGM Friday Ep 1. Executive tone, first-person Troy voice, 150-300 words.'
  },
  {
    id: '3',
    title: 'Episode 1 — Short clip #1',
    platform: 'shorts',
    stage: 'ideas',
    assignee: 'Pixel',
    dueDate: '2026-03-22',
    notes: 'Best 30-60 second clip from Ep 1. Vertical, captions burned in.'
  },
  {
    id: '4',
    title: 'AGM Intelligence Report — April',
    platform: 'newsletter',
    stage: 'ideas',
    assignee: 'Quill',
    notes: 'Monthly newsletter. ~280 subs, 97% non-customers. Sections: Intelligence, Platform, Automation, AI SEO, Tip.'
  },
  {
    id: '5',
    title: 'Why contractors lose $6K/mo on quote follow-up',
    platform: 'blog',
    stage: 'ideas',
    assignee: 'Quill',
    notes: 'SEO article for ArtificialGrassMarketing.com. Drives to AGMProTools.com.'
  },
  {
    id: '6',
    title: 'LinkedIn thought leadership — weekly post',
    platform: 'linkedin',
    stage: 'ideas',
    assignee: 'Echo',
    dueDate: '2026-03-18',
    notes: 'Tuesday publish. Industry insight, 1-2 key takeaways, CTA to newsletter or video.'
  },
]

const stages = [
  { id: 'ideas', label: 'Ideas', icon: Lightbulb, color: 'text-purple-400' },
  { id: 'scripting', label: 'Scripting', icon: Edit, color: 'text-blue-400' },
  { id: 'thumbnail', label: 'Thumbnail', icon: Image, color: 'text-green-400' },
  { id: 'filming', label: 'Filming', icon: Film, color: 'text-yellow-400' },
  { id: 'editing', label: 'Editing', icon: Film, color: 'text-orange-400' },
  { id: 'published', label: 'Published', icon: CheckCircle2, color: 'text-gray-400' },
]

const platforms: Record<string, { label: string; color: string }> = {
  youtube: { label: 'YouTube', color: 'bg-red-900 text-red-300' },
  shorts: { label: 'Shorts', color: 'bg-pink-900 text-pink-300' },
  twitter: { label: 'X/Twitter', color: 'bg-blue-900 text-blue-300' },
  linkedin: { label: 'LinkedIn', color: 'bg-indigo-900 text-indigo-300' },
  newsletter: { label: 'Newsletter', color: 'bg-green-900 text-green-300' },
  tiktok: { label: 'TikTok', color: 'bg-purple-900 text-purple-300' },
  blog: { label: 'Blog', color: 'bg-gray-700 text-gray-300' },
}

interface ContentPipelineProps {
  compact?: boolean
}

export default function ContentPipeline({ compact = false }: ContentPipelineProps) {
  const [content] = useState<ContentItem[]>(contentItems)

  const getContentByStage = (stage: string) =>
    content.filter(item => item.stage === stage)

  const getDaysLeft = (dueDate?: string) => {
    if (!dueDate) return null
    const due = new Date(dueDate)
    const now = new Date()
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (compact) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-xl border border-gray-800">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Content Pipeline</h2>
            </div>
            <span className="text-sm text-gray-400">
              {content.filter(c => c.stage !== 'published').length} in progress
            </span>
          </div>

          {/* Mini pipeline visualization */}
          <div className="flex items-center justify-between mb-4">
            {stages.slice(0, -1).map((stage, index) => {
              const count = getContentByStage(stage.id).length
              const Icon = stage.icon
              return (
                <div key={stage.id} className="flex items-center">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      count > 0 ? 'bg-indigo-900 text-indigo-300' : 'bg-gray-800 text-gray-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {count > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 text-white text-xs rounded-full flex items-center justify-center">
                        {count}
                      </span>
                    )}
                  </div>
                  {index < stages.length - 2 && (
                    <ArrowRight className="w-4 h-4 mx-2 text-gray-600" />
                  )}
                </div>
              )
            })}
          </div>

          <div className="space-y-2">
            {content.filter(c => c.stage !== 'published').slice(0, 4).map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-black rounded border border-gray-800">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${platforms[item.platform].color}`}>
                    {platforms[item.platform].label}
                  </span>
                  <p className="text-sm font-medium text-white truncate max-w-[200px]">
                    {item.title}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {stages.find(s => s.id === item.stage)?.label}
                </span>
              </div>
            ))}
            {content.filter(c => c.stage !== 'published').length > 4 && (
              <p className="text-xs text-gray-500 text-center">
                +{content.filter(c => c.stage !== 'published').length - 4} more items
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl border border-gray-800">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Zap className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">Content Pipeline</h2>
          </div>
          <span className="text-sm text-gray-400">
            {content.filter(c => c.stage !== 'published').length} items in progress
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Pipeline stages */}
        <div className="grid grid-cols-6 gap-4">
          {stages.map((stage) => {
            const Icon = stage.icon
            const stageContent = getContentByStage(stage.id)

            return (
              <div key={stage.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-5 h-5 ${stage.color}`} />
                    <h3 className="font-medium text-white text-sm">
                      {stage.label}
                    </h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    {stageContent.length}
                  </span>
                </div>

                <div className="space-y-2 min-h-[300px]">
                  {stageContent.map(item => {
                    const daysLeft = getDaysLeft(item.dueDate)
                    return (
                      <div
                        key={item.id}
                        className="p-3 bg-black rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
                      >
                        <div className="mb-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${platforms[item.platform].color}`}>
                            {platforms[item.platform].label}
                          </span>
                        </div>

                        <h4 className="text-sm font-medium text-white mb-1">
                          {item.title}
                        </h4>

                        {item.assignee && (
                          <p className="text-xs text-gray-400 mb-1">
                            {item.assignee}
                          </p>
                        )}

                        {daysLeft !== null && (
                          <p className={`text-xs flex items-center mb-1 ${
                            daysLeft < 0 ? 'text-red-400' :
                            daysLeft <= 2 ? 'text-yellow-400' :
                            'text-gray-500'
                          }`}>
                            <Clock className="w-3 h-3 mr-1" />
                            {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` :
                             daysLeft === 0 ? 'Due today' :
                             `${daysLeft}d left`}
                          </p>
                        )}

                        {item.notes && (
                          <p className="text-xs text-gray-500 mt-2 italic line-clamp-2">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    )
                  })}
                  {stageContent.length === 0 && (
                    <div className="text-center text-xs text-gray-700 py-8 border border-dashed border-gray-800 rounded-lg">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Weekly Publishing Calendar */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <h3 className="font-medium text-white mb-4">Weekly Publishing Cadence</h3>
          <div className="grid grid-cols-7 gap-2">
            {[
              { day: 'Mon', content: 'Week preview', platform: 'Telegram', owner: 'Briggs' },
              { day: 'Tue', content: 'Thought leadership', platform: 'LinkedIn', owner: 'Echo' },
              { day: 'Wed', content: 'AUA / Industry insight', platform: 'LinkedIn + X', owner: 'Echo' },
              { day: 'Thu', content: 'Newsletter teaser', platform: 'X + LinkedIn', owner: 'Echo' },
              { day: 'Fri', content: 'AGM Friday episode', platform: 'YouTube', owner: 'Full pipeline' },
              { day: 'Sat', content: 'Short clip #1', platform: 'YT + IG + TikTok', owner: 'Pixel' },
              { day: 'Sun', content: 'Carousel / blog', platform: 'LinkedIn + Blog', owner: 'Echo + Quill' },
            ].map((day) => (
              <div key={day.day} className="bg-black rounded-lg p-2 border border-gray-800 text-center">
                <p className="text-xs font-medium text-indigo-400">{day.day}</p>
                <p className="text-xs text-white mt-1">{day.content}</p>
                <p className="text-xs text-gray-500 mt-1">{day.platform}</p>
                <p className="text-xs text-gray-600">{day.owner}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Atomization Model */}
        <div className="mt-6 p-4 bg-indigo-900/20 rounded-lg border border-indigo-800">
          <h4 className="text-sm font-medium text-indigo-300 mb-2">Content Atomization (1 → 8+)</h4>
          <p className="text-xs text-gray-400">
            Each AGM Friday episode generates: YouTube long-form → 3-5 Shorts → LinkedIn post → LinkedIn carousel → Instagram Reels → TikTok → Newsletter teaser → Blog post. Briggs orchestrates, agents execute, Troy approves.
          </p>
        </div>
      </div>
    </div>
  )
}
