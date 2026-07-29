export const USER_NAME = "Pikuda";

export type CareType = "water" | "fertilize" | "prune" | "repot";
export type Health = "thriving" | "healthy" | "attention" | "unhappy";
export type Category = "Foliage" | "Flowering" | "Succulent" | "Cactus" | "Herb" | "Tropical";
export type Room = "Living Room" | "Bedroom" | "Kitchen" | "Bathroom" | "Office" | "Balcony";
export type CareLevel = "Easy care" | "Moderate" | "High maintenance";
export type Tab = "home" | "plants" | "calendar" | "history" | "settings";

export interface Plant {
  id: string;
  name: string;
  species: string;
  category: Category;
  room: Room;
  careLevel: CareLevel;
  health: Health;
  image: string;
  waterEveryDays: number;
  fertilizeEveryDays: number; // 0 = not needed
  pruneEveryDays: number; // 0 = not needed
  repotEveryMonths: number; // 0 = not needed
  addedAt: number;
  notes?: string;
}

export interface CareLogEntry {
  id: string;
  plantId: string;
  type: CareType;
  at: number;
  note?: string;
}

export interface GrowthEntry {
  id: string;
  plantId: string;
  at: number;
  heightCm: number;
  note?: string;
}

export interface AppData {
  plants: Plant[];
  careLog: CareLogEntry[];
  growth: GrowthEntry[];
}

export interface Settings {
  theme: "light" | "dark";
}

export type DueStatus = "overdue" | "today" | "soon" | "scheduled" | "disabled";

export interface CareTask {
  plant: Plant;
  type: CareType;
  dueAt: number;
  daysUntil: number;
  status: DueStatus;
}

export const CATEGORIES: Category[] = ["Foliage", "Flowering", "Succulent", "Cactus", "Herb", "Tropical"];
export const ROOMS: Room[] = ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Office", "Balcony"];
export const CARE_LEVELS: CareLevel[] = ["Easy care", "Moderate", "High maintenance"];
export const HEALTHS: { value: Health; label: string }[] = [
  { value: "thriving", label: "Thriving" },
  { value: "healthy", label: "Healthy" },
  { value: "attention", label: "Needs attention" },
  { value: "unhappy", label: "Unhappy" },
];

export const CARE_META: Record<CareType, { label: string; verb: string; noun: string }> = {
  water: { label: "Watering", verb: "Water", noun: "Water" },
  fertilize: { label: "Fertilizing", verb: "Fertilize", noun: "Fertilizer" },
  prune: { label: "Pruning", verb: "Prune", noun: "Pruning" },
  repot: { label: "Repotting", verb: "Repot", noun: "Repot" },
};

export const PRESET_PHOTOS: { name: string; url: string }[] = [
  { name: "Ficus", url: "https://images.pexels.com/photos/12516288/pexels-photo-12516288.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800" },
  { name: "Calathea", url: "https://images.pexels.com/photos/16960870/pexels-photo-16960870.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800" },
  { name: "Begonia", url: "https://images.pexels.com/photos/33614722/pexels-photo-33614722.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800" },
  { name: "Succulent", url: "https://images.pexels.com/photos/22610765/pexels-photo-22610765.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800" },
  { name: "Peperomia", url: "https://images.pexels.com/photos/12713197/pexels-photo-12713197.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800" },
  { name: "Dracaena", url: "https://images.pexels.com/photos/14325285/pexels-photo-14325285.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800" },
  { name: "Palm", url: "https://images.pexels.com/photos/30343587/pexels-photo-30343587.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800" },
  { name: "Alocasia", url: "https://images.pexels.com/photos/10894358/pexels-photo-10894358.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800" },
  { name: "Spider", url: "https://images.pexels.com/photos/5293174/pexels-photo-5293174.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800" },
  { name: "Windowsill", url: "https://images.pexels.com/photos/36065272/pexels-photo-36065272.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800" },
];
