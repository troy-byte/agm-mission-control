'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, TrendingUp, DollarSign, MapPin, Users, Layers, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react'

// AGM fallback URL (when no specific contact ID)
const AGM_CONTACTS_URL = 'https://app.agmpro.com/v2/location/tNwDUPgJ4GFjCD81OGVA/contacts'

// ── Types ──────────────────────────────────────────────────────────────

interface CostcoLead {
  sfId: string
  agmId: string
  firstName: string
  lastName: string
  phone: string
  email: string
  city: string
  state: string
  costcoStore: string
  turfType: string
  status: string
  createdDate: string
  sfUrl: string
  agmUrl: string
  opportunityStage?: string
  totalPrice?: number
  sqft?: number
  pricePerSqft?: number
  crewNumber?: string
  jobType?: string
  oppSfUrl?: string
}

interface DashboardData {
  generated: string
  summary: {
    totalLeads: number
    sold: number
    soldRate: number
    totalRevenue: number
    avgDealSize: number
    totalSqft: number
    avgPricePerSqft: number
    pipelineValue: number
    cancelledValue: number
    cancelledCount: number
  }
  statusCounts: Record<string, number>
  turfTypeCounts: Record<string, number>
  storePerformance: Record<string, { leads: number; sold: number; revenue: number; sqft: number }>
  shawProductsSold: Record<string, { jobs: number; sqft: number; revenue: number }>
  leads: CostcoLead[]
}

// ── Helpers ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  'Paid in Full': 'bg-green-900/40 text-green-300 border-green-700',
  'Installed': 'bg-green-900/40 text-green-300 border-green-700',
  'Installed - Unpaid': 'bg-orange-900/40 text-orange-300 border-orange-700',
  'Contract Approved': 'bg-emerald-900/40 text-emerald-300 border-emerald-700',
  'Deposit Sent': 'bg-emerald-900/40 text-emerald-300 border-emerald-700',
  'Deposit Received': 'bg-emerald-900/40 text-emerald-300 border-emerald-700',
  'Installation Started': 'bg-cyan-900/40 text-cyan-300 border-cyan-700',
  'Job Scheduled': 'bg-cyan-900/40 text-cyan-300 border-cyan-700',
  'Appointment Ran': 'bg-purple-900/40 text-purple-300 border-purple-700',
  'Proposal Out': 'bg-purple-900/40 text-purple-300 border-purple-700',
  'Appointment Booked': 'bg-blue-900/40 text-blue-300 border-blue-700',
  'Follow Up': 'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  'Being Contacted': 'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  'In Pipeline': 'bg-indigo-900/40 text-indigo-300 border-indigo-700',
  'On Hold': 'bg-orange-900/40 text-orange-300 border-orange-700',
  'New Lead': 'bg-blue-900/40 text-blue-300 border-blue-700',
  'Cancelled': 'bg-red-900/40 text-red-300 border-red-700',
  'No Show': 'bg-red-900/40 text-red-300 border-red-700',
  'Lost': 'bg-red-900/40 text-red-300 border-red-700',
  'Not Interested': 'bg-red-900/40 text-red-300 border-red-700',
}

const STATUS_BAR_COLORS: Record<string, string> = {
  'Paid in Full': 'bg-green-600',
  'Installed': 'bg-green-600',
  'Installed - Unpaid': 'bg-orange-600',
  'Contract Approved': 'bg-emerald-600',
  'Deposit Sent': 'bg-emerald-600',
  'Deposit Received': 'bg-emerald-600',
  'Installation Started': 'bg-cyan-600',
  'Job Scheduled': 'bg-cyan-600',
  'Appointment Ran': 'bg-purple-600',
  'Proposal Out': 'bg-purple-600',
  'Appointment Booked': 'bg-blue-600',
  'Follow Up': 'bg-yellow-600',
  'Being Contacted': 'bg-yellow-600',
  'In Pipeline': 'bg-indigo-600',
  'On Hold': 'bg-orange-500',
  'New Lead': 'bg-blue-500',
  'Cancelled': 'bg-red-600',
  'No Show': 'bg-red-600',
  'Lost': 'bg-red-500',
  'Not Interested': 'bg-red-500',
}

const STAGE_COLORS: Record<string, string> = {
  'Completed - Paid': 'text-green-400',
  'Sales Closed Won - Approved': 'text-emerald-400',
  'Job Scheduled': 'text-cyan-400',
  'Complete - Unpaid': 'text-orange-400',
}

function MetricCard({ label, value, sub, color = 'text-white' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-black rounded-lg p-4 border border-gray-800">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

function StoreRow({ store, leads }: { store: string; leads: CostcoLead[] }) {
  const [expanded, setExpanded] = useState(false)
  const converted = leads.filter(l => l.status === 'Converted').length
  const revenue = leads.reduce((sum, l) => sum + (l.totalPrice || 0), 0)

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between px-4 py-3 bg-black hover:bg-gray-900/50 transition-colors">
        <div className="flex items-center space-x-3">
          {expanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
          <MapPin className="w-4 h-4 text-red-400" />
          <span className="font-medium text-white">{store}</span>
          <span className="text-xs text-gray-500">{leads.length} leads</span>
        </div>
        <div className="flex items-center space-x-6 text-sm">
          <span className="text-green-400">{converted} won</span>
          <span className="text-white font-semibold">${revenue.toLocaleString()}</span>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-gray-800">
          {leads.map(lead => <LeadRow key={lead.sfId} lead={lead} />)}
        </div>
      )}
    </div>
  )
}

function LeadRow({ lead }: { lead: CostcoLead }) {
  const agmHref = lead.agmUrl || AGM_CONTACTS_URL
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-gray-950 hover:bg-gray-900/60 transition-colors border-b border-gray-800/50 last:border-b-0">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-white text-sm">{lead.firstName} {lead.lastName}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded border ${STATUS_COLORS[lead.status] || 'bg-gray-900/40 text-gray-300 border-gray-700'}`}>{lead.status}</span>
          </div>
          <div className="flex items-center space-x-3 mt-0.5">
            <span className="text-xs text-gray-500">{lead.city}</span>
            <span className="text-xs text-gray-600">|</span>
            <span className="text-xs text-gray-500">{lead.phone}</span>
            <span className="text-xs text-gray-600">|</span>
            <span className="text-xs text-cyan-500">{lead.turfType}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4 text-sm">
        {lead.opportunityStage && (
          <span className={`text-xs ${STAGE_COLORS[lead.opportunityStage] || 'text-gray-400'}`}>{lead.opportunityStage}</span>
        )}
        {lead.totalPrice ? <span className="text-white font-medium">${lead.totalPrice.toLocaleString()}</span> : null}
        {lead.sqft ? <span className="text-gray-400 text-xs">{lead.sqft.toLocaleString()} sqft</span> : null}
      </div>
      <div className="flex items-center space-x-2 ml-4">
        {lead.sfUrl && (
          <a href={lead.sfUrl} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 rounded bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 transition-colors flex items-center space-x-1" title="Salesforce">
            <span>SF</span><ExternalLink className="w-3 h-3" />
          </a>
        )}
        <a href={agmHref} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 rounded bg-green-900/30 text-green-400 hover:bg-green-900/50 transition-colors flex items-center space-x-1" title="AGM">
          <span>AGM</span><ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────

export default function CostcoDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [turfFilter, setTurfFilter] = useState('all')
  const [view, setView] = useState<'store' | 'list'>('store')

  useEffect(() => {
    fetch('costco-data.json?' + Date.now())
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  if (loading) return <div className="text-center text-gray-500 py-20">Loading Costco data from Salesforce...</div>
  if (error) return <div className="text-center text-red-400 py-20">Failed to load: {error}</div>
  if (!data) return null

  const { summary: s, statusCounts, turfTypeCounts, storePerformance } = data

  const filtered = data.leads.filter(l => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false
    if (turfFilter !== 'all' && l.turfType !== turfFilter) return false
    return true
  })

  const byStore = filtered.reduce((acc, l) => {
    const store = l.costcoStore || 'Unknown'
    if (!acc[store]) acc[store] = []
    acc[store].push(l)
    return acc
  }, {} as Record<string, CostcoLead[]>)

  const allStatuses = Object.keys(statusCounts).sort()
  const allTurfTypes = Object.keys(turfTypeCounts).sort()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ShoppingCart className="w-6 h-6 text-red-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">Costco</h2>
            <p className="text-xs text-gray-500">Shaw / Costco Lead Pipeline &mdash; Heavenly Greens &mdash; {s.totalLeads} leads</p>
          </div>
        </div>
        <span className="text-xs text-gray-600">Updated: {new Date(data.generated).toLocaleString()}</span>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <MetricCard label="Total Leads" value={s.totalLeads} />
        <MetricCard label="Sold" value={s.sold} color="text-green-400" />
        <MetricCard label="Close Rate" value={`${s.soldRate}%`} color="text-cyan-400" />
        <MetricCard label="Revenue" value={`$${s.totalRevenue.toLocaleString()}`} color="text-emerald-400" />
        <MetricCard label="Avg Deal" value={`$${s.avgDealSize.toLocaleString()}`} />
        <MetricCard label="Total Sqft" value={s.totalSqft.toLocaleString()} />
        <MetricCard label="Avg $/sqft" value={`$${s.avgPricePerSqft.toFixed(2)}`} color="text-cyan-400" />
        <MetricCard label="Pipeline" value={`$${s.pipelineValue.toLocaleString()}`} color="text-yellow-400" sub="open opps" />
      </div>

      {/* Status + Turf */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Lead Status</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).map(([status, count]) => {
              const pct = s.totalLeads > 0 ? (count / s.totalLeads) * 100 : 0
              return (
                <div key={status} className="flex items-center space-x-3">
                  <span className="text-xs text-gray-400 w-32">{status}</span>
                  <div className="flex-1 bg-gray-800 rounded-full h-5 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${STATUS_BAR_COLORS[status] || 'bg-gray-600'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-white font-medium w-8 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
          <div className="flex items-center space-x-2 mb-4">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Shaw Turf Products Sold</h3>
            <span className="text-xs text-gray-500 ml-auto">{Object.values(data.shawProductsSold).reduce((a, v) => a + v.sqft, 0).toLocaleString()} sqft total</span>
          </div>
          <div className="space-y-3">
            {Object.entries(data.shawProductsSold).sort((a, b) => b[1].sqft - a[1].sqft).map(([product, v]) => {
              const maxSqft = Math.max(...Object.values(data.shawProductsSold).map(p => p.sqft))
              const pct = maxSqft > 0 ? (v.sqft / maxSqft) * 100 : 0
              return (
                <div key={product}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white font-medium">{product}</span>
                    <div className="flex items-center space-x-4 text-xs">
                      <span className="text-gray-400">{v.jobs} jobs</span>
                      <span className="text-cyan-400">{v.sqft.toLocaleString()} sqft</span>
                      <span className="text-emerald-400">${v.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-full h-3 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <label className="text-xs text-gray-500">Status:</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-black border border-gray-700 rounded px-2 py-1 text-sm text-white">
            <option value="all">All ({s.totalLeads})</option>
            {allStatuses.map(st => <option key={st} value={st}>{st} ({statusCounts[st]})</option>)}
          </select>
          <label className="text-xs text-gray-500 ml-4">Turf Type:</label>
          <select value={turfFilter} onChange={e => setTurfFilter(e.target.value)} className="bg-black border border-gray-700 rounded px-2 py-1 text-sm text-white">
            <option value="all">All</option>
            {allTurfTypes.map(t => <option key={t} value={t}>{t} ({turfTypeCounts[t]})</option>)}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">{filtered.length} of {s.totalLeads} leads</span>
          <button onClick={() => setView('store')} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${view === 'store' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>By Store</button>
          <button onClick={() => setView('list')} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>All Leads</button>
        </div>
      </div>

      {/* Leads */}
      <div className="space-y-2">
        {view === 'store' ? (
          Object.entries(byStore).sort((a, b) => b[1].length - a[1].length).map(([store, leads]) => (
            <StoreRow key={store} store={store} leads={leads} />
          ))
        ) : (
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 text-xs text-gray-500 font-medium">
              <span className="flex-1">Lead</span>
              <span className="w-24 text-center">Store</span>
              <span className="w-28 text-center">Turf Type</span>
              <span className="w-32 text-center">Stage</span>
              <span className="w-20 text-right">Amount</span>
              <span className="w-28 text-right">Links</span>
            </div>
            {filtered.map(lead => (
              <div key={lead.sfId} className="flex items-center justify-between px-4 py-2.5 bg-black hover:bg-gray-900/60 transition-colors border-t border-gray-800/50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-white text-sm">{lead.firstName} {lead.lastName}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${STATUS_COLORS[lead.status] || 'bg-gray-900/40 text-gray-300 border-gray-700'}`}>{lead.status}</span>
                  </div>
                  <span className="text-xs text-gray-500">{lead.city} &middot; {lead.createdDate}</span>
                </div>
                <span className="w-24 text-center text-xs text-gray-400">{lead.costcoStore || '--'}</span>
                <span className="w-28 text-center text-xs text-cyan-400">{lead.turfType}</span>
                <span className={`w-32 text-center text-xs ${lead.opportunityStage ? (STAGE_COLORS[lead.opportunityStage] || 'text-gray-400') : 'text-gray-600'}`}>
                  {lead.opportunityStage || '--'}
                </span>
                <span className="w-20 text-right text-sm text-white font-medium">
                  {lead.totalPrice ? `$${lead.totalPrice.toLocaleString()}` : '--'}
                </span>
                <div className="w-28 flex items-center justify-end space-x-2">
                  {lead.sfUrl && (
                    <a href={lead.sfUrl} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 rounded bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 transition-colors flex items-center space-x-1">
                      <span>SF</span><ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <a href={lead.agmUrl || AGM_CONTACTS_URL} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 rounded bg-green-900/30 text-green-400 hover:bg-green-900/50 transition-colors flex items-center space-x-1">
                    <span>AGM</span><ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Store Performance */}
      <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-4 h-4 text-yellow-400" />
          <h3 className="text-sm font-semibold text-white">Store Performance</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(storePerformance).sort((a, b) => b[1].revenue - a[1].revenue).map(([store, st]) => {
            const rate = st.leads > 0 ? Math.round((st.sold / st.leads) * 100) : 0
            return (
              <div key={store} className="bg-black rounded-lg p-3 border border-gray-800">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-3 h-3 text-red-400" />
                  <span className="text-sm font-medium text-white">{store}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-lg font-bold text-white">{st.leads}</p><p className="text-[10px] text-gray-500">leads</p></div>
                  <div><p className="text-lg font-bold text-green-400">{rate}%</p><p className="text-[10px] text-gray-500">close</p></div>
                  <div><p className="text-lg font-bold text-emerald-400">${(st.revenue / 1000).toFixed(0)}k</p><p className="text-[10px] text-gray-500">rev</p></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-semibold text-white">Financial Summary</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center"><p className="text-2xl font-bold text-emerald-400">${s.totalRevenue.toLocaleString()}</p><p className="text-xs text-gray-500">Total Revenue</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-yellow-400">${s.pipelineValue.toLocaleString()}</p><p className="text-xs text-gray-500">Open Pipeline</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-white">${s.avgDealSize.toLocaleString()}</p><p className="text-xs text-gray-500">Avg Deal Size</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-cyan-400">${s.avgPricePerSqft.toFixed(2)}</p><p className="text-xs text-gray-500">Avg $/sqft</p></div>
        </div>
      </div>
    </div>
  )
}
