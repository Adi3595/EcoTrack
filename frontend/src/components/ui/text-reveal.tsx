"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  wordMode?: boolean;
}

export const TextReveal: React.FC<TextRevealProps> = ({ text, className = "", delay = 0, wordMode = false }) => {
  const elements = wordMode ? text.split(' ') : text.split('');

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: wordMode ? 0.05 : 0.02, delayChildren: delay },
    }),
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      rotateZ: 0,
      transition: {
        duration: 1,
        ease: [0.76, 0, 0.24, 1]
      },
    },
    hidden: {
      opacity: 0,
      y: 100,
      rotateZ: 5,
    },
  };

  return (
    <motion.span
      className={`inline-flex flex-wrap ${className}`}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      {elements.map((element, index) => (
        <span key={index} className="overflow-hidden inline-flex relative overflow-y-clip">
          <motion.span variants={child} className="inline-block">
            {element === " " ? "\u00A0" : element}
            {wordMode && "\u00A0"}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
};
