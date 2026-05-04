"use client";

import { motion, useInView, Variant } from "framer-motion";
import { useRef, ReactNode } from "react";

interface MotionViewportProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  duration?: number;
  stagger?: boolean;
  once?: boolean;
}

export const MotionViewport = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = 50,
  duration = 0.8,
  stagger = false,
  once = true,
}: MotionViewportProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: 0.2 });

  const getInitialPosition = () => {
    switch (direction) {
      case "up": return { y: distance, opacity: 0 };
      case "down": return { y: -distance, opacity: 0 };
      case "left": return { x: distance, opacity: 0 };
      case "right": return { x: -distance, opacity: 0 };
      case "none": return { opacity: 0, scale: 0.95 };
      default: return { y: distance, opacity: 0 };
    }
  };

  const variants = {
    hidden: getInitialPosition(),
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1] as const, // Custom cubic-bezier for a more professional "smooth" feel
        ...(stagger && {
          staggerChildren: 0.15,
          delayChildren: delay,
        }),
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};
