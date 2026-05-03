import { env } from "@/env";

export function getApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return new URL(normalizedPath, env.NEXT_PUBLIC_API_URL).toString();
}
