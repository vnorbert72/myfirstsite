var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertSubscriberSchema: () => insertSubscriberSchema,
  insertUserSchema: () => insertUserSchema,
  subscribers: () => subscribers,
  users: () => users
});
import { mysqlTable, varchar, text, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var subscribers = mysqlTable("subscribers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 254 }).notNull().unique(),
  language: varchar("language", { length: 5 }).notNull().default("en"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at")
});
var insertSubscriberSchema = createInsertSchema(subscribers).omit({ id: true, createdAt: true, unsubscribedAt: true }).extend({
  email: z.string().trim().toLowerCase().min(3, "Please enter a valid email address").max(254, "Email is too long").email("Please enter a valid email address"),
  language: z.string().min(2).max(5).optional().default("en")
});

// server/storage.ts
import { randomUUID } from "crypto";
import { eq, isNull } from "drizzle-orm";

// server/db.ts
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
var DB_HOST = process.env.DB_HOST || "localhost";
var DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
var DB_USER = process.env.DB_USER;
var DB_PASSWORD = process.env.DB_PASSWORD;
var DB_NAME = process.env.DB_NAME;
var hasDatabase = Boolean(DB_USER && DB_PASSWORD && DB_NAME);
var pool = null;
var db = null;
if (hasDatabase) {
  pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 5
  });
  db = drizzle(pool, { schema: schema_exports, mode: "default" });
}
async function ensureSchema() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(254) NOT NULL UNIQUE,
      language VARCHAR(5) NOT NULL DEFAULT 'en',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      unsubscribed_at TIMESTAMP NULL DEFAULT NULL
    )
  `);
}

// server/storage.ts
var MemStorage = class {
  users;
  subscribers;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.subscribers = /* @__PURE__ */ new Map();
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getSubscriberByEmail(email) {
    const normalized = email.trim().toLowerCase();
    return Array.from(this.subscribers.values()).find(
      (s) => s.email === normalized
    );
  }
  async createSubscriber(input) {
    const id = randomUUID();
    const subscriber = {
      id,
      email: input.email.trim().toLowerCase(),
      language: input.language ?? "en",
      createdAt: /* @__PURE__ */ new Date(),
      unsubscribedAt: null
    };
    this.subscribers.set(id, subscriber);
    return subscriber;
  }
  async listSubscribers() {
    return Array.from(this.subscribers.values());
  }
  async listActiveSubscribers() {
    return Array.from(this.subscribers.values()).filter(
      (s) => !s.unsubscribedAt
    );
  }
  async unsubscribe(id) {
    const sub = this.subscribers.get(id);
    if (sub) sub.unsubscribedAt = /* @__PURE__ */ new Date();
  }
};
var DbStorage = class {
  get conn() {
    if (!db) throw new Error("Database not configured");
    return db;
  }
  async getUser(id) {
    const rows = await this.conn.select().from(users).where(eq(users.id, id));
    return rows[0];
  }
  async getUserByUsername(username) {
    const rows = await this.conn.select().from(users).where(eq(users.username, username));
    return rows[0];
  }
  async createUser(insertUser) {
    const id = randomUUID();
    await this.conn.insert(users).values({ ...insertUser, id });
    return { ...insertUser, id };
  }
  async getSubscriberByEmail(email) {
    const normalized = email.trim().toLowerCase();
    const rows = await this.conn.select().from(subscribers).where(eq(subscribers.email, normalized));
    return rows[0];
  }
  async createSubscriber(input) {
    const id = randomUUID();
    const email = input.email.trim().toLowerCase();
    const language = input.language ?? "en";
    await this.conn.insert(subscribers).values({ id, email, language });
    const rows = await this.conn.select().from(subscribers).where(eq(subscribers.id, id));
    return rows[0];
  }
  async listSubscribers() {
    return this.conn.select().from(subscribers);
  }
  async listActiveSubscribers() {
    return this.conn.select().from(subscribers).where(isNull(subscribers.unsubscribedAt));
  }
  async unsubscribe(id) {
    await this.conn.update(subscribers).set({ unsubscribedAt: /* @__PURE__ */ new Date() }).where(eq(subscribers.id, id));
  }
};
var storage = hasDatabase ? new DbStorage() : new MemStorage();

// server/routes.ts
import { ZodError } from "zod";

// server/mail.ts
import nodemailer from "nodemailer";
var SMTP_HOST = process.env.SMTP_HOST;
var SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;
var SMTP_SECURE = (process.env.SMTP_SECURE ?? "true") !== "false";
var SMTP_USER = process.env.SMTP_USER;
var SMTP_PASSWORD = process.env.SMTP_PASSWORD;
var MAIL_FROM = process.env.MAIL_FROM || `FitFusion <${SMTP_USER ?? "noreply@fit-fusion.eu"}>`;
var NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;
var hasMail = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASSWORD);
var transport = hasMail ? nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: { user: SMTP_USER, pass: SMTP_PASSWORD }
}) : null;
async function sendMail(opts) {
  if (!transport) {
    console.warn(`[mail] not configured, skipping send to ${opts.to}`);
    return;
  }
  await transport.sendMail({
    from: MAIL_FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text
  });
}
function escapeHtml(s) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}
async function notifyNewSubscriber(email, language) {
  if (!NOTIFY_EMAIL) return;
  await sendMail({
    to: NOTIFY_EMAIL,
    subject: `\xDAj feliratkoz\xF3: ${email}`,
    html: `
      <p>\xDAj h\xEDrlev\xE9l-feliratkoz\xF3 \xE9rkezett a fit-fusion.eu oldalon.</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}<br/>
      <strong>Nyelv:</strong> ${escapeHtml(language)}</p>
    `
  });
}
var RECEIPT_COPY = {
  en: {
    subject: "You're subscribed to the FitFusion newsletter",
    body: "Thanks for subscribing! You'll get an email whenever we publish fresh nutrition and training content. You can unsubscribe at any time using the link at the bottom of any newsletter."
  },
  hu: {
    subject: "Feliratkozt\xE1l a FitFusion h\xEDrlev\xE9lre",
    body: "K\xF6sz\xF6nj\xFCk a feliratkoz\xE1st! Emailt fogsz kapni, amikor friss t\xE1pl\xE1lkoz\xE1si \xE9s edz\xE9ssel kapcsolatos tartalmat tesz\xFCnk k\xF6zz\xE9. B\xE1rmikor leiratkozhatsz a h\xEDrlevelek alj\xE1n tal\xE1lhat\xF3 linkkel."
  },
  es: {
    subject: "Te has suscrito al bolet\xEDn de FitFusion",
    body: "\xA1Gracias por suscribirte! Recibir\xE1s un correo cada vez que publiquemos contenido nuevo sobre nutrici\xF3n y entrenamiento. Puedes darte de baja en cualquier momento con el enlace al final de cada bolet\xEDn."
  }
};
async function sendSubscriberReceipt(email, language) {
  const copy = RECEIPT_COPY[language] || RECEIPT_COPY.en;
  await sendMail({
    to: email,
    subject: copy.subject,
    html: `<p>${escapeHtml(copy.body)}</p>`
  });
}

// server/tokens.ts
import { createHmac } from "crypto";
function secret() {
  const s = process.env.UNSUB_SECRET;
  if (!s) {
    return "fitfusion-dev-only-unsub-secret";
  }
  return s;
}
function sign(id) {
  return createHmac("sha256", secret()).update(id).digest("hex").slice(0, 32);
}
function makeUnsubscribeToken(id) {
  const idB64 = Buffer.from(id, "utf8").toString("base64url");
  return `${idB64}.${sign(id)}`;
}
function verifyUnsubscribeToken(token) {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [idB64, sig] = parts;
  let id;
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

// server/articles-reader.ts
import fs from "fs";
import path from "path";

// shared/article-frontmatter.ts
var FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
function parseArticleFile(raw) {
  const match = FRONTMATTER_RE.exec(raw);
  if (!match) {
    return { meta: {}, body: raw.trim() };
  }
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) meta[key] = value;
  }
  return { meta, body: match[2].trim() };
}
var ARTICLE_LANGS = ["en", "hu", "es"];
var ARTICLE_FILE_RE = /^(.+)\.(en|hu|es)\.md$/;

// server/articles-reader.ts
var ARTICLES_DIR = path.resolve(import.meta.dirname, "..", "content", "articles");
function loadEntries() {
  const entries = /* @__PURE__ */ new Map();
  let fileNames = [];
  try {
    fileNames = fs.readdirSync(ARTICLES_DIR);
  } catch {
    return entries;
  }
  for (const fileName of fileNames) {
    const match = ARTICLE_FILE_RE.exec(fileName);
    if (!match) continue;
    const slug = match[1];
    const lang = match[2];
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, fileName), "utf8");
    const entry = entries.get(slug) ?? { slug, files: {} };
    entry.files[lang] = parseArticleFile(raw);
    entries.set(slug, entry);
  }
  return entries;
}
function getLatestArticlesByLang(limit = 3) {
  const entries = loadEntries();
  const result = Object.fromEntries(
    ARTICLE_LANGS.map((lang) => [lang, []])
  );
  const candidates = [];
  entries.forEach((entry) => {
    const en = entry.files.en;
    if (!en) return;
    if (en.meta.draft === "true") return;
    candidates.push({ slug: entry.slug, en });
  });
  candidates.sort(
    (a, b) => (b.en.meta.publishDate || "").localeCompare(a.en.meta.publishDate || "")
  );
  const top = candidates.slice(0, limit);
  for (const lang of ARTICLE_LANGS) {
    result[lang] = top.map(({ slug, en }) => {
      const entry = entries.get(slug);
      const loc = lang === "en" ? void 0 : entry.files[lang];
      return {
        slug,
        title: loc?.meta.title || en.meta.title || slug,
        excerpt: loc?.meta.excerpt || en.meta.excerpt || "",
        publishDate: en.meta.publishDate || "",
        category: en.meta.category || ""
      };
    });
  }
  return result;
}

// server/newsletter-template.ts
function escapeHtml2(s) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}
var COPY = {
  en: {
    subject: "Fresh from FitFusion",
    heading: "Fresh from FitFusion",
    intro: "Here's what we've published recently:",
    readMore: "Read more",
    unsubscribe: "Unsubscribe"
  },
  hu: {
    subject: "Friss h\xEDrek a FitFusion-t\xF3l",
    heading: "Friss h\xEDrek a FitFusion-t\xF3l",
    intro: "\xCDme, amit mostan\xE1ban publik\xE1ltunk:",
    readMore: "Tov\xE1bb olvasom",
    unsubscribe: "Leiratkoz\xE1s"
  },
  es: {
    subject: "Novedades de FitFusion",
    heading: "Novedades de FitFusion",
    intro: "Esto es lo que hemos publicado recientemente:",
    readMore: "Leer m\xE1s",
    unsubscribe: "Darse de baja"
  }
};
function newsletterSubject(lang) {
  return (COPY[lang] || COPY.en).subject;
}
function renderNewsletterHtml(lang, articles, siteUrl, unsubscribeUrl) {
  const copy = COPY[lang] || COPY.en;
  const langPrefix = lang === "en" ? "" : `?lang=${lang}`;
  const articlesHtml = articles.map((a) => {
    const url = `${siteUrl}/blog/${encodeURIComponent(a.slug)}${langPrefix}`;
    return `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #eee;">
            <p style="margin:0 0 6px;font-size:18px;font-weight:600;color:#1a1a1a;">
              <a href="${url}" style="color:#ea580c;text-decoration:none;">${escapeHtml2(a.title)}</a>
            </p>
            <p style="margin:0 0 8px;font-size:14px;color:#555;line-height:1.5;">${escapeHtml2(a.excerpt)}</p>
            <a href="${url}" style="font-size:13px;color:#ea580c;text-decoration:none;font-weight:600;">${copy.readMore} \u2192</a>
          </td>
        </tr>
      `;
  }).join("");
  return `
    <!DOCTYPE html>
    <html lang="${lang}">
      <head><meta charset="utf-8" /></head>
      <body style="margin:0;padding:0;background:#f6f6f4;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f4;padding:24px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="background:#ea580c;padding:24px;text-align:center;">
                    <span style="font-size:22px;font-weight:700;color:#ffffff;">FitFusion</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px;">
                    <h1 style="margin:0 0 8px;font-size:20px;color:#1a1a1a;">${copy.heading}</h1>
                    <p style="margin:0 0 16px;font-size:14px;color:#555;">${copy.intro}</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${articlesHtml}
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;text-align:center;">
                    <a href="${unsubscribeUrl}" style="font-size:12px;color:#999;text-decoration:underline;">${copy.unsubscribe}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

// server/routes.ts
var RATE_LIMIT_WINDOW_MS = 6e4;
var RATE_LIMIT_MAX = 5;
var RATE_LIMIT_SWEEP_MS = 5 * 6e4;
var ipHits = /* @__PURE__ */ new Map();
var lastSweep = Date.now();
function sweepIfNeeded(now) {
  if (now - lastSweep < RATE_LIMIT_SWEEP_MS) return;
  lastSweep = now;
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  ipHits.forEach((hits, key) => {
    const fresh = hits.filter((t) => t > cutoff);
    if (fresh.length === 0) ipHits.delete(key);
    else ipHits.set(key, fresh);
  });
}
function rateLimit(req, res, next) {
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
var SITE_URL = "https://fit-fusion.eu";
async function registerRoutes(app2) {
  app2.post("/api/subscribe", rateLimit, async (req, res) => {
    try {
      const data = insertSubscriberSchema.parse(req.body);
      const existing = await storage.getSubscriberByEmail(data.email);
      if (!existing) {
        const created = await storage.createSubscriber(data);
        void Promise.allSettled([
          notifyNewSubscriber(created.email, created.language),
          sendSubscriberReceipt(created.email, created.language)
        ]);
      }
      return res.status(200).json({ ok: true });
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          ok: false,
          error: "validation_error",
          issues: err.flatten().fieldErrors
        });
      }
      console.error("/api/subscribe error", err);
      return res.status(500).json({ ok: false, error: "internal_error" });
    }
  });
  app2.get("/api/subscribers/count", async (_req, res) => {
    const subs = await storage.listSubscribers();
    res.json({ count: subs.length });
  });
  app2.get("/api/unsubscribe", async (req, res) => {
    const token = String(req.query.token || "");
    const id = verifyUnsubscribeToken(token);
    if (!id) {
      return res.status(400).send("This unsubscribe link is invalid or has expired.");
    }
    await storage.unsubscribe(id);
    res.status(200).send("You've been unsubscribed from the FitFusion newsletter. Sorry to see you go!");
  });
  app2.post("/api/newsletter/send", async (req, res) => {
    const secret2 = process.env.NEWSLETTER_SECRET;
    const auth = req.headers.authorization || "";
    if (!secret2 || auth !== `Bearer ${secret2}`) {
      return res.status(401).json({ ok: false, error: "unauthorized" });
    }
    try {
      const subscribers2 = await storage.listActiveSubscribers();
      const articlesByLang = getLatestArticlesByLang(3);
      let sent = 0;
      let failed = 0;
      let skipped = 0;
      for (const sub of subscribers2) {
        const lang = ["en", "hu", "es"].includes(sub.language) ? sub.language : "en";
        const articles = articlesByLang[lang];
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
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      res.json({ ok: true, total: subscribers2.length, sent, failed, skipped });
    } catch (err) {
      console.error("/api/newsletter/send error", err);
      res.status(500).json({ ok: false, error: "internal_error" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path2 from "path";
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const { createServer: createViteServer, createLogger } = await import("vite");
  const { nanoid } = await import("nanoid");
  const viteLogger = createLogger();
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    configFile: path2.resolve(import.meta.dirname, "..", "vite.config.ts"),
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.set("trust proxy", 1);
app.use(express2.json({ limit: "10kb" }));
app.use(express2.urlencoded({ extended: false, limit: "10kb" }));
if (process.env.NODE_ENV === "production") {
  app.use((_req, res, next) => {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
    res.setHeader("Content-Security-Policy", "frame-ancestors 'self'");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );
    next();
  });
}
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  try {
    await ensureSchema();
  } catch (err) {
    console.error("ensureSchema failed, continuing without it", err);
  }
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
