"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface IndustryCarouselProps {
  items: string[];
  className?: string;
  interval?: number;
}

/** Single-word carousel — no overlapping text */
export function IndustryCarousel({
  items,
  className,
  interval = 2800,
}: IndustryCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, interval);
    return () => clearInterval(timer);
  }, [items.length, interval]);

  return (
    <div className={cn("relative mx-auto h-10 w-full max-w-xs sm:h-12 sm:max-w-sm", className)}>
      <AnimatePresence mode="wait">
        <motion.p
          key={items[index]}
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center text-xl font-bold text-primary sm:text-2xl"
        >
          {items[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
