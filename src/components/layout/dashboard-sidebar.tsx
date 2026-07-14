"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  FileCheck,
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/permits", label: "Permits", icon: FileText },
  { href: "/inspections", label: "Inspections", icon: Calendar },
  { href: "/compliance", label: "Compliance", icon: ClipboardCheck },
  { href: "/chat", label: "AI Assistant", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <FileCheck className="h-6 w-6 text-primary" />
        <span className="font-bold">PermitFlow</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4 space-y-2">
        <div className="flex items-center justify-between px-3">
          <span className="text-xs text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 rounded-lg border border-border bg-background p-2 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border/60 glass-nav lg:m-3 lg:rounded-2xl lg:min-h-[calc(100vh-1.5rem)]">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col glass-nav lg:hidden m-2 rounded-2xl">
          <SidebarContent />
        </aside>
      )}
    </>
  );
}
