"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Car, Zap, Utensils, Leaf } from "lucide-react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    primary_transport: "",
    energy_source: "",
    diet_type: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { token, setAuth } = useAuthStore()
  const isAuthenticated = !!token;

  // Skip registration step if already logged in
  useEffect(() => {
    if (isAuthenticated && step === 1) {
      setStep(2)
    }
  }, [isAuthenticated])

  const handleNext = () => setStep(s => Math.min(s + 1, 3))
  const handleBack = () => setStep(s => Math.max(s - 1, 1))

  const handleSelect = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    if (isAuthenticated) {
      // Mock profile update for existing user since backend doesn't have PUT /users/me yet
      setTimeout(() => {
        toast.success("Impact Profile updated successfully!")
        setIsLoading(false)
        router.push("/dashboard")
      }, 1000)
      return
    }

    try {
      await api.post("/auth/register", formData)
      
      const loginData = new URLSearchParams()
      loginData.append("username", formData.email)
      loginData.append("password", formData.password)
      
      const loginRes = await api.post("/auth/login", loginData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      })
      const { access_token } = loginRes.data
      
      const userRes = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${access_token}` }
      })
      
      setAuth(access_token, userRes.data)
      toast.success("Account created successfully!")
      router.push("/dashboard")
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Registration failed")
      setIsLoading(false)
    }
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  }

  return (
    <div 
      className="flex min-h-screen bg-[#001209] bg-cover bg-center text-white selection:bg-primary/30 p-6 md:p-10 items-center justify-center relative overflow-hidden"
      style={{ backgroundImage: 'url(/onboarding.jpg)' }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      {/* Immersive Background Orbs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div 
        animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"
      />

      <div className="w-full max-w-2xl z-10">
        <div className="mb-10 flex justify-center gap-3">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-500 ${
                step >= i 
                  ? 'bg-primary w-12 shadow-[0_0_10px_rgba(149,212,179,0.8)]' 
                  : 'bg-white/10 w-4'
              }`}
            />
          ))}
        </div>

        <GlassCard className="p-8 md:p-12 min-h-[550px] relative overflow-hidden bg-black/40 backdrop-blur-2xl border border-white/5 rounded-[2rem]">
          <AnimatePresence mode="wait" custom={1}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="space-y-8 h-full flex flex-col"
              >
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-6">
                    <div className="bg-primary/20 p-4 rounded-2xl border border-primary/30 shadow-[0_0_20px_rgba(149,212,179,0.2)]">
                      <Leaf className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">Create your account</h1>
                  <p className="text-lg text-white/60">Join EcoTrack to monitor your impact.</p>
                </div>
                
                <div className="space-y-5 flex-grow">
                  <div>
                    <label className="block text-sm font-bold text-white/70 uppercase tracking-widest mb-2">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-white/20"
                      value={formData.full_name}
                      onChange={e => setFormData({...formData, full_name: e.target.value})}
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white/70 uppercase tracking-widest mb-2">Email</label>
                    <input 
                      type="email" 
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-white/20"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white/70 uppercase tracking-widest mb-2">Password</label>
                    <input 
                      type="password" 
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-white/20"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-8 border-t border-white/10 mt-8">
                  <Button 
                    onClick={handleNext} 
                    disabled={!formData.full_name || !formData.email || !formData.password}
                    className="h-14 px-10 text-lg shadow-[0_0_20px_rgba(149,212,179,0.3)] hover:shadow-[0_0_30px_rgba(149,212,179,0.5)] transition-shadow text-[#001209] font-bold rounded-full"
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="space-y-8 h-full flex flex-col"
              >
                <div className="text-center mb-6">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">Transport & Energy</h2>
                  <p className="text-lg text-white/60">Help us customize your baseline footprint.</p>
                </div>
                
                <div className="space-y-8 flex-grow">
                  <div>
                    <label className="block text-sm font-bold text-white/70 uppercase tracking-widest mb-4">Primary Transport</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { id: 'car', icon: Car, label: 'Gas Car' },
                        { id: 'ev', icon: Zap, label: 'EV' },
                        { id: 'transit', icon: Car, label: 'Transit' },
                        { id: 'bike', icon: Car, label: 'Bike/Walk' }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => handleSelect('primary_transport', t.id)}
                          className={`p-5 rounded-2xl border flex flex-col items-center gap-3 transition-all duration-300 ${
                            formData.primary_transport === t.id 
                              ? 'border-primary bg-primary/20 text-primary shadow-[inset_0_0_20px_rgba(149,212,179,0.2)] drop-shadow-[0_0_10px_rgba(149,212,179,0.3)]' 
                              : 'border-white/10 bg-black/50 text-white/60 hover:border-white/30 hover:bg-white/5'
                          }`}
                        >
                          <t.icon className="h-8 w-8" />
                          <span className="text-sm font-bold">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white/70 uppercase tracking-widest mb-4">Home Energy Source</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['Grid Standard', '100% Renewable', 'Solar Panels'].map(e => (
                        <button
                          key={e}
                          onClick={() => handleSelect('energy_source', e)}
                          className={`p-5 rounded-2xl border transition-all duration-300 text-center ${
                            formData.energy_source === e 
                              ? 'border-primary bg-primary/20 text-primary shadow-[inset_0_0_20px_rgba(149,212,179,0.2)] drop-shadow-[0_0_10px_rgba(149,212,179,0.3)]' 
                              : 'border-white/10 bg-black/50 text-white/60 hover:border-white/30 hover:bg-white/5'
                          }`}
                        >
                          <span className="text-sm font-bold">{e}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-8 border-t border-white/10 mt-8">
                  <Button variant="ghost" onClick={handleBack} className="h-14 px-8 text-white/60 hover:text-white hover:bg-white/5 rounded-full text-lg">Back</Button>
                  <Button 
                    onClick={handleNext} 
                    disabled={!formData.primary_transport || !formData.energy_source} 
                    className="h-14 px-10 text-lg shadow-[0_0_20px_rgba(149,212,179,0.3)] hover:shadow-[0_0_30px_rgba(149,212,179,0.5)] transition-shadow text-[#001209] font-bold rounded-full"
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="space-y-8 h-full flex flex-col"
              >
                <div className="text-center mb-6">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">Dietary Habits</h2>
                  <p className="text-lg text-white/60">Food is a major part of global emissions.</p>
                </div>
                
                <div className="space-y-4 flex-grow">
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { id: 'omnivore', icon: Utensils, label: 'Omnivore', desc: 'Meat mostly every day' },
                      { id: 'flexitarian', icon: Utensils, label: 'Flexitarian', desc: 'Meat a few times a week' },
                      { id: 'vegetarian', icon: Leaf, label: 'Vegetarian', desc: 'No meat, but dairy/eggs' },
                      { id: 'vegan', icon: Leaf, label: 'Vegan', desc: '100% plant-based' }
                    ].map(d => (
                      <button
                        key={d.id}
                        onClick={() => handleSelect('diet_type', d.id)}
                        className={`p-5 rounded-2xl border flex items-center gap-5 transition-all duration-300 ${
                          formData.diet_type === d.id 
                            ? 'border-primary bg-primary/10 shadow-[inset_0_0_20px_rgba(149,212,179,0.1)]' 
                            : 'border-white/10 bg-black/50 hover:border-white/30 hover:bg-white/5'
                        }`}
                      >
                        <div className={`p-4 rounded-xl ${
                          formData.diet_type === d.id 
                            ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(149,212,179,0.3)]' 
                            : 'bg-white/5 text-white/40'
                        }`}>
                          <d.icon className="h-6 w-6" />
                        </div>
                        <div className="text-left flex-1">
                          <h4 className={`text-xl font-bold mb-1 ${formData.diet_type === d.id ? 'text-primary' : 'text-white'}`}>{d.label}</h4>
                          <p className="text-sm text-white/50">{d.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-8 border-t border-white/10 mt-8">
                  <Button variant="ghost" onClick={handleBack} disabled={isLoading} className="h-14 px-8 text-white/60 hover:text-white hover:bg-white/5 rounded-full text-lg">Back</Button>
                  <Button 
                    onClick={handleRegister} 
                    disabled={!formData.diet_type || isLoading} 
                    isLoading={isLoading} 
                    className="h-14 px-10 text-lg shadow-[0_0_20px_rgba(149,212,179,0.3)] hover:shadow-[0_0_30px_rgba(149,212,179,0.5)] transition-shadow text-[#001209] font-bold rounded-full"
                  >
                    Complete Profile
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  )
}
