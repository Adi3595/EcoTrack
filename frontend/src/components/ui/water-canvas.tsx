"use client"

import dynamic from "next/dynamic"

// Dynamically import WaterWave with no SSR since it requires window/canvas
// @ts-ignore
const WaterWave = dynamic(
  () => import("react-water-wave").then((mod) => mod.default),
  { ssr: false }
)

export function WaterCanvas({ children }: { children?: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[-10] w-screen h-screen">
      <WaterWave
        imageUrl="/bg-dashboard.jpg"
        resolution={512}
        dropRadius={20}
        perturbance={0.04}
      >
        {() => (
          <div className="absolute inset-0 w-full h-full bg-teal-950/40 mix-blend-multiply" />
        )}
      </WaterWave>
      {children}
    </div>
  )
}
