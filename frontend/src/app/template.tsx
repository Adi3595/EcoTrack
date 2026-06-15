"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{ ease: [0.76, 0, 0.24, 1], duration: 0.8 }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}
