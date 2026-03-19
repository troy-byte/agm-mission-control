'use client'

import { useState } from 'react'
import { TrendingUp, Users, Target, DollarSign } from 'lucide-react'

interface RevenueData {
  currentMRR: number
  targetMRR: number
  payingClients: number
  pipelineClients: number
  productLayers: number
  fsmPlatforms: number
  clients: Array<{
    name: string
    mrr: number
    platform: string
    status: 'live' | 'in_progress'
  }>
}

export default function RevenueDashboard() {
  const [revenue] = useState<RevenueData>({
    currentMRR: 1391,
    targetMRR: 65000,
    payingClients: 3,
    pipelineClients: 1,
    productLayers: 5,
    fsmPlatforms: 4,
    clients: [
      { name: 'Texas Turf (Ivana)', mrr: 797, platform: 'Jobber', status: 'live' },
      { name: 'Heavenly Greens', mrr: 297, platform: 'CENTAH / Salesforce', status: 'live' },
      { name: 'Artificial Turf Express', mrr: 297, platform: 'Jobber', status: 'live' },
      { name: 'Valleywide Pest Control', mrr: 297, platform: 'Field Routes → SERTBO', status: 'live' },
      { name: 'Golden Mailer', mrr: 0, platform: 'Housecall Pro', status: 'in_progress' },
    ]
  })

  const progressPercentage = Math.max((revenue.currentMRR / revenue.targetMRR) * 100, 1)

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <DollarSign className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-semibold text-white">Revenue</h2>
        </div>
        <span className="text-sm text-gray-400">Year 1 Target: $65K MRR</span>
      </div>

      {/* MRR Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-3xl font-bold text-white">
              ${revenue.currentMRR.toLocaleString()}<span className="text-lg text-gray-400">/mo</span>
            </p>
            <p className="text-sm text-gray-400">Live MRR ({revenue.payingClients} paying customers)</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-gray-300">
              ${revenue.targetMRR.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400">~220 subscribers @ $297</p>
          </div>
        </div>

        <div className="relative h-8 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-1000"
            style={{ width: `${progressPercentage}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {progressPercentage.toFixed(1)}% of Goal
            </span>
          </div>
        </div>

        <p className="mt-3 text-center text-sm text-gray-500">
          Early stage — product built, activation is the gap. Flywheel + Jobber Marketplace are the growth engines.
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-black rounded-lg p-4 border border-gray-800">
          <Users className="w-5 h-5 text-blue-400" />
          <p className="text-2xl font-semibold text-white mt-2">{revenue.payingClients}</p>
          <p className="text-sm text-gray-400">Paying Customers</p>
        </div>

        <div className="bg-black rounded-lg p-4 border border-gray-800">
          <Target className="w-5 h-5 text-purple-400" />
          <p className="text-2xl font-semibold text-white mt-2">{revenue.productLayers}</p>
          <p className="text-sm text-gray-400">Product Layers</p>
        </div>

        <div className="bg-black rounded-lg p-4 border border-gray-800">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <p className="text-2xl font-semibold text-white mt-2">{revenue.fsmPlatforms}</p>
          <p className="text-sm text-gray-400">FSM Platforms</p>
        </div>

        <div className="bg-black rounded-lg p-4 border border-gray-800">
          <DollarSign className="w-5 h-5 text-yellow-400" />
          <p className="text-2xl font-semibold text-white mt-2">
            ${(revenue.currentMRR * 12).toLocaleString()}
          </p>
          <p className="text-sm text-gray-400">Current ARR</p>
        </div>
      </div>

      {/* Customer List */}
      <div>
        <h3 className="font-medium text-white mb-3">Customers</h3>
        <div className="space-y-2">
          {revenue.clients.map((client, index) => (
            <div key={index} className="bg-black rounded-lg p-3 border border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    client.status === 'live' ? 'bg-green-400' : 'bg-yellow-400'
                  }`} />
                  <div>
                    <p className="font-medium text-white">{client.name}</p>
                    <p className="text-xs text-gray-400">{client.platform}</p>
                  </div>
                </div>
                <div className="text-right">
                  {client.mrr > 0 ? (
                    <>
                      <p className="font-semibold text-white">${client.mrr.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">/month</p>
                    </>
                  ) : (
                    <p className="font-semibold text-yellow-400">In Progress</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Reference */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Pricing Tiers</h4>
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
          <div>
            <p className="text-white font-medium">Integration</p>
            <p>$1K setup + $297/mo</p>
          </div>
          <div>
            <p className="text-white font-medium">Platform</p>
            <p>$397–$997/mo</p>
          </div>
          <div>
            <p className="text-white font-medium">AI SEO</p>
            <p>~$1,297/mo</p>
          </div>
        </div>
      </div>
    </div>
  )
}
