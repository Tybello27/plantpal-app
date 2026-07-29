import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "../lib/store";
import { completedOnDay, dueLabel, startOfDay, tasksOnDay, todaysTasks, upcomingTasks } from "../lib/care";
import type { CareTask } from "../types";
import { Card, EmptyState, TaskIcon, CARE_STYLE } from "./ui";
import { cn } from "../utils/cn";

type Seg = "day" | "week" | "month";
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function TaskRow({ t }: { t: CareTask }) {
  const { completeTask, openDetail } = useStore();
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-bark-900/6 bg-white p-3 dark:border-cream/8 dark:bg-bark-800">
      <button onClick={() => openDetail(t.plant.id)} className="size-11 shrink-0 overflow-hidden rounded-xl">
        <img src={t.plant.image} alt={t.plant.name} className="size-full object-cover" loading="lazy" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold text-bark-900 dark:text-cream">{t.plant.name}</p>
        <p className="flex items-center gap-1.5 text-xs font-semibold text-bark-400">
          <TaskIcon type={t.type} boxed={false} /> {t.type === "water" ? "Watering" : t.type === "fertilize" ? "Fertilizing" : t.type === "prune" ? "Pruning" : "Repotting"}
        </p>
      </div>
      <div className="text-right">
        <p className={cn("text-[11px] font-extrabold", t.daysUntil <= 0 ? "text-rose-500" : "text-bark-400")}>{dueLabel(t)}</p>
        <button
          onClick={() => completeTask(t.plant.id, t.type)}
          className="mt-1 flex items-center gap-1 rounded-full bg-fern-500/12 px-3 py-1 text-[11px] font-extrabold text-fern-700 transition-all active:scale-95 dark:text-fern-300"
        >
          <Check className="size-3" strokeWidth={3} /> Done
        </button>
      </div>
    </div>
  );
}

export default function CalendarView() {
  const { data } = useStore();
  const [seg, setSeg] = useState<Seg>("day");
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState(() => startOfDay(Date.now()));

  const today = startOfDay(Date.now());

  const dayMap = useMemo(() => {
    const map = new Map<number, CareTask[]>();
    const last = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= last; d++) {
      const ts = new Date(month.getFullYear(), month.getMonth(), d).getTime();
      const tasks = tasksOnDay(data, ts);
      if (tasks.length) map.set(d, tasks);
    }
    return map;
  }, [data, month]);

  const firstWeekday = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selectedTasks = dayMap.get(new Date(selected).getDate()) ?? [];
  const doneOnSelected = completedOnDay(data, selected);

  const weekGroups = useMemo(() => {
    const all = [...todaysTasks(data), ...upcomingTasks(data, 7)];
    const groups = new Map<string, CareTask[]>();
    for (const t of all) {
      const label = t.daysUntil < 0 ? "Overdue" : t.daysUntil === 0 ? "Today" : t.daysUntil === 1 ? "Tomorrow" : new Date(t.dueAt).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
      groups.set(label, [...(groups.get(label) ?? []), t]);
    }
    return [...groups.entries()];
  }, [data]);

  const monthLabel = month.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-bark-900 dark:text-cream">Care Planner</h1>
        <p className="mt-1 text-sm font-semibold text-bark-400">Every watering, feeding and repot — mapped out.</p>
      </motion.div>

      {/* segmented */}
      <div className="relative grid grid-cols-3 rounded-full bg-bark-900/6 p-1 dark:bg-cream/8">
        {(["day", "week", "month"] as Seg[]).map((s) => (
          <button key={s} onClick={() => setSeg(s)} className={cn("relative rounded-full py-2.5 text-xs font-extrabold capitalize", seg === s ? "text-fern-800 dark:text-fern-200" : "text-bark-400")}>
            {seg === s && <motion.span layoutId="cal-seg" className="absolute inset-0 rounded-full bg-white shadow-soft dark:bg-bark-700" transition={{ type: "spring", damping: 30, stiffness: 400 }} />}
            <span className="relative">{s === "day" ? "Daily" : s === "week" ? "Weekly" : "Monthly"}</span>
          </button>
        ))}
      </div>

      {/* calendar grid */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month" className="flex size-9 items-center justify-center rounded-full bg-bark-900/5 text-bark-600 transition-all hover:bg-bark-900/10 active:scale-90 dark:bg-cream/10 dark:text-cream/80">
              <ChevronLeft className="size-4.5" />
            </button>
            <p className="font-display text-lg font-semibold text-bark-900 dark:text-cream">{monthLabel}</p>
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month" className="flex size-9 items-center justify-center rounded-full bg-bark-900/5 text-bark-600 transition-all hover:bg-bark-900/10 active:scale-90 dark:bg-cream/10 dark:text-cream/80">
              <ChevronRight className="size-4.5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((w, i) => (
              <span key={i} className="pb-1 text-[10px] font-extrabold uppercase text-bark-400">{w}</span>
            ))}
            {cells.map((d, i) => {
              if (d === null) return <span key={`b${i}`} />;
              const ts = new Date(month.getFullYear(), month.getMonth(), d).getTime();
              const isToday = ts === today;
              const isSel = ts === selected;
              const tasks = dayMap.get(d) ?? [];
              const dots = [...new Set(tasks.map((t) => t.type))].slice(0, 3);
              return (
                <button
                  key={d}
                  onClick={() => { setSelected(ts); setSeg("day"); }}
                  className={cn(
                    "relative mx-auto flex size-10 flex-col items-center justify-center rounded-2xl text-sm font-bold transition-all active:scale-90 sm:size-11",
                    isSel ? "bg-fern-600 text-white shadow-glow" : isToday ? "bg-fern-500/15 text-fern-700 dark:text-fern-300" : "text-bark-700 hover:bg-bark-900/5 dark:text-cream/80 dark:hover:bg-cream/8"
                  )}
                >
                  {d}
                  <span className="mt-0.5 flex h-1.5 gap-0.5">
                    {dots.map((t) => (
                      <span key={t} className={cn("size-1.5 rounded-full", isSel ? "bg-white" : CARE_STYLE[t].dot)} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* day detail */}
      {seg === "day" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-display text-lg font-semibold text-bark-900 dark:text-cream">
              {new Date(selected).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </h3>
            {doneOnSelected > 0 && <span className="text-xs font-extrabold text-fern-600 dark:text-fern-400">{doneOnSelected} completed</span>}
          </div>
          {selectedTasks.length === 0 ? (
            <Card><EmptyState title="A rest day" body="No care tasks scheduled for this day — your plants are self-sufficient." /></Card>
          ) : (
            selectedTasks.map((t, i) => (
              <motion.div key={`${t.plant.id}-${t.type}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <TaskRow t={t} />
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* week */}
      {seg === "week" && (
        <div className="space-y-5">
          {weekGroups.length === 0 ? (
            <Card><EmptyState title="Quiet week ahead" body="No reminders in the next 7 days." /></Card>
          ) : (
            weekGroups.map(([label, tasks]) => (
              <div key={label}>
                <p className={cn("mb-2 px-1 text-xs font-extrabold uppercase tracking-wider", label === "Overdue" ? "text-rose-500" : "text-bark-400")}>{label}</p>
                <div className="space-y-2.5">
                  {tasks.map((t) => <TaskRow key={`${t.plant.id}-${t.type}-${label}`} t={t} />)}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* month */}
      {seg === "month" && (
        <div className="space-y-2.5">
          {dayMap.size === 0 ? (
            <Card><EmptyState title="Empty month" body="No scheduled care this month." /></Card>
          ) : (
            [...dayMap.entries()].map(([d, tasks]) => (
              <button
                key={d}
                onClick={() => { setSelected(new Date(month.getFullYear(), month.getMonth(), d).getTime()); setSeg("day"); }}
                className="flex w-full items-center gap-3 rounded-2xl border border-bark-900/6 bg-white p-3.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-soft dark:border-cream/8 dark:bg-bark-800"
              >
                <span className="flex size-11 flex-col items-center justify-center rounded-xl bg-fern-500/12 text-fern-700 dark:text-fern-300">
                  <span className="text-[9px] font-extrabold uppercase">{month.toLocaleDateString(undefined, { month: "short" })}</span>
                  <span className="text-base font-extrabold leading-none">{d}</span>
                </span>
                <span className="flex gap-1">
                  {[...new Set(tasks.map((t) => t.type))].map((t) => (
                    <TaskIcon key={t} type={t} className="size-8" />
                  ))}
                </span>
                <span className="ml-auto text-xs font-extrabold text-bark-400">{tasks.length} {tasks.length === 1 ? "task" : "tasks"}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
