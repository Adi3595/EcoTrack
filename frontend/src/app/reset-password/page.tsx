"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Invalid Link</h1>
        <p className="text-white/60 mb-8">This password reset link is invalid or missing the security token.</p>
        <Button onClick={() => router.push("/login")}>Go to Login</Button>
      </div>
    );
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    
    setIsLoading(true);
    try {
      await api.post("/auth/reset-password", { token, new_password: password });
      toast.success("Password reset successfully! You can now log in.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Invalid or expired reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      <div className="w-full max-w-md p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
        <h1 className="text-2xl font-bold mb-2 text-center">Set New Password</h1>
        <p className="text-sm text-white/50 text-center mb-8">Enter your new secure password below.</p>
        
        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">New Password</label>
            <input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Min 8 characters"
              disabled={isLoading} 
              required
              className="flex h-10 w-full rounded-lg border border-input dark:border-input/50 bg-background px-3 py-3 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:bg-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 bg-black/50 border-white/10"
            />
          </div>
          <Button type="submit" className="w-full mt-4" disabled={isLoading}>
            {isLoading ? "Saving..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
