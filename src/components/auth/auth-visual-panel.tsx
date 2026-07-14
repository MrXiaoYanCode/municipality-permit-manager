"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const AUTH_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
    alt: "Restaurant interior",
  },
  {
    src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    alt: "Cafe business",
  },
  {
    src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
    alt: "Retail storefront",
  },
];

function ParallaxLayer({
  src,
  alt,
  index,
}: {
  src: string;
  alt: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1 + index * 0.08, 1.15 + index * 0.1]);
  const y = useTransform(scrollYProgress, [0, 1], [index * 20, -index * 30]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.4 + index * 0.15, 1, 0.6]);

  return (
    <div ref={ref} className="absolute inset-0">
      <motion.div style={{ scale, y, opacity }} className="h-full w-full">
        <Image src={src} alt={alt} fill className="object-cover" sizes="50vw" priority={index === 0} />
      </motion.div>
    </div>
  );
}

export function AuthVisualPanel() {
  return (
    <div className="relative h-full min-h-[280px] w-full overflow-hidden lg:min-h-screen">
      {AUTH_IMAGES.map((img, i) => (
        <ParallaxLayer key={img.alt} {...img} index={i} />
      ))}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-background/90 to-background/95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
      </div>
    </div>
  );
}
