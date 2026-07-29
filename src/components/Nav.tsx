import { motion } from "framer-motion";
import { Bell, CalendarDays, History, Home, Leaf, Moon, Plus, Settings, Sprout, Sun } from "lucide-react";
import { useStore } from "../lib/store";
import { todaysTasks } from "../lib/care";
import { USER_NAME, type Tab } from "../types";
import { cn } from "../utils/cn";

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "plants", label: "My Plants", icon: Sprout },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "history", label: "History", icon: History },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-2xl bg-gradient-to-br from-fern-400 to-fern-700 shadow-glow">
        <Leaf className="size-5 text-white" strokeWidth={2.4} />
      </span>
      {!compact && (
        <span className="font-display text-2xl font-semibold tracking-tight text-fern-800 dark:text-fern-300">
          PlantPal
        </span>
      )}
    </div>
  );
}

export function TopBar() {
  const { data, settings, setTheme, setNotifOpen } = useStore();
  const dueToday = todaysTasks(data).length;

  return (
    <header className="sticky top-0 z-30 border-b border-bark-900/5 bg-cream/80 backdrop-blur-xl dark:border-cream/5 dark:bg-bark-950/80">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <Logo />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(settings.theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="flex size-10 items-center justify-center rounded-full border border-bark-900/8 bg-white text-bark-600 transition-all hover:scale-105 active:scale-95 dark:border-cream/10 dark:bg-bark-800 dark:text-cream/80"
          >
            {settings.theme === "dark" ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
          </button>
          <button
            onClick={() => setNotifOpen(true)}
            aria-label="Notifications"
            className="relative flex size-10 items-center justify-center rounded-full border border-bark-900/8 bg-white text-bark-600 transition-all hover:scale-105 active:scale-95 dark:border-cream/10 dark:bg-bark-800 dark:text-cream/80"
          >
            <Bell className="size-4.5" />
            {dueToday > 0 && (
              <motion.span
                key={dueToday}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white ring-2 ring-cream dark:ring-bark-950"
              >
                {dueToday}
              </motion.span>
            )}
          </button>
          <div className="flex items-center gap-2 rounded-full border border-bark-900/8 bg-white py-1 pl-1 pr-3 dark:border-cream/10 dark:bg-bark-800">
            <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-fern-400 to-fern-700 text-sm font-extrabold text-white shadow-glow">
              {USER_NAME.charAt(0)}
            </span>
            <span className="hidden text-sm font-extrabold text-bark-800 sm:block dark:text-cream">{USER_NAME}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const { tab, setTab, openEditor } = useStore();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(env(safe-area-inset-bottom),12px)]">
      <div className="relative mx-auto max-w-md">
        {/* FAB */}
        <motion.button
          whileTap={{ scale: 0.88, rotate: 90 }}
          whileHover={{ scale: 1.06 }}
          onClick={() => openEditor(null)}
          aria-label="Add plant"
          className="absolute -top-7 left-1/2 z-10 flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-fern-500 to-fern-700 text-white shadow-glow ring-4 ring-cream dark:ring-bark-950"
        >
          <Plus className="size-6" strokeWidth={2.6} />
        </motion.button>

        <div className="grid grid-cols-5 rounded-[28px] border border-bark-900/6 bg-white/95 px-2 py-2 shadow-lift backdrop-blur-xl dark:border-cream/8 dark:bg-bark-800/95">
          {TABS.map((t) => {
            const active = tab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative flex flex-col items-center gap-1 rounded-2xl py-1.5 transition-colors",
                  active ? "text-fern-600 dark:text-fern-400" : "text-bark-400 hover:text-bark-600 dark:hover:text-cream/70"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-2xl bg-fern-500/12"
                    transition={{ type: "spring", damping: 28, stiffness: 380 }}
                  />
                )}
                <Icon className="relative size-5" strokeWidth={active ? 2.6 : 2.1} />
                <span className="relative text-[10px] font-bold">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
