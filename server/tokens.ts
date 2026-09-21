import { createHmac } from "crypto";

function secret(): string {
  const s = process.env.UNSUB_SECRET;
  if (!s) {
    // Falls back to a process-local random value so the app never crashes
    // without the env var, but tokens won't survive a restart in that case.
    // Always set UNSUB_SECRET in production.
    return "fitfusion-dev-only-unsub-secret";
  }
  return s;
}

function sign(id: string): string {
  return createHmac("sha256", secret()).update(id).digest("hex").slice(0, 32);
}

export function makeUnsubscribeToken(id: string): string {
  const idB64 = Buffer.from(id, "utf8").toString("base64url");
  return `${idB64}.${sign(id)}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [idB64, sig] = parts;
  let id: string;
  try {
    id = Buffer.from(idB64, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const expected = sign(id);
  if (expected.length !== sig.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return diff === 0 ? id : null;
}
