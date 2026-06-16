"use client";

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { UploadIcon, ShoppingBag, Leaf, Zap, Package, RefreshCw, BarChart2 } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { api } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Sidebar } from "@/components/ui/sidebar"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts"
import { Shared3DBackground } from "@/components/ui/shared-3d-background"

export default function ShoppingAssistant() {
  const { user } = useAuthStore()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    fetchHistory()
    fetchAnalytics()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await api.get("/shopping/history")
      setHistory(res.data)
    } catch (e) {}
  }

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/shopping/analytics")
      setAnalytics(res.data)
    } catch (e) {}
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0]
      setFile(f)
      setPreview(URL.createObjectURL(f))
    }
  }

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0]
      setFile(f)
      setPreview(URL.createObjectURL(f))
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const response = await api.post("/shopping/upload", formData, { headers: { "Content-Type": "multipart/form-data" } })
      setResult(response.data)
      toast.success("Product analyzed successfully!")
      fetchHistory()
      fetchAnalytics()
    } catch (error) {
      toast.error("Failed to process product.")
    } finally {
      setIsUploading(false)
    }
  }

  if (!user) return null

  const COLORS = ['#95d4b3', '#4d6553', '#003824']

  return (
    <div className="flex min-h-screen bg-transparent text-white selection:bg-primary/30 relative z-0">
      <Shared3DBackground />
      <Sidebar activeTab="shopping" />
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto overflow-y-auto">
        <header className="mb-10 flex items-center gap-4">
          <div className="bg-primary/20 p-4 rounded-2xl">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Green Shopping AI</h1>
            <p className="text-lg text-white/60">Upload a product image to evaluate its environmental impact.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Upload / Result Area */}
          <div className="lg:col-span-8 space-y-8">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <GlassCard className="p-8 bg-white/5 backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/10 rounded-3xl">
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      className={`border-2 border-dashed rounded-[2rem] p-16 text-center transition-all duration-300 cursor-pointer relative overflow-hidden ${
                        isDragging ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(149,212,179,0.2)]" : "border-white/20 bg-white/5 hover:border-primary/50"
                      }`}
                      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                    >
                      <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileChange} accept="image/*" />
                      
                      {preview ? (
                        <div className="relative z-10 flex flex-col items-center">
                          <img src={preview} alt="Preview" className="w-48 h-48 object-cover rounded-2xl mb-4 border border-white/10 shadow-lg" />
                          <p className="text-xl font-bold text-white">{file?.name}</p>
                        </div>
                      ) : (
                        <div className="relative z-10">
                          <div className="flex justify-center mb-6">
                            <div className="bg-black/50 p-5 rounded-2xl border border-white/10"><UploadIcon className="h-12 w-12 text-white/40" /></div>
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-3">Drag & Drop Product Image</h3>
                          <p className="text-white/60">Supported formats: JPG, PNG, WEBP</p>
                        </div>
                      )}
                    </motion.div>

                    <div className="mt-8 flex justify-end gap-4">
                      {file && <Button variant="ghost" className="text-white/60 hover:text-white rounded-full px-6" onClick={() => { setFile(null); setPreview(null) }}>Clear</Button>}
                      <Button onClick={handleUpload} disabled={!file || isUploading} isLoading={isUploading} className="px-10 shadow-[0_0_20px_rgba(149,212,179,0.3)] hover:shadow-[0_0_30px_rgba(149,212,179,0.5)] text-[#001209] font-bold rounded-full h-12">
                        Analyze Product
                      </Button>
                    </div>
                  </GlassCard>
                </motion.div>
              ) : (
                <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <GlassCard className="p-8 bg-white/5 backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/10 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
                    
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-2">{result.product.name}</h2>
                        <span className="bg-white/10 px-3 py-1 rounded-full text-sm font-bold text-white/70 tracking-widest uppercase">{result.product.category}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className={`h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold border-4 shadow-[0_0_20px_rgba(149,212,179,0.3)] ${
                          result.product.eco_rating === 'A' ? 'border-primary text-primary bg-primary/10' :
                          result.product.eco_rating === 'B' ? 'border-emerald-400 text-emerald-400 bg-emerald-400/10' :
                          result.product.eco_rating === 'C' ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10' :
                          'border-red-400 text-red-400 bg-red-400/10'
                        }`}>
                          {result.product.eco_rating}
                        </div>
                        <span className="text-xs text-white/50 uppercase mt-2 font-bold tracking-widest">Eco Rating</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><BarChart2 className="h-5 w-5 text-primary" /> Lifecycle Impact</h3>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={[
                                { name: 'Mfg', value: result.analysis.manufacturing_impact },
                                { name: 'Pkg', value: result.analysis.packaging_impact },
                                { name: 'Transport', value: result.analysis.transport_impact }
                              ]} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {[0, 1, 2].map((i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Leaf className="h-5 w-5 text-primary" /> AI Insights</h3>
                        {result.analysis.insights.map((insight: string, i: number) => (
                          <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 text-sm text-white/80 leading-relaxed">
                            {insight}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-8 mb-8">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><RefreshCw className="h-5 w-5 text-primary" /> Sustainable Alternatives</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {result.analysis.alternatives.map((alt: any, i: number) => (
                          <div key={i} className="bg-primary/10 p-5 rounded-2xl border border-primary/20 shadow-[inset_0_0_15px_rgba(149,212,179,0.05)] hover:border-primary/50 transition-colors">
                            <h4 className="font-bold text-primary mb-2 text-lg">{alt.name}</h4>
                            <p className="text-sm text-white/70">{alt.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={() => { setResult(null); setFile(null); setPreview(null) }} className="px-8 shadow-[0_0_20px_rgba(149,212,179,0.3)] text-[#001209] font-bold rounded-full h-12">Scan Another Product</Button>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Analytics Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <GlassCard className="p-6 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/10 rounded-3xl">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-6">Shopping Analytics</h3>
              <div className="flex items-end gap-2 mb-8">
                <span className="text-5xl font-bold text-primary">{analytics?.total_emissions?.toFixed(1) || 0}</span>
                <span className="text-white/50 pb-1">kg CO₂</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-white/70 font-medium">Total Items Scanned</span>
                  <span className="font-bold">{analytics?.total_items || 0}</span>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 bg-white/5 backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/10 rounded-3xl">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-6">Scan History</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {history.length === 0 ? (
                  <p className="text-white/40 text-center py-4">No history yet.</p>
                ) : (
                  history.map(item => (
                    <div key={item.id} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors flex justify-between items-center cursor-pointer">
                      <div className="overflow-hidden">
                        <p className="font-bold text-sm truncate">{item.name}</p>
                        <p className="text-xs text-white/40">{new Date(item.timestamp).toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className={`text-xs font-bold px-2 py-1 rounded border ${
                          item.eco_rating === 'A' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-white/10 text-white border-white/20'
                        }`}>{item.eco_rating}</span>
                        <span className="text-xs text-white/50 mt-1">{item.carbon_footprint}kg</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  )
}
