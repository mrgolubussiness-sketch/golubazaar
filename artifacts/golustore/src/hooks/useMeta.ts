import { useEffect } from "react";

interface MetaOptions {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}

const SITE_NAME = "GoluBazaar";
const DEFAULT_DESC =
  "Buy premium gaming accounts, OTT subscriptions, and Discord upgrades instantly. Safe, verified, and delivered via Discord.";
const DEFAULT_IMG = "/og-image.png";

export function useMeta({
  title,
  description = DEFAULT_DESC,
  image = DEFAULT_IMG,
  noIndex = false,
}: MetaOptions = {}) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;

  useEffect(() => {
    // Page title
    document.title = fullTitle;

    // Helper to upsert a <meta> tag
    function setMeta(selector: string, attr: string, value: string) {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        const [attrName, attrValue] = selector.replace("meta[", "").replace("]", "").split("=");
        el.setAttribute(attrName, attrValue.replace(/"/g, ""));
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    }

    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", fullTitle);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:image"]', "content", image);
    setMeta('meta[property="og:type"]', "content", "website");
    setMeta('meta[property="og:site_name"]', "content", SITE_NAME);
    setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "content", fullTitle);
    setMeta('meta[name="twitter:description"]', "content", description);
    setMeta('meta[name="twitter:image"]', "content", image);

    if (noIndex) {
      setMeta('meta[name="robots"]', "content", "noindex,nofollow");
    } else {
      const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
      if (robots) robots.setAttribute("content", "index,follow");
    }

    return () => {
      document.title = SITE_NAME;
    };
  }, [fullTitle, description, image, noIndex]);
}
