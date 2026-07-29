import { useMemo } from "react";
import { motion } from "framer-motion";
import { BellOff, Check } from "lucide-react";
import { useStore } from "../lib/store";
import { dueLabel, todaysTasks, upcomingTasks } from "../lib/care";
import type { CareTask } from "../types";
import { Sheet, TaskIcon } from "./ui";
import { cn } from "../utils/cn";

function Row({ t, i }: { t: CareTask; i: number }) {
  const { completeTask, openDetail, setNotifOpen } = useStore();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(i * 0.03, 0.3) }}
      className="flex items-center gap-3 rounded-2xl border border-bark-900/6 bg-white p-3 dark:border-cream/8 dark:bg-bark-800"
    >
      <TaskIcon type={t.type} />
      <button
        onClick={() => {
          openDetail(t.plant.id);
          setNotifOpen(false);
        }}
        className="min-w-0 flex-1 text-left"
      >
        <p className="truncate text-sm font-extrabold text-bark-900 dark:text-cream">{t.plant.name}</p>
        <p className="text-xs font-semibold text-bark-400">
          {t.type === "water" ? "Watering" : t.type === "fertilize" ? "Fertilizing" : t.type === "prune" ? "Pruning" : "Repotting"} · {t.plant.room}
        </p>
      </button>
      <div className="text-right">
        <p className={cn("text-[11px] font-extrabold", t.daysUntil < 0 ? "text-rose-500" : t.daysUntil === 0 ? "text-amber-600 dark:text-amber-400" : "text-bark-400")}>
          {dueLabel(t)}
        </p>
        <button
          onClick={() => completeTask(t.plant.id, t.type)}
          className="mt-1 flex items-center gap-1 rounded-full bg-fern-500/12 px-3 py-1 text-[11px] font-extrabold text-fern-700 transition-all active:scale-95 dark:text-fern-300"
        >
          <Check className="size-3" strokeWidth={3} /> Done
        </button>
      </div>
    </motion.div>
  );
}

export default function Notifications() {
  const { data, notifOpen, setNotifOpen } = useStore();

  const { overdue, today, week, later } = useMemo(() => {
    const t = todaysTasks(data);
    return {
      overdue: t.filter((x) => x.daysUntil < 0),
      today: t.filter((x) => x.daysUntil === 0),
      week: upcomingTasks(data, 7),
      later: upcomingTasks(data, 30).filter((x) => x.daysUntil > 7),
    };
  }, [data]);

  const total = overdue.length + today.length + week.length + later.length;

  const sections: { title: string; items: CareTask[]; cls: string }[] = [
    { title: "Overdue", items: overdue, cls: "text-rose-500" },
    { title: "Today", items: today, cls: "text-amber-600 dark:text-amber-400" },
    { title: "This week", items: week, cls: "text-fern-700 dark:text-fern-400" },
    { title: "Later this month", items: later, cls: "text-bark-400" },
  ];

  return (
    <Sheet open={notifOpen} onClose={() => setNotifOpen(false)}>
      <h2 className="mb-1 pr-10 font-display text-2xl font-semibold text-bark-900 dark:text-cream">Notifications</h2>
      <p className="mb-5 text-sm font-semibold text-bark-400">
        {total > 0 ? `${total} upcoming ${total === 1 ? "reminder" : "reminders"}` : "You're all caught up"}
      </p>

      {total === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <span className="mb-4 flex size-16 items-center justify-center rounded-3xl bg-fern-500/12 text-fern-600 dark:text-fern-400">
            <BellOff className="size-7" />
          </span>
          <p className="font-display text-lg font-semibold text-bark-900 dark:text-cream">All quiet in the jungle</p>
          <p className="mt-1 max-w-[220px] text-sm font-semibold text-bark-400">New reminders will appear here as schedules come due.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {sections.filter((s) => s.items.length > 0).map((s) => (
            <div key={s.title}>
              <p className={cn("mb-2 text-xs font-extrabold uppercase tracking-wider", s.cls)}>
                {s.title} · {s.items.length}
              </p>
              <div className="space-y-2.5">
                {s.items.map((t, i) => (
                  <Row key={`${t.plant.id}-${t.type}`} t={t} i={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
}
