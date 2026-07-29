import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Droplets, MapPin, Search, SlidersHorizontal, Sprout, X } from "lucide-react";
import { useStore } from "../lib/store";
import { taskFor, fmtDate } from "../lib/care";
import { CATEGORIES, ROOMS, HEALTHS, type Category, type Health, type Plant, type Room } from "../types";
import { Card, EmptyState, HealthBadge } from "./ui";
import { cn } from "../utils/cn";

function PlantCard({ plant, index }: { plant: Plant; index: number }) {
  const { openDetail, data } = useStore();
  const water = taskFor(data, plant, "water");
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4), type: "spring", damping: 24, stiffness: 300 }}
      layout
    >
      <Card onClick={() => openDetail(plant.id)} className="group overflow-hidden">
        <div className="relative aspect-[4/4.4] overflow-hidden">
          <img
            src={plant.image}
            alt={plant.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <HealthBadge health={plant.health} className="backdrop-blur-md" />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bark-950/45 to-transparent" />
        </div>
        <div className="p-3.5">
          <h3 className="truncate font-display text-[15px] font-semibold text-bark-900 dark:text-cream">{plant.name}</h3>
          <p className="truncate text-xs font-semibold italic text-bark-400">{plant.species}</p>
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-1 text-[11px] font-bold text-bark-400">
              <MapPin className="size-3 shrink-0 text-fern-600 dark:text-fern-400" />
              <span className="truncate">{plant.room}</span>
            </span>
            {water.status !== "disabled" && (
              <span
                className={cn(
                  "flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                  water.daysUntil <= 0
                    ? "bg-rose-500/12 text-rose-600 dark:text-rose-400"
                    : "bg-fern-500/12 text-fern-700 dark:text-fern-300"
                )}
              >
                <Droplets className="size-3" />
                {water.daysUntil <= 0 ? (water.daysUntil === 0 ? "Today" : `${-water.daysUntil}d late`) : fmtDate(water.dueAt)}
              </span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function Plants() {
  const { data, openEditor } = useStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [room, setRoom] = useState<Room | "All">("All");
  const [health, setHealth] = useState<Health | "All">("All");
  const [dueSoon, setDueSoon] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.plants.filter((p) => {
      if (q && !`${p.name} ${p.species} ${p.category} ${p.room}`.toLowerCase().includes(q)) return false;
      if (category !== "All" && p.category !== category) return false;
      if (room !== "All" && p.room !== room) return false;
      if (health !== "All" && p.health !== health) return false;
      if (dueSoon) {
        const w = taskFor(data, p, "water");
        if (w.status === "disabled" || w.daysUntil > 3) return false;
      }
      return true;
    });
  }, [data, query, category, room, health, dueSoon]);

  const hasFilters = category !== "All" || room !== "All" || health !== "All" || dueSoon || query !== "";
  const clear = () => {
    setQuery("");
    setCategory("All");
    setRoom("All");
    setHealth("All");
    setDueSoon(false);
  };

  const selectCls =
    "appearance-none rounded-full border border-bark-900/8 bg-white py-2 pl-3.5 pr-8 text-xs font-bold text-bark-700 shadow-soft outline-none transition-colors focus:border-fern-500 dark:border-cream/10 dark:bg-bark-800 dark:text-cream/80";

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-bark-900 dark:text-cream">My Plants</h1>
          <p className="mt-1 text-sm font-semibold text-bark-400">
            {data.plants.length} {data.plants.length === 1 ? "plant" : "plants"} in your collection
          </p>
        </div>
      </motion.div>

      {/* search */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-bark-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search plants, species, rooms…"
          className="w-full rounded-full border border-bark-900/8 bg-white py-3.5 pl-11 pr-10 text-sm font-semibold text-bark-800 shadow-soft outline-none transition-all placeholder:text-bark-400/70 focus:border-fern-500 focus:ring-4 focus:ring-fern-500/15 dark:border-cream/10 dark:bg-bark-800 dark:text-cream"
        />
        {query && (
          <button onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-bark-400 hover:bg-bark-900/5">
            <X className="size-4" />
          </button>
        )}
      </motion.div>

      {/* filters */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
          {(["All", ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c as Category | "All")}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition-all active:scale-95",
                category === c
                  ? "bg-fern-600 text-white shadow-glow"
                  : "border border-bark-900/8 bg-white text-bark-600 dark:border-cream/10 dark:bg-bark-800 dark:text-cream/70"
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="no-scrollbar -mx-5 flex items-center gap-2 overflow-x-auto px-5">
          <SlidersHorizontal className="size-4 shrink-0 text-bark-400" />
          <select value={room} onChange={(e) => setRoom(e.target.value as Room | "All")} className={selectCls} aria-label="Filter by room">
            <option value="All">All rooms</option>
            {ROOMS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select value={health} onChange={(e) => setHealth(e.target.value as Health | "All")} className={selectCls} aria-label="Filter by health">
            <option value="All">Any health</option>
            {HEALTHS.map((h) => (
              <option key={h.value} value={h.value}>{h.label}</option>
            ))}
          </select>
          <button
            onClick={() => setDueSoon((v) => !v)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition-all active:scale-95",
              dueSoon
                ? "bg-amber-500 text-white shadow-soft"
                : "border border-bark-900/8 bg-white text-bark-600 dark:border-cream/10 dark:bg-bark-800 dark:text-cream/70"
            )}
          >
            Due within 3 days
          </button>
          {hasFilters && (
            <button onClick={clear} className="shrink-0 text-xs font-extrabold text-fern-600 dark:text-fern-400">
              Reset
            </button>
          )}
        </div>
      </motion.div>

      {/* grid */}
      {data.plants.length === 0 ? (
        <Card>
          <EmptyState
            title="No plants yet"
            body="Start your indoor jungle — add a plant with a photo and PlantPal handles the rest."
            actionLabel="Add a plant"
            onAction={() => openEditor(null)}
          />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Search className="size-8" />}
            title="No matches found"
            body="Try adjusting your search or clearing a filter to see more of your collection."
            actionLabel="Clear filters"
            onAction={clear}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p, i) => (
            <PlantCard key={p.id} plant={p} index={i} />
          ))}
        </div>
      )}

      {data.plants.length > 0 && (
        <p className="flex items-center justify-center gap-1.5 pt-2 text-xs font-bold text-bark-400">
          <Sprout className="size-3.5 text-fern-600" /> Tap a plant to view care history & growth
        </p>
      )}
    </div>
  );
}
