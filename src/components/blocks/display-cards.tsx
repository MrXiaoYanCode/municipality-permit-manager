"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface DisplayCard {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

interface DisplayCardsProps {
  cards: DisplayCard[];
}

export function DisplayCards({ cards }: DisplayCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          className={cn(
            "group relative overflow-hidden rounded-2xl glass-card p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1",
            card.className
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative">
            <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
              <card.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">{card.title}</h3>
            <p className="text-sm text-muted-foreground">{card.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
