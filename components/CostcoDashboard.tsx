'use client'

import { useState } from 'react'
import { ShoppingCart, TrendingUp, DollarSign, MapPin, Users, Layers, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react'

// SF instance base URL
const SF_BASE = 'https://d37000000pbiqeac.my.salesforce.com/lightning/r'
const AGM_BASE = 'https://app.agmpro.com/v2/location'
const AGM_LOCATION = 'tNwDUPgJ4GFjCD81OGVA'

// ── Types ──────────────────────────────────────────────────────────────

interface CostcoLead {
  id: string
  sfId: string
  agmId: string
  firstName: string
  lastName: string
  phone: string
  email: string
  city: string
  costcoStore: string
  turfType: string
  status: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Closed Lost'
  createdDate: string
  opportunityStage?: string
  totalPrice?: number
  sqft?: number
  crewNumber?: string
}

// ── Mock Data (mirrors actual SF fields) ───────────────────────────────

const LEADS: CostcoLead[] = [
  { id: '1', sfId: '00QRb000008aXYZ', agmId: 'agm_001', firstName: 'Maria', lastName: 'Gonzalez', phone: '(925) 555-0142', email: 'maria.g@email.com', city: 'Pleasanton', costcoStore: 'Pleasanton', turfType: 'Artificial Grass', status: 'Converted', createdDate: '2026-03-01', opportunityStage: 'Completed - Paid', totalPrice: 12450, sqft: 820, crewNumber: 'Crew 2' },
  { id: '2', sfId: '00QRb000008bXYZ', agmId: 'agm_002', firstName: 'James', lastName: 'Park', phone: '(510) 555-0198', email: 'jpark@email.com', city: 'Fremont', costcoStore: 'Fremont', turfType: 'Pet Turf', status: 'Converted', createdDate: '2026-03-03', opportunityStage: 'Job Scheduled', totalPrice: 8900, sqft: 540, crewNumber: 'Crew 1' },
  { id: '3', sfId: '00QRb000008cXYZ', agmId: 'agm_003', firstName: 'Linda', lastName: 'Chen', phone: '(408) 555-0276', email: 'lchen@email.com', city: 'San Jose', costcoStore: 'San Jose', turfType: 'Putting Green', status: 'Qualified', createdDate: '2026-03-05', opportunityStage: 'Sales Closed Won - Approved', totalPrice: 18200, sqft: 1100 },
  { id: '4', sfId: '00QRb000008dXYZ', agmId: 'agm_004', firstName: 'Robert', lastName: 'Smith', phone: '(707) 555-0331', email: 'rsmith@email.com', city: 'Vallejo', costcoStore: 'Vallejo', turfType: 'Artificial Grass', status: 'Contacted', createdDate: '2026-03-08' },
  { id: '5', sfId: '00QRb000008eXYZ', agmId: 'agm_005', firstName: 'Sarah', lastName: 'Johnson', phone: '(925) 555-0419', email: 'sjohnson@email.com', city: 'Concord', costcoStore: 'Concord', turfType: 'Artificial Grass', status: 'Converted', createdDate: '2026-03-10', opportunityStage: 'Completed - Paid', totalPrice: 14800, sqft: 960, crewNumber: 'Crew 3' },
  { id: '6', sfId: '00QRb000008fXYZ', agmId: 'agm_006', firstName: 'David', lastName: 'Kim', phone: '(650) 555-0587', email: 'dkim@email.com', city: 'Redwood City', costcoStore: 'Redwood City', turfType: 'Pet Turf', status: 'New', createdDate: '2026-03-12' },
  { id: '7', sfId: '00QRb000008gXYZ', agmId: 'agm_007', firstName: 'Patricia', lastName: 'Rivera', phone: '(510) 555-0644', email: 'privera@email.com', city: 'Oakland', costcoStore: 'Oakland', turfType: 'Artificial Grass', status: 'Converted', createdDate: '2026-03-14', opportunityStage: 'Complete - Unpaid', totalPrice: 11200, sqft: 700 },
  { id: '8', sfId: '00QRb000008hXYZ', agmId: 'agm_008', firstName: 'Michael', lastName: 'Thompson', phone: '(408) 555-0712', email: 'mthompson@email.com', city: 'Santa Clara', costcoStore: 'San Jose', turfType: 'Playground Turf', status: 'Qualified', createdDate: '2026-03-16', opportunityStage: 'Sales Closed Won - Approved', totalPrice: 22500, sqft: 1450 },
  { id: '9', sfId: '00QRb000008iXYZ', agmId: 'agm_009', firstName: 'Jennifer', lastName: 'Lee', phone: '(925) 555-0893', email: 'jlee@email.com', city: 'Dublin', costcoStore: 'Pleasanton', turfType: 'Putting Green', status: 'Contacted', createdDate: '2026-03-18' },
  { id: '10', sfId: '00QRb000008jXYZ', agmId: 'agm_010', firstName: 'William', lastName: 'Brown', phone: '(707) 555-0951', email: 'wbrown@email.com', city: 'Napa', costcoStore: 'Vallejo', turfType: 'Artificial Grass', status: 'Closed Lost', createdDate: '2026-03-20' },
  { id: '11', sfId: '00QRb000008kXYZ', agmId: 'agm_011', firstName: 'Emily', lastName: 'Davis', phone: '(510) 555-1024', email: 'edavis@email.com', city: 'Berkeley', costcoStore: 'Oakland', turfType: 'Artificial Grass', status: 'New', createdDate: '2026-03-22' },
  { id: '12', sfId: '00QRb000008lXYZ', agmId: 'agm_012', firstName: 'Thomas', lastName: 'Wilson', phone: '(650) 555-1138', email: 'twilson@email.com', city: 'Palo Alto', costcoStore: 'Redwood City', turfType: 'Pet Turf', status: 'Contacted', createdDate: '2026-03-24' },
]

// ── Helpers ─────────────────────────────────────────────────────────────

const statusColor: Record<string, string> = {
  'New': 'bg-blue-900/40 text-blue-300 border-blue-700',
  'Contacted': 'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  'Qualified': 'bg-purple-900/40 text-purple-300 border-purple-700',
  'Converted': 'bg-green-900/40 text-green-300 border-green-700',
  'Closed Lost': 'bg-red-900/40 text-red-300 border-red-700',
}

const stageColor: Record<string, string> = {
  'Completed - Paid': 'text-green-400',
  'Sales Closed Won - Approved': 'text-emerald-400',
  'Job Scheduled': 'text-cyan-400',
  'Complete - Unpaid': 'text-orange-400',
}

function sfLeadUrl(sfId: string) {
  return `${SF_BASE}/Lead/${sfId}/view`
}

function agmUrl(agmId: string) {
  // Mock IDs (agm_001 etc.) won't resolve — link to contacts list for prototype
  // Production: real AGM contact IDs from SQLite tracker will link to /contacts/detail/{id}
  if (agmId.startsWith('agm_')) {
    return `${AGM_BASE}/${AGM_LOCATION}/contacts`
  }
  return `${AGM_BASE}/${AGM_LOCATION}/contacts/detail/${agmId}`
}

// ── Metric Card ─────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, color = 'text-white' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-black rounded-lg p-4 border border-gray-800">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

// ── Store Row (expandable) ──────────────────────────────────────────────

function StoreRow({ store, leads }: { store: string; leads: CostcoLead[] }) {
  const [expanded, setExpanded] = useState(false)
  const converted = leads.filter(l => l.status === 'Converted').length
  const revenue = leads.reduce((sum, l) => sum + (l.totalPrice || 0), 0)
  const sqft = leads.reduce((sum, l) => sum + (l.sqft || 0), 0)

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-black hover:bg-gray-900/50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {expanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
          <MapPin className="w-4 h-4 text-red-400" />
          <span className="font-medium text-white">{store}</span>
          <span className="text-xs text-gray-500">{leads.length} leads</span>
        </div>
        <div className="flex items-center space-x-6 text-sm">
          <span className="text-green-400">{converted} won</span>
          <span className="text-gray-400">{sqft.toLocaleString()} sqft</span>
          <span className="text-white font-semibold">${revenue.toLocaleString()}</span>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-gray-800">
          {leads.map(lead => (
            <LeadRow key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Lead Row (clickable) ────────────────────────────────────────────────

function LeadRow({ lead }: { lead: CostcoLead }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-gray-950 hover:bg-gray-900/60 transition-colors border-b border-gray-800/50 last:border-b-0">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-white text-sm">{lead.firstName} {lead.lastName}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded border ${statusColor[lead.status]}`}>{lead.status}</span>
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

      {/* Pipeline info */}
      <div className="flex items-center space-x-4 text-sm">
        {lead.opportunityStage && (
          <span className={`text-xs ${stageColor[lead.opportunityStage] || 'text-gray-400'}`}>
            {lead.opportunityStage}
          </span>
        )}
        {lead.totalPrice && (
          <span className="text-white font-medium">${lead.totalPrice.toLocaleString()}</span>
        )}
        {lead.sqft && (
          <span className="text-gray-400 text-xs">{lead.sqft.toLocaleString()} sqft</span>
        )}
        {lead.crewNumber && (
          <span className="text-xs text-gray-500">{lead.crewNumber}</span>
        )}
      </div>

      {/* Links */}
      <div className="flex items-center space-x-2 ml-4">
        <a
          href={sfLeadUrl(lead.sfId)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-2 py-1 rounded bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 transition-colors flex items-center space-x-1"
          title="Open in Salesforce"
        >
          <span>SF</span>
          <ExternalLink className="w-3 h-3" />
        </a>
        <a
          href={agmUrl(lead.agmId)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-2 py-1 rounded bg-green-900/30 text-green-400 hover:bg-green-900/50 transition-colors flex items-center space-x-1"
          title="Open in AGM"
        >
          <span>AGM</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────

export default function CostcoDashboard() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [turfFilter, setTurfFilter] = useState<string>('all')
  const [view, setView] = useState<'store' | 'list'>('store')

  // Filters
  const filtered = LEADS.filter(l => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false
    if (turfFilter !== 'all' && l.turfType !== turfFilter) return false
    return true
  })

  // Aggregates
  const totalLeads = filtered.length
  const converted = filtered.filter(l => l.status === 'Converted').length
  const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0
  const totalRevenue = filtered.reduce((sum, l) => sum + (l.totalPrice || 0), 0)
  const totalSqft = filtered.reduce((sum, l) => sum + (l.sqft || 0), 0)
  const avgDealSize = converted > 0 ? Math.round(totalRevenue / converted) : 0
  const avgPricePerSqft = totalSqft > 0 ? (totalRevenue / totalSqft).toFixed(2) : '0'
  const pipelineValue = filtered.filter(l => l.opportunityStage && !l.opportunityStage.includes('Completed') && !l.opportunityStage.includes('Complete')).reduce((sum, l) => sum + (l.totalPrice || 0), 0)

  // Status counts
  const statusCounts = filtered.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Turf type breakdown
  const turfTypes = filtered.reduce((acc, l) => {
    acc[l.turfType] = (acc[l.turfType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Group by store
  const byStore = filtered.reduce((acc, l) => {
    if (!acc[l.costcoStore]) acc[l.costcoStore] = []
    acc[l.costcoStore].push(l)
    return acc
  }, {} as Record<string, CostcoLead[]>)

  // Unique turf types for filter
  const allTurfTypes = Array.from(new Set(LEADS.map(l => l.turfType))).sort()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ShoppingCart className="w-6 h-6 text-red-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">Costco</h2>
            <p className="text-xs text-gray-500">Shaw / Costco Lead Pipeline &mdash; Heavenly Greens</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Prototype &mdash; mock data</span>
        </div>
      </div>

      {/* ── KPI Row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <MetricCard label="Total Leads" value={totalLeads} />
        <MetricCard label="Converted" value={converted} color="text-green-400" />
        <MetricCard label="Conversion" value={`${conversionRate}%`} color="text-cyan-400" />
        <MetricCard label="Revenue" value={`$${totalRevenue.toLocaleString()}`} color="text-emerald-400" />
        <MetricCard label="Avg Deal" value={`$${avgDealSize.toLocaleString()}`} />
        <MetricCard label="Total Sqft" value={totalSqft.toLocaleString()} />
        <MetricCard label="Pipeline" value={`$${pipelineValue.toLocaleString()}`} color="text-yellow-400" sub="open opps" />
      </div>

      {/* ── Status Funnel + Turf Breakdown ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Status */}
        <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Lead Status</h3>
          </div>
          <div className="space-y-2">
            {(['New', 'Contacted', 'Qualified', 'Converted', 'Closed Lost'] as const).map(status => {
              const count = statusCounts[status] || 0
              const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0
              return (
                <div key={status} className="flex items-center space-x-3">
                  <span className="text-xs text-gray-400 w-24">{status}</span>
                  <div className="flex-1 bg-gray-800 rounded-full h-5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        status === 'Converted' ? 'bg-green-600' :
                        status === 'Closed Lost' ? 'bg-red-600' :
                        status === 'Qualified' ? 'bg-purple-600' :
                        status === 'Contacted' ? 'bg-yellow-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-white font-medium w-8 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Turf Type Breakdown */}
        <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
          <div className="flex items-center space-x-2 mb-4">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Turf Type Breakdown</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(turfTypes).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
              const revenue = filtered.filter(l => l.turfType === type).reduce((sum, l) => sum + (l.totalPrice || 0), 0)
              const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <span className="text-xs text-gray-400 w-32">{type}</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-5 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-white font-medium w-8 text-right">{count}</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-4 w-20 text-right">${revenue.toLocaleString()}</span>
                </div>
              )
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-500">Avg $/sqft</span>
            <span className="text-sm font-semibold text-white">${avgPricePerSqft}</span>
          </div>
        </div>
      </div>

      {/* ── Filters + View Toggle ─────────────────────────────────── */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <label className="text-xs text-gray-500">Status:</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-black border border-gray-700 rounded px-2 py-1 text-sm text-white"
          >
            <option value="all">All</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Converted">Converted</option>
            <option value="Closed Lost">Closed Lost</option>
          </select>
          <label className="text-xs text-gray-500 ml-4">Turf Type:</label>
          <select
            value={turfFilter}
            onChange={e => setTurfFilter(e.target.value)}
            className="bg-black border border-gray-700 rounded px-2 py-1 text-sm text-white"
          >
            <option value="all">All</option>
            {allTurfTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView('store')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${view === 'store' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            By Store
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            All Leads
          </button>
        </div>
      </div>

      {/* ── Lead Table ────────────────────────────────────────────── */}
      <div className="space-y-2">
        {view === 'store' ? (
          Object.entries(byStore)
            .sort((a, b) => b[1].length - a[1].length)
            .map(([store, leads]) => (
              <StoreRow key={store} store={store} leads={leads} />
            ))
        ) : (
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 text-xs text-gray-500 font-medium">
              <span className="flex-1">Lead</span>
              <span className="w-24 text-center">Store</span>
              <span className="w-24 text-center">Turf Type</span>
              <span className="w-28 text-center">Stage</span>
              <span className="w-20 text-right">Amount</span>
              <span className="w-20 text-right">Sqft</span>
              <span className="w-28 text-right">Links</span>
            </div>
            {filtered.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()).map(lead => (
              <div key={lead.id} className="flex items-center justify-between px-4 py-2.5 bg-black hover:bg-gray-900/60 transition-colors border-t border-gray-800/50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-white text-sm">{lead.firstName} {lead.lastName}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${statusColor[lead.status]}`}>{lead.status}</span>
                  </div>
                  <span className="text-xs text-gray-500">{lead.city} &middot; {lead.createdDate}</span>
                </div>
                <span className="w-24 text-center text-xs text-gray-400">{lead.costcoStore}</span>
                <span className="w-24 text-center text-xs text-cyan-400">{lead.turfType}</span>
                <span className={`w-28 text-center text-xs ${lead.opportunityStage ? (stageColor[lead.opportunityStage] || 'text-gray-400') : 'text-gray-600'}`}>
                  {lead.opportunityStage || '--'}
                </span>
                <span className="w-20 text-right text-sm text-white font-medium">
                  {lead.totalPrice ? `$${lead.totalPrice.toLocaleString()}` : '--'}
                </span>
                <span className="w-20 text-right text-xs text-gray-400">
                  {lead.sqft ? lead.sqft.toLocaleString() : '--'}
                </span>
                <div className="w-28 flex items-center justify-end space-x-2">
                  <a href={sfLeadUrl(lead.sfId)} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 rounded bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 transition-colors flex items-center space-x-1" title="Salesforce">
                    <span>SF</span><ExternalLink className="w-3 h-3" />
                  </a>
                  <a href={agmUrl(lead.agmId)} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 rounded bg-green-900/30 text-green-400 hover:bg-green-900/50 transition-colors flex items-center space-x-1" title="AGM">
                    <span>AGM</span><ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Store Performance Summary ─────────────────────────────── */}
      <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-4 h-4 text-yellow-400" />
          <h3 className="text-sm font-semibold text-white">Store Performance</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(byStore)
            .sort((a, b) => {
              const revA = a[1].reduce((s, l) => s + (l.totalPrice || 0), 0)
              const revB = b[1].reduce((s, l) => s + (l.totalPrice || 0), 0)
              return revB - revA
            })
            .map(([store, leads]) => {
              const rev = leads.reduce((s, l) => s + (l.totalPrice || 0), 0)
              const won = leads.filter(l => l.status === 'Converted').length
              const rate = leads.length > 0 ? Math.round((won / leads.length) * 100) : 0
              return (
                <div key={store} className="bg-black rounded-lg p-3 border border-gray-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-3 h-3 text-red-400" />
                    <span className="text-sm font-medium text-white">{store}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-white">{leads.length}</p>
                      <p className="text-[10px] text-gray-500">leads</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-400">{rate}%</p>
                      <p className="text-[10px] text-gray-500">close</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-emerald-400">${(rev / 1000).toFixed(0)}k</p>
                      <p className="text-[10px] text-gray-500">rev</p>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* ── Financial Summary ──────────────────────────────────────── */}
      <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-semibold text-white">Financial Summary</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">${totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Closed Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">${pipelineValue.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Open Pipeline</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">${avgDealSize.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Avg Deal Size</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-cyan-400">${avgPricePerSqft}</p>
            <p className="text-xs text-gray-500">Avg $/sqft</p>
          </div>
        </div>
      </div>

      {/* Prototype notice */}
      <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-800">
        <p className="text-sm text-blue-300">
          <strong>Prototype:</strong> Using mock data. Production version will query Salesforce via SOQL and map AGM contact IDs from the intake pipeline&apos;s SQLite tracker.
          Each lead row links to both SF (blue) and AGM (green) records.
        </p>
      </div>
    </div>
  )
}
