import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EcoTrack | Data-Driven Serenity",
  description: "Advanced environmental stewardship platform. Track, optimize, and reduce your carbon footprint with AI-powered insights for travel, shopping, and daily activities.",
  keywords: ["sustainability", "carbon footprint", "AI", "environment", "eco-friendly", "tracker"],
  authors: [{ name: "EcoTrack Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ecotrack.vercel.app",
    title: "EcoTrack - Your AI Sustainability Coach",
    description: "Track, optimize, and reduce your carbon footprint with AI-powered insights.",
    siteName: "EcoTrack",
  },
  twitter: {
    card: "summary_large_image",
    title: "EcoTrack - Your AI Sustainability Coach",
    description: "Track, optimize, and reduce your carbon footprint with AI-powered insights.",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
};

import { Toaster } from "sonner";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { SmoothScrolling } from "@/components/ui/smooth-scrolling";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${manrope.variable} antialiased bg-surface text-on-surface`}
      >
        <SmoothScrolling>
          <CustomCursor />
          <AnimatedBackground />
          {children}
          <Toaster theme="dark" position="bottom-right" />
        </SmoothScrolling>
      </body>
    </html>
  );
}
