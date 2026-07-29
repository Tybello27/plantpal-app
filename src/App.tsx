import { AnimatePresence, motion } from "framer-motion";
import { AppProvider, useStore } from "./lib/store";
import { BottomNav, TopBar } from "./components/Nav";
import Dashboard from "./components/Dashboard";
import Plants from "./components/Plants";
import CalendarView from "./components/CalendarView";
import HistoryView from "./components/HistoryView";
import SettingsView, { IOSInstallBanner } from "./components/SettingsView";
import PlantEditor from "./components/PlantEditor";
import PlantDetail from "./components/PlantDetail";
import Notifications from "./components/Notifications";
import { ToastHost } from "./components/ui";

function Ambient() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-32 -top-40 size-[420px] rounded-full bg-fern-500/12 blur-3xl dark:bg-fern-500/8" />
      <div className="absolute -right-40 top-1/3 size-[380px] rounded-full bg-lime-500/10 blur-3xl dark:bg-lime-500/6" />
      <div className="absolute -bottom-48 left-1/4 size-[460px] rounded-full bg-teal-500/8 blur-3xl dark:bg-teal-500/5" />
      {/* drifting leaves */}
      <svg className="absolute left-[8%] top-[22%] size-10 animate-float text-fern-600/20 dark:text-fern-400/15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      </svg>
      <svg className="absolute right-[12%] top-[14%] size-7 animate-float text-lime-600/20 dark:text-lime-400/15" style={{ animationDelay: "1.4s" }} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      </svg>
      <svg className="absolute bottom-[24%] right-[6%] size-12 animate-float text-fern-700/15 dark:text-fern-300/10" style={{ animationDelay: "2.6s" }} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      </svg>
    </div>
  );
}

function Screen() {
  const { tab } = useStore();
  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={tab}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="mx-auto w-full max-w-5xl px-5 pb-36 pt-6"
      >
        {tab === "home" && <Dashboard />}
        {tab === "plants" && <Plants />}
        {tab === "calendar" && <CalendarView />}
        {tab === "history" && <HistoryView />}
        {tab === "settings" && <SettingsView />}
      </motion.main>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-dvh">
        <Ambient />
        <TopBar />
        <div className="pt-4">
          <IOSInstallBanner />
        </div>
        <Screen />
        <BottomNav />
        <PlantEditor />
        <PlantDetail />
        <Notifications />
        <ToastHost />
      </div>
    </AppProvider>
  );
}
