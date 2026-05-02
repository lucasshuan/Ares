import { env } from "@/env";

/**
 * Returns the full public URL for a stored CDN path.
 * Handles legacy full URLs transparently (returns them as-is).
 */
export function cdnUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${env.NEXT_PUBLIC_CDN_URL}/${path}`;
}
