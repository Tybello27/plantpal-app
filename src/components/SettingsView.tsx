import { motion } from "framer-motion";
import { CheckCircle2, Download, Leaf, Moon, RotateCcw, Share, Sun, Wifi, WifiOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "../lib/store";
import { USER_NAME } from "../types";
import { Card } from "./ui";
import { cn } from "../utils/cn";

const label = "mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-bark-400";

export function IOSInstallBanner() {
  const { isIOS, isStandalone } = useStore();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("plantpal.iosbanner.v1") === "1");
  if (!isIOS || isStandalone || dismissed) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto mb-4 max-w-5xl px-5"
    >
      <div className="flex items-start gap-3 rounded-3xl border border-fern-500/25 bg-fern-500/10 p-4 backdrop-blur">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-fern-600 text-white">
          <Share className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-bark-900 dark:text-cream">Install PlantPal</p>
          <p className="mt-0.5 text-xs font-semibold leading-relaxed text-bark-600 dark:text-cream/70">
            Install PlantPal by tapping the <Share className="inline size-3.5 text-fern-600" /> Share button and selecting{" "}
            <span className="font-extrabold">Add to Home Screen</span>.
          </p>
        </div>
        <button
          onClick={() => {
            setDismissed(true);
            localStorage.setItem("plantpal.iosbanner.v1", "1");
          }}
          className="text-xs font-extrabold text-fern-700 dark:text-fern-300"
        >
          Dismiss
        </button>
      </div>
    </motion.div>
  );
}

export default function SettingsView() {
  const { settings, setTheme, data, resetData, installEvt, promptInstall, installed, isIOS, toast } = useStore();
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plantpal-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Backup downloaded 📦");
  };

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-bark-900 dark:text-cream">Settings</h1>
        <p className="mt-1 text-sm font-semibold text-bark-400">Make PlantPal feel like home.</p>
      </motion.div>

      {/* profile */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02 }}>
        <Card className="flex items-center gap-4 p-5">
          <span className="relative flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fern-400 to-fern-700 font-display text-2xl font-semibold text-white shadow-glow">
            {USER_NAME.charAt(0)}
            <span className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-lime-400 ring-2 ring-white dark:ring-bark-800" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl font-semibold text-bark-900 dark:text-cream">{USER_NAME}</p>
            <p className="text-xs font-bold text-bark-400">Plant parent · {data.plants.length} {data.plants.length === 1 ? "plant" : "plants"}</p>
          </div>
          <span className="rounded-full bg-fern-500/12 px-3 py-1.5 text-[11px] font-extrabold text-fern-700 dark:text-fern-300">
            {data.careLog.length} tasks done
          </span>
        </Card>
      </motion.div>

      {/* appearance */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
        <Card className="p-5">
          <span className={label}>Appearance</span>
          <div className="relative grid grid-cols-2 rounded-full bg-bark-900/6 p-1 dark:bg-cream/8">
            {(["light", "dark"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setTheme(m)}
                className={cn("relative flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-extrabold capitalize", settings.theme === m ? "text-fern-800 dark:text-fern-200" : "text-bark-400")}
              >
                {settings.theme === m && (
                  <motion.span layoutId="theme-seg" className="absolute inset-0 rounded-full bg-white shadow-soft dark:bg-bark-700" transition={{ type: "spring", damping: 30, stiffness: 400 }} />
                )}
                <span className="relative flex items-center gap-2">
                  {m === "light" ? <Sun className="size-4" /> : <Moon className="size-4" />} {m}
                </span>
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* install — rendered only in a real, actionable state */}
      {(installed || installEvt || isIOS) && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Card className="p-5">
            <span className={label}>Install app</span>
            {installed ? (
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-fern-500/12 text-fern-600 dark:text-fern-400">
                  <CheckCircle2 className="size-6" />
                </span>
                <p className="text-sm font-extrabold text-bark-900 dark:text-cream">✓ PlantPal Installed</p>
              </div>
            ) : installEvt ? (
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-fern-500/12 text-fern-600 dark:text-fern-400">
                  <Download className="size-6" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-extrabold text-bark-900 dark:text-cream">Install PlantPal</p>
                  <p className="text-xs font-semibold text-bark-400">Install for faster access and offline use.</p>
                </div>
                <button onClick={promptInstall} className="rounded-full bg-fern-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-glow transition-all hover:bg-fern-700 active:scale-95">
                  Install
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-fern-500/12 text-fern-600 dark:text-fern-400">
                  <Share className="size-6" />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-bark-900 dark:text-cream">Install PlantPal</p>
                  <p className="mt-0.5 text-xs font-semibold leading-relaxed text-bark-400">
                    Tap the Share button in Safari, then choose "Add to Home Screen".
                  </p>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* status + data */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="grid gap-3.5 sm:grid-cols-2">
        <Card className="p-5">
          <span className={label}>Connection</span>
          <div className="flex items-center gap-3">
            <span className={cn("flex size-11 items-center justify-center rounded-2xl", online ? "bg-fern-500/12 text-fern-600 dark:text-fern-400" : "bg-amber-500/14 text-amber-600")}>
              {online ? <Wifi className="size-6" /> : <WifiOff className="size-6" />}
            </span>
            <div>
              <p className="text-sm font-extrabold text-bark-900 dark:text-cream">{online ? "Online" : "Offline mode"}</p>
              <p className="text-xs font-semibold text-bark-400">Your data is always saved on this device.</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <span className={label}>Your data</span>
          <p className="font-display text-2xl font-semibold text-bark-900 dark:text-cream">
            {data.plants.length} <span className="text-base text-bark-400">plants · {data.careLog.length} log entries</span>
          </p>
          <div className="mt-3 flex gap-2">
            <button onClick={exportData} className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-bark-900/10 bg-white py-2.5 text-xs font-extrabold text-bark-700 transition-all active:scale-95 dark:border-cream/10 dark:bg-bark-700 dark:text-cream/80">
              <Download className="size-3.5" /> Export
            </button>
            <button onClick={resetData} className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 py-2.5 text-xs font-extrabold text-amber-700 transition-all active:scale-95 dark:text-amber-400">
              <RotateCcw className="size-3.5" /> Reset demo
            </button>
          </div>
        </Card>
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="pt-2 text-center text-xs font-bold text-bark-400">
        PlantPal v1.0 · crafted with 🌿 · offline-ready PWA
      </motion.p>
    </div>
  );
}

/** Premium install promo — only when the browser actually offers installation. */
export function HomeInstallCard() {
  const { installEvt, installed, promptInstall } = useStore();
  const [hidden, setHidden] = useState(() => localStorage.getItem("plantpal.promo.v1") === "1");
  if (!installEvt || installed || hidden) return null;

  const dismiss = () => {
    setHidden(true);
    localStorage.setItem("plantpal.promo.v1", "1");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", damping: 26, stiffness: 300 }}
      className="mb-7"
    >
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-fern-600 via-fern-700 to-fern-800 p-5 text-white shadow-glow">
        {/* decorative foliage */}
        <Leaf className="pointer-events-none absolute -right-6 -top-8 size-40 rotate-12 text-white/10" strokeWidth={1.2} />
        <Leaf className="pointer-events-none absolute -bottom-10 -left-6 size-32 -rotate-45 text-white/8" strokeWidth={1.2} />
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-white/15 text-white/80 transition-colors hover:bg-white/25"
        >
          <X className="size-4" />
        </button>

        <div className="relative flex items-center gap-4">
          <img
            src={`${import.meta.env.BASE_URL}icons/icon.svg`}
            alt="PlantPal icon"
            className="size-16 shrink-0 rounded-[20px] shadow-lg ring-2 ring-white/30"
          />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-fern-200">
              <Leaf className="size-3.5" /> PlantPal
            </p>
            <h3 className="mt-0.5 font-display text-2xl font-semibold leading-tight">Install PlantPal</h3>
            <p className="mt-1 text-sm font-semibold text-fern-100/90">Use offline and launch like a native app.</p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={promptInstall}
          className="relative mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 text-sm font-extrabold text-fern-800 shadow-lg transition-colors hover:bg-fern-50"
        >
          <Download className="size-4.5" strokeWidth={2.6} /> Install
        </motion.button>
      </div>
    </motion.div>
  );
}
