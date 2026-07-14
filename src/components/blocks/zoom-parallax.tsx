"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

interface ParallaxImage {
  src: string;
  alt: string;
  className?: string;
  index: number;
}

function ParallaxLayer({ src, alt, className, index }: ParallaxImage) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1 + index * 0.1, 1.2 + index * 0.15]);
  const y = useTransform(scrollYProgress, [0, 1], [index * 30, -index * 50]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <motion.div style={{ scale, y }} className={`h-full w-full ${className ?? ""}`}>
        <div className="relative h-full w-full overflow-hidden rounded-2xl">
          <Image src={src} alt={alt} fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        </div>
      </motion.div>
    </div>
  );
}

interface ZoomParallaxProps {
  images: { src: string; alt: string; className?: string }[];
}

export function ZoomParallax({ images }: ZoomParallaxProps) {
  return (
    <div className="relative h-[60vh] overflow-hidden rounded-2xl">
      {images.map((image, i) => (
        <ParallaxLayer key={image.alt} {...image} index={i} />
      ))}
    </div>
  );
}
