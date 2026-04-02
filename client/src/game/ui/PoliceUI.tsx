/**
 * Police tape decorative component — yellow/black striped banner.
 * Design: Arcade Urbaine — Bangers font, bold yellow/black stripes
 */
import { motion } from "framer-motion";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive" };

interface PoliceTapeProps {
  children?: React.ReactNode;
  className?: string;
}

export function PoliceTape({ children, className = "" }: PoliceTapeProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Striped background */}
      <div
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(
            -45deg,
            #FBBF24,
            #FBBF24 20px,
            #000 20px,
            #000 40px
          )`,
        }}
      />
      {/* Content overlay */}
      <div
        className="relative z-10 px-6 py-2 text-center font-bold text-black"
        style={FONT_BANGERS}
      >
        {children}
      </div>
    </div>
  );
}

export function AnimatedPoliceTape({ children, className = "" }: PoliceTapeProps) {
  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      className={className}
    >
      <PoliceTape>{children}</PoliceTape>
    </motion.div>
  );
}
