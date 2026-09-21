import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubscriberSchema } from "@shared/schema";
import { ZodError } from "zod";
import { notifyNewSubscriber, sendSubscriberReceipt, sendMail } from "./mail";
import { makeUnsubscribeToken, verifyUnsubscribeToken } from "./tokens";
import { getLatestArticlesByLang } from "./articles-reader";
import { renderNewsletterHtml, newsletterSubject } from "./newsletter-template";

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

const SITE_URL = "https://fit-fusion.eu";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/subscribe", rateLimit, async (req, res) => {
    try {
      const data = insertSubscriberSchema.parse(req.body);
      const existing = await storage.getSubscriberByEmail(data.email);
      if (!existing) {
        const created = await storage.createSubscriber(data);
        // Fire-and-forget: a mail hiccup must never fail the subscribe
        // request itself, and callers get the same response either way.
        void Promise.allSettled([
          notifyNewSubscriber(created.email, created.language),
          sendSubscriberReceipt(created.email, created.language),
        ]);
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

  app.get("/api/unsubscribe", async (req, res) => {
    const token = String(req.query.token || "");
    const id = verifyUnsubscribeToken(token);
    if (!id) {
      return res.status(400).send("This unsubscribe link is invalid or has expired.");
    }
    await storage.unsubscribe(id);
    res
      .status(200)
      .send("You've been unsubscribed from the FitFusion newsletter. Sorry to see you go!");
  });

  // Triggered monthly by a cPanel cron job (see deploy notes) rather than
  // this app's own scheduler, since shared hosting has no reliable
  // long-running process to hang a timer off of.
  app.post("/api/newsletter/send", async (req, res) => {
    const secret = process.env.NEWSLETTER_SECRET;
    const auth = req.headers.authorization || "";
    if (!secret || auth !== `Bearer ${secret}`) {
      return res.status(401).json({ ok: false, error: "unauthorized" });
    }
    try {
      const subscribers = await storage.listActiveSubscribers();
      const articlesByLang = getLatestArticlesByLang(3);
      let sent = 0;
      let failed = 0;
      let skipped = 0;
      for (const sub of subscribers) {
        const lang = ["en", "hu", "es"].includes(sub.language) ? sub.language : "en";
        const articles = articlesByLang[lang as keyof typeof articlesByLang];
        if (!articles || articles.length === 0) {
          skipped++;
          continue;
        }
        const token = makeUnsubscribeToken(sub.id);
        const unsubscribeUrl = `${SITE_URL}/api/unsubscribe?token=${token}`;
        const html = renderNewsletterHtml(lang, articles, SITE_URL, unsubscribeUrl);
        try {
          await sendMail({ to: sub.email, subject: newsletterSubject(lang), html });
          sent++;
        } catch (err) {
          console.error(`newsletter send failed for ${sub.email}`, err);
          failed++;
        }
        // Gentle pacing so we stay well under shared-hosting outbound mail
        // rate limits.
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      res.json({ ok: true, total: subscribers.length, sent, failed, skipped });
    } catch (err) {
      console.error("/api/newsletter/send error", err);
      res.status(500).json({ ok: false, error: "internal_error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
