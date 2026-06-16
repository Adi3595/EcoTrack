"use client";

import { Button } from "@/components/ui/button"
import { Activity as ActivityIcon, Leaf, Trophy, Upload as UploadIcon, LogOut, Bot, Bell } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { api } from "@/lib/api"

interface SidebarProps {
  activeTab: 'dashboard' | 'onboarding' | 'chat' | 'challenges' | 'upload' | 'shopping' | 'travel';
}

export function Sidebar({ activeTab }: SidebarProps) {
  const { logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const navItems = [
    { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: ActivityIcon },
    { id: 'shopping', href: '/shopping', label: 'Green Shopping', icon: Leaf },
    { id: 'travel', href: '/travel', label: 'Travel Tracker', icon: Bot },
    { id: 'onboarding', href: '/onboarding', label: 'Impact Profile', icon: Leaf },
    { id: 'chat', href: '/chat', label: 'AI Assistant', icon: Bot },
    { id: 'challenges', href: '/challenges', label: 'Challenges', icon: Trophy },
    { id: 'upload', href: '/upload', label: 'Upload Receipt', icon: UploadIcon },
  ]

  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    // Request permission and fetch initial notifications
    const initNotifications = async () => {
      try {
        const { requestFirebaseNotificationPermission, onMessageListener } = await import('@/lib/firebase');
        await requestFirebaseNotificationPermission()
        
        onMessageListener().then((payload: any) => {
          setNotifications(prev => [payload.notification, ...prev])
        }).catch(err => console.log('failed: ', err))
        
        const res = await api.get('/notifications/')
        setNotifications(res.data)
      } catch (e) {
        console.error(e)
      }
    }
    initNotifications()
  }, [])

  return (
    <aside className="w-64 bg-white/5 backdrop-blur-3xl border-r border-white/10 shadow-[inset_-1px_0_1px_rgba(255,255,255,0.05)] hidden md:flex flex-col p-6 z-10 shrink-0 relative">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Eco<span className="text-primary drop-shadow-[0_0_10px_rgba(149,212,179,0.5)]">Track</span>
        </h2>
        
        <div className="relative">
          <Button variant="ghost" size="icon" className="relative rounded-full text-white/70 hover:bg-white/10" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />}
          </Button>
          
          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-[#001209] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="p-4 border-b border-white/5 bg-white/5 font-bold">Notifications</div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-white/50 text-center">No new notifications</div>
                ) : (
                  notifications.map((n, i) => (
                    <div key={n.id || i} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                      <p className="font-bold text-sm text-primary mb-1">{n.title}</p>
                      <p className="text-xs text-white/70">{n.message || n.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <nav className="space-y-2 flex-grow">
        {navItems.map((item) => (
          <Button 
            key={item.id}
            variant="ghost" 
            className={`w-full justify-start transition-all duration-300 ${
              activeTab === item.id 
                ? 'text-primary bg-primary/10 border-r-2 border-primary shadow-[inset_0_0_20px_rgba(149,212,179,0.1)]' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`} 
            asChild
          >
            <Link href={item.href}>
              <item.icon className="mr-3 h-5 w-5" /> 
              {item.label}
            </Link>
          </Button>
        ))}
        
        <Button 
          variant="ghost" 
          className="text-red-400 hover:text-red-300 hover:bg-red-400/10 mt-8 w-full justify-start transition-all" 
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" /> Sign Out
        </Button>
      </nav>
    </aside>
  )
}
