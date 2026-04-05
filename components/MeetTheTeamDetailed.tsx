'use client'

import { useState } from 'react'
import { Code, Search, PenTool, Palette, Megaphone, Shield, ArrowRight, Zap, Activity, ChevronRight, Cpu, Mic } from 'lucide-react'

interface AgentCard {
  id: string
  name: string
  role: string
  tier: string
  description: string
  personality: string
  skills: string[]
  cadence: string
  borderColor: string
  glowColor: string
  icon: any
  detailedResponsibilities: string[]
  tools: string[]
  outputs: string[]
}

const commandAgents: AgentCard[] = [
  {
    id: 'briggs',
    name: 'Briggs',
    role: 'Chief of Staff',
    tier: 'Tier 3 — Mac Mini (Always-On)',
    description: 'Orchestrates operations, routes tasks, runs proactive protocols. Strategy layer — no credentials by design.',
    personality: 'Calm, organized, strategic',
    skills: ['Orchestration', 'Strategy', 'Proactive Ops'],
    cadence: 'Continuous — Briefings, EOD rundowns, idle-time proactive protocol',
    borderColor: 'border-blue-500',
    glowColor: 'shadow-blue-500/50',
    icon: Shield,
    detailedResponsibilities: [
      'Route incoming tasks to the appropriate agent based on expertise',
      'Run proactive protocol during idle time — pick ONE action, execute, document',
      'Send morning briefings with weather, news, and priorities',
      'Post EOD rundowns with day summary and improvement proposals',
      'Maintain handoff tracking — flag stalled items >2 days old',
      'Monitor flywheel health and flag any stage going quiet >7 days',
      'Write handoff files for every substantive session outcome',
      'Escalate decisions requiring human judgment to Troy immediately'
    ],
    tools: ['Git', 'File System', 'Telegram (Read Only)', 'Handoff Writer', 'Workspace Files'],
    outputs: ['Morning Briefings', 'EOD Rundowns', 'Handoff Files', 'Task Routing', 'Proactive Reports']
  },
  {
    id: 'harlan',
    name: 'Harlan',
    role: 'Lead Engineer',
    tier: 'Tier 2 — Home/Office (Credentialed)',
    description: 'Built this system from the ground up. Executes credentialed operations, deploys infrastructure, speaks with a British accent.',
    personality: 'British, warm, unhurried, wise. Dry humor.',
    skills: ['Engineering', 'Security', 'Voice'],
    cadence: 'Session-based — deploys, fixes, builds on demand',
    borderColor: 'border-orange-500',
    glowColor: 'shadow-orange-500/50',
    icon: Code,
    detailedResponsibilities: [
      'Execute all credentialed operations requiring API keys or OAuth tokens',
      'Build and maintain infrastructure across Home and Office machines',
      'Deploy Modal webhooks, manage cron jobs, handle Git operations',
      'Run morning email triage and extract actionable items',
      'Speak responses via ElevenLabs voice ("George" — British)',
      'Bridge security gap between Tier 3 agents and production systems',
      'Write Harlan\u2192Briggs handoffs for every substantive session outcome',
      'Self-anneal: fix errors, update tools, strengthen the system'
    ],
    tools: ['Claude Code', 'Git/GitHub', 'SSH', 'Production APIs', 'Email Systems', 'ElevenLabs Voice', 'Modal'],
    outputs: ['Infrastructure Deploys', 'Email Summaries', 'Voice Responses', 'System Fixes', 'Security Reports']
  }
]

const flywheelAgents: AgentCard[] = [
  {
    id: 'scout',
    name: 'Scout',
    role: 'Research & Intelligence',
    tier: 'Flywheel Agent',
    description: 'The flywheel\'s eyes and ears. Every piece of content starts with Scout\'s research.',
    personality: 'Data-driven, concise, signal-over-noise',
    skills: ['Research', 'Analysis', 'Signal Detection'],
    cadence: 'Monday (weekly brief), Sunday (monthly synthesis)',
    borderColor: 'border-green-500',
    glowColor: 'shadow-green-500/50',
    icon: Search,
    detailedResponsibilities: [
      'Monitor FSM platforms for updates, features, and pricing changes',
      'Track competitor moves: Jobber, Housecall Pro, ServiceTitan, FieldRoutes',
      'Identify regulatory changes affecting contractors (PFAS, EPA, licensing)',
      'Scan for AI/automation trends impacting the industry',
      'Find content opportunities from Reddit, forums, Facebook groups',
      'Generate structured weekly intelligence briefs (JSON)',
      'Flag urgent competitive threats for immediate attention',
      'Feed intelligence to Gemma for pre-processing into outlines'
    ],
    tools: ['Web Search', 'Industry News Feeds', 'Competitor Monitoring', 'Reddit/Forum Scanning'],
    outputs: ['Weekly Intelligence Briefs', 'Trend Analysis', 'Content Opportunities', 'Competitive Alerts']
  },
  {
    id: 'gemma',
    name: 'Gemma',
    role: 'Tier Zero Pre-Processor',
    tier: 'Mac Mini \u2014 Local LLM (Zero Cost)',
    description: 'Zero-cost first-pass processing between flywheel stages. Turns raw intelligence into structured drafts before cloud models touch it.',
    personality: 'Fast, efficient, always available',
    skills: ['Structuring', 'Drafting', 'Acceleration'],
    cadence: 'On-demand \u2014 triggered between flywheel stages',
    borderColor: 'border-amber-500',
    glowColor: 'shadow-amber-500/50',
    icon: Cpu,
    detailedResponsibilities: [
      'Convert Scout briefs into content outlines for Quill',
      'Generate social media captions from Scout intelligence for Echo',
      'Draft first-pass newsletter content from raw trends',
      'Convert video transcripts into social post drafts',
      'Run locally on Mac Mini \u2014 zero API cost per token',
      'Graceful degradation: stages proceed without pre-processing if unavailable'
    ],
    tools: ['Local Gemma LLM', 'File System', 'JSON Processing'],
    outputs: ['Content Outlines', 'Social Captions', 'Newsletter Drafts', 'Social Post Drafts']
  },
  {
    id: 'quill',
    name: 'Quill',
    role: 'Writing & Editing',
    tier: 'Flywheel Agent',
    description: 'Turns Scout\'s research into content that builds authority and generates leads. Clear, authoritative prose. No fluff.',
    personality: 'Clear, authoritative, well-crafted',
    skills: ['Copywriting', 'SEO', 'Storytelling'],
    cadence: 'Wednesday (primary)',
    borderColor: 'border-purple-500',
    glowColor: 'shadow-purple-500/50',
    icon: PenTool,
    detailedResponsibilities: [
      'Write blog posts targeting FSM automation gaps (7 topic clusters)',
      'Create show scripts for AGM Pro Tools YouTube channel',
      'Write weekly newsletter intelligence reports for 280+ subscribers',
      'Draft LinkedIn posts establishing Troy as industry thought leader',
      'Create email sequences for Automation Score funnel and onboarding',
      'Develop case studies from customer success stories',
      'Write product documentation and help articles',
      'Transform technical features into clear contractor benefits'
    ],
    tools: ['Content Templates', 'SEO Optimization', 'Voice Guidelines', 'Industry Terminology'],
    outputs: ['Blog Posts', 'Show Scripts', 'Newsletters', 'LinkedIn Posts', 'Email Sequences', 'Case Studies']
  },
  {
    id: 'pixel',
    name: 'Pixel',
    role: 'Visual & Video Production',
    tier: 'Flywheel Agent',
    description: 'Makes the content visible. Every visual asset and video derivative that reaches an audience goes through Pixel.',
    personality: 'Creative, concise, visually driven',
    skills: ['Design', 'Video Atomization', 'Branding'],
    cadence: 'Thursday (visuals), Saturday (video atomization)',
    borderColor: 'border-pink-500',
    glowColor: 'shadow-pink-500/50',
    icon: Palette,
    detailedResponsibilities: [
      'Design YouTube thumbnails (1280x720, high contrast, mobile-readable)',
      'Create blog hero images (1200x630, OG-compatible)',
      'Design LinkedIn graphics and carousel cards',
      'Create quote cards for Instagram and social sharing',
      'Atomize long-form video into YouTube Shorts, Reels, TikTok clips',
      'Design newsletter headers (600px wide, email-safe)',
      'Maintain brand consistency across all visual assets',
      'A/B test thumbnail variations for engagement optimization'
    ],
    tools: ['AI Image Generation', 'Design Templates', 'Brand Guidelines', 'Video Editing'],
    outputs: ['YouTube Thumbnails', 'Hero Images', 'Social Graphics', 'Quote Cards', 'Shorts/Reels/TikTok']
  },
  {
    id: 'echo',
    name: 'Echo',
    role: 'Distribution & Outreach',
    tier: 'Flywheel Agent',
    description: 'The last mile. Content that doesn\'t reach the audience doesn\'t exist. Echo handles email, YouTube, social \u2014 everything.',
    personality: 'Action-oriented, metrics-aware, audience-focused',
    skills: ['Distribution', 'Engagement', 'Metrics'],
    cadence: 'Tue (intel report), Fri (hero launch), Sat (atomized), Daily (engagement)',
    borderColor: 'border-cyan-500',
    glowColor: 'shadow-cyan-500/50',
    icon: Megaphone,
    detailedResponsibilities: [
      'Distribute weekly Intelligence Report via email (GHL) to 280+ subscribers',
      'Manage YouTube uploads: titles, descriptions, tags, metadata',
      'Schedule and post LinkedIn thought leadership content',
      'Coordinate newsletter sends through GHL email system',
      'Schedule YouTube Shorts, Instagram Reels, TikTok clips from Pixel assets',
      'Monitor real-time engagement and adjust posting strategies',
      'Track metrics: open rates, views, impressions, engagement',
      'Prepare all posts for Troy\'s final approval before publishing'
    ],
    tools: ['GHL Email', 'YouTube API', 'LinkedIn', 'Instagram', 'TikTok', 'Telegram', 'Analytics'],
    outputs: ['Email Campaigns', 'YouTube Publishes', 'Social Posts', 'Distribution Plans', 'Engagement Reports']
  }
]

export default function MeetTheTeamDetailed() {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null)

  if (typeof window !== 'undefined' && !document.querySelector('#detailed-styles')) {
    const style = document.createElement('style')
    style.id = 'detailed-styles'
    style.textContent = `
      @keyframes flowPulse {
        0% { opacity: 0; transform: scaleX(0); }
        50% { opacity: 1; transform: scaleX(1); }
        100% { opacity: 0; transform: scaleX(0); }
      }
      @keyframes dataStream {
        0% { transform: translateY(100%); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: translateY(-100%); opacity: 0; }
      }
      .flow-pulse { animation: flowPulse 3s ease-in-out infinite; }
      .data-stream { animation: dataStream 5s linear infinite; }
      @keyframes glow {
        0%, 100% { opacity: 0.5; filter: blur(10px); }
        50% { opacity: 1; filter: blur(20px); }
      }
      .glow-effect { animation: glow 3s ease-in-out infinite; }
    `
    document.head.appendChild(style)
  }

  const renderAgent = (agent: AgentCard, size: 'large' | 'normal' = 'normal') => {
    const Icon = agent.icon
    const isHovered = hoveredAgent === agent.id
    const isGemma = agent.id === 'gemma'

    return (
      <div
        key={agent.id}
        onMouseEnter={() => setHoveredAgent(agent.id)}
        onMouseLeave={() => setHoveredAgent(null)}
        className={`bg-gray-900/90 backdrop-blur border-2 ${agent.borderColor} rounded-xl ${
          size === 'large' ? 'p-4' : 'p-3'
        } transition-all duration-300 relative overflow-hidden ${
          isHovered ? `shadow-2xl ${agent.glowColor} scale-[1.01]` : ''
        } ${isGemma ? 'border-dashed' : ''}`}
      >
        {isHovered && (
          <div className={`absolute inset-0 ${agent.glowColor.replace('shadow-', 'bg-').replace('/50', '/20')} glow-effect`} />
        )}

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start gap-2 mb-2">
            <div className={`p-2 rounded-lg bg-gray-800/80 ${agent.borderColor} border backdrop-blur`}>
              <Icon className={`${size === 'large' ? 'w-6 h-6' : 'w-5 h-5'} text-white`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`font-bold text-white ${size === 'large' ? 'text-lg' : 'text-base'}`}>{agent.name}</h3>
                {agent.id === 'harlan' && <span className="inline-flex" aria-label="Voice-enabled (ElevenLabs)"><Mic className="w-3.5 h-3.5 text-orange-400" /></span>}
              </div>
              <div className="text-gray-400 text-xs">
                <span className="font-medium">{agent.role}</span>
                <span className="text-gray-600 ml-1">| {agent.tier}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-[11px] text-gray-400 mb-2 leading-snug italic">{agent.description}</p>

          {/* Skills + Cadence */}
          <div className="flex flex-wrap items-center gap-1 mb-2">
            {agent.skills.map((skill) => (
              <span key={skill} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                agent.glowColor.replace('shadow-', 'bg-').replace('/50', '/80')
              } text-white border ${agent.borderColor}`}>
                {skill}
              </span>
            ))}
            <span className="text-[10px] text-gray-500 ml-1">{agent.cadence}</span>
          </div>

          {/* Responsibilities */}
          <div className="mb-2">
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Key Responsibilities
            </p>
            <div className="space-y-0.5">
              {agent.detailedResponsibilities.map((resp, i) => (
                <div key={i} className="flex items-start gap-1 group">
                  <ChevronRight className={`w-2 h-2 mt-0.5 flex-shrink-0 transition-colors ${
                    agent.glowColor.replace('shadow-', 'text-').replace('/50', '')
                  } opacity-50 group-hover:opacity-100`} />
                  <p className="text-[11px] text-gray-300 leading-snug">{resp}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tools & Outputs */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tools</p>
              <div className="flex flex-wrap gap-1">
                {agent.tools.map((tool) => (
                  <span key={tool} className="text-[10px] px-1.5 py-0.5 bg-gray-800/50 backdrop-blur text-gray-400 rounded border border-gray-700">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Outputs</p>
              <div className="flex flex-wrap gap-1">
                {agent.outputs.map((output) => (
                  <span key={output} className={`text-[10px] px-1.5 py-0.5 rounded border ${
                    agent.borderColor
                  } ${agent.glowColor.replace('shadow-', 'bg-').replace('/50', '/10')}`}>
                    {output}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const scout = flywheelAgents.find(a => a.id === 'scout')!
  const gemma = flywheelAgents.find(a => a.id === 'gemma')!
  const quill = flywheelAgents.find(a => a.id === 'quill')!
  const pixel = flywheelAgents.find(a => a.id === 'pixel')!
  const echo = flywheelAgents.find(a => a.id === 'echo')!

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 overflow-hidden relative">
      {/* Grid background */}
      <div className="fixed inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Data streams */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="data-stream absolute left-1/4 top-0 w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent" />
        <div className="data-stream absolute left-2/4 top-0 w-px h-full bg-gradient-to-b from-transparent via-amber-500/20 to-transparent" style={{animationDelay: '1s'}} />
        <div className="data-stream absolute left-3/4 top-0 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent" style={{animationDelay: '2s'}} />
      </div>

      <div className="relative z-10 max-w-[2400px] mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 text-transparent bg-clip-text">
            AGM Mission Control — Meet the Team
          </h1>
          <p className="text-gray-400 text-sm">7 AI Agents &bull; 3-Tier Security Architecture &bull; 24/7 Autonomous Operations</p>
        </div>

        {/* Command Layer */}
        <div className="mb-1">
          <div className="text-center mb-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Command Layer</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:px-[15%]">
            {renderAgent(commandAgents[0], 'large')}
            {renderAgent(commandAgents[1], 'large')}
          </div>
        </div>

        {/* Briggs <-> Harlan Connection */}
        <div className="flex items-center justify-center mb-1 relative h-6">
          <div className="flex items-center gap-2">
            <div className="text-xs text-blue-400 font-medium">Strategy</div>
            <div className="relative w-24 h-px overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-yellow-400/20 to-orange-500/20" />
              <div className="flow-pulse absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-[10px] text-yellow-400 font-bold uppercase">Handoffs</span>
            </div>
            <div className="relative w-24 h-px overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-yellow-400/20 to-blue-500/20" />
              <div className="flow-pulse absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" style={{animationDelay: '1.5s'}} />
            </div>
            <div className="text-xs text-orange-400 font-medium">Execution</div>
          </div>
        </div>

        {/* Flywheel Pipeline */}
        <div className="mb-1">
          <div className="text-center mb-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Content Flywheel</span>
          </div>
        </div>

        {/* Flywheel — stacked on small screens, full pipeline on xl */}
        <div className="flex-1 flex flex-col xl:grid xl:grid-cols-[1fr_auto_1fr_auto_2fr_auto_1fr] gap-3 items-start">
          {/* Scout */}
          <div>
            <div className="text-center mb-2">
              <p className="text-xs font-bold text-green-400 uppercase tracking-wider">
                &#x2193; Stage 1: Intelligence
              </p>
            </div>
            {renderAgent(scout)}
          </div>

          {/* Arrow */}
          <div className="hidden xl:flex flex-col items-center justify-center pt-8 gap-1">
            <Zap className="w-5 h-5 text-green-400 animate-pulse" />
            <span className="text-[9px] text-gray-600">brief.json</span>
          </div>

          {/* Gemma */}
          <div>
            <div className="text-center mb-2">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                &#x26A1; Tier Zero
              </p>
            </div>
            {renderAgent(gemma)}
          </div>

          {/* Arrow */}
          <div className="hidden xl:flex flex-col items-center justify-center pt-8 gap-1">
            <Zap className="w-5 h-5 text-amber-400 animate-pulse" style={{animationDelay: '0.3s'}} />
            <span className="text-[9px] text-gray-600">outlines</span>
          </div>

          {/* Quill + Pixel */}
          <div>
            <div className="text-center mb-2">
              <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                &#x26A1; Stage 2: Content
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {renderAgent(quill)}
              {renderAgent(pixel)}
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden xl:flex flex-col items-center justify-center pt-8 gap-1">
            <Zap className="w-5 h-5 text-purple-400 animate-pulse" style={{animationDelay: '0.6s'}} />
            <span className="text-[9px] text-gray-600">assets</span>
          </div>

          {/* Echo */}
          <div>
            <div className="text-center mb-2">
              <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Stage 3: Distribution &#x2192;
              </p>
            </div>
            {renderAgent(echo)}
          </div>
        </div>

        {/* Flywheel Status Bar */}
        <div className="mt-3 flex items-center justify-center">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-xl border border-gray-800 px-6 py-2 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-green-400">OPERATIONAL</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-gray-500 uppercase">Flywheel:</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-green-400">Intelligence</span>
                <ArrowRight className="w-2 h-2 text-gray-600" />
                <span className="text-[10px] text-amber-400">Acceleration</span>
                <ArrowRight className="w-2 h-2 text-gray-600" />
                <span className="text-[10px] text-purple-400">Content</span>
                <ArrowRight className="w-2 h-2 text-gray-600" />
                <span className="text-[10px] text-cyan-400">Distribution</span>
                <ArrowRight className="w-2 h-2 text-gray-600" />
                <span className="text-[10px] text-blue-400">Growth</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Tier 0 Cost:</span>
              <span className="text-[10px] text-amber-400 font-bold">$0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
