"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Activity as ActivityIcon, Leaf, Trophy, Upload, LogOut, Bot } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";
import { Shared3DBackground } from "@/components/ui/shared-3d-background";
import { GlassCard } from "@/components/ui/glass-card";

export default function ChatAssistant() {
  const { user, _hasHydrated, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) {
      router.push("/login");
    }
  }, [user, router, _hasHydrated]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!_hasHydrated || !user) return null;

  return (
    <div className="flex h-screen bg-transparent text-white overflow-hidden relative z-0">
      <Shared3DBackground />
      {/* Sidebar */}
      <aside className="w-64 bg-surface-container-low/80 backdrop-blur-xl border-r border-outline-variant/30 flex flex-col p-6 z-20 shrink-0 shadow-2xl shadow-black/50">
        <h2 className="text-headline-md font-bold text-on-surface mb-8 tracking-tight text-primary">EcoTrack</h2>
        <nav className="space-y-2 flex-grow">
          <Button variant="ghost" className="w-full justify-start text-on-surface-variant" asChild>
            <Link href="/dashboard"><ActivityIcon className="mr-3 h-5 w-5" /> Dashboard</Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-on-surface-variant" asChild>
            <Link href="/onboarding"><Leaf className="mr-3 h-5 w-5" /> Impact Profile</Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-primary bg-primary/10" asChild>
            <Link href="/chat"><Bot className="mr-3 h-5 w-5" /> AI Assistant</Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-on-surface-variant" asChild>
            <Link href="/challenges"><Trophy className="mr-3 h-5 w-5" /> Challenges</Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-on-surface-variant" asChild>
            <Link href="/upload"><Upload className="mr-3 h-5 w-5" /> Upload Receipt</Link>
          </Button>
          <Button variant="ghost" className="text-error mt-8 w-full justify-start hover:bg-error/10 hover:text-error" onClick={handleLogout}>
            <LogOut className="mr-3 h-5 w-5" /> Sign Out
          </Button>
        </nav>
      </aside>

      {/* Main Chat Area */}
      <GlassCard className="flex-1 flex flex-col min-h-0 bg-white/5 backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/10 rounded-3xl overflow-hidden m-6">
        {/* Header */}
        <header className="h-16 border-b border-primary/10 flex items-center px-8 bg-[#00180d]/60 backdrop-blur-md z-10 shrink-0">
          <h1 className="text-headline-sm font-semibold flex items-center gap-2 text-white">
            <Bot className="h-5 w-5 text-primary" /> AI Sustainability Coach
          </h1>
        </header>

        {/* Dynamic Chat Component */}
        <div className="flex-1 min-h-0 w-full relative">
          <AnimatedAIChat />
        </div>
      </GlassCard>
    </div>
  );
}
