import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class values into a single className string.
 * This utility merges Tailwind CSS classes and handles conflicts properly.
 *
 * @param inputs - Class values to be merged (strings, objects, arrays, etc.)
 * @returns A merged className string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

