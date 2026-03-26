'use client'

import { useState } from 'react'
import { Zap, CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react'

interface Integration {
  id: string
  name: string
  client: string
  fsmPlatform: string
  target: string
  status: 'live' | 'building' | 'prospect'
  proToolsTier: string
  priceSignal: string
  description: string
  features: string[]
}

export default function IntegrationMonitor() {
  const [integrations] = useState<Integration[]>([
    {
      id: 'jobber-texas-turf',
      name: 'Texas Turf → AGM',
      client: 'Ivana',
      fsmPlatform: 'Jobber',
      target: 'AGM',
      status: 'live',
      proToolsTier: 'Core',
      priceSignal: 'Residential free / Commercial $297/mo',
      description: 'Residential quote lifecycle live (free, founding partner). Commercial pipeline = paid $297/mo add-on, not yet scoped.',
      features: ['4 residential WFs live', 'Self-healing retry', 'Commercial pipeline pending']
    },
    {
      id: 'centah-hg',
      name: 'HG Costco → AGM + Salesforce',
      client: 'Heavenly Greens',
      fsmPlatform: 'CENTAH',
      target: 'AGM + Salesforce',
      status: 'live',
      proToolsTier: 'Custom',
      priceSignal: '$297/mo (confirm)',
      description: 'Costco lead intake — email polling every 5 min, dual write to AGM and Salesforce.',
      features: ['Costco lead polling', 'Dual CRM write', 'HG Polly (Voice AI) in dev']
    },
    {
      id: 'building-connected-sunburst',
      name: 'Sunburst → BuildingConnected',
      client: 'Noelle',
      fsmPlatform: 'BuildingConnected',
      target: 'AGM',
      status: 'prospect',
      proToolsTier: 'Enterprise',
      priceSignal: '$997/mo',
      description: 'Commercial construction bid management. On hold — Noelle unclear on platform details.',
      features: ['API research done', 'Needs platform clarification from Noelle']
    },
    {
      id: 'arcsite-oasis',
      name: 'Oasis Turf → Arc Site',
      client: 'Oasis Turf',
      fsmPlatform: 'Arc Site',
      target: 'AGM',
      status: 'prospect',
      proToolsTier: 'TBD',
      priceSignal: 'TBD',
      description: 'AI SEO ($1,297/mo) coming. Arc Site integration candidate.',
      features: ['AI SEO onboarding', 'Arc Site integration scoping']
    },
    {
      id: 'housecallpro-goldenmailer',
      name: 'Golden Mailer → Housecall Pro',
      client: 'Golden Mailer',
      fsmPlatform: 'Housecall Pro',
      target: 'AGM',
      status: 'building',
      proToolsTier: 'Core',
      priceSignal: '$297/mo',
      description: 'First Housecall Pro integration. Test client via goldenmailer.com. MAX plan required for API.',
      features: ['API research done', 'Webhook support confirmed', 'MAX plan gating']
    },
    {
      id: 'field-routes-valleywide',
      name: 'Valleywide Pest → SERTBO',
      client: 'Valleywide Pest Control',
      fsmPlatform: 'Field Routes',
      target: 'SERTBO',
      status: 'live',
      proToolsTier: 'Core',
      priceSignal: '$297/mo',
      description: 'Pest control vertical. Via Andrew/SERTBO channel. Core tier, signed Mar 18. 8,373 customers.',
      features: ['APIs connected', 'Data audit complete', '51% have email', 'Sync engine live']
    }
  ])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'building': return <RefreshCw className="w-5 h-5 text-yellow-400" />
      case 'prospect': return <Clock className="w-5 h-5 text-blue-400" />
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'live': return { text: 'Live', classes: 'bg-green-900 text-green-300' }
      case 'building': return { text: 'Building', classes: 'bg-yellow-900 text-yellow-300' }
      case 'prospect': return { text: 'Prospect', classes: 'bg-blue-900 text-blue-300' }
      default: return { text: status, classes: 'bg-gray-800 text-gray-400' }
    }
  }

  const liveCount = integrations.filter(i => i.status === 'live').length
  const buildingCount = integrations.filter(i => i.status === 'building').length
  const prospectCount = integrations.filter(i => i.status === 'prospect').length

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Zap className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-semibold text-white">Pro Tools Integrations</h2>
        </div>
        <div className="flex items-center space-x-3 text-sm">
          <span className="text-green-400">{liveCount} Live</span>
          <span className="text-gray-600">|</span>
          <span className="text-yellow-400">{buildingCount} Building</span>
          <span className="text-gray-600">|</span>
          <span className="text-blue-400">{prospectCount} Prospect</span>
        </div>
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-black rounded-lg p-3 border border-green-800 text-center">
          <p className="text-2xl font-semibold text-green-400">{liveCount}</p>
          <p className="text-sm text-gray-400">Live Integrations</p>
        </div>
        <div className="bg-black rounded-lg p-3 border border-yellow-800 text-center">
          <p className="text-2xl font-semibold text-yellow-400">{buildingCount}</p>
          <p className="text-sm text-gray-400">In Development</p>
        </div>
        <div className="bg-black rounded-lg p-3 border border-blue-800 text-center">
          <p className="text-2xl font-semibold text-blue-400">{prospectCount}</p>
          <p className="text-sm text-gray-400">Prospects</p>
        </div>
      </div>

      {/* Integration Cards */}
      <div className="space-y-4">
        {integrations.map(integration => {
          const statusLabel = getStatusLabel(integration.status)
          return (
            <div
              key={integration.id}
              className={`bg-black rounded-lg p-4 border transition-all ${
                integration.status === 'live' ? 'border-green-800' :
                integration.status === 'building' ? 'border-yellow-800' :
                'border-gray-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(integration.status)}
                  <div>
                    <h3 className="font-medium text-white">{integration.name}</h3>
                    <p className="text-sm text-gray-400">Contact: {integration.client}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${statusLabel.classes}`}>
                    {statusLabel.text}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                    {integration.proToolsTier} — {integration.priceSignal}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-3">{integration.description}</p>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {integration.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* FSM Platform Coverage */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Pro Tools Tier Model</h4>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="bg-black rounded p-2 border border-gray-700">
            <p className="text-white font-medium">Core — $297/mo</p>
            <p className="text-gray-400">Jobber, Housecall Pro</p>
          </div>
          <div className="bg-black rounded p-2 border border-gray-700">
            <p className="text-white font-medium">Pro — $597/mo</p>
            <p className="text-gray-400">Field Routes, Service Fusion</p>
          </div>
          <div className="bg-black rounded p-2 border border-gray-700">
            <p className="text-white font-medium">Enterprise — $997/mo</p>
            <p className="text-gray-400">ServiceTitan, BuildingConnected</p>
          </div>
        </div>
      </div>
    </div>
  )
}
