"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GooeyTextMorphingProps {
  texts: string[];
  className?: string;
  morphDuration?: number;
}

export function GooeyTextMorphing({
  texts,
  className,
  morphDuration = 4,
}: GooeyTextMorphingProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {texts.map((text, i) => (
        <motion.span
          key={text}
          className="absolute inset-0 flex items-center justify-center font-bold"
          initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
          animate={{
            opacity: [0, 1, 1, 0],
            filter: ["blur(10px)", "blur(0px)", "blur(0px)", "blur(10px)"],
            y: [20, 0, 0, -20],
          }}
          transition={{
            duration: morphDuration,
            repeat: Infinity,
            delay: i * (morphDuration / texts.length),
            times: [0, 0.2, 0.8, 1],
            ease: "easeInOut",
          }}
        >
          {text}
        </motion.span>
      ))}
      <span className="invisible">{texts[0]}</span>
    </div>
  );
}
