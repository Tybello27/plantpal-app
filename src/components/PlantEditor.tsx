import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Check, Image as ImageIcon, Leaf, Minus, Plus, Trash2 } from "lucide-react";
import { useStore } from "../lib/store";
import { CARE_LEVELS, CATEGORIES, HEALTHS, PRESET_PHOTOS, ROOMS } from "../types";
import { Sheet } from "./ui";
import { cn } from "../utils/cn";

const inputCls =
  "w-full rounded-2xl border border-bark-900/8 bg-white px-4 py-3 text-sm font-semibold text-bark-800 outline-none transition-all placeholder:text-bark-400/60 focus:border-fern-500 focus:ring-4 focus:ring-fern-500/15 dark:border-cream/10 dark:bg-bark-800 dark:text-cream";
const labelCls = "mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-bark-400";

function Stepper({ value, onChange, min = 0, max = 365, suffix }: { value: number; onChange: (v: number) => void; min?: number; max?: number; suffix: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-bark-900/8 bg-white px-2 py-1.5 dark:border-cream/10 dark:bg-bark-800">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex size-8 items-center justify-center rounded-xl bg-bark-900/5 text-bark-600 transition-all active:scale-90 dark:bg-cream/10 dark:text-cream/80"
        aria-label="Decrease"
      >
        <Minus className="size-4" />
      </button>
      <span className="text-sm font-extrabold text-bark-800 dark:text-cream">
        {value === 0 && min === 0 ? "Off" : `${value} ${suffix}`}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex size-8 items-center justify-center rounded-xl bg-fern-500/15 text-fern-700 transition-all active:scale-90 dark:text-fern-300"
        aria-label="Increase"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

/** Downscale an uploaded photo so localStorage stays lean. */
function readAndResize(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 640;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => reject(new Error("decode failed"));
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export default function PlantEditor() {
  const { editorOpen, closeEditor, editingPlant, addPlant, updatePlant, deletePlant, toast } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const blank = {
    image: "",
    name: "",
    species: "",
    category: CATEGORIES[0],
    room: ROOMS[0],
    careLevel: CARE_LEVELS[0],
    health: HEALTHS[1].value,
    waterEveryDays: 7,
    fertilizeEveryDays: 30,
    pruneEveryDays: 0,
    repotEveryMonths: 12,
    notes: "",
  };

  const [form, setForm] = useState(blank);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  // hydrate form when the editor opens for a specific plant
  const key = editingPlant?.id ?? "new";
  if (editorOpen && loadedFor !== key) {
    setLoadedFor(key);
    setConfirmDelete(false);
    setForm(
      editingPlant
        ? { ...blank, ...editingPlant, notes: editingPlant.notes ?? "" }
        : blank
    );
  }
  if (!editorOpen && loadedFor !== null) setLoadedFor(null);

  const set = <K extends keyof typeof blank>(k: K, v: (typeof blank)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onFile = async (file?: File | null) => {
    if (!file) return;
    try {
      const url = await readAndResize(file);
      set("image", url);
      toast("Photo attached 📷");
    } catch {
      toast("Couldn't read that image", "warn");
    }
  };

  const save = () => {
    if (!form.name.trim()) {
      toast("Give your plant a name first", "warn");
      return;
    }
    const payload = { ...form, name: form.name.trim(), species: form.species.trim() || form.name.trim() };
    if (editingPlant) {
      updatePlant({ ...editingPlant, ...payload });
      toast(`${payload.name} updated ✓`);
    } else {
      addPlant(payload);
    }
    closeEditor();
  };

  return (
    <Sheet open={editorOpen} onClose={closeEditor} wide>
      <h2 className="mb-1 pr-10 font-display text-2xl font-semibold text-bark-900 dark:text-cream">
        {editingPlant ? "Edit Plant" : "Add a Plant"}
      </h2>
      <p className="mb-5 text-sm font-semibold text-bark-400">
        {editingPlant ? "Update details and care schedule." : "A photo and a schedule — PlantPal does the rest."}
      </p>

      <div className="space-y-5">
        {/* photo */}
        <div>
          <span className={labelCls}>Photo</span>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-bark-900/15 bg-beige text-bark-400 transition-colors hover:border-fern-500 hover:text-fern-600 dark:border-cream/15 dark:bg-bark-800"
            >
              {form.image ? (
                <img src={form.image} alt="Preview" className="size-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-1.5">
                  <Camera className="size-6" />
                  <span className="text-[10px] font-extrabold">Upload</span>
                </span>
              )}
              {form.image && (
                <span className="absolute inset-x-0 bottom-0 bg-bark-950/55 py-1 text-center text-[10px] font-extrabold text-white opacity-0 transition-opacity group-hover:opacity-100">
                  Change
                </span>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            <div className="no-scrollbar grid flex-1 grid-cols-4 gap-2 overflow-x-auto">
              {PRESET_PHOTOS.slice(0, 8).map((p) => (
                <button
                  key={p.url}
                  type="button"
                  onClick={() => set("image", p.url)}
                  className={cn(
                    "relative aspect-square shrink-0 overflow-hidden rounded-2xl transition-all active:scale-95",
                    form.image === p.url ? "ring-2 ring-fern-500" : "opacity-80 hover:opacity-100"
                  )}
                >
                  <img src={p.url} alt={p.name} className="size-full object-cover" loading="lazy" />
                  {form.image === p.url && (
                    <span className="absolute inset-0 flex items-center justify-center bg-fern-600/35">
                      <Check className="size-5 text-white" strokeWidth={3} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          {!form.image && (
            <p className="mt-2 flex items-center gap-1 text-[11px] font-bold text-bark-400">
              <ImageIcon className="size-3.5" /> Upload your own or pick a botanical preset
            </p>
          )}
        </div>

        {/* identity */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Name *</label>
            <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Monstera" />
          </div>
          <div>
            <label className={labelCls}>Species</label>
            <input className={inputCls} value={form.species} onChange={(e) => set("species", e.target.value)} placeholder="e.g. Monstera deliciosa" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Category</label>
            <select className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value as typeof form.category)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Room</label>
            <select className={inputCls} value={form.room} onChange={(e) => set("room", e.target.value as typeof form.room)}>
              {ROOMS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Care type</label>
            <select className={inputCls} value={form.careLevel} onChange={(e) => set("careLevel", e.target.value as typeof form.careLevel)}>
              {CARE_LEVELS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Health</label>
            <select className={inputCls} value={form.health} onChange={(e) => set("health", e.target.value as typeof form.health)}>
              {HEALTHS.map((h) => <option key={h.value} value={h.value}>{h.label}</option>)}
            </select>
          </div>
        </div>

        {/* schedule */}
        <div>
          <span className={labelCls}>Automatic care schedule</span>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-bold text-fern-700 dark:text-fern-400">💧 Water every</p>
              <Stepper value={form.waterEveryDays} min={1} max={60} suffix="days" onChange={(v) => set("waterEveryDays", v)} />
            </div>
            <div>
              <p className="mb-1 text-xs font-bold text-lime-700 dark:text-lime-400">🌱 Fertilize every</p>
              <Stepper value={form.fertilizeEveryDays} suffix="days" onChange={(v) => set("fertilizeEveryDays", v)} />
            </div>
            <div>
              <p className="mb-1 text-xs font-bold text-amber-700 dark:text-amber-400">✂️ Prune every</p>
              <Stepper value={form.pruneEveryDays} suffix="days" onChange={(v) => set("pruneEveryDays", v)} />
            </div>
            <div>
              <p className="mb-1 text-xs font-bold text-teal-700 dark:text-teal-400">🪴 Repot every</p>
              <Stepper value={form.repotEveryMonths} suffix="months" onChange={(v) => set("repotEveryMonths", v)} />
            </div>
          </div>
          <p className="mt-2 text-[11px] font-semibold text-bark-400">
            <Leaf className="mr-1 inline size-3 text-fern-600" />
            Reminders are generated automatically from these intervals.
          </p>
        </div>

        <div>
          <label className={labelCls}>Notes</label>
          <textarea
            className={cn(inputCls, "min-h-20 resize-none")}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Light preferences, quirks, memories…"
          />
        </div>

        {/* actions */}
        <div className="flex gap-3 pt-1">
          {editingPlant && (
            <button
              type="button"
              onClick={() => {
                if (confirmDelete) deletePlant(editingPlant.id);
                else {
                  setConfirmDelete(true);
                  setTimeout(() => setConfirmDelete(false), 3000);
                }
              }}
              className={cn(
                "flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-extrabold transition-all active:scale-95",
                confirmDelete
                  ? "bg-rose-600 text-white"
                  : "border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
              )}
            >
              <Trash2 className="size-4" /> {confirmDelete ? "Confirm?" : "Delete"}
            </button>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={save}
            className="flex-1 rounded-full bg-gradient-to-r from-fern-600 to-fern-700 py-3.5 text-sm font-extrabold text-white shadow-glow transition-colors hover:from-fern-700 hover:to-fern-800"
          >
            {editingPlant ? "Save changes" : "Add to my jungle"}
          </motion.button>
        </div>
      </div>
    </Sheet>
  );
}
