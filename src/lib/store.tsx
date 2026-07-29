import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AppData, CareType, GrowthEntry, Plant, Settings, Tab } from "../types";
import { CARE_META, PRESET_PHOTOS } from "../types";
import { uid } from "./care";

const DATA_KEY = "plantpal.data.v1";
const SETTINGS_KEY = "plantpal.settings.v1";
const DAY = 86_400_000;

/* ---------------- seed data ---------------- */

function seedData(): AppData {
  const now = Date.now();
  const d = (days: number) => now - days * DAY;

  const plants: Plant[] = [
    { id: "p-ficus", name: "Ficus Kinki", species: "Ficus microcarpa", category: "Foliage", room: "Living Room", careLevel: "Easy care", health: "healthy", image: PRESET_PHOTOS[0].url, waterEveryDays: 7, fertilizeEveryDays: 30, pruneEveryDays: 45, repotEveryMonths: 12, addedAt: d(120) },
    { id: "p-calathea", name: "Calathea Orbifolia", species: "Goeppertia orbifolia", category: "Tropical", room: "Bathroom", careLevel: "High maintenance", health: "attention", image: PRESET_PHOTOS[1].url, waterEveryDays: 4, fertilizeEveryDays: 21, pruneEveryDays: 0, repotEveryMonths: 12, addedAt: d(95) },
    { id: "p-begonia", name: "Begonia Maculata", species: "Begonia maculata", category: "Flowering", room: "Office", careLevel: "Moderate", health: "thriving", image: PRESET_PHOTOS[2].url, waterEveryDays: 6, fertilizeEveryDays: 14, pruneEveryDays: 30, repotEveryMonths: 10, addedAt: d(80) },
    { id: "p-echeveria", name: "Echeveria Lola", species: "Echeveria 'Lola'", category: "Succulent", room: "Balcony", careLevel: "Easy care", health: "healthy", image: PRESET_PHOTOS[3].url, waterEveryDays: 14, fertilizeEveryDays: 60, pruneEveryDays: 0, repotEveryMonths: 24, addedAt: d(200) },
    { id: "p-palm", name: "Areca Palm", species: "Dypsis lutescens", category: "Tropical", room: "Living Room", careLevel: "Moderate", health: "healthy", image: PRESET_PHOTOS[6].url, waterEveryDays: 5, fertilizeEveryDays: 30, pruneEveryDays: 40, repotEveryMonths: 12, addedAt: d(150) },
    { id: "p-spider", name: "Spider Plant", species: "Chlorophytum comosum", category: "Foliage", room: "Kitchen", careLevel: "Easy care", health: "thriving", image: PRESET_PHOTOS[8].url, waterEveryDays: 8, fertilizeEveryDays: 28, pruneEveryDays: 50, repotEveryMonths: 12, addedAt: d(60) },
  ];

  const careLog: AppData["careLog"] = [];
  const push = (plantId: string, type: CareType, daysAgo: number) =>
    careLog.push({ id: uid(), plantId, type, at: d(daysAgo) });

  // watering history (last value defines next due date)
  [16, 9, 7].forEach((x) => push("p-ficus", "water", x + 7));
  push("p-ficus", "water", 7); // due today
  [21, 17, 13, 9, 5].forEach((x) => push("p-calathea", "water", x)); // 1 day overdue
  [27, 21, 15, 9, 3].forEach((x) => push("p-begonia", "water", x));
  [48, 34, 20, 6].forEach((x) => push("p-echeveria", "water", x));
  [25, 20, 15, 10, 5].forEach((x) => push("p-palm", "water", x)); // due today
  [26, 18, 10, 2].forEach((x) => push("p-spider", "water", x));

  // fertilizing + pruning history
  push("p-ficus", "fertilize", 24);
  push("p-begonia", "fertilize", 16); // overdue
  push("p-calathea", "fertilize", 12);
  push("p-palm", "fertilize", 28);
  push("p-spider", "fertilize", 20);
  push("p-begonia", "prune", 18);
  push("p-ficus", "prune", 40);
  push("p-palm", "repot", 300);

  const growth: GrowthEntry[] = [
    { id: uid(), plantId: "p-ficus", at: d(110), heightCm: 42 },
    { id: uid(), plantId: "p-ficus", at: d(75), heightCm: 47 },
    { id: uid(), plantId: "p-ficus", at: d(40), heightCm: 53 },
    { id: uid(), plantId: "p-ficus", at: d(8), heightCm: 58, note: "New leaf unfurled" },
    { id: uid(), plantId: "p-calathea", at: d(88), heightCm: 30 },
    { id: uid(), plantId: "p-calathea", at: d(50), heightCm: 34 },
    { id: uid(), plantId: "p-calathea", at: d(14), heightCm: 37 },
    { id: uid(), plantId: "p-begonia", at: d(70), heightCm: 25 },
    { id: uid(), plantId: "p-begonia", at: d(20), heightCm: 31, note: "Polka-dot leaves multiplying" },
  ];

  return { plants, careLog, growth };
}

/* ---------------- persistence ---------------- */

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppData;
      if (parsed && Array.isArray(parsed.plants)) return parsed;
    }
  } catch {
    /* corrupted — reseed */
  }
  return seedData();
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as Settings;
  } catch {
    /* ignore */
  }
  const prefersDark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return { theme: prefersDark ? "dark" : "light" };
}

/* ---------------- PWA install ---------------- */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface Toast {
  id: string;
  msg: string;
  kind: "success" | "info" | "warn";
}

interface Store {
  data: AppData;
  settings: Settings;
  tab: Tab;
  setTab: (t: Tab) => void;
  editorOpen: boolean;
  editingPlant: Plant | null;
  openEditor: (p?: Plant | null) => void;
  closeEditor: () => void;
  detailId: string | null;
  openDetail: (id: string) => void;
  closeDetail: () => void;
  notifOpen: boolean;
  setNotifOpen: (v: boolean) => void;
  addPlant: (p: Omit<Plant, "id" | "addedAt">) => void;
  updatePlant: (p: Plant) => void;
  deletePlant: (id: string) => void;
  completeTask: (plantId: string, type: CareType, note?: string) => void;
  addGrowth: (plantId: string, heightCm: number, note?: string) => void;
  deleteGrowth: (id: string) => void;
  setTheme: (t: "light" | "dark") => void;
  resetData: () => void;
  toasts: Toast[];
  toast: (msg: string, kind?: Toast["kind"]) => void;
  installEvt: BeforeInstallPromptEvent | null;
  promptInstall: () => void;
  isIOS: boolean;
  isStandalone: boolean;
  installed: boolean;
}

const Ctx = createContext<Store | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [tab, setTab] = useState<Tab>("home");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [installEvt, setInstallEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const timers = useRef<Record<string, number>>({});

  useEffect(() => {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings]);

  const [installed, setInstalled] = useState<boolean>(
    () =>
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true
  );

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvt(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const toast = useCallback((msg: string, kind: Toast["kind"] = "success") => {
    const id = uid();
    setToasts((t) => [...t, { id, msg, kind }]);
    timers.current[id] = window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
      delete timers.current[id];
    }, 2600);
  }, []);

  const openEditor = useCallback((p?: Plant | null) => {
    setEditingPlant(p ?? null);
    setEditorOpen(true);
  }, []);

  const addPlant: Store["addPlant"] = useCallback(
    (p) => {
      const plant: Plant = { ...p, id: uid(), addedAt: Date.now() };
      setData((d) => ({ ...d, plants: [plant, ...d.plants] }));
      toast(`${plant.name} added to your jungle 🌿`);
    },
    [toast]
  );

  const updatePlant: Store["updatePlant"] = useCallback((p) => {
    setData((d) => ({ ...d, plants: d.plants.map((x) => (x.id === p.id ? p : x)) }));
  }, []);

  const deletePlant: Store["deletePlant"] = useCallback(
    (id) => {
      setData((d) => ({
        ...d,
        plants: d.plants.filter((p) => p.id !== id),
        careLog: d.careLog.filter((e) => e.plantId !== id),
        growth: d.growth.filter((g) => g.plantId !== id),
      }));
      setDetailId(null);
      toast("Plant removed", "info");
    },
    [toast]
  );

  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const completeTask: Store["completeTask"] = useCallback(
    (plantId, type, note) => {
      const plant = dataRef.current.plants.find((p) => p.id === plantId);
      const entry = { id: uid(), plantId, type, at: Date.now(), note };
      setData((d) => ({ ...d, careLog: [...d.careLog, entry] }));
      if (plant) toast(`${CARE_META[type].verb}ed ${plant.name} ✓`);
    },
    [toast]
  );

  const addGrowth: Store["addGrowth"] = useCallback(
    (plantId, heightCm, note) => {
      setData((d) => ({ ...d, growth: [...d.growth, { id: uid(), plantId, at: Date.now(), heightCm, note }] }));
      toast("Growth logged 📏");
    },
    [toast]
  );

  const deleteGrowth: Store["deleteGrowth"] = useCallback((id) => {
    setData((d) => ({ ...d, growth: d.growth.filter((g) => g.id !== id) }));
  }, []);

  const setTheme = useCallback((t: "light" | "dark") => setSettings((s) => ({ ...s, theme: t })), []);

  const resetData = useCallback(() => {
    setData(seedData());
    toast("Demo garden restored", "info");
  }, [toast]);

  const promptInstall = useCallback(() => {
    if (!installEvt) return;
    installEvt.prompt();
    installEvt.userChoice.then((c) => {
      if (c.outcome === "accepted") {
        setInstalled(true);
        toast("PlantPal installed 🎉");
      }
      setInstallEvt(null);
    });
  }, [installEvt, toast]);

  const isIOS = useMemo(() => {
    const ua = navigator.userAgent;
    const touchMac = /macintosh/i.test(ua) && navigator.maxTouchPoints > 1; // iPadOS 13+
    return (/iphone|ipod/i.test(ua) || touchMac) && !/crios|fxios|edgios|opios/i.test(ua);
  }, []);
  const isStandalone = installed;

  const value: Store = {
    data,
    settings,
    tab,
    setTab,
    editorOpen,
    editingPlant,
    openEditor,
    closeEditor: () => setEditorOpen(false),
    detailId,
    openDetail: setDetailId,
    closeDetail: () => setDetailId(null),
    notifOpen,
    setNotifOpen,
    addPlant,
    updatePlant,
    deletePlant,
    completeTask,
    addGrowth,
    deleteGrowth,
    setTheme,
    resetData,
    toasts,
    toast,
    installEvt,
    promptInstall,
    isIOS,
    isStandalone,
    installed,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside AppProvider");
  return ctx;
}
