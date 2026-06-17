"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Activity as ActivityIcon, Leaf, Trophy, Upload, LogOut, Bot } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";
import { WaterWaveWrapper } from "@/components/ui/water-wave-wrapper";
import { GlassCard } from "@/components/ui/glass-card";
import { Sidebar } from "@/components/ui/sidebar";

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
    <WaterWaveWrapper>
      <div className="flex h-screen bg-transparent text-white overflow-hidden relative z-0">
      <Sidebar activeTab="chat" />

      {/* Main Chat Area */}
      <GlassCard className="flex-1 flex flex-col min-h-0 bg-transparent backdrop-blur-none shadow-[0_0_20px_rgba(255,255,255,0.05),inset_0_0_20px_rgba(255,255,255,0.05)] border-2 border-white/30 rounded-3xl overflow-hidden m-6">
        {/* Header */}
        <header className="h-16 border-b-2 border-white/30 flex items-center px-8 bg-transparent z-10 shrink-0">
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
    </WaterWaveWrapper>
  );
}
