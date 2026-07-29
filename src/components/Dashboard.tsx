import { motion } from "framer-motion";
import { ArrowRight, BellRing, Check, CheckCircle2, HeartPulse, Leaf, Sparkles } from "lucide-react";
import { useStore } from "../lib/store";
import {
  allTasks,
  completedInRange,
  fmtDateFull,
  greeting,
  greetingEmoji,
  intervalMs,
  lastDoneAt,
  stats,
  todaysTasks,
  dueLabel,
} from "../lib/care";
import { USER_NAME } from "../types";
import { CARE_META, type CareTask } from "../types";
import { Card, EmptyState, HealthDot, ProgressRing, SectionHead, TaskIcon, CARE_STYLE } from "./ui";
import { HomeInstallCard } from "./SettingsView";
import { cn } from "../utils/cn";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

function ringProgress(data: ReturnType<typeof useStore>["data"], t: CareTask) {
  const step = intervalMs(t.plant, t.type);
  const last = lastDoneAt(data, t.plant.id, t.type) ?? t.plant.addedAt;
  if (step <= 0) return 1;
  return Math.min(1, Math.max(0.06, (Date.now() - last) / step));
}

function ScheduleCard({ t, index }: { t: CareTask; index: number }) {
  const { data, completeTask, openDetail } = useStore();
  const style = CARE_STYLE[t.type];
  const urgent = t.status === "overdue" || t.status === "today";
  return (
    <motion.div
      {...fadeUp}
      transition={{ delay: 0.05 * index, type: "spring", damping: 24, stiffness: 300 }}
      className="w-44 shrink-0 snap-start"
    >
      <Card className="flex h-full flex-col p-4">
        <div className="flex items-center justify-between">
          <TaskIcon type={t.type} className="size-9" />
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-extrabold",
              urgent
                ? "bg-rose-500/12 text-rose-600 dark:text-rose-400"
                : "bg-fern-500/12 text-fern-700 dark:text-fern-300"
            )}
          >
            {dueLabel(t)}
          </span>
        </div>
        <div className="my-3 flex justify-center">
          <ProgressRing value={ringProgress(data, t)} color={style.ring} size={76}>
            <button
              onClick={() => openDetail(t.plant.id)}
              aria-label={`Open ${t.plant.name}`}
              className="flex size-11 items-center justify-center overflow-hidden rounded-full"
            >
              <img src={t.plant.image} alt={t.plant.name} className="size-11 rounded-full object-cover" loading="lazy" />
            </button>
          </ProgressRing>
        </div>
        <p className="truncate text-center text-sm font-extrabold text-bark-900 dark:text-cream">{t.plant.name}</p>
        <p className="mb-3 text-center text-xs font-semibold text-bark-400">
          {CARE_META[t.type].noun} · every {t.type === "repot" ? `${t.plant.repotEveryMonths} mo` : `${intervalMs(t.plant, t.type) / 86400000}d`}
        </p>
        <button
          onClick={() => completeTask(t.plant.id, t.type)}
          className="mt-auto flex items-center justify-center gap-1.5 rounded-full bg-fern-600 py-2 text-xs font-bold text-white transition-all hover:bg-fern-700 active:scale-95"
        >
          <Check className="size-3.5" strokeWidth={3} /> Mark done
        </button>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const { data, openDetail, setTab, setNotifOpen, openEditor } = useStore();
  const s = stats(data);
  const today = todaysTasks(data);
  const attention = allTasks(data)
    .filter((t) => t.status === "overdue" || t.plant.health === "attention" || t.plant.health === "unhappy")
    .slice(0, 8);

  const weekDone = completedInRange(data, Date.now() - 7 * 86400000, Date.now() + 86400000);
  const weekTotal = Math.max(weekDone, allTasks(data).length);
  const weekPct = Math.round((weekDone / weekTotal) * 100);

  const statCards = [
    { icon: Leaf, label: "Total plants", value: s.total, cls: "bg-fern-500/12 text-fern-600 dark:text-fern-400" },
    { icon: HeartPulse, label: "Healthy", value: s.healthy, cls: "bg-lime-500/14 text-lime-700 dark:text-lime-400" },
    { icon: CheckCircle2, label: "Done this week", value: s.completedWeek, cls: "bg-sky-500/12 text-sky-600 dark:text-sky-400" },
    { icon: BellRing, label: "Upcoming", value: s.upcoming, cls: "bg-amber-500/14 text-amber-700 dark:text-amber-400" },
  ];

  return (
    <div className="space-y-8">
      {/* native install promo (only when browser offers it) */}
      <HomeInstallCard />

      {/* greeting */}
      <motion.div {...fadeUp}>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-fern-600 dark:text-fern-400">
          {fmtDateFull(Date.now())}
        </p>
        <h1 className="mt-1 font-display text-[34px] font-semibold leading-tight tracking-tight text-bark-900 dark:text-cream">
          {greeting()}, <span className="text-fern-600 dark:text-fern-400">{USER_NAME}</span>{" "}
          <span className="inline-block animate-sway">{greetingEmoji()}</span>
        </h1>
        <p className="mt-1.5 text-[15px] text-bark-400">
          {s.dueToday > 0
            ? `${s.dueToday} care ${s.dueToday === 1 ? "task" : "tasks"} waiting for you today.`
            : "Your jungle is all caught up. Enjoy the calm."}
        </p>
      </motion.div>

      {data.plants.length === 0 ? (
        <Card>
          <EmptyState
            title="Your jungle awaits"
            body="Add your first plant and PlantPal will build a personal watering, feeding and repotting schedule for it."
            actionLabel="Add your first plant"
            onAction={() => openEditor(null)}
          />
        </Card>
      ) : (
        <>
          {/* stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {statCards.map((c, i) => (
              <motion.div key={c.label} {...fadeUp} transition={{ delay: 0.04 * i }}>
                <Card className="flex items-center gap-3 p-4">
                  <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl", c.cls)}>
                    <c.icon className="size-5" strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0">
                    <motion.p
                      key={c.value}
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="font-display text-2xl font-semibold leading-none text-bark-900 dark:text-cream"
                    >
                      {c.value}
                    </motion.p>
                    <p className="mt-1 truncate text-[11px] font-bold text-bark-400">{c.label}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* weekly progress */}
          <motion.div {...fadeUp} transition={{ delay: 0.12 }}>
            <Card className="overflow-hidden p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-bark-400">This week's progress</p>
                  <p className="mt-0.5 font-display text-xl font-semibold text-bark-900 dark:text-cream">
                    {weekDone} <span className="text-bark-400">/ {weekTotal} tasks</span>
                  </p>
                </div>
                <span className="font-display text-3xl font-semibold text-fern-600 dark:text-fern-400">{weekPct}%</span>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-bark-900/8 dark:bg-cream/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${weekPct}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className="h-full rounded-full bg-gradient-to-r from-fern-500 to-lime-500"
                />
              </div>
            </Card>
          </motion.div>

          {/* today's schedule */}
          <div>
            <SectionHead title="Today's Care Schedule" action="See all" onAction={() => setNotifOpen(true)} />
            {today.length === 0 ? (
              <Card className="flex items-center gap-4 p-5">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-fern-500/12 text-fern-600 dark:text-fern-400">
                  <Sparkles className="size-6" />
                </span>
                <div>
                  <p className="font-extrabold text-bark-900 dark:text-cream">Nothing due today</p>
                  <p className="text-sm text-bark-400">Check the calendar for what's coming up next.</p>
                </div>
                <button onClick={() => setTab("calendar")} className="ml-auto text-fern-600 dark:text-fern-400" aria-label="Open calendar">
                  <ArrowRight className="size-5" />
                </button>
              </Card>
            ) : (
              <div className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2">
                {today.map((t, i) => (
                  <ScheduleCard key={`${t.plant.id}-${t.type}`} t={t} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* needing attention */}
          {attention.length > 0 && (
            <div>
              <SectionHead title="Needs Attention" action="See all" onAction={() => setTab("plants")} />
              <div className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2">
                {attention.map((t, i) => (
                  <motion.div key={`${t.plant.id}-${t.type}-att`} {...fadeUp} transition={{ delay: 0.04 * i }} className="w-64 shrink-0 snap-start">
                    <Card onClick={() => openDetail(t.plant.id)} className="flex items-center gap-3 p-3">
                      <div className="relative shrink-0">
                        <img src={t.plant.image} alt={t.plant.name} className="size-14 rounded-2xl object-cover" loading="lazy" />
                        <span className="absolute -bottom-1 -right-1">
                          <HealthDot health={t.plant.health} />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-extrabold text-bark-900 dark:text-cream">{t.plant.name}</p>
                        <p className="truncate text-xs font-semibold text-bark-400">{t.plant.room}</p>
                        <p className={cn("mt-0.5 text-xs font-bold", t.status === "overdue" ? "text-rose-500" : "text-amber-600 dark:text-amber-400")}>
                          {t.type === "water" ? "Watering" : t.type === "fertilize" ? "Feeding" : t.type === "prune" ? "Pruning" : "Repotting"} · {dueLabel(t)}
                        </p>
                      </div>
                      <ArrowRight className="size-4 shrink-0 text-bark-400" />
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
