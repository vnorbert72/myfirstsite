import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubscriberSchema } from "@shared/schema";
import { ZodError } from "zod";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_SWEEP_MS = 5 * 60_000;
const ipHits = new Map<string, number[]>();

let lastSweep = Date.now();
function sweepIfNeeded(now: number) {
  if (now - lastSweep < RATE_LIMIT_SWEEP_MS) return;
  lastSweep = now;
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  ipHits.forEach((hits, key) => {
    const fresh = hits.filter((t) => t > cutoff);
    if (fresh.length === 0) ipHits.delete(key);
    else ipHits.set(key, fresh);
  });
}

function rateLimit(req: Request, res: Response, next: NextFunction) {
  // req.ip is set correctly because index.ts calls app.set("trust proxy", 1).
  // Untrusted X-Forwarded-For from arbitrary clients is therefore ignored.
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  sweepIfNeeded(now);
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const hits = (ipHits.get(ip) ?? []).filter((t) => t > cutoff);
  if (hits.length >= RATE_LIMIT_MAX) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({ ok: false, error: "rate_limited" });
  }
  hits.push(now);
  ipHits.set(ip, hits);
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/subscribe", rateLimit, async (req, res) => {
    try {
      const data = insertSubscriberSchema.parse(req.body);
      const existing = await storage.getSubscriberByEmail(data.email);
      if (!existing) {
        await storage.createSubscriber(data);
      }
      // Always return the same generic success response to prevent
      // email-enumeration probes against this public endpoint.
      return res.status(200).json({ ok: true });
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          ok: false,
          error: "validation_error",
          issues: err.flatten().fieldErrors,
        });
      }
      console.error("/api/subscribe error", err);
      return res.status(500).json({ ok: false, error: "internal_error" });
    }
  });

  app.get("/api/subscribers/count", async (_req, res) => {
    const subs = await storage.listSubscribers();
    res.json({ count: subs.length });
  });

  const httpServer = createServer(app);
  return httpServer;
}
