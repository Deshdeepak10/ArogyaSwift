import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // 1. Trust proxy headers (Cloudflare, Vercel, AWS ALB, Nginx) so req.secure and x-forwarded-proto are accurate
  app.set("trust proxy", 1);

  // 2. Hide backend server technology signatures (Prevent fingerprinting)
  app.disable("x-powered-by");

  // 3. Sensitive Path & Source Shield: Block any attempt to read backend source, configs, or hidden files
  app.use((req: Request, res: Response, next: NextFunction) => {
    const pathLower = req.path.toLowerCase();

    // Allow legitimate API routes to process
    if (pathLower.startsWith("/api")) {
      return next();
    }

    const sensitivePatterns = [
      "/.env",
      "/.git",
      "/schema.sql",
      "/package.json",
      "/tsconfig",
      "/server/",
      "/node_modules",
      ".ts",
      ".tsx",
      ".map",
      "webpack",
      ".yaml",
      ".yml",
      ".config."
    ];

    const isSensitive = sensitivePatterns.some((pattern) => pathLower.includes(pattern));
    if (isSensitive) {
      // Return 404 to obscure existence of internal assets
      return res.status(404).send("Not Found");
    }

    next();
  });

  // 4. Strict HTTPS Enforcement: Redirect all insecure HTTP traffic to HTTPS
  app.use((req: Request, res: Response, next: NextFunction) => {
    const isProduction = process.env.NODE_ENV === "production" || process.env.FORCE_HTTPS === "true";
    
    // Check multiple proxy indicators
    const forwardedProto = req.headers["x-forwarded-proto"] as string | undefined;
    let cfVisitorScheme: string | null = null;
    try {
      if (req.headers["cf-visitor"]) {
        const parsed = JSON.parse(req.headers["cf-visitor"] as string);
        cfVisitorScheme = parsed.scheme;
      }
    } catch {
      // ignore json parse error
    }

    const isHttp =
      forwardedProto === "http" ||
      cfVisitorScheme === "http" ||
      (!req.secure && isProduction && forwardedProto !== "https");

    if (isHttp && isProduction) {
      const host = req.headers.host || req.hostname;
      return res.redirect(301, `https://${host}${req.originalUrl}`);
    }

    // Strict Transport Security (HSTS) - 2 Years with SubDomains and Preload
    res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
    res.setHeader("Content-Security-Policy", "upgrade-insecure-requests");

    next();
  });

  // Parse JSON bodies with sensible payload size limit to prevent memory exhaustion DOS
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: false, limit: "2mb" }));

  // Register API routes with Zod input validation & rate limiters
  registerRoutes(app);

  // Serve static files safely from dist/public (ignoring any dotfiles)
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(
    express.static(staticPath, {
      dotfiles: "ignore",
      index: "index.html",
      fallthrough: true,
      maxAge: process.env.NODE_ENV === "production" ? "1d" : 0,
    })
  );

  // Global Sanitized Error Handler: NEVER leaks internal stack traces, database queries, or server code
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    // Log securely on the server console only
    console.error("[ArogyaSwift Internal Error]", err?.message || err);

    const status = err.status || err.statusCode || 500;
    res.status(status).json({
      error: status === 500 ? "Internal Server Error" : (err.message || "Request could not be processed"),
      code: err.code || "REQUEST_FAILED",
      ref: `err_${Date.now().toString(36)}`,
    });
  });

  return app;
}

export const app = createApp();
