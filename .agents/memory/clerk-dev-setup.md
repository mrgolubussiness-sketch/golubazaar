---
name: Clerk dev setup quirk
description: publishableKeyFromHost encodes the current hostname into the key, causing Clerk to try loading from a non-existent clerk.<replit-dev-domain> subdomain in development.
---

# Clerk dev setup quirk

## The rule
In `artifacts/golustore/src/App.tsx`, only use `publishableKeyFromHost` when `VITE_CLERK_PROXY_URL` is set (production). In dev, use `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY` directly.

**Why:** `publishableKeyFromHost(hostname, fallbackKey)` encodes the current hostname into a Clerk publishable key, which tells Clerk to load its JS bundle from `clerk.<that-hostname>`. On the Replit dev domain, that subdomain doesn't exist, so Clerk fails to load. The Clerk proxy middleware (`/api/__clerk`) is also explicitly disabled in development (`NODE_ENV !== 'production'`), so there's no proxy to fall back to.

**How to apply:** The fix in App.tsx:
```ts
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const clerkPubKey = clerkProxyUrl
  ? publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)
  : import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
```

For production deployment, `VITE_CLERK_PROXY_URL` must be set to `https://<production-domain>/api/__clerk`.
