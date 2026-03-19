'use client'

import { useState } from 'react'
import { Building2, Zap } from 'lucide-react'

interface Client {
  name: string
  type: 'Manufacturer' | 'Dealer' | 'Retailer'
  services: {
    agmManufacturer?: number
    agmBuild?: number
    agmGrow?: number
    agmScale?: number
    aiSEO?: number
    hosting?: number
  }
  totalMonthly: number
  status: 'active' | 'confirm_payment'
}

interface ProToolsClient {
  name: string
  fsmPlatform: string
  status: 'live' | 'in_progress' | 'prospect'
  monthlyValue: number
  notes: string
}

export default function ClientsDashboard() {
  const [clients] = useState<Client[]>([
    { name: 'Realturf', type: 'Manufacturer', services: { agmGrow: 697 }, totalMonthly: 697, status: 'active' },
    { name: 'Amazing Turf & Lawn', type: 'Dealer', services: { agmBuild: 497, aiSEO: 997, hosting: 25 }, totalMonthly: 1519, status: 'active' },
    { name: 'Texas Turf USA', type: 'Dealer', services: { agmGrow: 797, hosting: 25 }, totalMonthly: 822, status: 'active' },
    { name: 'Alpha Turf', type: 'Dealer', services: { agmGrow: 697 }, totalMonthly: 697, status: 'active' },
    { name: 'Sunburst Landscaping', type: 'Dealer', services: { agmGrow: 797, aiSEO: 997, hosting: 25 }, totalMonthly: 1819, status: 'active' },
    { name: 'Turf Prep', type: 'Dealer', services: { agmBuild: 497 }, totalMonthly: 497, status: 'active' },
    { name: 'East Coast Turf Pros', type: 'Dealer', services: { hosting: 25 }, totalMonthly: 25, status: 'active' },
    { name: 'Oasis Turf', type: 'Dealer', services: { agmScale: 997, hosting: 75 }, totalMonthly: 1072, status: 'active' },
    { name: 'DFW', type: 'Dealer', services: { agmBuild: 497, aiSEO: 997, hosting: 25 }, totalMonthly: 1519, status: 'active' },
    { name: 'JNR Home Improvement', type: 'Dealer', services: { agmGrow: 797 }, totalMonthly: 797, status: 'active' },
    { name: 'Turf Casa', type: 'Retailer', services: { hosting: 25 }, totalMonthly: 25, status: 'active' },
  ])

  const [proToolsClients] = useState<ProToolsClient[]>([
    { name: 'Heavenly Greens', fsmPlatform: 'CENTAH / Salesforce', status: 'live', monthlyValue: 297, notes: 'Costco lead intake. AGM + ProTools Core. SF + AGM bridge.' },
    { name: 'Artificial Turf Express', fsmPlatform: 'Jobber', status: 'live', monthlyValue: 297, notes: 'AGM platform client.' },
    { name: 'Texas Turf (Ivana)', fsmPlatform: 'Jobber', status: 'live', monthlyValue: 0, notes: '4 workflows live. Free integration — founding use case client.' },
    { name: 'Valleywide Pest Control', fsmPlatform: 'Field Routes', status: 'live', monthlyValue: 297, notes: 'Via Andrew/SERTBO. Core tier ($297/mo). Signed Mar 18, 2026. 8,373 customers.' },
    { name: 'Golden Mailer', fsmPlatform: 'Housecall Pro', status: 'in_progress', monthlyValue: 0, notes: 'Test integration began Mar 19. Third ProTools client. MAX plan API access.' },
    { name: 'Sunburst Landscaping', fsmPlatform: 'BuildingConnected', status: 'prospect', monthlyValue: 0, notes: 'Contact: Noelle. Commercial construction bid integration.' },
    { name: 'Oasis Turf', fsmPlatform: 'Arc Site', status: 'prospect', monthlyValue: 0, notes: 'AI SEO ($1,297/mo) closing. Arc Site integration candidate.' },
  ])

  const totalMRR = clients.reduce((sum, c) => sum + c.totalMonthly, 0)
  const activeClients = clients.length

  const serviceCount = (key: keyof Client['services']) =>
    clients.filter(c => c.services[key] && c.services[key]! > 0).length

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Building2 className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">AGM Clients</h2>
        </div>
        <span className="text-sm text-gray-400">${totalMRR.toLocaleString()} MRR</span>
      </div>

      {/* Client Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-3xl font-bold text-white">
              {activeClients}<span className="text-lg text-gray-400"> clients</span>
            </p>
            <p className="text-sm text-gray-400">Active AGM platform accounts</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-gray-300">${totalMRR.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Platform MRR</p>
          </div>
        </div>
      </div>

      {/* Service Breakdown */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <div className="bg-black rounded-lg p-3 border border-gray-800 text-center">
          <p className="text-xs text-gray-500">AGM Build</p>
          <p className="text-xl font-semibold text-white">{serviceCount('agmBuild')}</p>
        </div>
        <div className="bg-black rounded-lg p-3 border border-gray-800 text-center">
          <p className="text-xs text-gray-500">AGM Grow</p>
          <p className="text-xl font-semibold text-white">{serviceCount('agmGrow')}</p>
        </div>
        <div className="bg-black rounded-lg p-3 border border-gray-800 text-center">
          <p className="text-xs text-gray-500">AGM Scale</p>
          <p className="text-xl font-semibold text-white">{serviceCount('agmScale')}</p>
        </div>
        <div className="bg-black rounded-lg p-3 border border-gray-800 text-center">
          <p className="text-xs text-gray-500">AI SEO</p>
          <p className="text-xl font-semibold text-white">{serviceCount('aiSEO')}</p>
        </div>
        <div className="bg-black rounded-lg p-3 border border-gray-800 text-center">
          <p className="text-xs text-gray-500">Hosting</p>
          <p className="text-xl font-semibold text-white">{serviceCount('hosting')}</p>
        </div>
      </div>

      {/* Client List */}
      <div className="mb-6">
        <h3 className="font-medium text-white mb-3 flex items-center justify-between">
          <span>Platform Clients</span>
          <span className="text-xs text-gray-400">Sorted by monthly value</span>
        </h3>
        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
          {[...clients].sort((a, b) => b.totalMonthly - a.totalMonthly).map((client, index) => (
            <div key={index} className="bg-black rounded-lg p-3 border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-white">{client.name}</p>
                    <div className="text-right">
                      <p className="font-semibold text-white">${client.totalMonthly.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">/month</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">{client.type}</span>
                    <div className="flex items-center space-x-2">
                      {client.services.agmBuild && (
                        <span className="text-xs px-2 py-1 bg-blue-900 text-blue-300 rounded">Build ${client.services.agmBuild}</span>
                      )}
                      {client.services.agmGrow && (
                        <span className="text-xs px-2 py-1 bg-green-900 text-green-300 rounded">Grow ${client.services.agmGrow}</span>
                      )}
                      {client.services.agmScale && (
                        <span className="text-xs px-2 py-1 bg-purple-900 text-purple-300 rounded">Scale ${client.services.agmScale}</span>
                      )}
                      {client.services.aiSEO && (
                        <span className="text-xs px-2 py-1 bg-orange-900 text-orange-300 rounded">SEO ${client.services.aiSEO}</span>
                      )}
                      {client.services.hosting && (
                        <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">Host ${client.services.hosting}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Tools Integration Pipeline */}
      <div className="border-t border-gray-700 pt-6">
        <div className="flex items-center space-x-3 mb-3">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h3 className="font-medium text-white">Pro Tools Integration Pipeline</h3>
        </div>
        <div className="space-y-2">
          {proToolsClients.map((client, index) => (
            <div key={index} className={`bg-black rounded-lg p-3 border ${
              client.status === 'live' ? 'border-green-800' : 'border-yellow-800'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${client.status === 'live' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                  <p className="font-medium text-white">{client.name}</p>
                  <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">{client.fsmPlatform}</span>
                </div>
                {client.monthlyValue > 0 ? (
                  <p className="font-semibold text-white">${client.monthlyValue}/mo</p>
                ) : (
                  <p className="text-xs text-yellow-400">TBD</p>
                )}
              </div>
              <p className="text-xs text-gray-400 ml-4">{client.notes}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Status Note */}
      <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-800">
        <p className="text-sm text-blue-300">
          <strong>Pipeline:</strong> 4 live integrations, 1 building (Golden Mailer / Housecall Pro), 2 prospects. ProTools MRR: $891/mo.
        </p>
      </div>
    </div>
  )
}
