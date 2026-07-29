import type { AppData, CareTask, CareType, Plant } from "../types";

const DAY = 86_400_000;

export const startOfDay = (ts: number) => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export const addDays = (ts: number, days: number) => ts + days * DAY;

export const daysUntil = (ts: number, now = Date.now()) =>
  Math.round((startOfDay(ts) - startOfDay(now)) / DAY);

export const intervalMs = (plant: Plant, type: CareType): number => {
  switch (type) {
    case "water":
      return plant.waterEveryDays * DAY;
    case "fertilize":
      return plant.fertilizeEveryDays * DAY;
    case "prune":
      return plant.pruneEveryDays * DAY;
    case "repot":
      return plant.repotEveryMonths * 30 * DAY;
  }
};

export const isEnabled = (plant: Plant, type: CareType): boolean => {
  if (type === "water") return plant.waterEveryDays > 0;
  if (type === "fertilize") return plant.fertilizeEveryDays > 0;
  if (type === "prune") return plant.pruneEveryDays > 0;
  return plant.repotEveryMonths > 0;
};

export const lastDoneAt = (data: AppData, plantId: string, type: CareType): number | null => {
  let latest: number | null = null;
  for (const e of data.careLog) {
    if (e.plantId === plantId && e.type === type && (latest === null || e.at > latest)) latest = e.at;
  }
  return latest;
};

/** Automatic schedule generator: next due date from interval + last completion. */
export const nextDueAt = (data: AppData, plant: Plant, type: CareType): number => {
  const step = intervalMs(plant, type);
  const last = lastDoneAt(data, plant.id, type);
  const base = last ?? plant.addedAt;
  if (step <= 0) return base;
  let due = base + step;
  // If far overdue, keep the schedule anchored (don't pile up missed cycles).
  const now = Date.now();
  while (due < startOfDay(now) - step && last !== null) due += step;
  return due;
};

export const taskFor = (data: AppData, plant: Plant, type: CareType, now = Date.now()): CareTask => {
  if (!isEnabled(plant, type)) {
    return { plant, type, dueAt: 0, daysUntil: Infinity, status: "disabled" };
  }
  const dueAt = nextDueAt(data, plant, type);
  const d = daysUntil(dueAt, now);
  const status = d < 0 ? "overdue" : d === 0 ? "today" : d <= 3 ? "soon" : "scheduled";
  return { plant, type, dueAt, daysUntil: d, status };
};

export const tasksForPlant = (data: AppData, plant: Plant): CareTask[] =>
  (["water", "fertilize", "prune", "repot"] as CareType[])
    .map((t) => taskFor(data, plant, t))
    .filter((t) => t.status !== "disabled");

export const allTasks = (data: AppData): CareTask[] =>
  data.plants.flatMap((p) => tasksForPlant(data, p));

export const todaysTasks = (data: AppData): CareTask[] =>
  allTasks(data)
    .filter((t) => t.daysUntil <= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil || a.plant.name.localeCompare(b.plant.name));

export const upcomingTasks = (data: AppData, withinDays: number): CareTask[] =>
  allTasks(data)
    .filter((t) => t.daysUntil > 0 && t.daysUntil <= withinDays)
    .sort((a, b) => a.daysUntil - b.daysUntil);

export const overdueCount = (data: AppData) => allTasks(data).filter((t) => t.status === "overdue").length;

/** Tasks due on a specific calendar day (projects repeating schedules forward). */
export const tasksOnDay = (data: AppData, dayTs: number): CareTask[] => {
  const day = startOfDay(dayTs);
  const out: CareTask[] = [];
  for (const plant of data.plants) {
    for (const type of ["water", "fertilize", "prune", "repot"] as CareType[]) {
      if (!isEnabled(plant, type)) continue;
      const step = intervalMs(plant, type);
      let due = nextDueAt(data, plant, type);
      // walk overdue items up to today so they appear on today's cell
      if (due < day) {
        while (due + step < day) due += step;
      }
      for (let i = 0; i < 4 && due <= day + 0; i++) {
        if (startOfDay(due) === day) {
          const d = daysUntil(due);
          out.push({
            plant,
            type,
            dueAt: due,
            daysUntil: d,
            status: d < 0 ? "overdue" : d === 0 ? "today" : d <= 3 ? "soon" : "scheduled",
          });
        }
        due += step;
      }
    }
  }
  return out.sort((a, b) => a.plant.name.localeCompare(b.plant.name));
};

/** Count of care tasks that land inside a month (for calendar dots). */
export const taskCountsByDay = (data: AppData, year: number, month: number): Map<number, number> => {
  const map = new Map<number, number>();
  const first = startOfDay(new Date(year, month, 1).getTime());
  const last = startOfDay(new Date(year, month + 1, 0).getTime());
  for (const plant of data.plants) {
    for (const type of ["water", "fertilize", "prune", "repot"] as CareType[]) {
      if (!isEnabled(plant, type)) continue;
      const step = intervalMs(plant, type);
      let due = nextDueAt(data, plant, type);
      while (due < first && due + step <= last) due += step;
      if (due < first) due = first;
      for (let d = due; startOfDay(d) <= last; d += step) {
        const day = new Date(d).getDate();
        map.set(day, (map.get(day) ?? 0) + 1);
      }
    }
  }
  return map;
};

export const completedOnDay = (data: AppData, dayTs: number) => {
  const day = startOfDay(dayTs);
  return data.careLog.filter((e) => startOfDay(e.at) === day).length;
};

export const completedInRange = (data: AppData, from: number, to: number) =>
  data.careLog.filter((e) => e.at >= from && e.at < to).length;

export const stats = (data: AppData) => {
  const now = Date.now();
  const weekAgo = now - 7 * DAY;
  const healthy = data.plants.filter((p) => p.health === "healthy" || p.health === "thriving").length;
  return {
    total: data.plants.length,
    healthy,
    completedAll: data.careLog.length,
    completedWeek: data.careLog.filter((e) => e.at >= weekAgo).length,
    dueToday: todaysTasks(data).length,
    upcoming: upcomingTasks(data, 7).length,
    overdue: overdueCount(data),
  };
};

/* ---------- formatting helpers ---------- */

export const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });

export const fmtDateFull = (ts: number) =>
  new Date(ts).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

export const timeAgo = (ts: number) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return fmtDate(ts);
};

export const dueLabel = (t: CareTask) => {
  if (t.status === "overdue") return `${Math.abs(t.daysUntil)}d overdue`;
  if (t.status === "today") return "Due today";
  if (t.daysUntil === 1) return "Due tomorrow";
  return `In ${t.daysUntil} days`;
};

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return "Good Night";
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

export const greetingEmoji = () => {
  const h = new Date().getHours();
  if (h < 5) return "🌙";
  if (h < 12) return "🌱";
  if (h < 17) return "🌿";
  return "🪴";
};

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
