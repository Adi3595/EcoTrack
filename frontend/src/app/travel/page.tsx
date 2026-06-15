"use client";

import { useState, useEffect, useRef } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Map, MapPin, Navigation, Car, Zap, Activity } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { api } from "@/lib/api"
import { motion } from "framer-motion"
import { Sidebar } from "@/components/ui/sidebar"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import dynamic from 'next/dynamic'

// Dynamically import Leaflet map to avoid SSR issues
const DynamicMap = dynamic(() => import('@/components/ui/travel-map'), { ssr: false, loading: () => <div className="h-[500px] w-full bg-white/5 animate-pulse rounded-3xl" /> })

export default function TravelTracker() {
  const { user, _hasHydrated } = useAuthStore()
  const router = useRouter()
  const [isTracking, setIsTracking] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [vehicle, setVehicle] = useState("Gas Car")
  const [liveStats, setLiveStats] = useState({ distance: 0, emissions: 0 })
  const [analytics, setAnalytics] = useState<any>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [route, setRoute] = useState<[number, number][]>([])

  useEffect(() => {
    fetchAnalytics()
    return () => { stopTracking() }
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/travel/analytics")
      setAnalytics(res.data)
    } catch (e) {}
  }

  const startTracking = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      return
    }

    try {
      const res = await api.post("/travel/session/start", { vehicle_type: vehicle })
      const sid = res.data.session_id
      setSessionId(sid)
      setIsTracking(true)
      setLiveStats({ distance: 0, emissions: 0 })
      setRoute([])

      // Connect WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//localhost:8000/ws/travel/${sid}`
      wsRef.current = new WebSocket(wsUrl)
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        setLiveStats({ distance: data.total_distance, emissions: data.total_emissions })
      }

      // Start watching GPS
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude
          const lng = pos.coords.longitude
          setPosition([lat, lng])
          setRoute(prev => [...prev, [lat, lng]])
          
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ lat, lng }))
          }
        },
        (err) => toast.error(`GPS Error: ${err.message}`),
        { enableHighAccuracy: true, maximumAge: 0 }
      )
      
      toast.success("Tracking started!")
    } catch (e) {
      toast.error("Failed to start session")
    }
  }

  const stopTracking = async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    if (sessionId && isTracking) {
      try {
        await api.post("/travel/session/end", { session_id: sessionId })
        toast.success("Trip saved successfully!")
        fetchAnalytics()
      } catch (e) {
        console.error(e)
      }
    }
    setIsTracking(false)
    setSessionId(null)
  }

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) {
      router.push("/login")
    }
  }, [user, router, _hasHydrated])

  if (!_hasHydrated || !user) return null

  return (
    <div className="flex min-h-screen bg-transparent text-white selection:bg-primary/30">
      <Sidebar activeTab="travel" />
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto overflow-y-auto">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/20 p-4 rounded-2xl border border-blue-500/30">
              <Navigation className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Geo Travel Tracker</h1>
              <p className="text-lg text-white/60">Real-time emission monitoring for your daily commutes.</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Map Area */}
          <div className="lg:col-span-8 relative">
            <GlassCard className="p-2 bg-black/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] overflow-hidden relative">
              <div className="absolute top-6 left-6 z-10">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                  <span className={`w-3 h-3 rounded-full ${isTracking ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-white/20'}`} />
                  <span className="font-bold text-sm tracking-widest uppercase">{isTracking ? 'LIVE TRACKING' : 'OFFLINE'}</span>
                </div>
              </div>
              
              <DynamicMap position={position} route={route} />

              {/* Bottom HUD */}
              <div className="absolute bottom-6 left-6 right-6 z-10 flex gap-4">
                <div className="flex-1 bg-black/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex justify-between items-center shadow-2xl">
                  <div>
                    <p className="text-sm font-bold text-white/50 uppercase tracking-widest mb-1">Distance</p>
                    <p className="text-3xl font-bold">{liveStats.distance.toFixed(2)} <span className="text-lg font-normal text-white/40">km</span></p>
                  </div>
                  <div className="w-px h-12 bg-white/10" />
                  <div>
                    <p className="text-sm font-bold text-white/50 uppercase tracking-widest mb-1">Emissions</p>
                    <p className="text-3xl font-bold text-blue-400">{liveStats.emissions.toFixed(2)} <span className="text-lg font-normal text-white/40">kg</span></p>
                  </div>
                  <div className="w-px h-12 bg-white/10" />
                  <div>
                    {isTracking ? (
                      <Button onClick={stopTracking} className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-full px-8 h-12 shadow-[0_0_20px_rgba(239,68,68,0.4)]">End Trip</Button>
                    ) : (
                      <Button onClick={startTracking} className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-8 h-12 shadow-[0_0_20px_rgba(59,130,246,0.4)]">Start Trip</Button>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-4 space-y-6">
            <GlassCard className="p-6 bg-black/40 backdrop-blur-2xl border border-white/5 rounded-3xl">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-6">Transport Mode</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {['Gas Car', 'EV', 'Bus', 'Bike'].map(v => (
                  <button
                    key={v}
                    disabled={isTracking}
                    onClick={() => setVehicle(v)}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      vehicle === v 
                        ? 'border-blue-500 bg-blue-500/20 text-blue-400 shadow-[inset_0_0_15px_rgba(59,130,246,0.2)]' 
                        : 'border-white/5 bg-white/5 hover:bg-white/10 disabled:opacity-50'
                    }`}
                  >
                    {v === 'EV' ? <Zap className="h-6 w-6" /> : v === 'Bike' ? <Activity className="h-6 w-6" /> : <Car className="h-6 w-6" />}
                    <span className="text-sm font-bold">{v}</span>
                  </button>
                ))}
              </div>
              <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 text-sm text-blue-200/80">
                Switching to an EV or Bike dramatically reduces your live emissions rate.
              </div>
            </GlassCard>

            <GlassCard className="p-6 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-2xl border border-white/5 rounded-3xl">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-6">Travel Analytics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5">
                  <span className="text-white/70 font-medium flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-400" /> Total Traveled</span>
                  <span className="font-bold text-xl">{analytics?.total_distance?.toFixed(1) || 0} km</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5">
                  <span className="text-white/70 font-medium flex items-center gap-2"><Zap className="h-4 w-4 text-emerald-400" /> Total Emissions</span>
                  <span className="font-bold text-xl">{analytics?.total_emissions?.toFixed(1) || 0} kg</span>
                </div>
              </div>
            </GlassCard>

            {/* Manual Calculator */}
            <GlassCard className="p-6 bg-black/40 backdrop-blur-2xl border border-white/5 rounded-3xl mt-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-6">Manual Calculator</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase mb-2">Start Location</label>
                  <input type="text" id="startLoc" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors" placeholder="e.g. New York" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase mb-2">Destination</label>
                  <input type="text" id="endLoc" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors" placeholder="e.g. Boston" />
                </div>
                <Button onClick={() => {
                   const s = (document.getElementById('startLoc') as HTMLInputElement).value;
                   const e = (document.getElementById('endLoc') as HTMLInputElement).value;
                   if(!s || !e) {
                     toast.error("Please enter both locations");
                     return;
                   }
                   
                   // Generate a deterministic mock distance based on location strings
                   const dist = (s.length * 3 + e.length * 2) * 8.5;
                   
                   const factors: any = { "Gas Car": 0.192, "EV": 0.05, "Bus": 0.082, "Bike": 0.0 };
                   const f = factors[vehicle] || 0.192;
                   const em = dist * f;
                   
                   toast.success(`Distance: ${dist.toFixed(1)}km | Footprint: ${em.toFixed(2)}kg CO2`);
                }} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl py-6 mt-2 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all">Calculate Impact</Button>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  )
}
