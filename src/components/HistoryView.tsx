import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { useStore } from "../lib/store";
import { completedInRange, fmtDateFull, startOfDay, timeAgo } from "../lib/care";
import { CARE_META, type CareType } from "../types";
import { Card, EmptyState, TaskIcon, CARE_STYLE } from "./ui";
import { cn } from "../utils/cn";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip);
ChartJS.defaults.font.family = "Manrope, sans-serif";
ChartJS.defaults.font.weight = 600;

const DAY = 86_400_000;

export default function HistoryView() {
  const { data, settings, openDetail } = useStore();
  const [filter, setFilter] = useState<CareType | "all">("all");
  const dark = settings.theme === "dark";
  const grid = dark ? "rgba(250,250,248,0.08)" : "rgba(14,20,17,0.07)";
  const tick = dark ? "rgba(250,250,248,0.55)" : "rgba(14,20,17,0.5)";

  const weekLabels = useMemo(() => {
    const out: { label: string; ts: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const ts = startOfDay(Date.now() - i * DAY);
      out.push({ label: new Date(ts).toLocaleDateString(undefined, { weekday: "short" }), ts });
    }
    return out;
  }, []);

  const barData = useMemo(() => ({
    labels: weekLabels.map((w) => w.label),
    datasets: [
      {
        data: weekLabels.map((w) => completedInRange(data, w.ts, w.ts + DAY)),
        backgroundColor: dark ? "rgba(52,211,153,0.75)" : "rgba(16,185,129,0.8)",
        hoverBackgroundColor: "#059669",
        borderRadius: 8,
        borderSkipped: false as const,
        maxBarThickness: 26,
      },
    ],
  }), [weekLabels, data, dark]);

  const barOpts: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { tooltip: { backgroundColor: dark ? "#1d2821" : "#0e1411", padding: 10, cornerRadius: 12, titleFont: { weight: 700 } } },
    scales: {
      x: { grid: { display: false }, ticks: { color: tick } },
      y: { beginAtZero: true, grid: { color: grid }, ticks: { color: tick, precision: 0 } },
    },
  };

  const typeCounts = useMemo(() => {
    const counts: Record<CareType, number> = { water: 0, fertilize: 0, prune: 0, repot: 0 };
    data.careLog.forEach((e) => { counts[e.type as CareType] = (counts[e.type as CareType] ?? 0) + 1; });
    return counts;
  }, [data]);

  const doughnutData = {
    labels: ["Watering", "Fertilizing", "Pruning", "Repotting"],
    datasets: [
      {
        data: [typeCounts.water, typeCounts.fertilize, typeCounts.prune, typeCounts.repot],
        backgroundColor: ["#10B981", "#84CC16", "#F59E0B", "#14B8A6"],
        borderWidth: 0,
        spacing: 3,
        borderRadius: 6,
      },
    ],
  };
  const doughnutOpts: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: { tooltip: { backgroundColor: dark ? "#1d2821" : "#0e1411", padding: 10, cornerRadius: 12 } },
  };

  const log = useMemo(
    () =>
      data.careLog
        .filter((e) => filter === "all" || e.type === filter)
        .sort((a, b) => b.at - a.at)
        .slice(0, 60),
    [data, filter]
  );

  const allTime = data.careLog.length;
  const thisWeek = completedInRange(data, Date.now() - 7 * DAY, Date.now() + DAY);

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-bark-900 dark:text-cream">Care History</h1>
        <p className="mt-1 text-sm font-semibold text-bark-400">{allTime} tasks completed all time · {thisWeek} this week</p>
      </motion.div>

      {/* charts */}
      <div className="grid gap-3.5 lg:grid-cols-5">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="lg:col-span-3">
          <Card className="p-5">
            <p className="mb-4 text-xs font-extrabold uppercase tracking-wider text-bark-400">Tasks completed · last 7 days</p>
            <div className="h-44">
              <Bar data={barData} options={barOpts} />
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <Card className="flex h-full flex-col items-center p-5">
            <p className="mb-2 self-start text-xs font-extrabold uppercase tracking-wider text-bark-400">Care mix</p>
            <div className="h-40 w-full max-w-[180px]">
              {allTime > 0 ? <Doughnut data={doughnutData} options={doughnutOpts} /> : null}
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1">
              {(["water", "fertilize", "prune", "repot"] as CareType[]).map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-[11px] font-bold text-bark-500 dark:text-cream/60">
                  <span className={cn("size-2 rounded-full", CARE_STYLE[t].dot)} /> {CARE_META[t].label}
                </span>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* filter */}
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {(["all", "water", "fertilize", "prune", "repot"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-xs font-extrabold capitalize transition-all active:scale-95",
              filter === f
                ? "bg-fern-600 text-white shadow-glow"
                : "border border-bark-900/8 bg-white text-bark-600 dark:border-cream/10 dark:bg-bark-800 dark:text-cream/70"
            )}
          >
            {f === "all" ? "All activity" : CARE_META[f].label}
          </button>
        ))}
      </div>

      {/* log */}
      {log.length === 0 ? (
        <Card>
          <EmptyState
            title="Nothing logged yet"
            body="Every time you water, feed, prune or repot, it's recorded here as part of your plant's story."
          />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {log.map((e, i) => {
            const plant = data.plants.find((p) => p.id === e.plantId);
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                className="flex items-center gap-3 rounded-2xl border border-bark-900/6 bg-white p-3 dark:border-cream/8 dark:bg-bark-800"
              >
                {plant ? (
                  <button onClick={() => openDetail(plant.id)} className="size-11 shrink-0 overflow-hidden rounded-xl">
                    <img src={plant.image} alt={plant.name} className="size-full object-cover" loading="lazy" />
                  </button>
                ) : (
                  <TaskIcon type={e.type as CareType} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-bark-900 dark:text-cream">
                    {CARE_META[e.type as CareType].verb}ed {plant?.name ?? "a plant"}
                  </p>
                  <p className="text-xs font-semibold text-bark-400">{fmtDateFull(e.at)} · {timeAgo(e.at)}</p>
                </div>
                <TaskIcon type={e.type as CareType} className="size-9" />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
