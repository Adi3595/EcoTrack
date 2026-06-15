"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const slideUp = {
  initial: {
    top: 0
  },
  exit: {
    top: "-100vh",
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 }
  }
}

export function Preloader() {
  const [index, setIndex] = useState(0);
  const [dimension, setDimension] = useState({width: 0, height: 0});

  useEffect(() => {
    setDimension({width: window.innerWidth, height: window.innerHeight})
  }, [])

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if(index === 100) {
      setTimeout(() => setIsLoading(false), 500);
      return;
    }
    setTimeout(() => {
      setIndex(index + 2)
    }, index === 0 ? 100 : 15)
  }, [index])

  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width/2} ${dimension.height + 300} 0 ${dimension.height}  L0 0`
  const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width/2} ${dimension.height} 0 ${dimension.height}  L0 0`

  const curve = {
    initial: {
        d: initialPath,
        transition: {duration: 0.7, ease: [0.76, 0, 0.24, 1]}
    },
    exit: {
        d: targetPath,
        transition: {duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.3}
    }
  }

  // Hide scrollbar during preload
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isLoading]);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div 
          variants={slideUp as any} 
          initial="initial" 
          exit="exit" 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#001209]"
        >
          {dimension.width > 0 && 
          <>
            <motion.p 
              initial={{opacity: 0}} 
              animate={{opacity: 1}} 
              exit={{opacity: 0}}
              transition={{duration: 0.2, ease: "easeOut"}}
              className="text-white text-4xl md:text-6xl font-bold font-sans z-10"
            >
              {index}%
            </motion.p>
          </>
          }
        </motion.div>
      )}
    </AnimatePresence>
  )
}
