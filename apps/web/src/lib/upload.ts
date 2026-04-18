import { requestUploadUrl } from "@/actions/game";

/**
 * If value is a File, uploads it to S3 and returns the CDN URL.
 * If value is already a string URL, returns it as-is.
 * If value is null/undefined, returns null.
 */
export async function resolveImageValue(
  value: File | string | null | undefined,
): Promise<string | null> {
  if (!value) return null;
  if (typeof value === "string") return value.trim() || null;

  const result = await requestUploadUrl(value.name, value.type);
  if (!result.success || !result.data) {
    throw new Error(result.error ?? "Upload failed");
  }

  const { uploadUrl, finalUrl } = result.data;
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": value.type },
    body: value,
  });

  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return finalUrl;
}
