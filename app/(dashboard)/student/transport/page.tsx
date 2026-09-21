'use client'

import * as React from 'react'
import { getLocalTransportData } from '@/lib/data/transport'
import { PageHeader } from '@/components/shared/page-header'
import { MapPin, Navigation, PhoneCall, Bus, User, Clock, AlertCircle } from 'lucide-react'

// Note: In a production app, we would dynamically load Mapbox GL JS or react-map-gl here.
// For this stage, we'll build the UI shell with a styled placeholder for the map.

export default function StudentTransportPage() {
  const { route, stops } = getLocalTransportData()
  const [activeTab, setActiveTab] = React.useState<'details' | 'live'>('details')

  // Mock live state
  const [isBusRunning, setIsBusRunning] = React.useState(true)

  return (
    <div className="space-y-6">
      <PageHeader title="Transport" subtitle="View pickup/drop details and track the school bus live." />

      <div className="flex border-b bg-muted/20 rounded-t-2xl px-4 pt-2 gap-4">
        <button
          onClick={() => setActiveTab('details')}
          className={`py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
        >
          Location & Contacts
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'live' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
        >
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isBusRunning ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isBusRunning ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          </span>
          Live Tracking
        </button>
      </div>

      {activeTab === 'details' && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Stops Card */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <Bus className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{route.name}</h3>
                <p className="text-sm text-muted-foreground font-mono">{route.vehicle_number}</p>
              </div>
            </div>

            <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent">
              {/* Pickup */}
              <div className="relative z-10 flex gap-4">
                <div className="absolute -left-6 h-6 w-6 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-600 mb-1">Pick Up</p>
                  <p className="font-semibold text-foreground">{stops[0].stop_name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3.5 w-3.5" /> Scheduled: {stops[0].scheduled_time} AM
                  </p>
                </div>
              </div>

              {/* Drop */}
              <div className="relative z-10 flex gap-4">
                <div className="absolute -left-6 h-6 w-6 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
                  <MapPin className="h-3 w-3 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-600 mb-1">Drop Off</p>
                  <p className="font-semibold text-foreground">{stops[2].stop_name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3.5 w-3.5" /> Scheduled: {stops[2].scheduled_time} AM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Cards */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">Transport Contacts</h3>
            
            {[
              { role: 'Driver', name: route.driver_name, phone: route.driver_phone },
              { role: 'Conductor', name: route.conductor_name, phone: route.conductor_phone },
              { role: 'Incharge', name: route.incharge_name, phone: route.incharge_phone },
            ].map((contact, i) => (
              <div key={i} className="rounded-xl border bg-card p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">{contact.role}</p>
                  </div>
                </div>
                <a href={`tel:${contact.phone}`} className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <PhoneCall className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'live' && (
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col" style={{ minHeight: '60vh' }}>
          
          <div className="p-4 border-b bg-background flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className={`flex h-3 w-3 relative`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isBusRunning ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isBusRunning ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              </span>
              <p className="font-semibold text-sm">
                {isBusRunning ? 'Bus is en route' : 'Trip not started'}
              </p>
            </div>
            
            {isBusRunning && (
              <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                ETA to Stop: ~12 mins
              </div>
            )}
          </div>

          <div className="flex-1 relative bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-6">
            {!isBusRunning ? (
              <div className="text-center max-w-sm">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-bold mb-2">Live tracking unavailable</h3>
                <p className="text-sm text-muted-foreground">
                  Live tracking will appear here once the bus starts its trip today.
                </p>
              </div>
            ) : (
              <div className="text-center max-w-sm">
                <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-4">
                  <Navigation className="h-8 w-8" />
                </div>
                <h3 className="font-bold mb-2">Mapbox Map Placeholder</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  In the real environment, this space will render a Mapbox GL map subscribed to Supabase Realtime for the bus icon coordinates.
                </p>
                <div className="bg-background border rounded-lg p-3 text-xs text-left font-mono">
                  <p className="text-emerald-600 mb-1">// Mock Payload from Realtime</p>
                  <p>lat: 25.6022</p>
                  <p>lng: 85.1506</p>
                  <p>speed: 32 km/h</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
