"use client";

import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Activity as ActivityIcon, Leaf, Zap, Trophy, Upload, LogOut, Award, Users, Bot } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Sidebar } from "@/components/ui/sidebar"

import { useState, useRef } from "react"
import { api } from "@/lib/api"

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

export default function ChallengesPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [joinedQuests, setJoinedQuests] = useState<string[]>([]);

  const handleJoin = (name: string) => {
    setJoinedQuests(prev => [...prev, name]);
    toast.success(`You joined the ${name} challenge!`);
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen bg-transparent text-white selection:bg-primary/30">
      
      <Sidebar activeTab="challenges" />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto overflow-y-auto">
        <header className="mb-10">
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">Community Challenges</motion.h1>
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-lg text-white/60">
            Compete with friends and earn rewards for sustainable choices.
          </motion.p>
        </header>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Leaderboard */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <GlassCard className="p-8 bg-black/40 backdrop-blur-2xl border border-white/5 rounded-3xl h-full">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <div className="bg-primary/20 p-2.5 rounded-xl"><Trophy className="text-primary h-6 w-6" /></div>
                  Global Leaderboard
                </h3>
              </div>
              <div className="space-y-4">
                {[
                  { rank: 1, name: "Sarah J.", score: 98, isUser: false },
                  { rank: 2, name: "Mike T.", score: 92, isUser: false },
                  { rank: 3, name: user.full_name || "You", score: user.carbon_score || 85, isUser: true },
                  { rank: 4, name: "David L.", score: 81, isUser: false },
                ].map((p) => (
                  <motion.div 
                    key={p.rank} 
                    whileHover={{ scale: 1.02, x: 5 }}
                    className={`flex items-center justify-between p-5 rounded-2xl border ${
                      p.isUser 
                        ? 'bg-primary/10 border-primary/30 shadow-[inset_0_0_20px_rgba(149,212,179,0.1)]' 
                        : 'bg-white/5 hover:bg-white/10 border-white/5'
                    } transition-all`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg shadow-inner ${
                        p.rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 
                        p.rank === 2 ? 'bg-gray-300/20 text-gray-300 border border-gray-300/30' : 
                        p.rank === 3 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 
                        'bg-black/50 text-white/40 border border-white/5'
                      }`}>
                        {p.rank}
                      </div>
                      <span className={`text-xl font-bold ${p.isUser ? 'text-primary drop-shadow-[0_0_5px_rgba(149,212,179,0.5)]' : 'text-white/90'}`}>{p.name}</span>
                    </div>
                    <span className="text-2xl font-bold">{p.score} <span className="text-sm font-normal text-white/40 uppercase tracking-wider">pts</span></span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Active Challenges */}
          <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
            <h3 className="text-xl font-bold text-white/80 mb-2 px-2 uppercase tracking-widest">Available Quests</h3>
            {[
              { title: "Zero Waste Week", desc: "Log 0 plastic waste for 7 days.", reward: "500 XP", icon: Leaf, maxProgress: 7 },
              { title: "Public Transit Pro", desc: "Take the bus or train 5 times.", reward: "300 XP", icon: Users, maxProgress: 5 },
              { title: "Energy Saver", desc: "Reduce electricity by 10%.", reward: "400 XP", icon: Zap, maxProgress: 10 }
            ].map((c, i) => {
              const isJoined = joinedQuests.includes(c.title);
              // Simulated random progress between 1 and maxProgress for demonstration purposes
              const currentProgress = isJoined ? Math.max(1, Math.floor(Math.random() * (c.maxProgress - 1))) : 0;
              const progressPercent = (currentProgress / c.maxProgress) * 100;

              return (
                <GlassCard key={i} className="p-6 bg-white/5 backdrop-blur-2xl border border-white/5 hover:border-primary/50 hover:bg-white/10 transition-all hover:shadow-[0_0_30px_rgba(149,212,179,0.1)] rounded-3xl">
                  <div className="flex gap-4 mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-black/50 border border-white/5 flex items-center justify-center shrink-0">
                      <c.icon className="text-primary h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white mb-1 leading-tight">{c.title}</h4>
                      <p className="text-sm text-white/50">{c.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                    <span className="text-sm font-bold text-primary flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full shrink-0"><Award className="h-4 w-4" /> {c.reward}</span>
                    
                    {isJoined ? (
                      <div className="flex flex-col w-[100px] gap-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-white/60 uppercase tracking-wider">
                          <span>Progress</span>
                          <span>{currentProgress}/{c.maxProgress}</span>
                        </div>
                        <div className="w-full bg-black border border-white/10 rounded-full h-2 overflow-hidden shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${progressPercent}%` }} 
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="bg-gradient-to-r from-emerald-500 to-primary h-full rounded-full" 
                          />
                        </div>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" className="border-white/10 hover:bg-primary/20 hover:text-primary rounded-full shrink-0" onClick={() => handleJoin(c.title)}>Join Quest</Button>
                    )}
                  </div>
                </GlassCard>
              )
            })}
            
            <DailyTasksSection />
            
          </motion.div>

        </motion.div>
      </main>
    </div>
  )
}

function DailyTasksSection() {
  const [tasks, setTasks] = useState([
    { id: "1", title: "Use a reusable coffee cup", rewardXp: 50, rewardCarbon: 2.0, completed: false, verifying: false },
    { id: "2", title: "Walk or bike to work", rewardXp: 100, rewardCarbon: 5.0, completed: false, verifying: false },
    { id: "3", title: "Plant a tree or garden", rewardXp: 200, rewardCarbon: 10.0, completed: false, verifying: false }
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const { setAuth, token } = useAuthStore();

  const handleUploadClick = (taskId: string) => {
    setActiveTask(taskId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeTask) return;

    // Set task to verifying
    setTasks(prev => prev.map(t => t.id === activeTask ? { ...t, verifying: true } : t));
    
    // Simulate AI Vision Verification Delay (2 seconds)
    toast.info("Uploading and verifying with AI Vision...");
    
    setTimeout(async () => {
      try {
        const taskObj = tasks.find(t => t.id === activeTask);
        if (!taskObj) return;

        const response = await api.post("/activities/complete-task", {
          task_id: taskObj.id,
          task_title: taskObj.title,
          proof_base64: "simulated_base64_string",
          reward_xp: taskObj.rewardXp,
          reward_carbon: taskObj.rewardCarbon
        });

        // Update global user state with new stats
        const userResponse = await api.get("/auth/me");
        if (token) setAuth(token, userResponse.data);

        toast.success(`Proof verified! You earned ${response.data.xp_earned} XP.`);
        
        // Mark as completed
        setTasks(prev => prev.map(t => t.id === activeTask ? { ...t, verifying: false, completed: true } : t));
      } catch (err) {
        toast.error("Verification failed. Please try again.");
        setTasks(prev => prev.map(t => t.id === activeTask ? { ...t, verifying: false } : t));
      }
    }, 2000);
  };

  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-xl font-bold text-white/80 mb-2 px-2 uppercase tracking-widest">Daily Tasks</h3>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      
      {tasks.map(task => (
        <GlassCard key={task.id} className={`p-5 backdrop-blur-2xl border transition-all rounded-3xl ${task.completed ? 'bg-black/40 border-white/5 opacity-50' : 'bg-primary/5 border-primary/20 hover:border-primary/50 shadow-[0_0_20px_rgba(149,212,179,0.05)]'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`text-lg font-bold mb-1 leading-tight ${task.completed ? 'text-white/50 line-through' : 'text-white'}`}>{task.title}</h4>
              <span className="text-xs font-bold text-primary flex items-center gap-1.5 bg-primary/10 px-2 py-1 rounded-full w-fit"><Award className="h-3 w-3" /> +{task.rewardXp} XP</span>
            </div>
            {task.completed ? (
              <span className="text-primary font-bold text-sm bg-primary/10 px-3 py-1.5 rounded-full flex items-center gap-2"><Trophy className="h-4 w-4" /> Completed</span>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="border-primary/30 hover:bg-primary/20 hover:text-primary rounded-full" 
                onClick={() => handleUploadClick(task.id)}
                disabled={task.verifying}
              >
                {task.verifying ? "Verifying..." : <><Upload className="h-4 w-4 mr-2" /> Upload Proof</>}
              </Button>
            )}
          </div>
        </GlassCard>
      ))}
    </div>
  )
}
