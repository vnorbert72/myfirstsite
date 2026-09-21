import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";

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

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
