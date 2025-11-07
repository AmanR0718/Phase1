/**
 * debug.ts
 * Simple helper to safely log debug info only in development builds.
 *
 * Usage:
 *   import { debug } from "@/utils/debug"
 *   debug("API_BASE_URL:", import.meta.env.VITE_API_BASE_URL)
 */

export function debug(...args: any[]) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug("[DEBUG]", ...args)
  }
}
