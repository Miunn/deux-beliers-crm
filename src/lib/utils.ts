import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function textColorForBg(bg: string): string {
  try {
    const c = bg.replace("#", "");
    const r = parseInt(c.length === 3 ? c[0] + c[0] : c.slice(0, 2), 16);
    const g = parseInt(c.length === 3 ? c[1] + c[1] : c.slice(2, 4), 16);
    const b = parseInt(c.length === 3 ? c[2] + c[2] : c.slice(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 140 ? "#111" : "#fff";
  } catch {
    return "#111";
  }
}
