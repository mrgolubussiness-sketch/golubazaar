import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import { CLERK_PROXY_PATH, clerkProxyMiddleware, getClerkProxyHost } from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required but was not provided.");
}

const app: Express = express();

// Clerk proxy — must be before body parsers (streams raw bytes)
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : true;

app.use(cors({ credentials: true, origin: ALLOWED_ORIGINS }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(SESSION_SECRET));

app.use(
  clerkMiddleware((req: any) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

// Mount all API routes
app.use("/api", router);

// ── Serve the frontend static build ────────────────────────────────────────
// __dirname is artifacts/api-server/dist at runtime, go up 3 levels to root
const frontendDist = resolve(__dirname, "../../../artifacts/golustore/dist/public");

if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  // SPA fallback — unmatched routes return index.html for client-side routing
  app.get(/.*/, (_req, res) => {
    res.sendFile(resolve(frontendDist, "index.html"));
  });
} else {
  logger.warn({ frontendDist }, "Frontend dist not found — skipping static serve");
}

export default app;
