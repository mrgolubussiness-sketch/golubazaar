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
// Links your login form straight to the dashboard environment variables you just added
app.get('/api/admin/init-db-account', async (req, res) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.ADMIN_MAIL;
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS;
    res.send(`🚀 Backend sync active! Listening for variables. Email loaded: ${adminEmail ? "✅ YES" : "❌ NO"}`);
  } catch (err: any) {
    res.status(500).send(`❌ DB Init Failed: ${err.message}`);
  }
});

export default app;
