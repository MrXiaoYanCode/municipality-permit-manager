"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCheck,
  Sparkles,
  Layers,
  CreditCard,
  Building2,
  LogIn,
  Menu,
  X,
} from "lucide-react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/") return;
    if (pathname.startsWith("/auth")) setActive("Sign In");
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const highlight = hovered ?? active;

  const handleNavClick = (name: string) => {
    setActive(name);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="container mx-auto">
        <div className="glass-nav flex h-14 items-center justify-between gap-2 rounded-2xl px-3 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2 font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
              <FileCheck className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm sm:text-base">PermitFlow</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
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

          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="hidden rounded-xl md:inline-flex" asChild>
              <Link href="/auth/login">
                <LogIn className="mr-1.5 h-4 w-4" />
                Sign In
              </Link>
            </Button>
            <Button size="sm" className="hidden rounded-xl shadow-sm shadow-primary/20 sm:inline-flex" asChild>
              <Link href="/auth/signup">
                <Sparkles className="mr-1.5 h-4 w-4" />
                Get Started
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="glass-nav relative z-50 mt-2 overflow-hidden rounded-2xl lg:hidden"
              >
                <nav className="flex flex-col p-2">
                  {items.map((item) => (
                    <a
                      key={item.name}
                      href={item.url}
                      onClick={() => handleNavClick(item.name)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                        active === item.name
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </a>
                  ))}
                </nav>
                <div className="flex flex-col gap-2 border-t border-border/60 p-3">
                  <Button variant="outline" className="w-full rounded-xl" asChild>
                    <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Link>
                  </Button>
                  <Button className="w-full rounded-xl" asChild>
                    <Link href="/auth/signup" onClick={() => setMobileOpen(false)}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Get Started Free
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
