import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, Check, History, MapPin, Pencil, Ruler, Tag, TrendingUp, Trash2 } from "lucide-react";
import { useStore } from "../lib/store";
import { dueLabel, fmtDate, fmtDateFull, lastDoneAt, tasksForPlant, timeAgo } from "../lib/care";
import { CARE_META, type CareType } from "../types";
import { Card, EmptyState, HealthBadge, Sheet, TaskIcon, CARE_STYLE } from "./ui";
import { cn } from "../utils/cn";

type Seg = "care" | "history" | "growth";

export default function PlantDetail() {
  const { data, detailId, closeDetail, openEditor, completeTask, addGrowth, deleteGrowth } = useStore();
  const [seg, setSeg] = useState<Seg>("care");
  const [height, setHeight] = useState("");
  const [note, setNote] = useState("");

  const plant = data.plants.find((p) => p.id === detailId) ?? null;

  const tasks = useMemo(() => (plant ? tasksForPlant(data, plant) : []), [data, plant]);
  const history = useMemo(
    () => (plant ? data.careLog.filter((e) => e.plantId === plant.id).sort((a, b) => b.at - a.at) : []),
    [data, plant]
  );
  const growth = useMemo(
    () => (plant ? data.growth.filter((g) => g.plantId === plant.id).sort((a, b) => a.at - b.at) : []),
    [data, plant]
  );

  if (!plant) return <Sheet open={false} onClose={closeDetail}>{null}</Sheet>;

  const logGrowth = () => {
    const h = parseFloat(height);
    if (!h || h <= 0) return;
    addGrowth(plant.id, h, note.trim() || undefined);
    setHeight("");
    setNote("");
  };

  return (
    <Sheet open={!!detailId} onClose={closeDetail} wide>
      {/* hero */}
      <div className="relative -mx-5 -mt-5 mb-5 h-52 sm:-mx-7 sm:rounded-t-[32px]">
        <img src={plant.image} alt={plant.name} className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bark-950/75 via-bark-950/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
          <div>
            <HealthBadge health={plant.health} className="mb-2 backdrop-blur" />
            <h2 className="font-display text-3xl font-semibold text-white drop-shadow">{plant.name}</h2>
            <p className="text-sm font-semibold italic text-white/80">{plant.species}</p>
          </div>
          <button
            onClick={() => openEditor(plant)}
            className="flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 text-xs font-extrabold text-white backdrop-blur-md transition-all hover:bg-white/30 active:scale-95"
          >
            <Pencil className="size-3.5" /> Edit
          </button>
        </div>
      </div>

      {/* meta chips */}
      <div className="mb-5 flex flex-wrap gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-bark-900/5 px-3 py-1.5 text-xs font-bold text-bark-600 dark:bg-cream/8 dark:text-cream/70">
          <MapPin className="size-3.5 text-fern-600" /> {plant.room}
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-bark-900/5 px-3 py-1.5 text-xs font-bold text-bark-600 dark:bg-cream/8 dark:text-cream/70">
          <Tag className="size-3.5 text-fern-600" /> {plant.category}
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-bark-900/5 px-3 py-1.5 text-xs font-bold text-bark-600 dark:bg-cream/8 dark:text-cream/70">
          <CalendarClock className="size-3.5 text-fern-600" /> Added {fmtDate(plant.addedAt)}
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-bark-900/5 px-3 py-1.5 text-xs font-bold text-bark-600 dark:bg-cream/8 dark:text-cream/70">
          <TrendingUp className="size-3.5 text-fern-600" /> {plant.careLevel}
        </span>
      </div>

      {/* quick actions */}
      <div className="mb-6 grid grid-cols-4 gap-2">
        {tasks.map((t) => {
          const s = CARE_STYLE[t.type];
          return (
            <motion.button
              key={t.type}
              whileTap={{ scale: 0.92 }}
              onClick={() => completeTask(plant.id, t.type)}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-bark-900/6 bg-white p-3 shadow-soft transition-colors hover:border-fern-500/40 dark:border-cream/8 dark:bg-bark-800"
            >
              <TaskIcon type={t.type} className="size-9" />
              <span className="text-[11px] font-extrabold text-bark-700 dark:text-cream/80">{CARE_META[t.type].verb}</span>
              <span className={cn("text-[9px] font-bold", t.daysUntil <= 0 ? "text-rose-500" : "text-bark-400")}>
                {t.daysUntil <= 0 ? "Now" : fmtDate(t.dueAt)}
              </span>
              <span className="sr-only">{s.text}</span>
            </motion.button>
          );
        })}
      </div>

      {/* segmented */}
      <div className="relative mb-5 grid grid-cols-3 rounded-full bg-bark-900/6 p-1 dark:bg-cream/8">
        {(["care", "history", "growth"] as Seg[]).map((s) => (
          <button
            key={s}
            onClick={() => setSeg(s)}
            className={cn("relative rounded-full py-2 text-xs font-extrabold capitalize transition-colors", seg === s ? "text-fern-800 dark:text-fern-200" : "text-bark-400")}
          >
            {seg === s && (
              <motion.span layoutId="detail-seg" className="absolute inset-0 rounded-full bg-white shadow-soft dark:bg-bark-700" transition={{ type: "spring", damping: 30, stiffness: 400 }} />
            )}
            <span className="relative">{s}</span>
          </button>
        ))}
      </div>

      {/* CARE */}
      {seg === "care" && (
        <div className="space-y-3">
          {tasks.map((t) => {
            const last = lastDoneAt(data, plant.id, t.type);
            return (
              <Card key={t.type} className="flex items-center gap-3.5 p-4">
                <TaskIcon type={t.type} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-bark-900 dark:text-cream">{CARE_META[t.type].label}</p>
                  <p className="text-xs font-semibold text-bark-400">
                    {last ? `Last: ${timeAgo(last)}` : "Not done yet"} · every{" "}
                    {t.type === "repot" ? `${plant.repotEveryMonths} mo` : `${t.type === "water" ? plant.waterEveryDays : t.type === "fertilize" ? plant.fertilizeEveryDays : plant.pruneEveryDays}d`}
                  </p>
                </div>
                <div className="text-right">
                  <p className={cn("text-xs font-extrabold", t.daysUntil <= 0 ? "text-rose-500" : "text-fern-700 dark:text-fern-400")}>
                    {dueLabel(t)}
                  </p>
                  <button
                    onClick={() => completeTask(plant.id, t.type)}
                    className="mt-1 flex items-center gap-1 rounded-full bg-fern-500/12 px-3 py-1 text-[11px] font-extrabold text-fern-700 transition-all active:scale-95 dark:text-fern-300"
                  >
                    <Check className="size-3" strokeWidth={3} /> Done
                  </button>
                </div>
              </Card>
            );
          })}
          {plant.notes && (
            <Card className="border-fern-500/20 bg-fern-500/5 p-4">
              <p className="text-xs font-extrabold uppercase tracking-wider text-fern-700 dark:text-fern-400">Notes</p>
              <p className="mt-1.5 text-sm leading-relaxed text-bark-700 dark:text-cream/80">{plant.notes}</p>
            </Card>
          )}
        </div>
      )}

      {/* HISTORY */}
      {seg === "history" && (
        history.length === 0 ? (
          <EmptyState icon={<History className="size-8" />} title="No care logged yet" body="Complete a task and it will show up here as part of this plant's story." />
        ) : (
          <div className="space-y-2.5">
            {history.map((e) => (
              <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 rounded-2xl border border-bark-900/6 bg-white p-3 dark:border-cream/8 dark:bg-bark-800">
                <TaskIcon type={e.type as CareType} className="size-9" />
                <div className="flex-1">
                  <p className="text-sm font-extrabold text-bark-900 dark:text-cream">
                    {CARE_META[e.type as CareType].verb}ed
                  </p>
                  <p className="text-xs font-semibold text-bark-400">{fmtDateFull(e.at)} · {timeAgo(e.at)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}

      {/* GROWTH */}
      {seg === "growth" && (
        <div className="space-y-5">
          <Card className="p-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-bark-400">
              <Ruler className="size-4 text-fern-600" /> Log measurement
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Height (cm)"
                className="w-28 rounded-2xl border border-bark-900/8 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-fern-500 dark:border-cream/10 dark:bg-bark-700 dark:text-cream"
              />
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note (optional)"
                className="flex-1 rounded-2xl border border-bark-900/8 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-fern-500 dark:border-cream/10 dark:bg-bark-700 dark:text-cream"
              />
              <button
                onClick={logGrowth}
                disabled={!height}
                className="rounded-2xl bg-fern-600 px-4 text-sm font-extrabold text-white transition-all enabled:active:scale-95 disabled:opacity-40"
              >
                Add
              </button>
            </div>
          </Card>

          {growth.length === 0 ? (
            <EmptyState icon={<TrendingUp className="size-8" />} title="No measurements yet" body="Track height over time to see how your plant is thriving." />
          ) : (
            <div className="relative pl-6">
              <div className="absolute bottom-2 left-[9px] top-2 w-0.5 rounded bg-fern-500/25" />
              {[...growth].reverse().map((g, i, arr) => {
                const prev = arr[i + 1];
                const diff = prev ? g.heightCm - prev.heightCm : 0;
                return (
                  <motion.div key={g.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="group relative pb-5 last:pb-0">
                    <span className="absolute -left-6 top-1 flex size-5 items-center justify-center rounded-full bg-fern-500 ring-4 ring-cream dark:ring-bark-900">
                      <span className="size-1.5 rounded-full bg-white" />
                    </span>
                    <div className="flex items-center justify-between rounded-2xl border border-bark-900/6 bg-white p-3 dark:border-cream/8 dark:bg-bark-800">
                      <div>
                        <p className="text-sm font-extrabold text-bark-900 dark:text-cream">
                          {g.heightCm} cm
                          {diff > 0 && <span className="ml-2 text-xs font-bold text-lime-600 dark:text-lime-400">+{diff} cm</span>}
                        </p>
                        <p className="text-xs font-semibold text-bark-400">{fmtDateFull(g.at)}{g.note ? ` · ${g.note}` : ""}</p>
                      </div>
                      <button onClick={() => deleteGrowth(g.id)} aria-label="Delete entry" className="rounded-full p-2 text-bark-400 opacity-0 transition-opacity hover:text-rose-500 group-hover:opacity-100">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}
