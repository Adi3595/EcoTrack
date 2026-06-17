"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import react-water-wave to prevent SSR issues with canvas/WebGL
const WaterWave = dynamic(
  () => import('react-water-wave').then((mod) => mod.default),
  { ssr: false }
);

export function WaterCanvas() {
  const [mounted, setMounted] = useState(false);
  const [imagePath, setImagePath] = useState('');

  useEffect(() => {
    // Ensure absolute path so WebGL can securely fetch it
    setImagePath(window.location.origin + '/bg-dashboard.jpg');
    setMounted(true);
  }, []);

  if (!mounted || !imagePath) {
    return (
      <div 
        className="fixed inset-0 z-[-10] bg-cover bg-center" 
        style={{ backgroundImage: 'url(/bg-dashboard.jpg)' }} 
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[-10] bg-[#001209]">
      <WaterWave
        imageUrl={imagePath}
        dropRadius={40}
        perturbance={0.03}
        resolution={512}
        interactive={true}
        style={{ width: '100%', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {() => <div className="w-full h-full pointer-events-none" />}
      </WaterWave>
    </div>
  );
}
