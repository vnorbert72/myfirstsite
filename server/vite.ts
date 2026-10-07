import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
import { injectSeo, resolvePageMeta } from "./seo";

// NOTE: "vite", "../vite.config" (which itself pulls in @vitejs/plugin-react
// and the @replit/vite-plugin-* packages) and "nanoid" are only ever needed
// by setupVite() below, which itself only runs in development (see
// server/index.ts). None of them may be static top-level imports: cPanel's
// production NPM install skips devDependencies, so a static import here
// makes the bundled dist/index.js crash at module-load time in production,
// before the server can even bind a port — regardless of the NODE_ENV check
// gating setupVite() at the call site. Dynamic imports keep all of this out
// of the module-load path entirely unless setupVite() actually runs.

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const { createServer: createViteServer, createLogger } = await import("vite");
  const { nanoid } = await import("nanoid");
  const viteLogger = createLogger();

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  // Passing configFile (an absolute path) instead of statically importing
  // "../vite.config" lets Vite's own config loader read and evaluate that
  // file at runtime, completely bypassing our esbuild bundle's static
  // analysis. A relative *source* import of vite.config.ts would otherwise
  // get inlined by esbuild (it isn't a bare package specifier, so
  // --packages=external doesn't apply to it), which would hoist that
  // file's own "vite"/"@vitejs/plugin-react" imports back into a static,
  // top-level import in dist/index.js — breaking production again.
  const vite = await createViteServer({
    configFile: path.resolve(import.meta.dirname, "..", "vite.config.ts"),
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // index: false stops express.static from auto-serving index.html for
  // "/" itself, which would otherwise bypass the catch-all below and leave
  // the homepage as the one page with no injected canonical/title.
  app.use(express.static(distPath, { index: false }));

  // Every route used to fall through to the exact same static index.html,
  // byte-for-byte identical (same <title>, no <link rel="canonical"> at
  // all) for "/", "/bmi", "/blog/some-article", etc., and always with a
  // 200 status even for a path that matches nothing. That is what Search
  // Console's Page Indexing report flagged as "Duplicate without
  // user-selected canonical" and "Crawled - currently not indexed": the
  // very first HTML a crawler sees carried no per-page signal to tell
  // pages apart. The handler below reads the template once, then injects
  // a real per-route <title>/description/canonical (and the real article
  // image for blog posts) before sending it, and returns an actual 404 for
  // paths that match nothing instead of silently serving the homepage.
  const indexPath = path.resolve(distPath, "index.html");
  const indexTemplate = fs.readFileSync(indexPath, "utf-8");

  app.use("*", (req, res) => {
    // Express rewrites req.path to be relative to the "*" mount point
    // (always "/"), so the real path has to come from originalUrl instead
    // — req.path/req.baseUrl cannot be trusted here.
    const [rawPathname] = req.originalUrl.split("?");
    const pathname = decodeURIComponent(rawPathname || "/");

    // "/bmi/" and "/bmi" previously served identical content with no
    // redirect between them — a second, hidden duplicate URL for every
    // route. Collapse the trailing slash permanently instead.
    if (pathname !== "/" && pathname.endsWith("/")) {
      const target = pathname.slice(0, -1) + req.originalUrl.slice(rawPathname.length);
      res.redirect(301, target);
      return;
    }

    const meta = resolvePageMeta(pathname);
    const html = injectSeo(indexTemplate, meta);
    res.status(meta.found ? 200 : 404).set({ "Content-Type": "text/html" }).send(html);
  });
}
