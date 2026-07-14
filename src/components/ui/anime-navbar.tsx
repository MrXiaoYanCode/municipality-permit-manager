"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FileCheck, Sparkles, Layers, CreditCard, Building2, LogIn } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

const defaultItems: NavItem[] = [
  { name: "Features", url: "#features", icon: Layers },
  { name: "Industries", url: "#industries", icon: Building2 },
  { name: "Pricing", url: "#pricing", icon: CreditCard },
];

interface AnimeNavBarProps {
  items?: NavItem[];
  defaultActive?: string;
}

export function AnimeNavBar({ items = defaultItems, defaultActive = "Features" }: AnimeNavBarProps) {
  const pathname = usePathname();
  const [active, setActive] = useState(defaultActive);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    if (pathname === "/") return;
    if (pathname.startsWith("/auth")) setActive("Sign In");
  }, [pathname]);

  const highlight = hovered ?? active;

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="container mx-auto">
        <div className="glass-nav flex h-14 items-center justify-between rounded-2xl px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
              <FileCheck className="h-4 w-4 text-primary" />
            </div>
            <span className="hidden sm:inline">PermitFlow</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {items.map((item) => (
              <a
                key={item.name}
                href={item.url}
                onMouseEnter={() => setHovered(item.name)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setActive(item.name)}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  highlight === item.name ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {highlight === item.name && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl bg-primary/10 dark:bg-primary/15"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon className="relative h-4 w-4" />
                <span className="relative">{item.name}</span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex rounded-xl" asChild>
              <Link href="/auth/login">
                <LogIn className="mr-1.5 h-4 w-4" />
                Sign In
              </Link>
            </Button>
            <Button size="sm" className="rounded-xl shadow-sm shadow-primary/20" asChild>
              <Link href="/auth/signup">
                <Sparkles className="mr-1.5 h-4 w-4" />
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
