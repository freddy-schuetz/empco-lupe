// Browser-native SHA-256, used to hash URLs for telemetry/history.
// We never persist or send the clear-text URL to the backend.

export async function sha256(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  const bytes = new Uint8Array(buf);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return "sha256:" + hex;
}
