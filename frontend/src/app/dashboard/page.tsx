"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { CircularGauge } from "@/components/ui/circular-gauge"
import { CarbonChip } from "@/components/ui/carbon-chip"
import { Button } from "@/components/ui/button"
import { Activity as ActivityIcon, Leaf, Zap, Car } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { Sidebar } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Shared3DBackground } from "@/components/ui/shared-3d-background"

interface Activity {
  id: string;
  activity_type: string;
  description: string;
  value: number;
  timestamp: string;
}

const mockChartData = [
  { name: "Mon", transport: 12, energy: 8 },
  { name: "Tue", transport: 10, energy: 9 },
  { name: "Wed", transport: 15, energy: 7 },
  { name: "Thu", transport: 8, energy: 10 },
  { name: "Fri", transport: 5, energy: 6 },
  { name: "Sat", transport: 20, energy: 12 },
  { name: "Sun", transport: 18, energy: 11 },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

// ... existing code ...

function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen bg-transparent relative z-0">
      <Shared3DBackground />
      <Sidebar activeTab="dashboard" />
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4 w-full">
          <div>
            <Skeleton className="h-12 w-64 mb-2 bg-white/5" />
            <Skeleton className="h-6 w-96 bg-white/5" />
          </div>
          <Skeleton className="h-12 w-48 rounded-full bg-white/5" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
          <div className="col-span-1 md:col-span-8">
            <GlassCard className="p-8 flex flex-col md:flex-row items-center gap-8 h-[250px] bg-black/40 border border-white/5 rounded-3xl">
              <Skeleton className="h-40 w-40 rounded-full shrink-0 bg-white/5" />
              <div className="flex-1 space-y-4 w-full">
                <Skeleton className="h-8 w-48 bg-white/5" />
                <Skeleton className="h-16 w-full bg-white/5" />
                <div className="flex gap-3">
                  <Skeleton className="h-8 w-24 rounded-full bg-white/5" />
                  <Skeleton className="h-8 w-24 rounded-full bg-white/5" />
                </div>
              </div>
            </GlassCard>
          </div>
          
          <div className="col-span-1 md:col-span-4">
            <GlassCard className="p-8 h-[250px] bg-black/40 border border-white/5 rounded-3xl space-y-6">
              <Skeleton className="h-4 w-32 bg-white/5" />
              <Skeleton className="h-16 w-full rounded-2xl bg-white/5" />
              <Skeleton className="h-16 w-full rounded-2xl bg-white/5" />
            </GlassCard>
          </div>

          <div className="col-span-1 md:col-span-12">
            <GlassCard className="p-8 h-[350px] bg-black/40 border border-white/5 rounded-3xl">
              <div className="flex justify-between mb-8">
                <Skeleton className="h-8 w-64 bg-white/5" />
                <Skeleton className="h-8 w-24 rounded-full bg-white/5" />
              </div>
              <Skeleton className="h-64 w-full bg-white/5" />
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function Dashboard() {
  const { user, _hasHydrated } = useAuthStore()
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) {
      router.push("/login")
      return
    }

    const fetchActivities = async () => {
      try {
        const response = await api.get("/activities/")
        setActivities(response.data)
      } catch (error) {
        console.error("Failed to fetch activities", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchActivities()
  }, [user, router, _hasHydrated])

  if (!_hasHydrated || isLoading || !user) {
    return <DashboardSkeleton />
  }

  return (
    <div className="flex min-h-screen bg-transparent text-white selection:bg-cyan-500/30 relative z-0 overflow-hidden">
      {/* Watery Ambient Background Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/40 via-[#001219]/60 to-blue-950/40 pointer-events-none z-[-1]" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none z-[-1] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none z-[-1] animate-pulse" style={{ animationDuration: '10s' }} />
      
      <Shared3DBackground />
      <Sidebar activeTab="dashboard" />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto overflow-y-auto">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-blue-300 drop-shadow-[0_0_10px_rgba(103,232,249,0.3)]">Hello, {user?.full_name || "Eco Warrior"}</h1>
            <p className="text-lg text-cyan-100/60 font-light">Your sustainability performance flowing seamlessly this week.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all text-white font-bold rounded-full px-8" asChild>
              <Link href="/upload">Log New Activity</Link>
            </Button>
          </motion.div>
        </header>

        {/* Bento Box Layout */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Score Card */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-8">
            <GlassCard className="p-8 flex flex-col md:flex-row items-center gap-8 h-full bg-cyan-950/10 backdrop-blur-[40px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),_0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),_0_8px_32px_rgba(34,211,238,0.15)] transition-all border border-cyan-500/20 rounded-3xl group">
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                transition={{ type: "spring", delay: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-cyan-500/20 blur-[50px] rounded-full group-hover:bg-cyan-400/30 transition-colors duration-500" />
                <CircularGauge value={user.carbon_score || 0} max={100} size={160} />
              </motion.div>
              <div className="flex-1 space-y-4 text-center md:text-left">
                <h3 className="text-3xl font-bold tracking-tight">Crystal Clear!</h3>
                <p className="text-lg text-cyan-50/70 font-light leading-relaxed">
                  You've reduced your carbon emissions by <span className="text-cyan-400 font-bold drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">15%</span> compared to last week. Your impact is making ripples!
                </p>
                <div className="flex gap-3 justify-center md:justify-start pt-2">
                  <CarbonChip level="high" className="bg-cyan-500/20 border-cyan-400/50 text-cyan-300">Top 20%</CarbonChip>
                  <CarbonChip level="neutral" className="bg-white/5 border-white/20 text-white/80">Eco Wave</CarbonChip>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-4">
            <GlassCard className="p-8 flex flex-col justify-between h-full bg-gradient-to-b from-cyan-950/20 to-transparent backdrop-blur-[40px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] border border-cyan-500/20 hover:border-cyan-400/40 transition-colors rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[40px] rounded-full pointer-events-none" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-200/50 mb-6">Emissions Pool</h3>
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                  <div className="flex items-center gap-4 font-medium">
                    <div className="p-2.5 rounded-xl bg-cyan-500/20"><Car className="h-5 w-5 text-cyan-400" /></div> 
                    Transport
                  </div>
                  <span className="text-2xl font-bold">120 <span className="text-sm text-cyan-100/40 font-normal">kg</span></span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                  <div className="flex items-center gap-4 font-medium">
                    <div className="p-2.5 rounded-xl bg-blue-500/20"><Zap className="h-5 w-5 text-blue-400" /></div> 
                    Electricity
                  </div>
                  <span className="text-2xl font-bold">85 <span className="text-sm text-cyan-100/40 font-normal">kg</span></span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-8 border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-400 text-cyan-100 rounded-full transition-all relative z-10" asChild>
                <Link href="/chat">Ask AI for Tips</Link>
              </Button>
            </GlassCard>
          </motion.div>

          {/* Weekly Trends Chart */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-12">
            <GlassCard className="p-8 bg-cyan-950/5 backdrop-blur-[40px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),_0_8px_32px_rgba(0,0,0,0.3)] border border-cyan-500/20 rounded-3xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold tracking-tight">Weekly Emissions Tide</h3>
                <CarbonChip level="low" className="bg-cyan-500/20 border-cyan-400/50 text-cyan-300 animate-pulse">Live Stream</CarbonChip>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTransport" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(34,211,238,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(165,243,252,0.5)" tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(165,243,252,0.5)" tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(8, 51, 68, 0.8)', borderRadius: '12px', border: '1px solid rgba(34,211,238,0.2)', backdropFilter: 'blur(12px)' }}
                      itemStyle={{ color: '#cffafe', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="transport" stroke="#22d3ee" strokeWidth={4} fillOpacity={1} fill="url(#colorTransport)" />
                    <Area type="monotone" dataKey="energy" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorEnergy)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>

          {/* AI Recommendations */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-6">
            <GlassCard className="p-8 h-full bg-cyan-950/10 backdrop-blur-[40px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] border border-cyan-500/20 rounded-3xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold tracking-tight">AI Insights</h3>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
                </span>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-900/20 transition-colors shadow-inner">
                  <div className="bg-cyan-500/20 p-3.5 rounded-xl"><Leaf className="h-6 w-6 text-cyan-400" /></div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">Smooth Sailing Transit</h4>
                    <p className="text-cyan-100/60 font-light">Taking the train tomorrow could save 5kg of CO2.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-400/50 hover:bg-blue-900/20 transition-colors shadow-inner">
                  <div className="bg-blue-500/20 p-3.5 rounded-xl"><Zap className="h-6 w-6 text-blue-400" /></div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">Peak Energy Currents</h4>
                    <p className="text-cyan-100/60 font-light">Avoid using the washer between 5 PM and 8 PM.</p>
                  </div>
                </li>
              </ul>
            </GlassCard>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-6">
            <GlassCard className="p-8 h-full bg-cyan-950/10 backdrop-blur-[40px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] border border-cyan-500/20 rounded-3xl">
              <h3 className="text-2xl font-bold mb-8 tracking-tight">Recent Logged Flow</h3>
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                    <ActivityIcon className="h-12 w-12 text-cyan-200/20 mb-4" />
                    <p className="text-cyan-100/50 mb-2 font-light">The stream is empty. Log your first activity.</p>
                    <Button variant="link" className="text-cyan-400 hover:text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" asChild><Link href="/upload">Log an activity</Link></Button>
                  </div>
                ) : (
                  activities.slice(0, 3).map((act) => (
                    <motion.div 
                      key={act.id} 
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between p-5 rounded-2xl bg-white/5 hover:bg-cyan-900/20 transition-colors border border-white/10 shadow-inner group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-xl bg-black/30 group-hover:bg-cyan-500/20 transition-colors">
                          {act.activity_type === 'TRANSPORT' ? <Car className="h-5 w-5 text-cyan-200/70 group-hover:text-cyan-400" /> : <Zap className="h-5 w-5 text-cyan-200/70 group-hover:text-cyan-400" />}
                        </div>
                        <div>
                          <p className="text-lg font-bold leading-tight mb-1">{act.description || act.activity_type}</p>
                          <p className="text-xs text-cyan-100/40 uppercase tracking-wider">{new Date(act.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold block text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">+ {act.value}</span>
                        <span className="text-xs text-cyan-100/40 uppercase tracking-wider">{act.activity_type === 'TRANSPORT' ? 'km' : 'kWh'}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </GlassCard>
          </motion.div>

        </motion.div>
      </main>
    </div>
  )
}

