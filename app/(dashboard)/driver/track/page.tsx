'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Navigation, Play, Square, Loader2, MapPin } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'

// Note: For real map rendering we'd use Mapbox GL JS here, but we will use a simplified mock for the driver 
// who primarily just needs a big button to start/stop the trip.

export default function DriverTrackPage() {
  const [isActive, setIsActive] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [position, setPosition] = React.useState<{ lat: number, lng: number } | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  
  const watchIdRef = React.useRef<number | null>(null)

  const startTrip = () => {
    setLoading(true)
    setError(null)
    
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser.')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setIsActive(true)
        setLoading(false)
        toast.success('Trip started! Live location is now broadcasting.')
        
        // Start watching
        watchIdRef.current = navigator.geolocation.watchPosition(
          (watchPos) => {
            const newPos = { lat: watchPos.coords.latitude, lng: watchPos.coords.longitude }
            setPosition(newPos)
            // In a real app: push this to Supabase transport_live_location here
            console.log('Broadcasting position:', newPos)
          },
          (err) => {
            console.error(err)
            // Silently fail on subsequent updates, don't crash the UI
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
      },
      (err) => {
        let msg = 'Failed to get location.'
        if (err.code === 1) msg = 'Location access denied. Please allow GPS access in your browser settings to start the trip.'
        setError(msg)
        setLoading(false)
      },
      { enableHighAccuracy: true }
    )
  }

  const endTrip = () => {
    setIsActive(false)
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    toast.success('Trip ended. Location broadcasting stopped.')
  }

  React.useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <Navigation className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">Route 12 - Kankarbagh</h1>
          <p className="text-muted-foreground">Driver: Rajesh Kumar · Vehicle: BR01 PA 1234</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm">
            {error}
          </div>
        )}

        <div className="bg-card border rounded-3xl p-8 shadow-sm flex flex-col items-center gap-6">
          <button
            onClick={isActive ? endTrip : startTrip}
            disabled={loading}
            className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center gap-3 text-white font-bold text-xl shadow-lg transition-all active:scale-95 disabled:opacity-50
              ${isActive 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
              }`}
          >
            {isActive && (
              <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping" />
            )}
            
            {loading ? (
              <Loader2 className="h-10 w-10 animate-spin" />
            ) : isActive ? (
              <Square className="h-10 w-10 fill-current" />
            ) : (
              <Play className="h-10 w-10 fill-current ml-2" />
            )}
            
            {loading ? 'Starting...' : isActive ? 'End Trip' : 'Start Trip'}
          </button>
          
          <div className="text-center h-12">
            {isActive && position ? (
              <p className="text-sm font-medium text-emerald-600 flex items-center gap-2 justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Broadcasting GPS signal
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Press Start to begin GPS tracking for parents.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
