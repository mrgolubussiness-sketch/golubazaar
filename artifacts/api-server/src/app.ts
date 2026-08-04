import express, { type Express } from "express";
import { dirname } from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import { CLERK_PROXY_PATH, clerkProxyMiddleware, getClerkProxyHost } from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

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
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(
  cors({
    origin: ["https://golubazaar.up.railway.app", "https://golubazaarog.up.railway.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

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
app.get('/', (req, res) => {
  res.send('🚀 Golu Bazaar API Server is Active and Running!');
});

app.use("/api", router);

// Serve built frontend in production (e.g. Wispbyte).
// In Replit dev mode the dist folder won't exist, so this is skipped automatically.
import { existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
const __appdir = dirname(fileURLToPath(import.meta.url));
const frontendDist = join(__appdir, "../../golustore/dist/public");
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
app.get("*", (req, res) => {
  res.sendFile(join(frontendDist, "index.html"));
});
}

export default app;
