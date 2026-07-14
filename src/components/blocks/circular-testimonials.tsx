"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Testimonial {
  quote: string;
  name: string;
  designation: string;
  src: string;
}

interface CircularTestimonialsProps {
  testimonials: Testimonial[];
  autoplay?: boolean;
  interval?: number;
  className?: string;
}

export function CircularTestimonials({
  testimonials,
  autoplay = true,
  interval = 5000,
  className,
}: CircularTestimonialsProps) {
  const [active, setActive] = useState(0);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prev = useCallback(() => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [autoplay, interval, next]);

  const current = testimonials[active];

  return (
    <div className={cn("relative flex flex-col items-center gap-8", className)}>
      <div className="relative h-28 w-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 overflow-hidden rounded-full border-4 border-primary/30 shadow-2xl shadow-primary/20"
          >
            <Image
              src={current.src}
              alt={current.name}
              fill
              className="object-cover"
              sizes="112px"
            />
          </motion.div>
        </AnimatePresence>
        {testimonials.map((_, i) => {
          const angle = (i / testimonials.length) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * 56;
          const y = Math.sin(rad) * 56;
          return (
            <motion.div
              key={i}
              className={cn(
                "absolute h-2.5 w-2.5 rounded-full",
                i === active ? "bg-primary scale-125" : "bg-white/30"
              )}
              style={{ left: `calc(50% + ${x}px - 5px)`, top: `calc(50% + ${y}px - 5px)` }}
              animate={{ scale: i === active ? 1.25 : 1 }}
            />
          );
        })}
      </div>

      <div className="max-w-sm text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            <p className="mb-4 text-sm leading-relaxed text-white/80 italic">
              &ldquo;{current.quote}&rdquo;
            </p>
            <p className="font-semibold text-white">{current.name}</p>
            <p className="text-xs text-white/50">{current.designation}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-2">
        <button
          onClick={prev}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-primary"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={next}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-primary"
          aria-label="Next testimonial"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
