"use client";

import dynamic from 'next/dynamic';
import { ReactNode, useEffect, useState } from 'react';

// Dynamically import react-water-wave to prevent SSR issues with WebGL
const WaterWave = dynamic(
  () => import('react-water-wave').then((mod) => mod.default),
  { ssr: false }
);

interface WaterWaveWrapperProps {
  children: ReactNode;
}

export function WaterWaveWrapper({ children }: WaterWaveWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const [imagePath, setImagePath] = useState('');

  useEffect(() => {
    // Ensure absolute path so WebGL can securely fetch it and avoid CORS/path resolution issues
    setImagePath(window.location.origin + '/bg-dashboard.jpg');
    setMounted(true);
  }, []);

  if (!mounted || !imagePath) {
    // Fallback static background before hydration
    return (
      <div 
        className="flex min-h-screen bg-cover bg-center relative z-0" 
        style={{ backgroundImage: 'url(/bg-dashboard.jpg)' }} 
      >
        {children}
      </div>
    );
  }

  return (
    <WaterWave
      imageUrl={imagePath}
      dropRadius={40}       // Massive realistic wake
      perturbance={0.03}    // Strong distortion
      resolution={512}      // High quality ripples
      interactive={true}    // Enable mouse interactions
      style={{ 
        width: '100%', 
        minHeight: '100vh', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed' // Ensure it doesn't scroll away
      }}
    >
      {() => (
        <div className="w-full h-full relative z-10">
          {children}
        </div>
      )}
    </WaterWave>
  );
}
