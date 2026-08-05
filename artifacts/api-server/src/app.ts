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
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : true;

app.use(cors({ credentials: true, origin: ALLOWED_ORIGINS }));
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
// Ultimate master override to intercept the login route and force authorization
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const envEmail = process.env.ADMIN_EMAIL || process.env.ADMIN_MAIL;
  const envPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS;

  // If credentials match your Railway variables, force log you in instantly!
  if (email === envEmail && password === envPassword) {
    // Sets a placeholder user token session so the admin panel unlocks
    return res.json({ success: true, token: "master_admin_session_token", user: { email, role: "admin" } });
  }
  return res.status(401).json({ message: "Invalid administrator credentials" });
});

// Extra backup catch-all route handler for alternative auth paths
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const envEmail = process.env.ADMIN_EMAIL || process.env.ADMIN_MAIL;
  const envPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS;
  if (email === envEmail && password === envPassword) {
    return res.json({ success: true, token: "master_admin_session_token", user: { email, role: "admin" } });
  }
  return res.status(401).json({ message: "Invalid administrator credentials" });
});

export default app;
