"use client";

import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Activity as ActivityIcon, Leaf, Zap, Trophy, Upload, LogOut, Award, Users, Bot, Plus, X } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Sidebar } from "@/components/ui/sidebar"
import { Shared3DBackground } from "@/components/ui/shared-3d-background"

import { useState, useRef, useEffect } from "react"
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

interface Quest {
  id: string;
  title: string;
  description: string;
  reward_xp: number;
  max_progress: number;
  current_progress: number;
  is_joined: boolean;
}

interface DailyTask {
  id: string;
  title: string;
  reward_xp: number;
  reward_carbon: number;
  completed: boolean;
  locked_until: string | null;
}

export default function ChallengesPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchQuests();
    }
  }, [user]);

  const fetchQuests = async () => {
    try {
      const res = await api.get("/quests/");
      setQuests(res.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load quests");
      setLoading(false);
    }
  };

  const handleJoin = async (questId: string) => {
    try {
      await api.post(`/quests/${questId}/join`);
      toast.success("Successfully joined the quest!");
      fetchQuests();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to join quest");
    }
  };

  const handleProgress = async (questId: string) => {
    try {
      const res = await api.post(`/quests/${questId}/progress`);
      toast.success(`Progress logged! (${res.data.current_progress})`);
      fetchQuests();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to log progress");
    }
  };

  if (!user) return null

  return (
    <div className="flex min-h-screen bg-transparent text-white selection:bg-primary/30 relative z-0">
      <Shared3DBackground />
      <Sidebar activeTab="challenges" />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto overflow-y-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">Community Quests</motion.h1>
            <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-lg text-white/60">
              Compete with friends and earn rewards for sustainable choices.
            </motion.p>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Button onClick={() => setShowCreateModal(true)} className="bg-primary text-black hover:bg-primary/90 font-bold rounded-full px-6 shadow-[0_0_20px_rgba(149,212,179,0.3)]">
              <Plus className="mr-2 h-5 w-5" /> Create Quest
            </Button>
          </motion.div>
        </header>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Leaderboard */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <GlassCard className="p-8 bg-white/5 backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/10 rounded-3xl h-full">
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
            <h3 className="text-xl font-bold text-white/80 mb-2 px-2 uppercase tracking-widest">Live Quests</h3>
            
            {loading && <p className="text-white/50 px-2">Loading quests...</p>}
            {!loading && quests.length === 0 && <p className="text-white/50 px-2">No active quests. Create one!</p>}

            {quests.map((c) => {
              const progressPercent = (c.current_progress / c.max_progress) * 100;

              return (
                <GlassCard key={c.id} className="p-6 bg-white/5 backdrop-blur-3xl border border-white/10 hover:border-primary/50 hover:bg-white/10 transition-all hover:shadow-[0_0_30px_rgba(149,212,179,0.1)] rounded-3xl">
                  <div className="flex gap-4 mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-black/50 border border-white/5 flex items-center justify-center shrink-0">
                      <Trophy className="text-primary h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white mb-1 leading-tight">{c.title}</h4>
                      <p className="text-sm text-white/50 line-clamp-2">{c.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                    <span className="text-sm font-bold text-primary flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full shrink-0"><Award className="h-4 w-4" /> {c.reward_xp} XP</span>
                    
                    {c.is_joined ? (
                      <div className="flex flex-col w-[120px] gap-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-white/60 uppercase tracking-wider">
                          <span>Progress</span>
                          <span>{c.current_progress}/{c.max_progress}</span>
                        </div>
                        <div className="w-full bg-black border border-white/10 rounded-full h-2 overflow-hidden shadow-inner mb-2">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${progressPercent}%` }} 
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="bg-gradient-to-r from-emerald-500 to-primary h-full rounded-full" 
                          />
                        </div>
                        {c.current_progress < c.max_progress && (
                           <button onClick={() => handleProgress(c.id)} className="text-[10px] text-primary hover:underline self-end">Log +1</button>
                        )}
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" className="border-white/10 hover:bg-primary/20 hover:text-primary rounded-full shrink-0" onClick={() => handleJoin(c.id)}>Join Quest</Button>
                    )}
                  </div>
                </GlassCard>
              )
            })}
            
            <DailyTasksSection />
            
          </motion.div>

        </motion.div>
      </main>

      {/* Create Quest Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-zinc-950 border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl relative"
            >
              <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Trophy className="text-primary w-6 h-6"/> Create Community Quest</h2>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                try {
                  await api.post("/quests/", {
                    title: fd.get("title"),
                    description: fd.get("description"),
                    max_progress: parseInt(fd.get("max_progress") as string),
                    reward_xp: parseInt(fd.get("reward_xp") as string)
                  });
                  toast.success("Quest created successfully!");
                  setShowCreateModal(false);
                  fetchQuests();
                } catch(err: any) {
                  toast.error(err.response?.data?.detail || "Failed to create quest");
                }
              }} className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Quest Title</label>
                  <input name="title" required className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="e.g., Plastic Free Week" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Description</label>
                  <textarea name="description" required className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="What do users need to do?"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/60 mb-1 block">Target Goal</label>
                    <input name="max_progress" type="number" min="1" required className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="e.g., 5" />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-1 block">XP Reward</label>
                    <input name="reward_xp" type="number" min="10" required className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="e.g., 500" />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-primary text-black hover:bg-primary/90 font-bold rounded-xl py-6 mt-4">
                  Publish Quest to Community
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DailyTasksSection() {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTask, setActiveTask] = useState<DailyTask | null>(null);
  const [verifyingTask, setVerifyingTask] = useState<string | null>(null);
  const { setAuth, token } = useAuthStore();

  useEffect(() => {
    fetchDailyTasks();
  }, []);

  const fetchDailyTasks = async () => {
    try {
      const res = await api.get("/quests/daily");
      setTasks(res.data);
      setLoading(false);
    } catch (e) {
      toast.error("Failed to fetch daily tasks");
      setLoading(false);
    }
  }

  const handleUploadClick = (task: DailyTask) => {
    if (task.completed) {
       toast.error(`This task is locked for 24 hours. Check back later!`);
       return;
    }
    setActiveTask(task);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeTask) return;

    setVerifyingTask(activeTask.id);
    
    toast.info("Uploading and verifying with AI Vision...");
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64String = reader.result as string;
      try {
        const response = await api.post("/quests/daily/complete", {
          task_id: activeTask.id,
          task_title: activeTask.title,
          proof_base64: base64String,
          reward_xp: activeTask.reward_xp,
          reward_carbon: activeTask.reward_carbon
        });

        // Update global user state with new stats
        const userResponse = await api.get("/auth/me");
        if (token) setAuth(token, userResponse.data);

        toast.success(`Proof verified! You earned ${response.data.xp_earned} XP.`);
        fetchDailyTasks();
        setVerifyingTask(null);
      } catch (err: any) {
        toast.error(err.response?.data?.detail || "Verification failed. Please try again.");
        setVerifyingTask(null);
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read file.");
      setVerifyingTask(null);
    };
  };

  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-xl font-bold text-white/80 mb-2 px-2 uppercase tracking-widest flex justify-between items-center">
        <span>Daily Tasks</span>
        <span className="text-[10px] text-primary bg-primary/10 px-2 py-1 rounded-md tracking-normal">Resets Midnight</span>
      </h3>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      
      {loading && <p className="text-white/50 px-2">Loading today's tasks...</p>}

      {tasks.map(task => {
        
        let lockTimeText = "";
        if (task.locked_until) {
          const lockDate = new Date(task.locked_until + "Z"); // Add Z to force UTC parsing correctly
          lockTimeText = lockDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        return (
          <GlassCard key={task.id} className={`p-5 backdrop-blur-3xl border transition-all rounded-3xl ${task.completed ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed' : 'bg-primary/5 border-white/10 hover:border-primary/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`text-lg font-bold mb-1 leading-tight ${task.completed ? 'text-white/50 line-through' : 'text-white'}`}>{task.title}</h4>
                <span className="text-xs font-bold text-primary flex items-center gap-1.5 bg-primary/10 px-2 py-1 rounded-full w-fit"><Award className="h-3 w-3" /> +{task.reward_xp} XP</span>
              </div>
              {task.completed ? (
                <div className="flex flex-col items-end">
                  <span className="text-orange-500 font-bold text-[10px] uppercase mb-1 flex items-center gap-1">24h Cooldown</span>
                  <span className="text-white/40 text-[10px]">Unlocks at {lockTimeText}</span>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-primary/30 hover:bg-primary/20 hover:text-primary rounded-full shrink-0" 
                  onClick={() => handleUploadClick(task)}
                  disabled={verifyingTask === task.id}
                >
                  {verifyingTask === task.id ? "Verifying..." : <><Upload className="h-4 w-4 mr-2" /> Proof</>}
                </Button>
              )}
            </div>
          </GlassCard>
        )
      })}
    </div>
  )
}
