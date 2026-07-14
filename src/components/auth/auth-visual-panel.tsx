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
  const scale = useTransform(scrollYProgress, [0, 1], [1 + index * 0.05, 1.1 + index * 0.08]);
  const y = useTransform(scrollYProgress, [0, 1], [index * 15, -index * 20]);

  return (
    <div ref={ref} className="absolute inset-0">
      <motion.div style={{ scale, y }} className="h-full w-full">
        <Image src={src} alt={alt} fill className="object-cover opacity-40" sizes="50vw" priority={index === 0} />
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
      {/* Dark overlay — ensures white text is always readable */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/92 via-slate-900/88 to-slate-950/95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_oklch(0.55_0.2_260_/_0.25),_transparent_60%)]" />
      {/* Subtle grid on auth panel */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
    </div>
  );
}
