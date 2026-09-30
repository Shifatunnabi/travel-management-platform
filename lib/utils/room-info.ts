import {
  AirVent, Armchair, Bath, BedDouble, Bell, Briefcase, Car, ConciergeBell, Coffee, Droplets,
  Fan, Flame, Gift, Lock, Martini, Mountain, Newspaper, NotebookPen, PenLine, Phone,
  Refrigerator, ShowerHead, Sparkles, Tv, UtensilsCrossed, Waves, Wifi, Wind, DoorOpen, Plane,
  Check, Shirt, Dumbbell, type LucideIcon,
} from "lucide-react";

/**
 * Amenities are free text typed by the vendor, so the icon is picked by what
 * the words say. The first matching rule wins; anything unrecognised gets a tick.
 */
const AMENITY_ICONS: [RegExp, LucideIcon][] = [
  [/air.?con|\ba\/?c\b|cooling/i, AirVent],
  [/\bfan\b/i, Fan],
  [/tv|television|flat.?screen/i, Tv],
  [/wi.?fi|internet|wireless/i, Wifi],
  [/mini.?bar/i, Martini],
  [/fridge|refrigerator/i, Refrigerator],
  [/bath.?tub|bathtub|jacuzzi/i, Bath],
  [/shower.*(amenit|toiletr)|toiletr|amenit/i, Sparkles],
  [/shower/i, ShowerHead],
  [/hot\s*(&|and)?\s*cold|hot water|geyser/i, Droplets],
  [/wash.?room|bath.?room|restroom|toilet/i, Bath],
  [/king|queen|twin|double|bed/i, BedDouble],
  [/balcon|terrace|patio/i, DoorOpen],
  [/sea|ocean|beach|lake|river/i, Waves],
  [/hill|mountain|garden|view/i, Mountain],
  [/dining|room service|breakfast|meal|restaurant/i, UtensilsCrossed],
  [/tea|coffee|kettle/i, Coffee],
  [/pen\b|writing pen/i, PenLine],
  [/notepad|notebook|stationery/i, NotebookPen],
  [/desk|work/i, Briefcase],
  [/hair.?dr|dryer/i, Wind],
  [/phone|idd|telephone/i, Phone],
  [/seat|sofa|chair|lounge/i, Armchair],
  [/water/i, Droplets],
  [/safe|locker|lock/i, Lock],
  [/iron|laundry|wardrobe|closet/i, Shirt],
  [/newspaper/i, Newspaper],
  [/pickup|transfer|airport|shuttle|car|parking/i, Car],
  [/gym|fitness/i, Dumbbell],
  [/heater|heating|fireplace/i, Flame],
  [/welcome|gift|fruit|basket/i, Gift],
  [/bell|concierge|butler/i, ConciergeBell],
];

export function amenityIcon(label: string): LucideIcon {
  for (const [pattern, icon] of AMENITY_ICONS) if (pattern.test(label)) return icon;
  return Check;
}

/** Icon for an add-on such as an airport pickup or a breakfast. */
export function addOnIcon(label: string): LucideIcon {
  if (/pick.?up|transfer|airport|shuttle|car/i.test(label)) return /airport|flight/i.test(label) ? Plane : Car;
  if (/cancel|flex/i.test(label)) return Bell;
  return amenityIcon(label);
}

export interface RoomFacts {
  hasAc: boolean;
  washroom: string | null;
}

/** AC and washroom are not separate fields; they are read from the amenity list. */
export function roomFacts(amenities: string[]): RoomFacts {
  const hasAc = amenities.some((a) => /air.?con|\ba\/?c\b/i.test(a) && !/non.?a\/?c/i.test(a));
  const washroom = amenities.find((a) => /wash.?room|bath.?room/i.test(a)) ?? null;
  return { hasAc, washroom };
}
