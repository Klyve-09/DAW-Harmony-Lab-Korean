const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

if (!rawSiteUrl) {
  throw new Error("NEXT_PUBLIC_SITE_URL is required for release builds.");
}

let siteUrl;
try {
  siteUrl = new URL(rawSiteUrl);
} catch {
  throw new Error(`NEXT_PUBLIC_SITE_URL must be a valid URL. Received: ${rawSiteUrl}`);
}

if (siteUrl.protocol !== "https:") {
  throw new Error("NEXT_PUBLIC_SITE_URL must use https:// for release builds.");
}

if (["localhost", "127.0.0.1", "0.0.0.0"].includes(siteUrl.hostname) || siteUrl.hostname.endsWith(".example")) {
  throw new Error("NEXT_PUBLIC_SITE_URL must be the real production domain, not a local or placeholder URL.");
}

console.log(`Production environment validated for ${siteUrl.origin}`);
