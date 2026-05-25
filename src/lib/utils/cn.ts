import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge inteligente de classes Tailwind: resolve conflitos
 * (ex.: `px-2 px-4` → `px-4`) e aceita arrays/objetos do clsx.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
