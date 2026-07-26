"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Dumbbell,
  History,
  Library,
  ListOrdered,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Train", icon: Zap },
  { href: "/library", label: "Library", icon: Library },
  { href: "/builder", label: "Builder", icon: ListOrdered },
  { href: "/history", label: "History", icon: History },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/live")) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
      <div className="glass-strong mx-auto flex max-w-lg items-center justify-around gap-1 rounded-2xl px-2 py-2 shadow-[0_-8px_40px_rgb(0_0_0_/0.45)]">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex min-w-[4.25rem] flex-col items-center gap-1 rounded-xl px-3 py-2 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                className={cn("relative z-10 size-5", active && "drop-shadow-[0_0_8px_rgb(57_255_20_/0.7)]")}
                strokeWidth={active ? 2.4 : 2}
              />
              <span className="relative z-10">{label}</span>
            </Link>
          );
        })}
        <Link
          href="/builder"
          className="absolute -top-5 right-6 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_24px_rgb(57_255_20_/0.45)] md:hidden"
          aria-label="Quick builder"
          style={{ display: "none" }}
        >
          <Dumbbell className="size-5" />
        </Link>
      </div>
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLive = pathname.startsWith("/live");

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col md:max-w-2xl lg:max-w-4xl">
      {!isLive && (
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] glass-strong border-b-0! border-x-0! border-t-0!">
          <Link href="/" className="group flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-extrabold tracking-tight text-glow text-primary">
              Pulse
            </span>
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">
              Fit
            </span>
          </Link>
          <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary/90">
            Gym Mode
          </span>
        </header>
      )}
      <main className={cn("flex-1 px-4 pt-4", !isLive && "safe-bottom")}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
