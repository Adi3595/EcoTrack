# 🌟 EcoTrack 3D & Animation Playbook

This document serves as our master reference for the high-end 3D, physics, and animation techniques we developed for EcoTrack. As we build more premium, cinematic websites in the future, we will use these core techniques as our foundation.

## 1. True WebGL Fluid Physics (`react-water-wave`)
**Where we used it:** Dashboard, Upload, Travel, Shopping, and Challenges pages.
**The Technique:**
- Instead of using CSS `backdrop-blur` or DOM elements for ripples (which causes severe browser lagging and layout blinking), we drop a full WebGL canvas in the absolute background.
- We wrap our page content in a `<WaterWaveWrapper>` component.
- The WebGL engine mathematically calculates refraction, wave displacement, and light reflection based on the user's cursor movement, providing an organic, non-shape-based "crystal clear water" effect identical to top-tier agency sites (like the Dynamite site).
- **Pro-tip:** The UI placed on top MUST have a higher `z-index` but should **not** block pointer events from reaching the canvas underneath.

## 2. 3D Parallax Layering & CSS Masking
**Where we used it:** The Landing Page.
**The Technique:**
- We slice an image into multiple layers (e.g., Background, Middle-ground, Foreground/Screen).
- We place the UI/Text *between* the middle and foreground layers to create massive depth.
- Using **GSAP ScrollTrigger**, we animate the layers at slightly different speeds as the user scrolls down, giving a hyper-realistic 3D parallax effect without requiring Three.js.
- **Pro-tip:** Using absolute positioning and `clip-path` or transparent PNG layers is key to making the text look like it's truly emerging from behind an object.

## 3. High-Contrast Dark Glassmorphism
**Where we used it:** Bento box cards across the dashboard.
**The Technique:**
- When placing text over a highly dynamic background (like a fluid simulation), transparent cards are unreadable.
- Instead of fully opaque cards, we use `bg-black/40` (or `bg-black/60`) with `backdrop-blur-none` (to prevent lagging the WebGL canvas).
- We pair this with `font-extrabold` and `drop-shadow-md` on the text to make it pop beautifully over the dark glass.

## 4. Kinetic Typography & Framer Motion
**Where we used it:** Page headers, AI Chat, and lists.
**The Technique:**
- Elements shouldn't just "appear". We use Framer Motion's `variants` with `staggerChildren` to create a cascading reveal effect.
- Text fades in while slightly moving up (`y: 20` to `y: 0`) over `0.5s` to give it weight and momentum.
- **Pro-tip:** Wrap elements in `<AnimatePresence>` for smooth exit animations when states change (like uploading a receipt).

## 5. Zero-Latency Custom Cursors
**Where we used it:** Global Application Cursor.
**The Technique:**
- Hide the default browser cursor with CSS (`cursor-none`).
- Track the mouse via `mousemove` event listeners in a `useEffect`.
- Use Framer Motion's `spring` physics to make the custom cursor trail the actual mouse position smoothly, providing a "heavy", premium feel.
- We change the cursor's size, shape, and blend mode (`mix-blend-difference`) when hovering over specific elements to provide deep interactivity.

---
*We will continue to append new, mind-blowing techniques to this playbook as we conquer more projects!*
