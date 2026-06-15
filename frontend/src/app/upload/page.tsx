"use client";

import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Activity as ActivityIcon, Leaf, Zap, Trophy, Upload as UploadIcon, LogOut, FileText, CheckCircle, Bot } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Sidebar } from "@/components/ui/sidebar"

export default function UploadPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append("file", file)
      
      const response = await api.post("/ocr/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      
      setResult(response.data)
      toast.success("Receipt scanned successfully!")
    } catch (error) {
      console.error("Upload failed", error)
      toast.error("Failed to process receipt.")
    } finally {
      setIsUploading(false)
    }
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen bg-transparent text-white selection:bg-primary/30">
      
      <Sidebar activeTab="upload" />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto flex flex-col justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <header className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">Smart Receipt Scanner</h1>
            <p className="text-lg text-white/60 max-w-lg mx-auto">
              Upload your energy bills or transit receipts. Our AI will automatically extract the data and update your carbon score.
            </p>
          </header>

          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GlassCard className="p-8 bg-black/40 backdrop-blur-2xl border border-white/5 rounded-3xl">
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className={`border-2 border-dashed rounded-[2rem] p-16 text-center transition-all duration-300 cursor-pointer relative overflow-hidden ${
                      isDragging 
                        ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(149,212,179,0.2)]" 
                        : "border-white/20 bg-white/5 hover:border-primary/50 hover:bg-white/10"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={handleFileChange}
                      accept="image/*,.pdf"
                    />
                    
                    {/* Decorative glowing orb behind the icon */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-[40px] transition-opacity duration-500 pointer-events-none ${file || isDragging ? 'bg-primary/40 opacity-100' : 'opacity-0'}`} />

                    <div className="flex justify-center mb-6 relative z-10">
                      <div className={`p-5 rounded-2xl border transition-all duration-300 ${
                        file || isDragging 
                          ? 'bg-primary/20 border-primary/30 text-primary drop-shadow-[0_0_15px_rgba(149,212,179,0.5)]' 
                          : 'bg-black/50 border-white/10 text-white/40'
                      }`}>
                        {file ? <FileText className="h-12 w-12" /> : <UploadIcon className="h-12 w-12" />}
                      </div>
                    </div>
                    
                    {file ? (
                      <div className="relative z-10">
                        <p className="text-2xl font-bold text-white mb-2">{file.name}</p>
                        <p className="text-primary text-sm font-bold uppercase tracking-widest">Ready to process</p>
                      </div>
                    ) : (
                      <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-white mb-3">Drag and drop your receipt</h3>
                        <p className="text-white/60">or click anywhere to browse from your computer</p>
                        <p className="text-xs text-white/30 mt-6 uppercase tracking-widest font-bold">Supports JPG, PNG, PDF</p>
                      </div>
                    )}
                  </motion.div>

                  <div className="mt-8 flex justify-end gap-4">
                    {file && (
                      <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5 px-6 rounded-full" onClick={() => setFile(null)}>
                        Clear Selection
                      </Button>
                    )}
                    <Button 
                      onClick={handleUpload} 
                      disabled={!file || isUploading}
                      isLoading={isUploading}
                      className="px-10 shadow-[0_0_20px_rgba(149,212,179,0.3)] hover:shadow-[0_0_30px_rgba(149,212,179,0.5)] transition-shadow text-[#001209] font-bold rounded-full h-12"
                    >
                      Process Receipt
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <GlassCard className="p-12 text-center flex flex-col items-center bg-black/40 backdrop-blur-2xl border border-white/5 rounded-3xl relative overflow-hidden">
                  
                  {/* Glowing success background */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-primary/20 blur-[80px] rounded-full pointer-events-none" />

                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="mb-8 bg-primary/20 p-5 rounded-3xl border border-primary/30 relative z-10 drop-shadow-[0_0_20px_rgba(149,212,179,0.5)]"
                  >
                    <CheckCircle className="h-20 w-20 text-primary" />
                  </motion.div>
                  <h3 className="text-4xl font-bold text-white mb-4 relative z-10">Receipt Processed!</h3>
                  <p className="text-lg text-white/60 mb-10 max-w-md relative z-10">
                    We've extracted the data and automatically logged it to your profile.
                  </p>
                  
                  <div className="w-full max-w-md bg-white/5 rounded-2xl p-6 mb-10 text-left border border-white/10 relative z-10 backdrop-blur-md">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                      <span className="text-white/50 text-sm uppercase tracking-widest font-bold">Task ID</span>
                      <span className="text-white font-mono bg-black/50 px-3 py-1 rounded-md border border-white/5">{result.task_id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/50 text-sm uppercase tracking-widest font-bold">Status</span>
                      <span className="text-primary font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        {result.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4 relative z-10">
                    <Button variant="outline" className="border-white/10 hover:bg-white/10 text-white rounded-full px-8 h-12" onClick={() => { setResult(null); setFile(null); }}>
                      Scan Another
                    </Button>
                    <Button asChild className="shadow-[0_0_20px_rgba(149,212,179,0.3)] hover:shadow-[0_0_30px_rgba(149,212,179,0.5)] transition-shadow text-[#001209] font-bold rounded-full px-8 h-12">
                      <Link href="/dashboard">Return to Dashboard</Link>
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  )
}
